#!/usr/bin/env python3
"""
Embed OMS native skills into Qdrant.

Reads all content/skills/*.yaml files, generates embeddings via Ollama,
and upserts to the Qdrant collection with source: "oms" payload.

Usage: python scripts/embed-oms-skills.py

Environment:
  OLLAMA_URL     - Ollama API (default: http://localhost:11434)
  QDRANT_URL     - Qdrant API (default: http://localhost:6333)
  COLLECTION     - Qdrant collection (default: tu_tools_nomic)
  EMBED_MODEL    - Ollama model (default: nomic-embed-text)
"""

import glob
import os
import sys
import uuid

import requests
import yaml

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6333")
COLLECTION = os.environ.get("COLLECTION", "tu_tools_nomic")
EMBED_MODEL = os.environ.get("EMBED_MODEL", "nomic-embed-text")
CONTENT_DIR = os.path.join(os.path.dirname(__file__), "..", "content", "skills")


def load_skills():
    """Load all skill YAML files."""
    skills = []
    for pattern in ["*.yaml", "*.yml"]:
        for path in glob.glob(os.path.join(CONTENT_DIR, pattern)):
            try:
                with open(path) as f:
                    data = yaml.safe_load(f)
                if data and isinstance(data, dict):
                    skills.append(data)
            except Exception as e:
                print(f"WARN: Could not parse {path}: {e}")
    return skills


def embed_text(text):
    """Get embedding from Ollama."""
    response = requests.post(
        f"{OLLAMA_URL}/api/embeddings",
        json={"model": EMBED_MODEL, "prompt": text},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["embedding"]


def upsert_to_qdrant(points):
    """Batch upsert points to Qdrant."""
    response = requests.put(
        f"{QDRANT_URL}/collections/{COLLECTION}/points",
        json={"points": points},
        headers={"Content-Type": "application/json"},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def main():
    skills = load_skills()
    if not skills:
        print("No skills found.")
        sys.exit(1)

    print(f"Processing {len(skills)} OMS skills...")

    points = []
    for i, skill in enumerate(skills):
        name = skill.get("name", "unknown")
        description = skill.get("description", "")

        if not description:
            print(f"  SKIP: {name} -- no description")
            continue

        try:
            embedding = embed_text(f"{name}: {description}")
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"oms:{name}"))

            points.append(
                {
                    "id": point_id,
                    "vector": embedding,
                    "payload": {
                        "name": name,
                        "display_name": skill.get("display_name", name),
                        "description": description,
                        "category": skill.get("category", ""),
                        "source": "oms",
                        "author": skill.get("author", ""),
                        "evidence_level": skill.get("evidence_level", ""),
                        "safety_classification": skill.get("safety_classification", ""),
                        "tags": skill.get("tags", []),
                    },
                }
            )

            if (i + 1) % 10 == 0:
                print(f"  Embedded {i + 1}/{len(skills)}...")

        except Exception as e:
            print(f"  ERROR: {name} -- {e}")

    if not points:
        print("No points to upsert.")
        sys.exit(1)

    # Batch upsert (Qdrant supports up to ~100 at a time)
    BATCH_SIZE = 50
    for batch_start in range(0, len(points), BATCH_SIZE):
        batch = points[batch_start : batch_start + BATCH_SIZE]
        try:
            upsert_to_qdrant(batch)
            print(f"  Upserted batch {batch_start // BATCH_SIZE + 1}: {len(batch)} points")
        except Exception as e:
            print(f"  ERROR upserting batch: {e}")

    print(f"\nDone. Upserted {len(points)} OMS skill embeddings to Qdrant.")


if __name__ == "__main__":
    main()
