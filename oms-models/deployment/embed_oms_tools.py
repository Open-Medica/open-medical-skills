#!/usr/bin/env python3
"""Re-embed all OMS + ToolUniverse tools into Qdrant with the trained model.

Loads the fine-tuned sentence-transformer model, embeds all 2,049 tools/skills,
and upserts them into a Qdrant collection with full metadata payloads.

References the existing embed_to_qdrant.py patterns for Qdrant operations.

Usage:
    python embed_oms_tools.py --model-path ../models/oms-toolrag-gemma-v1/final
    python embed_oms_tools.py --model-path ../models/oms-toolrag-gemma-v1/final --qdrant-url http://10.30.1.5:31335
    python embed_oms_tools.py --model-path ../models/oms-toolrag-gemma-v1/final --collection oms_tools_custom --batch-size 128
"""

import argparse
import json
import logging
import time
from pathlib import Path
from typing import Any

import yaml

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[2]  # oms-models -> open-medical-skills
SKILLS_DIR = PROJECT_ROOT / "content" / "skills"
PLUGINS_DIR = PROJECT_ROOT / "content" / "plugins"
TU_TOOLS_PATH = PROJECT_ROOT / "data" / "tools_universe" / "data" / "tu_all_tools_full.json"

DEFAULT_QDRANT_URL = "http://10.30.1.5:31335"
DEFAULT_COLLECTION = "oms_tools_custom"
DEFAULT_BATCH_SIZE = 64


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

