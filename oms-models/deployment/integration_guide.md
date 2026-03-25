# OMS ToolRAG Integration Guide

> How to integrate the trained custom embedding model into the OMS ecosystem: website search, CLI, vector database, and model distribution.

---

## Architecture Overview

```
                    ┌─────────────────────────────────┐
                    │       OMS Website (Astro)        │
                    │   Pagefind (keyword) + Qdrant    │
                    │     (semantic) = Hybrid Search   │
                    └───────────────┬─────────────────┘
                                    │ API calls
                    ┌───────────────▼─────────────────┐
                    │     Search API (CF Worker)       │
                    │   /api/search?q=...&mode=hybrid  │
                    └───────────────┬─────────────────┘
                                    │
                    ┌───────────────▼─────────────────┐
                    │         Qdrant (K3s)             │
                    │   Collection: oms_tools_custom   │
                    │   768d vectors (or 256d fast)    │
                    └─────────────────────────────────┘

                    ┌─────────────────────────────────┐
                    │         OMS CLI                  │
                    │   oms find-tools "query"         │
                    │   Uses GGUF via Ollama or        │
                    │   sentence-transformers local    │
                    └───────────────┬─────────────────┘
                                    │
                    ┌───────────────▼─────────────────┐
                    │    Ollama (K3s or local)         │
                    │    Model: oms-toolrag-v1         │
                    │    GGUF Q4_0 (~150MB)            │
                    └─────────────────────────────────┘
```

---

## 1. Qdrant Integration

### Collection Setup

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient(host="100.120.120.20", port=6333)  # K3s Tailscale IP

# Create collection for custom model embeddings
client.create_collection(
    collection_name="oms_tools_custom",
    vectors_config=VectorParams(
        size=768,                    # EmbeddingGemma full dimension
        distance=Distance.COSINE,
    ),
)
```

### Multi-Dimensional Deployment (MRL)

With EmbeddingGemma's Matryoshka dimensions, we can create multiple collections or use named vectors:

```python
from qdrant_client.models import VectorParams

# Option A: Separate collections for different speed/quality trade-offs
collections = {
    "oms_tools_768d": VectorParams(size=768, distance=Distance.COSINE),   # Maximum quality
    "oms_tools_256d": VectorParams(size=256, distance=Distance.COSINE),   # Balanced
    "oms_tools_128d": VectorParams(size=128, distance=Distance.COSINE),   # Fastest
}

# Option B: Named vectors in a single collection
client.create_collection(
    collection_name="oms_tools_custom",
    vectors_config={
        "full": VectorParams(size=768, distance=Distance.COSINE),
        "fast": VectorParams(size=256, distance=Distance.COSINE),
    },
)
```

### Indexing All Tools

```python
from sentence_transformers import SentenceTransformer
import yaml
import json

# Load trained model
model = SentenceTransformer("trained/oms-toolrag-gemma-v1")

# Load OMS skills
tools = []
for yaml_file in Path("content/skills/").glob("*.yaml"):
    with open(yaml_file) as f:
        skill = yaml.safe_load(f)
        tools.append({
            "id": skill["name"],
            "text": skill["description"],
            "metadata": {
                "name": skill["name"],
                "display_name": skill["display_name"],
                "category": skill["category"],
                "tags": skill.get("tags", []),
                "evidence_level": skill.get("evidence_level", ""),
                "safety": skill.get("safety", ""),
                "source": "oms_skill",
                "verified": skill.get("verified", False),
                "reviewer": skill.get("reviewer", ""),
            }
        })

# Load ToolUniverse tools
from tooluniverse import ToolUniverse
tu = ToolUniverse()
for tool in tu.get_all_tools():
    tools.append({
        "id": f"tu_{tool['name']}",
        "text": tool["description"],
        "metadata": {
            "name": tool["name"],
            "category": tool.get("category", ""),
            "source": "tooluniverse",
            "tu_source": tool.get("source", ""),
        }
    })

# Encode all tool descriptions
descriptions = [t["text"] for t in tools]
embeddings = model.encode_document(descriptions)  # Use document encoding

# For MRL, truncate to desired dimension
embeddings_256d = embeddings[:, :256]
# Re-normalize after truncation
import numpy as np
embeddings_256d = embeddings_256d / np.linalg.norm(embeddings_256d, axis=1, keepdims=True)

# Upload to Qdrant
points = [
    PointStruct(
        id=i,
        vector=embeddings[i].tolist(),
        payload=tools[i]["metadata"],
    )
    for i in range(len(tools))
]

