#!/usr/bin/env python3
"""End-to-end retrieval benchmark comparing custom model vs baselines.

Loads test queries and ground truth, runs each model against Qdrant or
in-memory search, computes standard IR metrics, and produces formatted
comparison tables and charts.

Usage:
    python benchmark_retrieval.py --model-path ../../models/oms-toolrag-gemma-v1/final
    python benchmark_retrieval.py --model-path ../../models/oms-toolrag-gemma-v1/final --qdrant-url http://10.30.1.5:31335
    python benchmark_retrieval.py --in-memory --all-baselines
"""

import argparse
import json
import logging
import math
import time
from collections import defaultdict
from pathlib import Path
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parents[1]  # benchmarks -> oms-models -> open-medical-skills
DEFAULT_TEST_DIR = SCRIPT_DIR.parent / "data" / "processed"
DEFAULT_OUTPUT_DIR = SCRIPT_DIR / "results"

BASELINE_MODELS = {
    "nomic-embed-text-v1.5": "nomic-ai/nomic-embed-text-v1.5",
    "mxbai-embed-large-v1": "mixedbread-ai/mxbai-embed-large-v1",
    "base-embeddinggemma-300m": "google/embeddinggemma-300m",
    "base-gte-qwen2-1.5b": "Alibaba-NLP/gte-Qwen2-1.5B-instruct",
}


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