def load_oms_skills() -> list[dict[str, Any]]:
    """Load OMS skills from YAML."""
    items = []
    if not SKILLS_DIR.exists():
        return items
    for ext in ("*.yaml", "*.yml"):
        for path in sorted(SKILLS_DIR.glob(ext)):
            try:
                with open(path, encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                if data:
                    data["_source"] = "oms_skill"
                    data["_source_file"] = str(path.name)
                    items.append(data)
            except Exception as exc:
                logger.warning("Failed to load %s: %s", path, exc)
    return items


def load_oms_plugins() -> list[dict[str, Any]]:
    """Load OMS plugins from YAML."""
    items = []
    if not PLUGINS_DIR.exists():
        return items
    for ext in ("*.yaml", "*.yml"):
        for path in sorted(PLUGINS_DIR.glob(ext)):
            try:
                with open(path, encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                if data:
                    data["_source"] = "oms_plugin"
                    data["_source_file"] = str(path.name)
                    items.append(data)
            except Exception as exc:
                logger.warning("Failed to load %s: %s", path, exc)
    return items


def load_tu_tools() -> list[dict[str, Any]]:
    """Load ToolUniverse tools from JSON."""
    if not TU_TOOLS_PATH.exists():
        return []
    with open(TU_TOOLS_PATH, encoding="utf-8") as f:
        tools = json.load(f)
    for tool in tools:
        tool["_source"] = "tu_tool"
    return tools


# ---------------------------------------------------------------------------
# Embedding text and payload builders
# ---------------------------------------------------------------------------

def build_embedding_text(item: dict[str, Any]) -> str:
    """Build text to embed for a given item.

    Follows the same pattern as embed_to_qdrant.py but extended for OMS items.
    """
    source = item.get("_source", "unknown")

    if source in ("oms_skill", "oms_plugin"):
        name = item.get("display_name", item.get("name", ""))
        desc = item.get("description", "")
        category = item.get("category", "")
        tags = item.get("tags", [])
        specialty = item.get("specialty", [])

        parts = [f"{name}: {desc}"]
        if category:
            parts.append(f"Category: {category}")
        if tags:
            parts.append(f"Tags: {', '.join(tags)}")
        if specialty:
            parts.append(f"Specialty: {', '.join(specialty)}")
        evidence = item.get("evidence_level", "")
        if evidence:
            parts.append(f"Evidence: {evidence}")

        return ". ".join(parts)

    else:  # tu_tool
        name = item.get("name", "")
        desc = item.get("description", "")
        category = item.get("_category", "")
        tool_type = item.get("type", "")

        params = item.get("parameter", {})
        param_props = params.get("properties", {}) if isinstance(params, dict) else {}
        param_names = ", ".join(param_props.keys()) if param_props else ""

        parts = [f"{name}: {desc}"]
        if category:
            parts.append(f"Category: {category}")
        if tool_type:
            parts.append(f"Type: {tool_type}")
        if param_names:
            parts.append(f"Parameters: {param_names}")

        return ". ".join(parts)


def build_payload(item: dict[str, Any]) -> dict[str, Any]:
    """Build Qdrant payload for storage alongside the vector."""
    source = item.get("_source", "unknown")

    if source in ("oms_skill", "oms_plugin"):
        return {
            "tool_name": item.get("display_name", item.get("name", "")),
            "name_slug": item.get("name", ""),
            "description": item.get("description", ""),
            "category": item.get("category", ""),
            "type": source.replace("oms_", ""),
            "source": source,
            "source_file": item.get("_source_file", ""),
            "tags": item.get("tags", []),
            "specialty": item.get("specialty", []),
            "evidence_level": item.get("evidence_level", ""),
            "safety_classification": item.get("safety_classification", ""),
            "status": item.get("status", ""),
            "verified": item.get("verified", False),
            "author": item.get("author", ""),
            "repository": item.get("repository", ""),
        }
    else:
        params = item.get("parameter", {})
        param_props = params.get("properties", {}) if isinstance(params, dict) else {}
        required = params.get("required", []) if isinstance(params, dict) else []

        return {
            "tool_name": item.get("name", ""),
            "description": item.get("description", ""),
            "category": item.get("_category", ""),
            "type": item.get("type", ""),
            "source": "tu_tool",
            "source_file": item.get("_source_file", ""),
            "parameter_names": list(param_props.keys()),
            "required_parameters": required,
            "parameter_count": len(param_props),
        }


# ---------------------------------------------------------------------------
# Qdrant operations
# ---------------------------------------------------------------------------

def create_collection(
    client: Any,
    collection_name: str,
    vector_size: int,
) -> None:
    """Create or recreate a Qdrant collection."""
    from qdrant_client.models import Distance, VectorParams, PayloadSchemaType

    if client.collection_exists(collection_name):
        logger.info("Deleting existing collection '%s'...", collection_name)
        client.delete_collection(collection_name)

    logger.info("Creating collection '%s' (%dd vectors)...", collection_name, vector_size)
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
    )

    # Create payload indexes for filtering
    logger.info("Creating payload indexes...")
    client.create_payload_index(collection_name, "category", PayloadSchemaType.KEYWORD)
    client.create_payload_index(collection_name, "type", PayloadSchemaType.KEYWORD)
    client.create_payload_index(collection_name, "source", PayloadSchemaType.KEYWORD)
    client.create_payload_index(collection_name, "tool_name", PayloadSchemaType.KEYWORD)
    logger.info("Indexes created on: category, type, source, tool_name")


def upload_embeddings(
    client: Any,
    collection_name: str,
    items: list[dict[str, Any]],
    embeddings: list[list[float]],
    batch_size: int = 100,
) -> None:
    """Upload embeddings and payloads to Qdrant in batches."""
    from qdrant_client.models import PointStruct

    total = len(items)
    uploaded = 0
    t0 = time.time()

    for i in range(0, total, batch_size):
        batch_items = items[i:i + batch_size]
        batch_embeddings = embeddings[i:i + batch_size]

        points = [
            PointStruct(
                id=i + j,
                vector=emb,
                payload=build_payload(item),
            )
            for j, (item, emb) in enumerate(zip(batch_items, batch_embeddings))
        ]

        client.upsert(collection_name=collection_name, points=points)
        uploaded += len(points)

        elapsed = time.time() - t0
        rate = uploaded / elapsed if elapsed > 0 else 0
        eta = (total - uploaded) / rate if rate > 0 else 0
        logger.info(
            "  [%5d/%d] %.1f%% | %.0f items/sec | ETA %.0fs",
            uploaded, total, 100 * uploaded / total, rate, eta,
        )

    elapsed = time.time() - t0
    logger.info("Upload complete: %d items in %.1fs (%.0f items/sec)", uploaded, elapsed, uploaded / max(elapsed, 0.01))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Re-embed all tools into Qdrant with the trained model"
    )
    parser.add_argument(
        "--model-path",
        type=str,
        required=True,
        help="Path to trained sentence-transformer model",
    )
    parser.add_argument(
        "--qdrant-url",
        default=DEFAULT_QDRANT_URL,
        help=f"Qdrant server URL (default: {DEFAULT_QDRANT_URL})",
    )
    parser.add_argument(
        "--collection-name",
        default=DEFAULT_COLLECTION,
        help=f"Qdrant collection name (default: {DEFAULT_COLLECTION})",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=DEFAULT_BATCH_SIZE,
        help=f"Embedding batch size (default: {DEFAULT_BATCH_SIZE})",
    )
    parser.add_argument(
        "--source",
        choices=["oms", "tu", "all"],
        default="all",
        help="Data sources to embed (default: all)",
    )
    parser.add_argument(
        "--update",
        action="store_true",
        help="Update existing collection instead of recreating",
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

    # Load data
    items: list[dict[str, Any]] = []

    if args.source in ("oms", "all"):
        skills = load_oms_skills()
        plugins = load_oms_plugins()
        items.extend(skills)
        items.extend(plugins)
        logger.info("OMS: %d skills + %d plugins", len(skills), len(plugins))

    if args.source in ("tu", "all"):
        tu_tools = load_tu_tools()
        items.extend(tu_tools)
        logger.info("ToolUniverse: %d tools", len(tu_tools))

    if not items:
        logger.error("No items loaded")
        return

    logger.info("Total items to embed: %d", len(items))

    # Load model
    from sentence_transformers import SentenceTransformer

    logger.info("Loading model: %s", args.model_path)
    model = SentenceTransformer(args.model_path, trust_remote_code=True)
    vector_size = model.get_sentence_embedding_dimension()
    logger.info("Model loaded. Vector size: %d", vector_size)

    # Build embedding texts
    texts = [build_embedding_text(item) for item in items]

    # Generate embeddings
    logger.info("Generating embeddings for %d items...", len(texts))
    t0 = time.time()
    embeddings_np = model.encode(
        texts,
        batch_size=args.batch_size,
        show_progress_bar=True,
        normalize_embeddings=True,
        convert_to_numpy=True,
    )
    elapsed = time.time() - t0
    logger.info("Embedding complete: %d items in %.1fs (%.0f items/sec)", len(texts), elapsed, len(texts) / max(elapsed, 0.01))

    # Convert to list of lists for Qdrant
    embeddings = embeddings_np.tolist()

    # Connect to Qdrant
    from qdrant_client import QdrantClient

    logger.info("Connecting to Qdrant at %s...", args.qdrant_url)
    client = QdrantClient(url=args.qdrant_url, timeout=60)

    collections = client.get_collections()
    logger.info("Connected. Existing collections: %s", [c.name for c in collections.collections])

    # Create or update collection
    if not args.update:
        create_collection(client, args.collection_name, vector_size)
    else:
        if not client.collection_exists(args.collection_name):
            create_collection(client, args.collection_name, vector_size)
        else:
            logger.info("Updating existing collection '%s'", args.collection_name)

    # Upload embeddings
    upload_embeddings(client, args.collection_name, items, embeddings, batch_size=100)

    # Verify
    info = client.get_collection(args.collection_name)
    logger.info("\nCollection '%s' info:", args.collection_name)
    logger.info("  Points: %d", info.points_count)
    logger.info("  Vectors: %dd", vector_size)
    logger.info("  Status: %s", info.status)

    # Run test queries
    logger.info("\n--- Test Semantic Queries ---")
    test_queries = [
        "tool for checking drug-drug interactions",
        "analyze genomic variants for clinical significance",
        "AI skill for prior authorization review",
        "tools for emergency triage protocols",
        "search PubMed for clinical guidelines",
    ]

    for query in test_queries:
        query_embedding = model.encode([query], normalize_embeddings=True).tolist()[0]
        results = client.query_points(
            collection_name=args.collection_name,
            query=query_embedding,
            limit=5,
        )
        logger.info('Query: "%s"', query)
        for r in results.points:
            source = r.payload.get("source", "")
            cat = r.payload.get("category", "")
            name = r.payload.get("tool_name", "")
            desc = r.payload.get("description", "")[:80]
            logger.info("  %.3f | [%s/%s] %s: %s", r.score, source, cat, name, desc)
        logger.info("")

    logger.info("All done. Collection '%s' has %d points.", args.collection_name, info.points_count)


if __name__ == "__main__":
    main()