client.upsert(
    collection_name="oms_tools_custom",
    points=points,
)

print(f"Indexed {len(points)} tools in Qdrant")
```

### Metadata Filtering

Qdrant supports payload filtering, enabling queries like "find emergency tools with high evidence":

```python
from qdrant_client.models import Filter, FieldCondition, MatchValue

# Semantic search with category filter
results = client.search(
    collection_name="oms_tools_custom",
    query_vector=query_embedding.tolist(),
    query_filter=Filter(
        must=[
            FieldCondition(key="category", match=MatchValue(value="emergency")),
            FieldCondition(key="evidence_level", match=MatchValue(value="high")),
        ]
    ),
    limit=10,
)
```

### Payload Schema

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `name` | string | Yes (keyword) | Tool/skill unique identifier |
| `display_name` | string | No | Human-readable name |
| `category` | string | Yes (keyword) | One of 14 OMS categories |
| `tags` | string[] | Yes (keyword) | Semantic tags |
| `evidence_level` | string | Yes (keyword) | high/moderate/low/expert-opinion |
| `safety` | string | Yes (keyword) | safe/caution/restricted |
| `source` | string | Yes (keyword) | oms_skill/oms_plugin/tooluniverse |
| `verified` | bool | Yes | Physician-verified status |
| `reviewer` | string | No | Reviewing physician name |

---

## 2. OMS Website Search (Hybrid)

### Current State

The OMS website uses **Pagefind** for client-side keyword search. This is a build-time generated index that searches skill names, descriptions, tags, and categories via exact/fuzzy keyword matching.

### Proposed Hybrid Architecture

```
User Query: "tool for checking drug interactions in elderly patients"
    │
    ├──→ Pagefind (keyword)
    │    Results: [drug-interaction-checker, medication-review, ...]
    │    Score: BM25-like keyword relevance
    │
    ├──→ Qdrant (semantic via custom model)
    │    Results: [pharmacokinetic-analyzer, drug-interaction-checker, geriatric-med-review, ...]
    │    Score: Cosine similarity from custom embeddings
    │
    └──→ Result Merger
         Weight: 0.3 * keyword_score + 0.7 * semantic_score
         Final: [drug-interaction-checker, pharmacokinetic-analyzer, geriatric-med-review, ...]
```

### Search API Endpoint

The existing Cloudflare Worker search API (`workers/search-api/`) can be extended:

```typescript
// workers/search-api/src/handlers/search.ts

interface SearchRequest {
  query: string;
  mode: "keyword" | "semantic" | "hybrid";
  category?: string;
  evidence_level?: string;
  safety?: string;
  limit?: number;
}

interface SearchResult {
  name: string;
  display_name: string;
  description: string;
  category: string;
  score: number;
  source: "keyword" | "semantic" | "hybrid";
}

export async function handleSearch(request: SearchRequest): Promise<SearchResult[]> {
  const { query, mode = "hybrid", limit = 10 } = request;

  if (mode === "keyword") {
    return keywordSearch(query, limit);
  }

  if (mode === "semantic") {
    return semanticSearch(query, limit);
  }

  // Hybrid: merge results
  const [keywordResults, semanticResults] = await Promise.all([
    keywordSearch(query, limit * 2),
    semanticSearch(query, limit * 2),
  ]);

  return mergeResults(keywordResults, semanticResults, {
    keywordWeight: 0.3,
    semanticWeight: 0.7,
    limit,
  });
}
```

### Embedding at Query Time

For the search API, we need to encode the query into an embedding. Options:

| Option | Latency | Cost | Complexity |
|--------|---------|------|-----------|
| **Ollama on K3s** | ~50-100ms | Free (self-hosted) | Medium |
| **HuggingFace Inference API** | ~200-500ms | Free tier available | Low |
| **CF Workers AI** | ~20-50ms | Pay per request | Low (if model supported) |
| **Pre-computed query cache** | <5ms | Free | High (limited query coverage) |

Recommended: **Ollama on K3s** for the MVP. The model serves from the same cluster as Qdrant, minimizing network latency.

---

## 3. OMS CLI Integration

### Current Implementation

The OMS CLI (`cli/lib/skills.js`) currently uses a generic embedding model for `oms find-tools`:

```javascript
// cli/lib/skills.js (current)
const { pipeline } = require("@xenova/transformers");
const embedder = await pipeline("feature-extraction", "nomic-ai/nomic-embed-text-v1.5");
```

### Updated Implementation with Custom Model

```javascript
// cli/lib/skills.js (proposed)

