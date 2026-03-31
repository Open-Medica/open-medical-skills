#!/usr/bin/env python3
"""Evaluate embedding models on OMS medical tool retrieval benchmark.

Computes MRR@5, Recall@1/5/10, NDCG@10 for trained and baseline models.
Produces comparison tables, per-category breakdowns, and per-query-type
analysis.

Usage:
    python evaluate.py --model-path ../models/oms-toolrag-gemma-v1/final
    python evaluate.py --model-path ../models/oms-toolrag-gemma-v1/final --baselines
    python evaluate.py --all-models  # evaluate all available models
"""

import argparse
import json
import logging
import math
from collections import defaultdict
from pathlib import Path
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_TEST_DIR = SCRIPT_DIR.parent / "data" / "processed"
DEFAULT_OUTPUT_DIR = SCRIPT_DIR.parent / "benchmarks" / "results"

# Baseline models available through sentence-transformers
BASELINE_MODELS = {
    "nomic-embed-text": "nomic-ai/nomic-embed-text-v1.5",
    "mxbai-embed-large": "mixedbread-ai/mxbai-embed-large-v1",
    "base-embeddinggemma": "google/embeddinggemma-300m",
    "base-gte-qwen2": "Alibaba-NLP/gte-Qwen2-1.5B-instruct",
}


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