def load_test_data(data_dir: Path, split: str = "test") -> list[dict[str, str]]:
    """Load test data from HF dataset or JSONL."""
    try:
        from datasets import load_from_disk
        ds = load_from_disk(str(data_dir))
        if split in ds:
            return [dict(row) for row in ds[split]]
    except Exception:
        pass

    jsonl_path = data_dir / f"{split}.jsonl"
    if jsonl_path.exists():
        records = []
        with open(jsonl_path, encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    records.append(json.loads(line))
        return records

    raise FileNotFoundError(f"No test data in {data_dir}")


def load_all_tools() -> list[dict[str, Any]]:
    """Load all tools/skills for corpus construction."""
    import yaml as yaml_lib

    items: list[dict[str, Any]] = []

    # OMS skills
    skills_dir = PROJECT_ROOT / "content" / "skills"
    if skills_dir.exists():
        for ext in ("*.yaml", "*.yml"):
            for path in sorted(skills_dir.glob(ext)):
                try:
                    with open(path, encoding="utf-8") as f:
                        data = yaml_lib.safe_load(f)
                    if data:
                        data["_source"] = "oms_skill"
                        items.append(data)
                except Exception:
                    pass

    # OMS plugins
    plugins_dir = PROJECT_ROOT / "content" / "plugins"
    if plugins_dir.exists():
        for ext in ("*.yaml", "*.yml"):
            for path in sorted(plugins_dir.glob(ext)):
                try:
                    with open(path, encoding="utf-8") as f:
                        data = yaml_lib.safe_load(f)
                    if data:
                        data["_source"] = "oms_plugin"
                        items.append(data)
                except Exception:
                    pass

    # TU tools
    tu_path = PROJECT_ROOT / "data" / "tools_universe" / "data" / "tu_all_tools_full.json"
    if tu_path.exists():
        with open(tu_path, encoding="utf-8") as f:
            tools = json.load(f)
        for t in tools:
            t["_source"] = "tu_tool"
        items.extend(tools)

    return items


# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------

def reciprocal_rank(gt: int, retrieved: list[int], k: int = 5) -> float:
    """MRR component for a single query."""
    for rank, idx in enumerate(retrieved[:k], start=1):
        if idx == gt:
            return 1.0 / rank
    return 0.0


def recall_at_k(gt: int, retrieved: list[int], k: int) -> float:
    """Recall@k for binary relevance."""
    return 1.0 if gt in retrieved[:k] else 0.0


def ndcg_at_k(gt: int, retrieved: list[int], k: int) -> float:
    """NDCG@k for binary relevance."""
    dcg = 0.0
    for rank, idx in enumerate(retrieved[:k], start=1):
        if idx == gt:
            dcg += 1.0 / math.log2(rank + 1)
    idcg = 1.0 / math.log2(2)
    return dcg / idcg if idcg > 0 else 0.0


def compute_metrics(
    ground_truth: list[int],
    all_retrieved: list[list[int]],
) -> dict[str, float]:
    """Compute all retrieval metrics."""
    n = len(ground_truth)
    return {
        "mrr@5": round(sum(reciprocal_rank(g, r, 5) for g, r in zip(ground_truth, all_retrieved)) / n, 4),
        "recall@1": round(sum(recall_at_k(g, r, 1) for g, r in zip(ground_truth, all_retrieved)) / n, 4),
        "recall@5": round(sum(recall_at_k(g, r, 5) for g, r in zip(ground_truth, all_retrieved)) / n, 4),
        "recall@10": round(sum(recall_at_k(g, r, 10) for g, r in zip(ground_truth, all_retrieved)) / n, 4),
        "ndcg@10": round(sum(ndcg_at_k(g, r, 10) for g, r in zip(ground_truth, all_retrieved)) / n, 4),
    }


# ---------------------------------------------------------------------------
# In-memory benchmark
# ---------------------------------------------------------------------------

def benchmark_in_memory(
    model_name_or_path: str,
    queries: list[str],
    corpus: list[str],
    ground_truth: list[int],
    batch_size: int = 64,
) -> tuple[dict[str, float], float]:
    """Benchmark a model using in-memory cosine similarity.

    Returns:
        Tuple of (metrics dict, total time in seconds).
    """
    from sentence_transformers import SentenceTransformer

    logger.info("Loading model: %s", model_name_or_path)
    t0 = time.time()
    model = SentenceTransformer(model_name_or_path, trust_remote_code=True)

    # Encode corpus
    corpus_emb = model.encode(
        corpus, batch_size=batch_size, normalize_embeddings=True,
        convert_to_numpy=True, show_progress_bar=False,
    )

    # Encode queries
    query_emb = model.encode(
        queries, batch_size=batch_size, normalize_embeddings=True,
        convert_to_numpy=True, show_progress_bar=False,
    )

    # Retrieve
    similarities = np.dot(query_emb, corpus_emb.T)
    all_retrieved = [np.argsort(similarities[i])[::-1][:10].tolist() for i in range(len(queries))]

    total_time = time.time() - t0

    metrics = compute_metrics(ground_truth, all_retrieved)

    # Cleanup
    del model, corpus_emb, query_emb, similarities
    try:
        import torch
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    except ImportError:
        pass
    import gc
    gc.collect()

    return metrics, total_time


# ---------------------------------------------------------------------------
# Qdrant benchmark
# ---------------------------------------------------------------------------

def benchmark_qdrant(
    model_name_or_path: str,
    queries: list[str],
    ground_truth_names: list[str],
    qdrant_url: str,
    collection_name: str,
    batch_size: int = 64,
) -> tuple[dict[str, float], float]:
    """Benchmark using Qdrant vector search.

    Returns:
        Tuple of (metrics dict, total time in seconds).
    """
    from sentence_transformers import SentenceTransformer
    from qdrant_client import QdrantClient

    t0 = time.time()
    model = SentenceTransformer(model_name_or_path, trust_remote_code=True)
    client = QdrantClient(url=qdrant_url, timeout=60)

    # Encode queries
    query_emb = model.encode(
        queries, batch_size=batch_size, normalize_embeddings=True,
        convert_to_numpy=True, show_progress_bar=False,
    )

    # Search Qdrant for each query
    hits_at_10 = 0
    hits_at_5 = 0
    hits_at_1 = 0
    mrr_sum = 0.0
    ndcg_sum = 0.0

    for i, (emb, gt_name) in enumerate(zip(query_emb, ground_truth_names)):
        results = client.query_points(
            collection_name=collection_name,
            query=emb.tolist(),
            limit=10,
        )

        retrieved_names = [r.payload.get("tool_name", "") for r in results.points]

        for rank, name in enumerate(retrieved_names[:10], start=1):
            if name == gt_name:
                if rank <= 1:
                    hits_at_1 += 1
                if rank <= 5:
                    hits_at_5 += 1
                    mrr_sum += 1.0 / rank
                hits_at_10 += 1
                ndcg_sum += 1.0 / math.log2(rank + 1)
                break

    total_time = time.time() - t0
    n = len(queries)
    idcg = 1.0 / math.log2(2)

    metrics = {
        "mrr@5": round(mrr_sum / n, 4),
        "recall@1": round(hits_at_1 / n, 4),
        "recall@5": round(hits_at_5 / n, 4),
        "recall@10": round(hits_at_10 / n, 4),
        "ndcg@10": round(ndcg_sum / (n * idcg), 4),
    }

    del model
    import gc
    gc.collect()

    return metrics, total_time


# ---------------------------------------------------------------------------
# Visualization
# ---------------------------------------------------------------------------

def generate_comparison_chart(
    all_results: dict[str, dict[str, float]],
    output_path: Path,
) -> None:
    """Generate a bar chart comparing model metrics."""
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        logger.warning("matplotlib not installed, skipping chart generation")
        return

    metrics = ["mrr@5", "recall@1", "recall@5", "recall@10", "ndcg@10"]
    model_names = list(all_results.keys())
    n_models = len(model_names)
    n_metrics = len(metrics)

    x = np.arange(n_metrics)
    width = 0.8 / n_models

    fig, ax = plt.subplots(figsize=(12, 6))

    for i, model_name in enumerate(model_names):
        values = [all_results[model_name].get(m, 0) for m in metrics]
        offset = (i - n_models / 2 + 0.5) * width
        bars = ax.bar(x + offset, values, width, label=model_name, alpha=0.85)

        # Add value labels
        for bar, val in zip(bars, values):
            if val > 0:
                ax.text(
                    bar.get_x() + bar.get_width() / 2,
                    bar.get_height() + 0.005,
                    f"{val:.3f}",
                    ha="center",
                    va="bottom",
                    fontsize=7,
                    rotation=45,
                )

    ax.set_ylabel("Score")
    ax.set_title("OMS ToolRAG - Model Comparison")
    ax.set_xticks(x)
    ax.set_xticklabels(metrics)
    ax.set_ylim(0, 1.1)
    ax.legend(loc="upper left", fontsize=8)
    ax.grid(axis="y", alpha=0.3)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info("Chart saved to %s", output_path)


# ---------------------------------------------------------------------------
# Reporting
# ---------------------------------------------------------------------------

def format_markdown_table(
    all_results: dict[str, dict[str, Any]],
) -> str:
    """Format results as markdown table."""
    metrics = ["mrr@5", "recall@1", "recall@5", "recall@10", "ndcg@10"]
    header = "| Model | " + " | ".join(metrics) + " | Time (s) |"
    separator = "|" + "|".join(["---"] * (len(metrics) + 2)) + "|"

    rows = [header, separator]

    # Find best value per metric for bolding
    best: dict[str, float] = {}
    for m in metrics:
        values = [r.get(m, 0) for r in all_results.values()]
        best[m] = max(values) if values else 0

    for model_name, results in all_results.items():
        cells = []
        for m in metrics:
            val = results.get(m, 0)
            formatted = f"{val:.4f}"
            if val == best[m] and val > 0:
                formatted = f"**{formatted}**"
            cells.append(formatted)
        time_val = results.get("time_seconds", 0)
        cells.append(f"{time_val:.1f}")
        rows.append(f"| {model_name} | {' | '.join(cells)} |")

    return "\n".join(rows)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="End-to-end retrieval benchmark for OMS ToolRAG models"
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
        "--qdrant-url",
        type=str,
        help="Qdrant URL for live search benchmark (omit for in-memory only)",
    )
    parser.add_argument(
        "--collection-name",
        default="oms_tools_custom",
        help="Qdrant collection name",
    )
    parser.add_argument(
        "--all-baselines",
        action="store_true",
        help="Benchmark all baseline models",
    )
    parser.add_argument(
        "--in-memory",
        action="store_true",
        default=True,
        help="Use in-memory cosine similarity (default: True)",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=64,
    )
    parser.add_argument(
        "--max-queries",
        type=int,
        default=0,
        help="Limit number of test queries (0 = all)",
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
    test_data = load_test_data(args.test_data)
    if args.max_queries > 0:
        test_data = test_data[:args.max_queries]

    logger.info("Test data: %d pairs", len(test_data))

    # Build queries and corpus for in-memory evaluation
    corpus_map: dict[str, int] = {}
    queries: list[str] = []
    ground_truth: list[int] = []
    ground_truth_names: list[str] = []

    for record in test_data:
        query = record.get("anchor", record.get("query", ""))
        positive = record.get("positive", record.get("tool_description", ""))
        if not query or not positive:
            continue

        if positive not in corpus_map:
            corpus_map[positive] = len(corpus_map)

        queries.append(query)
        ground_truth.append(corpus_map[positive])
        # For Qdrant mode, try to extract tool name
        ground_truth_names.append(record.get("tool_name", ""))

    corpus = [""] * len(corpus_map)
    for doc, idx in corpus_map.items():
        corpus[idx] = doc

    logger.info("Queries: %d, Corpus: %d unique docs", len(queries), len(corpus))

    # Build model list
    models: dict[str, str] = {}
    if args.model_path:
        name = Path(args.model_path).name if Path(args.model_path).exists() else args.model_path
        models[name] = args.model_path

    if args.all_baselines:
        models.update(BASELINE_MODELS)

    # Also search for trained models
    trained_dir = SCRIPT_DIR.parent / "models"
    if trained_dir.exists():
        for mdir in trained_dir.iterdir():
            final = mdir / "final"
            if final.exists() and mdir.name not in models:
                models[mdir.name] = str(final)

    if not models:
        logger.error("No models to benchmark. Use --model-path or --all-baselines")
        return

    logger.info("Models to benchmark: %s", list(models.keys()))

    # Run benchmarks
    all_results: dict[str, dict[str, Any]] = {}

    for model_label, model_path in models.items():
        logger.info("\n" + "=" * 50)
        logger.info("Benchmarking: %s", model_label)
        logger.info("=" * 50)

        try:
            if args.qdrant_url:
                metrics, elapsed = benchmark_qdrant(
                    model_path, queries, ground_truth_names,
                    args.qdrant_url, args.collection_name, args.batch_size,
                )
            else:
                metrics, elapsed = benchmark_in_memory(
                    model_path, queries, corpus, ground_truth, args.batch_size,
                )

            metrics["time_seconds"] = round(elapsed, 1)
            all_results[model_label] = metrics

            logger.info("Results for %s (%.1fs):", model_label, elapsed)
            for k, v in metrics.items():
                if k != "time_seconds":
                    logger.info("  %s: %.4f", k, v)

        except Exception as exc:
            logger.error("Failed to benchmark %s: %s", model_label, exc)

    if not all_results:
        logger.error("No successful benchmarks")
        return

    # Generate report
    args.output_dir.mkdir(parents=True, exist_ok=True)

    # Markdown table
    table = format_markdown_table(all_results)
    logger.info("\n--- Benchmark Results ---\n%s", table)

    report_path = args.output_dir / "benchmark_report.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# OMS ToolRAG Retrieval Benchmark\n\n")
        f.write(f"Test queries: {len(queries)}\n")
        f.write(f"Corpus size: {len(corpus)}\n")
        f.write(f"Mode: {'Qdrant' if args.qdrant_url else 'In-memory'}\n\n")
        f.write("## Results\n\n")
        f.write(table)
        f.write("\n")

    # JSON results
    json_path = args.output_dir / "benchmark_results.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, indent=2)

    # Chart
    chart_path = args.output_dir / "benchmark_comparison.png"
    generate_comparison_chart(all_results, chart_path)

    logger.info("\nResults saved to: %s", args.output_dir)
    logger.info("  Report: %s", report_path)
    logger.info("  JSON: %s", json_path)
    logger.info("  Chart: %s", chart_path)


if __name__ == "__main__":
    main()