const EMBEDDING_MODELS = {
  // Custom model via Ollama (preferred)
  ollama: {
    name: "oms-toolrag-v1",
    endpoint: "http://localhost:11434/api/embeddings",
    dimensions: 256,  // Use MRL 256d for CLI speed
  },
  // Fallback: generic model via transformers.js
  fallback: {
    name: "nomic-ai/nomic-embed-text-v1.5",
    dimensions: 768,
  },
};

async function getEmbedding(text, config) {
  try {
    // Try Ollama first (custom model)
    const response = await fetch(config.ollama.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.ollama.name,
        prompt: text,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.embedding;
    }
  } catch (e) {
    // Ollama not available, fall through to fallback
  }

  // Fallback to generic model
  const embedder = await pipeline("feature-extraction", config.fallback.name);
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}
```

### Pre-computed Tool Embeddings for CLI

To avoid requiring Ollama for basic CLI usage, we pre-compute and ship tool embeddings:

```javascript
// cli/data/tool_embeddings.json (generated at build time)
{
  "model": "oms-toolrag-v1",
  "dimension": 256,
  "tools": [
    {
      "name": "drug-interaction-checker",
      "embedding": [0.0234, -0.0891, ...]  // 256 floats
    },
    // ... 2,049 tools
  ]
}
```

At 256 dimensions with float32, this file is approximately:
- 2,049 tools x 256 dims x 4 bytes = ~2.1 MB (uncompressed)
- ~800 KB (gzipped) -- small enough to ship with the CLI

### CLI Flow

```
oms find-tools "check drug interactions for transplant patient"
    │
    ├──→ Check: Is Ollama running with oms-toolrag-v1?
    │    ├── YES → Encode query via Ollama (256d)
    │    └── NO  → Encode query via transformers.js fallback (768d → truncate to 256d)
    │
    ├──→ Load pre-computed tool embeddings (cli/data/tool_embeddings.json)
    │
    ├──→ Compute cosine similarity: query_emb @ tool_embs.T
    │
    ├──→ Sort by similarity, return top-10
    │
    └──→ Display results with scores, categories, evidence levels
```

---

## 4. HuggingFace Hub Distribution

### Model Card

Push the trained model to HuggingFace Hub at `intelmedica/oms-toolrag-v1`:

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("trained/oms-toolrag-gemma-v1")

model.save_to_hub(
    repo_id="intelmedica/oms-toolrag-v1",
    private=False,
    exist_ok=True,
    tags=[
        "medical",
        "tool-retrieval",
        "biomedical",
        "sentence-transformers",
        "embedding",
        "matryoshka",
    ],
)
```

### Model Card Template

```markdown
---
license: apache-2.0
language:
- en
pipeline_tag: sentence-similarity
library_name: sentence-transformers
tags:
- sentence-transformers
- medical
- tool-retrieval
- biomedical
- matryoshka
base_model: google/embeddinggemma-300m
datasets:
- custom (OMS + ToolUniverse)
---

# OMS ToolRAG v1

A 300M parameter embedding model fine-tuned for medical AI tool retrieval.
Trained on 2,049 biomedical tools spanning 14 medical categories.

## Usage

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("intelmedica/oms-toolrag-v1")

query = "tool for checking drug interactions in elderly patients"
tools = ["Drug interaction database...", "Pediatric dosing calculator...", ...]

query_emb = model.encode_query(query)
tool_embs = model.encode_document(tools)

similarities = model.similarity(query_emb, tool_embs)
```

## Benchmarks

| Metric | OMS Skills | ToolUniverse | Cross-Domain | Clinical |
|--------|-----------|-------------|-------------|---------|
| MRR@5  | TBD       | TBD         | TBD         | TBD     |
| R@1    | TBD       | TBD         | TBD         | TBD     |
| R@5    | TBD       | TBD         | TBD         | TBD     |

## Training

- Base: google/embeddinggemma-300m
- Loss: CachedMNRL + MatryoshkaLoss
- Data: ~35,000 (query, tool) pairs from OMS + ToolUniverse
- Categories: 14 medical specialties

## Limitations

- Research tool only, not for clinical decision support
- Optimized for English medical terminology
- Coverage limited to tools in training set (2,049)

## Organization

