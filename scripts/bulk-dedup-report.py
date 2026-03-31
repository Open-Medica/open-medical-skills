#!/usr/bin/env python3
"""
Bulk semantic deduplication report for OMS skills.

Embeds all skill descriptions and computes pairwise cosine similarity.
Outputs pairs above threshold as CSV.

Usage: python scripts/bulk-dedup-report.py > dedup-report.csv

Requires: requests, numpy (pip install requests numpy)
"""

import csv
import glob
import os
import sys

import numpy as np
import requests
import yaml

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
EMBED_MODEL = os.environ.get("EMBED_MODEL", "nomic-embed-text")
THRESHOLD = float(os.environ.get("DEDUP_THRESHOLD", "0.85"))
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
                    skills.append(
                        {
                            "name": data.get("name", os.path.basename(path)),
                            "description": data.get("description", ""),
                            "category": data.get("category", ""),
                            "path": path,
                        }
                    )
            except Exception as e:
                print(f"WARN: Could not parse {path}: {e}", file=sys.stderr)
    return skills


def embed_text(text):
    """Get embedding from Ollama."""
    response = requests.post(
        f"{OLLAMA_URL}/api/embeddings",
        json={"model": EMBED_MODEL, "prompt": text},
        timeout=30,
    )
    response.raise_for_status()
    return np.array(response.json()["embedding"])


def cosine_similarity(a, b):
    """Compute cosine similarity between two vectors."""
    dot = np.dot(a, b)
    norm = np.linalg.norm(a) * np.linalg.norm(b)
    return dot / norm if norm > 0 else 0.0


def main():
    skills = load_skills()
    if not skills:
        print("No skills found.", file=sys.stderr)
        sys.exit(1)

    print(f"Embedding {len(skills)} skills...", file=sys.stderr)

    # Embed all descriptions
    embeddings = []
    for i, skill in enumerate(skills):
        try:
            emb = embed_text(skill["description"])
            embeddings.append(emb)
            if (i + 1) % 10 == 0:
                print(f"  Embedded {i + 1}/{len(skills)}...", file=sys.stderr)
        except Exception as e:
            print(f"WARN: Could not embed {skill['name']}: {e}", file=sys.stderr)
            embeddings.append(None)

    # Compute pairwise similarities
    writer = csv.writer(sys.stdout)
    writer.writerow(["skill_a", "skill_b", "similarity", "category_a", "category_b"])

    pairs_found = 0
    for i in range(len(skills)):
        if embeddings[i] is None:
            continue
        for j in range(i + 1, len(skills)):
            if embeddings[j] is None:
                continue
            sim = cosine_similarity(embeddings[i], embeddings[j])
            if sim >= THRESHOLD:
                writer.writerow(
                    [
                        skills[i]["name"],
                        skills[j]["name"],
                        f"{sim:.4f}",
                        skills[i]["category"],
                        skills[j]["category"],
                    ]
                )
                pairs_found += 1

    print(f"\nFound {pairs_found} pairs above {THRESHOLD} threshold.", file=sys.stderr)


if __name__ == "__main__":
    main()
