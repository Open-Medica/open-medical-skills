#!/usr/bin/env python3
"""Fine-tune EmbeddingGemma-300M for OMS medical tool retrieval.

Uses sentence-transformers SentenceTransformerTrainer with
CachedMultipleNegativesRankingLoss for memory-efficient training
on large effective batch sizes. Supports Matryoshka Representation
Learning (MRL) for flexible output dimensions.

Usage:
    python train_embeddinggemma.py --config config.yaml
    python train_embeddinggemma.py --config config.yaml --resume-from-checkpoint
    python train_embeddinggemma.py --config config.yaml --colab
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
        logger.warning("No GPU detected. Training on CPU will be very slow.")

    return info


def adjust_for_colab(model_config: dict[str, Any], device_info: dict[str, Any]) -> dict[str, Any]:
    """Adjust batch sizes for Google Colab (typically T4 16GB)."""
    gpu_mem = device_info.get("total_memory_gb", 0)

    if gpu_mem < 8:
        model_config["batch_size"] = 16
        model_config["mini_batch_size"] = 4
        logger.info("Colab adjustment (low memory): batch_size=16, mini_batch_size=4")
    elif gpu_mem < 16:
        model_config["batch_size"] = 64
        model_config["mini_batch_size"] = 8
        logger.info("Colab adjustment (T4 ~16GB): batch_size=64, mini_batch_size=8")
    else:
        model_config["batch_size"] = 128
        model_config["mini_batch_size"] = 16
        logger.info("Colab adjustment (A100/V100): batch_size=128, mini_batch_size=16")

    return model_config


def load_dataset(data_dir: Path) -> Any:
    """Load training/validation datasets."""
    try:
        from datasets import load_from_disk
        ds = load_from_disk(str(data_dir))
        logger.info("Loaded HF DatasetDict from %s", data_dir)
        return ds
    except Exception:
        pass

    # Fallback: load from JSONL files in parent directory
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


def build_evaluator(eval_dataset: Any, model_config: dict[str, Any]) -> Any:
    """Build an InformationRetrievalEvaluator for validation."""
    from sentence_transformers.evaluation import (
        InformationRetrievalEvaluator,
    )

    # Build queries and corpus from eval dataset
    queries: dict[str, str] = {}
    corpus: dict[str, str] = {}
    relevant_docs: dict[str, set[str]] = {}

    for idx, row in enumerate(eval_dataset):
        query_id = f"q_{idx}"
        doc_id = f"d_{idx}"

        queries[query_id] = row.get("anchor", row.get("query", ""))
        corpus[doc_id] = row.get("positive", row.get("tool_description", ""))
        relevant_docs[query_id] = {doc_id}

    evaluator = InformationRetrievalEvaluator(
        queries=queries,
        corpus=corpus,
        relevant_docs=relevant_docs,
        name="oms-toolrag-eval",
        show_progress_bar=True,
    )

    return evaluator


def train(
    config_path: Path,
    resume_from_checkpoint: bool = False,
    colab: bool = False,
) -> None:
    """Run the full EmbeddingGemma fine-tuning pipeline."""
    import torch
    from sentence_transformers import SentenceTransformer, SentenceTransformerTrainer
    from sentence_transformers.losses import CachedMultipleNegativesRankingLoss
    from sentence_transformers.training_args import (
        BatchSamplers,
        SentenceTransformerTrainingArguments,
    )

    # Load config
    config = load_config(config_path)
    model_config = config["models"]["embeddinggemma"]
    data_config = config["data"]
    base_dir = config_path.parent

    logger.info("Training EmbeddingGemma-300M for OMS ToolRAG")
    logger.info("Config: %s", config_path)

    # Device info
    device_info = get_device_info()

    # Adjust for Colab
    if colab:
        model_config = adjust_for_colab(model_config, device_info)

    # Resolve paths
    model_name = model_config.get("local_path", model_config["name"])
    model_path = resolve_path(base_dir, model_name)
    if not model_path.exists():
        model_path = Path(model_config["name"])  # Use HF model name
        logger.info("Local model not found, will download from HuggingFace: %s", model_config["name"])

    output_dir = resolve_path(base_dir, model_config["output_dir"])
    data_dir = resolve_path(base_dir, data_config["train_path"]).parent

    # Load model
    logger.info("Loading model: %s", model_path)
    model = SentenceTransformer(
        str(model_path),
        trust_remote_code=True,
    )
    model.max_seq_length = model_config.get("max_seq_length_doc", 512)

    logger.info("Model loaded. Parameters: %s", sum(p.numel() for p in model.parameters()))
    logger.info("Max sequence length: %d", model.max_seq_length)

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

    # Build loss
    loss = CachedMultipleNegativesRankingLoss(
        model=model,
        mini_batch_size=model_config.get("mini_batch_size", 8),
    )

    # Wrap with Matryoshka loss if configured
    matryoshka_dims = model_config.get("matryoshka_dims")
    if matryoshka_dims:
        from sentence_transformers.losses import MatryoshkaLoss

        loss = MatryoshkaLoss(
            model=model,
            loss=loss,
            matryoshka_dims=matryoshka_dims,
        )
        logger.info("Using MatryoshkaLoss with dims: %s", matryoshka_dims)

    # Training arguments
    training_args = SentenceTransformerTrainingArguments(
        output_dir=str(output_dir),
        num_train_epochs=model_config["epochs"],
        per_device_train_batch_size=model_config["batch_size"],
        per_device_eval_batch_size=model_config.get("batch_size", 64),
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
        metric_for_best_model="eval_oms-toolrag-eval_cosine_ndcg@10" if eval_dataset else None,
        logging_steps=10,
        logging_dir=str(output_dir / "logs"),
        dataloader_num_workers=4,
        report_to="none",
    )

    # Build evaluator
    evaluator = None
    if eval_dataset:
        evaluator = build_evaluator(eval_dataset, model_config)

    # Train
    logger.info("Starting training...")
    logger.info("  Epochs: %d", model_config["epochs"])
    logger.info("  Batch size: %d", model_config["batch_size"])
    logger.info("  Learning rate: %s", model_config["learning_rate"])
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

    # Save final model
    final_path = output_dir / "final"
    model.save(str(final_path))
    logger.info("Final model saved to: %s", final_path)

    # Log final metrics
    if evaluator:
        logger.info("Running final evaluation...")
        results = evaluator(model)
        logger.info("Final evaluation results:")
        for metric, value in sorted(results.items()):
            logger.info("  %s: %.4f", metric, value)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fine-tune EmbeddingGemma-300M for OMS medical tool retrieval"
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=Path(__file__).resolve().parent / "config.yaml",
        help="Path to training config YAML (default: config.yaml)",
    )
    parser.add_argument(
        "--resume-from-checkpoint",
        action="store_true",
        help="Resume training from last checkpoint",
    )
    parser.add_argument(
        "--colab",
        action="store_true",
        help="Adjust settings for Google Colab (auto-detect GPU memory)",
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
    )


if __name__ == "__main__":
    main()