def load_test_data(data_dir: Path, split: str = "test") -> list[dict[str, str]]:
    """Load test queries and ground truth."""
    try:
        from datasets import load_from_disk
        ds = load_from_disk(str(data_dir))
        if split in ds:
            records = [dict(row) for row in ds[split]]
            logger.info("Loaded %d test records from HF dataset", len(records))
            return records
    except Exception:
        pass

    jsonl_path = data_dir / f"{split}.jsonl"
    if jsonl_path.exists():
        records = []
        with open(jsonl_path, encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    records.append(json.loads(line))
        logger.info("Loaded %d test records from %s", len(records), jsonl_path)
        return records

    raise FileNotFoundError(f"No test data found in {data_dir} for split '{split}'")


def build_queries_and_corpus(
    test_data: list[dict[str, str]],
) -> tuple[list[str], list[str], list[int]]:
    """Build query list, corpus, and ground truth mapping.

    Returns:
        queries: list of query strings
        corpus: list of unique document strings
        ground_truth: list of corpus indices (one per query)
    """
    corpus_set: dict[str, int] = {}
    queries: list[str] = []
    ground_truth: list[int] = []
    query_metadata: list[dict[str, str]] = []

    for record in test_data:
        query = record.get("anchor", record.get("query", ""))
        positive = record.get("positive", record.get("tool_description", ""))

        if not query or not positive:
            continue

        # Add to corpus if new
        if positive not in corpus_set:
            corpus_set[positive] = len(corpus_set)

        queries.append(query)
        ground_truth.append(corpus_set[positive])
        query_metadata.append({
            "category": record.get("category", "unknown"),
            "query_type": record.get("query_type", "unknown"),
            "source": record.get("source", "unknown"),
        })

    corpus = [""] * len(corpus_set)
    for doc, idx in corpus_set.items():
        corpus[idx] = doc

    logger.info("Queries: %d, Corpus: %d unique documents", len(queries), len(corpus))
    return queries, corpus, ground_truth, query_metadata


# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------

def reciprocal_rank(relevant_idx: int, retrieved_indices: list[int], k: int = 5) -> float:
    """Compute reciprocal rank for a single query."""
    for rank, idx in enumerate(retrieved_indices[:k], start=1):
        if idx == relevant_idx:
            return 1.0 / rank
    return 0.0


def recall_at_k(relevant_idx: int, retrieved_indices: list[int], k: int) -> float:
    """Compute recall@k for a single query (binary relevance)."""
    return 1.0 if relevant_idx in retrieved_indices[:k] else 0.0


def dcg_at_k(relevant_idx: int, retrieved_indices: list[int], k: int) -> float:
    """Compute DCG@k for a single query (binary relevance)."""
    dcg = 0.0
    for rank, idx in enumerate(retrieved_indices[:k], start=1):
        if idx == relevant_idx:
            dcg += 1.0 / math.log2(rank + 1)
    return dcg


def ndcg_at_k(relevant_idx: int, retrieved_indices: list[int], k: int) -> float:
    """Compute NDCG@k for a single query (binary relevance)."""
    dcg = dcg_at_k(relevant_idx, retrieved_indices, k)
    # Ideal DCG: relevant doc at rank 1
    idcg = 1.0 / math.log2(2)
    return dcg / idcg if idcg > 0 else 0.0


def compute_all_metrics(
    ground_truth: list[int],
    all_retrieved: list[list[int]],
) -> dict[str, float]:
    """Compute all evaluation metrics."""
    n = len(ground_truth)
    assert n == len(all_retrieved), "Mismatch between ground truth and retrieved counts"

    mrr5 = sum(reciprocal_rank(gt, ret, k=5) for gt, ret in zip(ground_truth, all_retrieved)) / n
    r1 = sum(recall_at_k(gt, ret, k=1) for gt, ret in zip(ground_truth, all_retrieved)) / n
    r5 = sum(recall_at_k(gt, ret, k=5) for gt, ret in zip(ground_truth, all_retrieved)) / n
    r10 = sum(recall_at_k(gt, ret, k=10) for gt, ret in zip(ground_truth, all_retrieved)) / n
    ndcg10 = sum(ndcg_at_k(gt, ret, k=10) for gt, ret in zip(ground_truth, all_retrieved)) / n

    return {
        "mrr@5": round(mrr5, 4),
        "recall@1": round(r1, 4),
        "recall@5": round(r5, 4),
        "recall@10": round(r10, 4),
        "ndcg@10": round(ndcg10, 4),
    }


# ---------------------------------------------------------------------------
# Model evaluation
# ---------------------------------------------------------------------------

def evaluate_model(
    model_name_or_path: str,
    queries: list[str],
    corpus: list[str],
    ground_truth: list[int],
    batch_size: int = 64,
) -> dict[str, float]:
    """Evaluate a single model on the retrieval benchmark.

    Returns:
        Dictionary of metric name -> score.
    """
    from sentence_transformers import SentenceTransformer

    logger.info("Loading model: %s", model_name_or_path)
    model = SentenceTransformer(model_name_or_path, trust_remote_code=True)

    # Encode corpus
    logger.info("Encoding %d corpus documents...", len(corpus))
    corpus_embeddings = model.encode(
        corpus,
        batch_size=batch_size,
        show_progress_bar=True,
        normalize_embeddings=True,
        convert_to_numpy=True,
    )

    # Encode queries
    logger.info("Encoding %d queries...", len(queries))
    query_embeddings = model.encode(
        queries,
        batch_size=batch_size,
        show_progress_bar=True,
        normalize_embeddings=True,
        convert_to_numpy=True,
    )

    # Compute similarity and retrieve top-k
    logger.info("Computing similarities...")
    # Cosine similarity (already normalized)
    similarities = np.dot(query_embeddings, corpus_embeddings.T)

    all_retrieved: list[list[int]] = []
    for i in range(len(queries)):
        # Get top-10 indices
        top_indices = np.argsort(similarities[i])[::-1][:10].tolist()
        all_retrieved.append(top_indices)

    # Compute metrics
    metrics = compute_all_metrics(ground_truth, all_retrieved)

    # Clean up GPU memory
    del model, corpus_embeddings, query_embeddings, similarities
    try:
        import torch
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    except ImportError:
        pass
    import gc
    gc.collect()

    return metrics


def evaluate_per_group(
    model_name_or_path: str,
    queries: list[str],
    corpus: list[str],
    ground_truth: list[int],
    query_metadata: list[dict[str, str]],
    group_key: str,
    batch_size: int = 64,
) -> dict[str, dict[str, float]]:
    """Evaluate model with per-group (category, query_type) breakdown.

    Note: This re-encodes everything. For efficiency, call evaluate_model
    for the overall score and this for breakdowns using the same model.
    """
    from sentence_transformers import SentenceTransformer

    model = SentenceTransformer(model_name_or_path, trust_remote_code=True)

    corpus_embeddings = model.encode(
        corpus, batch_size=batch_size, normalize_embeddings=True, convert_to_numpy=True,
    )
    query_embeddings = model.encode(
        queries, batch_size=batch_size, normalize_embeddings=True, convert_to_numpy=True,
    )

    similarities = np.dot(query_embeddings, corpus_embeddings.T)

    # Group queries
    groups: dict[str, list[int]] = defaultdict(list)
    for idx, meta in enumerate(query_metadata):
        group_val = meta.get(group_key, "unknown")
        groups[group_val].append(idx)

    results: dict[str, dict[str, float]] = {}
    for group_name, indices in sorted(groups.items()):
        group_gt = [ground_truth[i] for i in indices]
        group_retrieved = [
            np.argsort(similarities[i])[::-1][:10].tolist() for i in indices
        ]
        results[group_name] = compute_all_metrics(group_gt, group_retrieved)
        results[group_name]["count"] = len(indices)

    del model, corpus_embeddings, query_embeddings, similarities
    try:
        import torch
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    except ImportError:
        pass
    import gc
    gc.collect()

    return results


# ---------------------------------------------------------------------------
# Reporting
# ---------------------------------------------------------------------------

def format_comparison_table(
    all_results: dict[str, dict[str, float]],
) -> str:
    """Format results as a markdown comparison table."""
    metrics = ["mrr@5", "recall@1", "recall@5", "recall@10", "ndcg@10"]
    header = "| Model | " + " | ".join(metrics) + " |"
    separator = "|" + "|".join(["---"] * (len(metrics) + 1)) + "|"

    rows = [header, separator]
    for model_name, results in all_results.items():
        values = " | ".join(f"{results.get(m, 0):.4f}" for m in metrics)
        rows.append(f"| {model_name} | {values} |")

    return "\n".join(rows)


def format_group_table(
    group_results: dict[str, dict[str, float]],
    group_key: str,
) -> str:
    """Format per-group results as a markdown table."""
    metrics = ["mrr@5", "recall@5", "ndcg@10", "count"]
    header = f"| {group_key} | " + " | ".join(metrics) + " |"
    separator = "|" + "|".join(["---"] * (len(metrics) + 1)) + "|"

    rows = [header, separator]
    for group_name, results in sorted(group_results.items(), key=lambda x: -x[1].get("ndcg@10", 0)):
        values = []
        for m in metrics:
            v = results.get(m, 0)
            if m == "count":
                values.append(str(int(v)))
            else:
                values.append(f"{v:.4f}")
        rows.append(f"| {group_name} | {' | '.join(values)} |")

    return "\n".join(rows)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Evaluate embedding models on OMS medical tool retrieval"
    )
    parser.add_argument(
        "--model-path",
        type=str,
        help="Path to trained model (or HuggingFace model name)",
    )
    parser.add_argument(
        "--test-data",
        type=Path,
        default=DEFAULT_TEST_DIR,
        help="Path to test data directory",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Output directory for results",
    )
    parser.add_argument(
        "--baselines",
        action="store_true",
        help="Also evaluate baseline models",
    )
    parser.add_argument(
        "--all-models",
        action="store_true",
        help="Evaluate all available models (trained + baselines)",
    )
    parser.add_argument(
        "--per-category",
        action="store_true",
        help="Compute per-category breakdown",
    )
    parser.add_argument(
        "--per-query-type",
        action="store_true",
        help="Compute per-query-type breakdown",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=64,
        help="Encoding batch size (default: 64)",
    )
    parser.add_argument(
        "--split",
        default="test",
        help="Dataset split to evaluate (default: test)",
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

    # Load test data
    test_data = load_test_data(args.test_data, split=args.split)
    queries, corpus, ground_truth, query_metadata = build_queries_and_corpus(test_data)

    if not queries:
        logger.error("No test queries found")
        return

    # Build list of models to evaluate
    models_to_eval: dict[str, str] = {}

    if args.model_path:
        model_name = Path(args.model_path).name if Path(args.model_path).exists() else args.model_path
        models_to_eval[model_name] = args.model_path

    if args.baselines or args.all_models:
        models_to_eval.update(BASELINE_MODELS)

    if args.all_models:
        # Also look for trained models
        models_dir = SCRIPT_DIR.parent / "models"
        if models_dir.exists():
            for model_dir in models_dir.iterdir():
                final_dir = model_dir / "final"
                if final_dir.exists():
                    models_to_eval[model_dir.name] = str(final_dir)

    if not models_to_eval:
        logger.error("No models to evaluate. Use --model-path or --baselines.")
        return

    logger.info("Models to evaluate: %s", list(models_to_eval.keys()))

    # Evaluate each model
    all_results: dict[str, dict[str, float]] = {}

    for model_label, model_path in models_to_eval.items():
        logger.info("\n" + "=" * 50)
        logger.info("Evaluating: %s", model_label)
        logger.info("=" * 50)

        try:
            metrics = evaluate_model(
                model_path, queries, corpus, ground_truth, batch_size=args.batch_size
            )
            all_results[model_label] = metrics
            logger.info("Results for %s:", model_label)
            for k, v in metrics.items():
                logger.info("  %s: %.4f", k, v)
        except Exception as exc:
            logger.error("Failed to evaluate %s: %s", model_label, exc)

    # Comparison table
    if all_results:
        table = format_comparison_table(all_results)
        logger.info("\n--- Model Comparison ---\n%s", table)

        # Save results
        args.output_dir.mkdir(parents=True, exist_ok=True)
        results_path = args.output_dir / "model_comparison.json"
        with open(results_path, "w", encoding="utf-8") as f:
            json.dump(all_results, f, indent=2)

        table_path = args.output_dir / "model_comparison.md"
        with open(table_path, "w", encoding="utf-8") as f:
            f.write("# OMS ToolRAG Model Comparison\n\n")
            f.write(table)
            f.write("\n")

        logger.info("Results saved to %s", args.output_dir)

    # Per-group breakdowns (only for the primary model)
    primary_model = args.model_path
    if primary_model and (args.per_category or args.per_query_type):
        if args.per_category:
            logger.info("\nComputing per-category breakdown...")
            cat_results = evaluate_per_group(
                primary_model, queries, corpus, ground_truth, query_metadata,
                group_key="category", batch_size=args.batch_size,
            )
            cat_table = format_group_table(cat_results, "category")
            logger.info("\n--- Per-Category Results ---\n%s", cat_table)

            cat_path = args.output_dir / "per_category.json"
            with open(cat_path, "w", encoding="utf-8") as f:
                json.dump(cat_results, f, indent=2)

        if args.per_query_type:
            logger.info("\nComputing per-query-type breakdown...")
            qt_results = evaluate_per_group(
                primary_model, queries, corpus, ground_truth, query_metadata,
                group_key="query_type", batch_size=args.batch_size,
            )
            qt_table = format_group_table(qt_results, "query_type")
            logger.info("\n--- Per-Query-Type Results ---\n%s", qt_table)

            qt_path = args.output_dir / "per_query_type.json"
            with open(qt_path, "w", encoding="utf-8") as f:
                json.dump(qt_results, f, indent=2)


if __name__ == "__main__":
    main()