[IntelMedica.ai](https://intelmedica.ai) -- Open-source medical AI research tools
```

---

## 5. Ollama Deployment

### GGUF Conversion

Convert the trained sentence-transformers model to GGUF format for Ollama serving:

```python
# scripts/convert_gguf.py

from transformers import AutoModel, AutoTokenizer
import subprocess

MODEL_PATH = "trained/oms-toolrag-gemma-v1"
GGUF_OUTPUT = "trained/oms-toolrag-gemma-v1-gguf"

# Step 1: Export to ONNX or use llama.cpp conversion
# For EmbeddingGemma (Gemma 3 architecture), use the llama.cpp converter:

subprocess.run([
    "python", "llama.cpp/convert_hf_to_gguf.py",
    MODEL_PATH,
    "--outfile", f"{GGUF_OUTPUT}/oms-toolrag-v1-f16.gguf",
    "--outtype", "f16",
])

# Step 2: Quantize
subprocess.run([
    "llama.cpp/quantize",
    f"{GGUF_OUTPUT}/oms-toolrag-v1-f16.gguf",
    f"{GGUF_OUTPUT}/oms-toolrag-v1-q4_0.gguf",
    "q4_0",
])

subprocess.run([
    "llama.cpp/quantize",
    f"{GGUF_OUTPUT}/oms-toolrag-v1-f16.gguf",
    f"{GGUF_OUTPUT}/oms-toolrag-v1-q8_0.gguf",
    "q8_0",
])
```

### Ollama Modelfile

```dockerfile
# Modelfile for OMS ToolRAG v1
FROM ./oms-toolrag-v1-q4_0.gguf

PARAMETER num_ctx 2048
PARAMETER temperature 0

TEMPLATE """{{ .Prompt }}"""

SYSTEM """You are a text embedding model. Output the embedding vector for the input text."""
```

### Deploy to K3s

```bash
# Create the model in Ollama
ollama create oms-toolrag-v1 -f Modelfile

# Verify
ollama run oms-toolrag-v1 "test embedding"

# The model will be served at the Ollama endpoint
# K3s: http://100.120.120.20:11434/api/embeddings
```

### GGUF Size Estimates

| Quantization | EmbeddingGemma-300M | GTE-Qwen2-1.5B |
|-------------|--------------------|-----------------|
| f16 | ~600MB | ~3GB |
| q8_0 | ~300MB | ~1.5GB |
| q4_0 | ~150MB | ~800MB |

---

## 6. Deployment Checklist

### Pre-Deployment

- [ ] Model trained and evaluated (MRR@5 > 0.85 on OMS test set)
- [ ] GGUF conversion completed and verified
- [ ] HuggingFace model card written with benchmarks
- [ ] Pre-computed tool embeddings generated for CLI
- [ ] Qdrant collection created and indexed
- [ ] Search API endpoint updated for hybrid search

### Deployment Steps

1. **Push model to HuggingFace Hub** (`intelmedica/oms-toolrag-v1`)
2. **Deploy GGUF to Ollama on K3s** (namespace: `oms`)
3. **Index all tools in Qdrant** (2,049 vectors)
4. **Update search API worker** (add semantic search handler)
5. **Update CLI** (add custom model support, ship pre-computed embeddings)
6. **Update OMS website** (add semantic search toggle)

### Post-Deployment Monitoring

| Metric | How to Measure | Alert Threshold |
|--------|---------------|-----------------|
| Search relevance | User click-through on top-3 results | < 60% CTR |
| Query latency | P95 of /api/search response time | > 500ms |
| Embedding freshness | Time since last Qdrant re-index | > 7 days |
| Model availability | Ollama health check | Any downtime |

### Rollback Plan

If the custom model degrades search quality:
1. Search API: Switch `mode` default from `hybrid` to `keyword` (Pagefind only)
2. CLI: Fall back to `nomic-embed-text` (already implemented as fallback)
3. Qdrant: Keep collection but disable semantic search endpoint
4. Investigate: Compare query logs to identify failing query patterns

---

## 7. Future Improvements

### Re-indexing Pipeline

When new skills are added to OMS:
1. Extract description from new skill YAML
2. Encode with current model
3. Upsert into Qdrant collection
4. Regenerate CLI pre-computed embeddings file

This should be automated as part of the CI/CD pipeline (on merge to main).

### Model Updates

When retraining with new data:
1. Train new model version (v2, v3, etc.)
2. Re-index all tools with new model
3. A/B test: serve both old and new model, compare relevance metrics
4. If new model is better, promote to production
5. Push new version to HuggingFace Hub

### Hybrid Re-ranking

For maximum quality, add a cross-encoder re-ranker after initial retrieval:
1. Retrieve top-50 with bi-encoder (fast, ~10ms)
2. Re-rank top-50 with cross-encoder (slower, ~100ms per pair)
3. Return top-10 re-ranked results

Candidate re-rankers: Qwen3-Reranker-0.6B, BGE-reranker-v2-m3.
