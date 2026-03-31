# OMS ToolRAG -- Custom Embedding Model for Medical AI Tool Retrieval

A research project by [IntelMedica.ai](https://intelmedica.ai) to train a domain-specific embedding model that retrieves the right medical AI tool for any clinical query -- across all biomedical specialties, not just drug reasoning.

## Problem

Harvard's [ToolRAG-T1](https://huggingface.co/mims-harvard/ToolRAG-T1-GTE-Qwen2-1.5B) model was trained on only 211 drug-reasoning tools from ToolUniverse. It excels at matching drug interaction queries to FDA-related tools but lacks coverage for:

- **Broader medical specialties**: surgery, nursing, emergency medicine, pediatrics, mental health, public health, and more
- **AI skill retrieval**: structured skills with YAML metadata, install methods, evidence levels, and safety classifications
- **Cross-domain queries**: questions that span multiple categories (e.g., "pediatric dosing calculator for emergency settings")
- **Scale**: OMS has 2,049 items to index (49 curated skills + 5 plugins + 1,995 ToolUniverse tools), not 211

General-purpose embedding models (nomic-embed-text, mxbai-embed-large) perform adequately on keyword overlap but fail on semantic tool retrieval -- they do not understand that a query about "checking drug-drug interactions for a transplant patient" should retrieve a pharmacokinetics tool rather than a transplant surgery tool.

## Approach

Fine-tune small, efficient embedding models on synthetic (query, tool-description) pairs generated via multi-model consensus, validated by medical accuracy checks. Deploy a model that is:

1. **Accurate**: MRR@5 > 0.85 on OMS tool retrieval benchmarks
2. **Tiny**: Deployable in CLI tools, edge devices, and low-resource servers
3. **Fast**: Sub-50ms inference for real-time search
4. **Comprehensive**: Covers all 14 OMS medical categories

## Directory Structure

```
oms-models/
├── README.md                          # This file
├── research/                          # Research documentation
│   ├── toolrag-analysis.md            # Deep analysis of Harvard's ToolRAG-T1
│   ├── base-model-comparison.md       # Candidate model evaluation
│   ├── training-methodology.md        # Our training approach
│   └── related-papers.md              # Annotated bibliography
├── deployment/                        # Deployment guides
│   └── integration_guide.md           # OMS integration plan
├── data/                              # Training data (generated)
│   ├── raw/                           # Source YAML/JSON extracts
│   ├── augmented/                     # Enriched tool descriptions
│   ├── queries/                       # Synthetic query sets
│   ├── pairs/                         # Final (query, description) pairs
│   └── hard_negatives/                # Mined hard negative pairs
├── notebooks/                         # Training & evaluation notebooks
│   ├── 01_data_preparation.ipynb      # Extract and augment descriptions
│   ├── 02_query_generation.ipynb      # Multi-model synthetic queries
│   ├── 03_hard_negative_mining.ipynb   # Mine hard negatives
│   ├── 04_train_embeddinggemma.ipynb   # Fine-tune EmbeddingGemma-300M
│   ├── 05_train_gte_qwen2.ipynb       # Fine-tune GTE-Qwen2-1.5B
│   └── 06_evaluation.ipynb            # Benchmark all models
├── models/                            # Downloaded base models
│   ├── embeddinggemma-300m/           # Google EmbeddingGemma (primary)
│   ├── gte-qwen2-1.5b/               # Alibaba GTE-Qwen2 (secondary)
│   ├── qwen3-embedding-0.6b/         # Qwen3-Embedding (candidate)
│   └── toolrag-t1/                    # Harvard ToolRAG-T1 (reference)
├── trained/                           # Fine-tuned model outputs
│   ├── oms-toolrag-gemma-v1/          # Trained EmbeddingGemma
│   └── oms-toolrag-qwen2-v1/         # Trained GTE-Qwen2
├── eval/                              # Evaluation results
│   ├── baselines/                     # Baseline model scores
│   └── trained/                       # Fine-tuned model scores
└── scripts/                           # Utility scripts
    ├── extract_oms_data.py            # Extract from OMS YAML files
    ├── extract_tu_data.py             # Extract from ToolUniverse
    ├── augment_descriptions.py        # LLM description enrichment
    ├── generate_queries.py            # Multi-model query generation
    ├── mine_hard_negatives.py         # Hard negative mining
    ├── convert_gguf.py                # Convert to GGUF for Ollama
    └── push_to_hub.py                # Push to HuggingFace Hub
```

## Quick Start

### Prerequisites

```bash
pip install sentence-transformers torch datasets accelerate
pip install -U transformers>=4.51.0   # Required for Qwen3/Gemma3
```

### 1. Prepare Training Data

```bash
# Extract tool descriptions from OMS content and ToolUniverse
python scripts/extract_oms_data.py --input ../content/skills/ --output data/raw/oms_skills.jsonl
python scripts/extract_tu_data.py --output data/raw/tu_tools.jsonl

# Augment descriptions with clinical context
python scripts/augment_descriptions.py --input data/raw/ --output data/augmented/
```

### 2. Generate Synthetic Queries

```bash
# Multi-model consensus query generation
python scripts/generate_queries.py \
  --input data/augmented/ \
  --output data/queries/ \
  --primary gemini-3-flash \
  --validator claude-sonnet \
  --queries-per-tool 15
```

### 3. Train

Open the appropriate Colab notebook:

| Model | Notebook | GPU | Est. Time |
|-------|----------|-----|-----------|
| EmbeddingGemma-300M (primary) | `04_train_embeddinggemma.ipynb` | T4 (free) | 2-3 hours |
| GTE-Qwen2-1.5B (secondary) | `05_train_gte_qwen2.ipynb` | A100 (Pro) | 4-6 hours |

### 4. Evaluate

```bash
# Run evaluation suite against all baselines
python -m notebooks.06_evaluation \
  --model trained/oms-toolrag-gemma-v1/ \
  --test-set eval/test_queries.jsonl
```

## Model Candidates

| Model | Role | Params | Dim | Context | Architecture | Why |
|-------|------|--------|-----|---------|--------------|-----|
| **EmbeddingGemma-300M** | Primary | 308M | 768 (MRL: 512/256/128) | 2K | Encoder (bi-directional) | Tiny, fast, proven medical fine-tuning (MIRIAD), MRL flexibility |
| **GTE-Qwen2-1.5B** | Secondary | ~1.5B | 1536 | 4K | Decoder (causal, last-token pool) | Same base as ToolRAG-T1, longer context, higher capacity |
| Qwen3-Embedding-0.6B | Candidate | 600M | 1024 | 32K | Decoder (causal) | Newer architecture, strong MTEB scores, MRL support |
| Snowflake Arctic Embed L v2 | Candidate | 303M | 1024 | 32K | Encoder | Long context encoder, competitive benchmarks |

See [research/base-model-comparison.md](research/base-model-comparison.md) for the full evaluation.

## Data Pipeline

```
Source Data (2,049 items)
  │
  ├── 49 OMS Skill YAMLs (content/skills/)
  ├── 5 OMS Plugin YAMLs (content/plugins/)
  ├── 1,995 ToolUniverse tools (Harvard MIMS)
  └── 49 SKILL.md documentation files (skills/)
  │
  ▼
Augmented Descriptions
  │  LLM-enriched with clinical scenarios, synonyms,
  │  parameter explanations (+17.8% retrieval improvement)
  │
  ▼
Synthetic Queries (30K-50K pairs)
  │  Multi-model consensus:
  │  Gemini 3 Flash (generation) → Claude Sonnet (validation)
  │  10-20 diverse queries per tool
  │
  ▼
Hard Negatives
  │  Same-category wrong-function pairs
  │  BM25 near-misses, similar-name different-domain
  │
  ▼
Validated Training Pairs
  │  Final (query, positive_tool, hard_negatives) triplets
  │
  ▼
Fine-tuned Model
```

## Training

- **Framework**: [sentence-transformers](https://www.sbert.net/) (SentenceTransformer class)
- **Loss**: CachedMultipleNegativesRankingLoss (EmbeddingGemma) / MultipleNegativesRankingLoss (GTE-Qwen2)
- **Epochs**: 3
- **Learning rate**: 2e-5 with 10% linear warmup
- **Precision**: fp16 (T4) / bf16 (A100)
- **Matryoshka training**: Enabled for EmbeddingGemma (768/512/256/128 dimensions)
- **Batch size**: Dynamic via CachedMNRL (effective batch of 512+ on T4 with EmbeddingGemma)

See [research/training-methodology.md](research/training-methodology.md) for the complete methodology.

## Evaluation

### Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **MRR@5** | Mean Reciprocal Rank at 5 | > 0.85 |
| **Recall@1** | Correct tool in top-1 result | > 0.70 |
| **Recall@5** | Correct tool in top-5 results | > 0.90 |
| **Recall@10** | Correct tool in top-10 results | > 0.95 |
| **NDCG@10** | Normalized Discounted Cumulative Gain | > 0.85 |

### Test Sets

| Test Set | Size | Purpose |
|----------|------|---------|
| OMS Skills | 200 queries | Curated skill retrieval accuracy |
| ToolUniverse | 500 queries | Broad biomedical tool coverage |
| Cross-domain | 100 queries | Multi-category query handling |
| Clinical scenarios | 100 queries | Real-world clinical use cases |

### Baselines

| Model | Role |
|-------|------|
| nomic-embed-text | Generic small embedding (current OMS default) |
| mxbai-embed-large | Generic large embedding |
| ToolRAG-T1 | Harvard's drug-reasoning model (reference) |
| EmbeddingGemma-300M (base) | Untuned primary candidate |
| GTE-Qwen2-1.5B (base) | Untuned secondary candidate |

## Deployment

### Targets

| Target | Format | Use Case |
|--------|--------|----------|
| **Qdrant** | Native sentence-transformers | OMS website semantic search |
| **HuggingFace Hub** | `intelmedica/oms-toolrag-v1` | Public model distribution |
| **Ollama** | GGUF (Q4_0/Q8_0) | Self-hosted inference on K3s |
| **OMS CLI** | Sentence-transformers or GGUF | `oms find-tools` command |

See [deployment/integration_guide.md](deployment/integration_guide.md) for integration details.

## Compute Requirements

| Stage | Hardware | Cost | Time |
|-------|----------|------|------|
| Data preparation | CPU (any) | Free | ~1 hour |
| Query generation | API calls (Gemini free tier) | Free | ~2-3 hours |
| EmbeddingGemma training | Google Colab T4 (free) | Free | 2-3 hours |
| GTE-Qwen2 training | Google Colab A100 (Pro) | ~$10/month | 4-6 hours |
| Evaluation | CPU or T4 | Free | ~30 min |

## Key References

- **TxAgent** (arXiv 2503.10970) -- Harvard's clinical AI agent with ToolRAG retrieval
- **"Tools Are Under-Documented"** (arXiv 2510.22670) -- Description augmentation improves retrieval by 17.8%
- **EmbeddingGemma** (Google, arXiv 2509.20354) -- 300M encoder with Matryoshka dimensions
- **ToolUniverse** (Harvard MIMS) -- 1,995 biomedical tools catalog

See [research/related-papers.md](research/related-papers.md) for the complete annotated bibliography.

## Organization

**IntelMedica.ai** -- Building open-source medical AI research tools that help physicians, researchers, and the healthcare industry discover, share, and use AI-powered skills safely.

All tools in this project are **research tools** -- not clinical decision support systems. This is a deliberate boundary to ensure responsible development outside of FDA SaMD classification.

## License

Apache-2.0
