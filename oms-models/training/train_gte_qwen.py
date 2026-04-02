#!/usr/bin/env python3
"""Fine-tune GTE-Qwen2-1.5B-instruct for OMS medical tool retrieval.

Larger model with optional LoRA/QLoRA for memory-constrained GPUs.
Uses MultipleNegativesRankingLoss (standard, no caching needed at smaller
batch sizes). Supports gradient checkpointing for T4 GPUs.

Usage:
    python train_gte_qwen.py --config config.yaml
    python train_gte_qwen.py --config config.yaml --colab
    python train_gte_qwen.py --config config.yaml --no-lora  # full fine-tune
"""

import argparse
import logging
from pathlib import Path
from typing import Any

import yaml

logger = logging.getLogger(__name__)


def load_config(config_path: Path) -> dict[str, Any]:
    """Load training configuration from YAML."""
    with open(config_path, encoding="utf-8") as f:
        config = yaml.safe_load(f)
    return config


def resolve_path(base_dir: Path, relative_path: str) -> Path:
    """Resolve a relative path against a base directory."""
    p = Path(relative_path)
    if p.is_absolute():
        return p
    return base_dir / p


def get_device_info() -> dict[str, Any]:
    """Detect GPU availability and memory."""
    import torch

    info: dict[str, Any] = {
        "cuda_available": torch.cuda.is_available(),
        "device_count": 0,
        "device_name": "cpu",
        "total_memory_gb": 0.0,
    }

    if torch.cuda.is_available():
        info["device_count"] = torch.cuda.device_count()
        info["device_name"] = torch.cuda.get_device_name(0)
        info["total_memory_gb"] = torch.cuda.get_device_properties(0).total_mem / (1024 ** 3)
        logger.info("GPU detected: %s (%.1f GB)", info["device_name"], info["total_memory_gb"])
    else:
        logger.warning("No GPU detected. Training on CPU will be extremely slow for 1.5B model.")

    return info


def adjust_for_colab(model_config: dict[str, Any], device_info: dict[str, Any]) -> dict[str, Any]:
    """Adjust batch sizes for Google Colab."""
    gpu_mem = device_info.get("total_memory_gb", 0)

    if gpu_mem < 16:
        model_config["batch_size"] = 4
        model_config["gradient_checkpointing"] = True
        # Force LoRA for low memory
        if "lora" not in model_config:
            model_config["lora"] = {}
        model_config["lora"]["enabled"] = True
        logger.info("Colab adjustment (T4 ~16GB): batch_size=4, LoRA=True, grad_checkpoint=True")
    elif gpu_mem < 40:
        model_config["batch_size"] = 16
        model_config["gradient_checkpointing"] = True
        logger.info("Colab adjustment (A100 40GB): batch_size=16, grad_checkpoint=True")
    else:
        model_config["batch_size"] = 32
        logger.info("Colab adjustment (A100 80GB+): batch_size=32")

    return model_config


def apply_lora(model: Any, lora_config: dict[str, Any]) -> Any:
    """Apply LoRA adapters to the model using PEFT."""
    from peft import LoraConfig, TaskType, get_peft_model

    peft_config = LoraConfig(
        task_type=TaskType.FEATURE_EXTRACTION,
        r=lora_config.get("r", 16),
        lora_alpha=lora_config.get("lora_alpha", 32),
        lora_dropout=lora_config.get("lora_dropout", 0.05),
        target_modules=lora_config.get(
            "target_modules", ["q_proj", "v_proj", "k_proj", "o_proj"]
        ),
        bias="none",
    )

    # Apply to the underlying transformer model
    underlying_model = model[0].auto_model if hasattr(model[0], "auto_model") else model[0]
    peft_model = get_peft_model(underlying_model, peft_config)

    trainable_params = sum(p.numel() for p in peft_model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in peft_model.parameters())
    logger.info(
        "LoRA applied: %d trainable / %d total (%.2f%%)",
        trainable_params, total_params, 100 * trainable_params / total_params,
    )

    # Replace the underlying model
    if hasattr(model[0], "auto_model"):
        model[0].auto_model = peft_model
    else:
        model[0] = peft_model

    return model


def load_dataset(data_dir: Path) -> Any:
    """Load training/validation datasets."""
    try:
        from datasets import load_from_disk
        ds = load_from_disk(str(data_dir))
        logger.info("Loaded HF DatasetDict from %s", data_dir)
        return ds
    except Exception:
        pass

    import json
    from datasets import Dataset, DatasetDict

    parent = data_dir.parent if not data_dir.is_dir() else data_dir
    splits = {}
    for split_name in ("train", "validation", "val", "test"):
        jsonl_path = parent / f"{split_name}.jsonl"
        if jsonl_path.exists():
            records = []
            with open(jsonl_path, encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        records.append(json.loads(line))
            name = "validation" if split_name == "val" else split_name
            splits[name] = Dataset.from_list(records)
            logger.info("Loaded %d records for %s", len(records), name)

    if not splits:
        raise FileNotFoundError(f"No training data found in {parent}")

    return DatasetDict(splits)


def build_evaluator(eval_dataset: Any) -> Any:
    """Build an InformationRetrievalEvaluator."""
    from sentence_transformers.evaluation import InformationRetrievalEvaluator

    queries: dict[str, str] = {}
    corpus: dict[str, str] = {}
    relevant_docs: dict[str, set[str]] = {}

    for idx, row in enumerate(eval_dataset):
        query_id = f"q_{idx}"
        doc_id = f"d_{idx}"

        queries[query_id] = row.get("anchor", row.get("query", ""))
        corpus[doc_id] = row.get("positive", row.get("tool_description", ""))
        relevant_docs[query_id] = {doc_id}

    return InformationRetrievalEvaluator(
        queries=queries,
        corpus=corpus,
        relevant_docs=relevant_docs,
        name="oms-toolrag-qwen-eval",
        show_progress_bar=True,
    )


def train(
    config_path: Path,
    resume_from_checkpoint: bool = False,
    colab: bool = False,
    use_lora: bool = True,
) -> None:
    """Run the full GTE-Qwen2 fine-tuning pipeline."""
    import torch
    from sentence_transformers import SentenceTransformer, SentenceTransformerTrainer
    from sentence_transformers.losses import MultipleNegativesRankingLoss
    from sentence_transformers.training_args import (
        BatchSamplers,
        SentenceTransformerTrainingArguments,
    )

    config = load_config(config_path)
    model_config = config["models"]["gte_qwen2"]
    data_config = config["data"]
    base_dir = config_path.parent

    logger.info("Training GTE-Qwen2-1.5B-instruct for OMS ToolRAG")
    logger.info("Config: %s", config_path)

    device_info = get_device_info()

    if colab:
        model_config = adjust_for_colab(model_config, device_info)

    # Resolve paths
    model_name = model_config.get("local_path", model_config["name"])
    model_path = resolve_path(base_dir, model_name)
    if not model_path.exists():
        model_path = Path(model_config["name"])
        logger.info("Will download from HuggingFace: %s", model_config["name"])

    output_dir = resolve_path(base_dir, model_config["output_dir"])
    data_dir = resolve_path(base_dir, data_config["train_path"]).parent

    # Load model
    logger.info("Loading model: %s", model_path)

    # GTE-Qwen2 uses instruction-based prompts
    model = SentenceTransformer(
        str(model_path),
        trust_remote_code=True,
    )
    model.max_seq_length = model_config.get("max_seq_length_doc", 512)

    total_params = sum(p.numel() for p in model.parameters())
    logger.info("Model loaded. Parameters: %d (%.1fB)", total_params, total_params / 1e9)

    # Enable gradient checkpointing for memory efficiency
    if model_config.get("gradient_checkpointing", False):
        underlying = model[0].auto_model if hasattr(model[0], "auto_model") else model[0]
        if hasattr(underlying, "gradient_checkpointing_enable"):
            underlying.gradient_checkpointing_enable()
            logger.info("Gradient checkpointing enabled")

    # Apply LoRA if configured
    lora_config = model_config.get("lora", {})
    if use_lora and lora_config.get("enabled", False):
        try:
            model = apply_lora(model, lora_config)
        except ImportError:
            logger.warning("peft not installed. Running full fine-tune instead.")
            logger.warning("Install with: pip install peft")
    elif not use_lora:
        logger.info("LoRA disabled (--no-lora). Running full fine-tune.")

    # Load dataset
    logger.info("Loading training data from %s", data_dir)
    dataset = load_dataset(data_dir)

    train_dataset = dataset.get("train")
    eval_dataset = dataset.get("validation")

    if train_dataset is None:
        raise ValueError("No 'train' split found in dataset")

    logger.info("Train samples: %d", len(train_dataset))
    if eval_dataset:
        logger.info("Eval samples: %d", len(eval_dataset))

    # Loss function
    loss = MultipleNegativesRankingLoss(model=model)

    # Training arguments
    training_args = SentenceTransformerTrainingArguments(
        output_dir=str(output_dir),
        num_train_epochs=model_config["epochs"],
        per_device_train_batch_size=model_config["batch_size"],
        per_device_eval_batch_size=min(model_config["batch_size"], 16),
        learning_rate=model_config["learning_rate"],
        warmup_ratio=model_config["warmup_ratio"],
        fp16=model_config.get("fp16", True) and torch.cuda.is_available(),
        bf16=False,
        batch_sampler=BatchSamplers.NO_DUPLICATES,
        eval_strategy="steps" if eval_dataset else "no",
        eval_steps=model_config.get("eval_steps", 100) if eval_dataset else None,
        save_strategy="steps",
        save_steps=model_config.get("eval_steps", 100),
        save_total_limit=3,
        load_best_model_at_end=True if eval_dataset else False,
        metric_for_best_model="eval_oms-toolrag-qwen-eval_cosine_ndcg@10" if eval_dataset else None,
        logging_steps=10,
        logging_dir=str(output_dir / "logs"),
        dataloader_num_workers=2,
        gradient_accumulation_steps=max(1, 32 // model_config["batch_size"]),
        report_to="none",
    )

    # Evaluator
    evaluator = None
    if eval_dataset:
        evaluator = build_evaluator(eval_dataset)

    # Train
    logger.info("Starting training...")
    logger.info("  Epochs: %d", model_config["epochs"])
    logger.info("  Batch size: %d", model_config["batch_size"])
    logger.info("  Gradient accumulation: %d", training_args.gradient_accumulation_steps)
    logger.info("  Effective batch size: %d", model_config["batch_size"] * training_args.gradient_accumulation_steps)
    logger.info("  Learning rate: %s", model_config["learning_rate"])
    logger.info("  LoRA: %s", "enabled" if (use_lora and lora_config.get("enabled")) else "disabled")
    logger.info("  Output: %s", output_dir)

    trainer = SentenceTransformerTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        loss=loss,
        evaluator=evaluator,
    )

    trainer.train(resume_from_checkpoint=resume_from_checkpoint)

    # Merge LoRA weights if applicable
    if use_lora and lora_config.get("enabled", False):
        try:
            underlying = model[0].auto_model if hasattr(model[0], "auto_model") else model[0]
            if hasattr(underlying, "merge_and_unload"):
                logger.info("Merging LoRA weights...")
                merged = underlying.merge_and_unload()
                if hasattr(model[0], "auto_model"):
                    model[0].auto_model = merged
                else:
                    model[0] = merged
                logger.info("LoRA weights merged successfully")
        except Exception as exc:
            logger.warning("Could not merge LoRA weights: %s", exc)

    # Save final model
    final_path = output_dir / "final"
    model.save(str(final_path))
    logger.info("Final model saved to: %s", final_path)

    # Final evaluation
    if evaluator:
        logger.info("Running final evaluation...")
        results = evaluator(model)
        logger.info("Final evaluation results:")
        for metric, value in sorted(results.items()):
            logger.info("  %s: %.4f", metric, value)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fine-tune GTE-Qwen2-1.5B for OMS medical tool retrieval"
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=Path(__file__).resolve().parent / "config.yaml",
        help="Path to training config YAML",
    )
    parser.add_argument(
        "--resume-from-checkpoint",
        action="store_true",
        help="Resume training from last checkpoint",
    )
    parser.add_argument(
        "--colab",
        action="store_true",
        help="Adjust settings for Google Colab",
    )
    parser.add_argument(
        "--no-lora",
        action="store_true",
        help="Disable LoRA, run full fine-tune (requires more VRAM)",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
    )

    args = parser.parse_args()

    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    train(
        config_path=args.config,
        resume_from_checkpoint=args.resume_from_checkpoint,
        colab=args.colab,
        use_lora=not args.no_lora,
    )


if __name__ == "__main__":
    main()
