# OMS ToolRAG Training Methodology

> Our approach to training a custom embedding model for medical AI tool retrieval across 2,049 biomedical tools spanning 14 medical categories.

## Overview

We adapt Harvard's ToolRAG approach (iterative trace-based training) into a more practical pipeline: **synthetic query generation with multi-model consensus**. Instead of deploying a full agent system to collect reasoning traces, we generate diverse (query, tool-description) pairs using LLMs, validate them with a second model, and mine hard negatives to teach fine-grained distinctions.

This approach is:
- **Faster**: Hours of data generation vs. weeks of agent trace collection
- **Cheaper**: Uses free-tier models (Gemini) for generation
- **More controllable**: We define the query distribution explicitly
- **More diverse**: We can target all 14 medical categories, not just drug reasoning

---

## Data Sources (2,049 Items)

### Source Inventory

| Source | Count | Location | Format | Content Quality |
|--------|-------|----------|--------|----------------|
| OMS Skill YAMLs | 49 | `content/skills/*.yaml` | Structured YAML | High (physician-curated) |
| OMS Plugin YAMLs | 5 | `content/plugins/*.yaml` | Structured YAML | High (physician-curated) |
| ToolUniverse tools | 1,995 | PyPI: `tooluniverse` | Python objects / JSON | Moderate (auto-generated descriptions) |
| SKILL.md files | 49 | `skills/*/SKILL.md` | Markdown + YAML frontmatter | High (detailed documentation) |

### OMS Skill YAML Fields (used for training)

```yaml
name: "skill-name"                    # Unique identifier
display_name: "Skill Display Name"    # Human-readable name
description: "Brief description"       # Primary retrieval target
category: "diagnosis"                  # 1 of 14 categories
tags: ["tag1", "tag2"]                # Semantic tags
evidence_level: "high"                # Clinical evidence strength
safety: "safe"                         # Safety classification
```

### ToolUniverse Tool Fields

```python
tool = {
    "name": "tool_name",
    "description": "Tool description text",
    "parameters": {...},               # Function parameters
    "source": "FDA|OpenTargets|...",   # Data source
    "category": "drug_interaction|..."  # Tool category
}
```

### Category Distribution

| Category | OMS Skills | TU Tools | Total | % of Dataset |
|----------|-----------|----------|-------|-------------|
| diagnosis | 5 | ~100 | ~105 | 5.1% |
| treatment | 8 | ~800 | ~808 | 39.4% |
| lab-imaging | 4 | ~50 | ~54 | 2.6% |
| pharmacy | 6 | ~900 | ~906 | 44.2% |
| emergency | 3 | ~10 | ~13 | 0.6% |
| surgery | 2 | ~5 | ~7 | 0.3% |
| nursing | 3 | ~5 | ~8 | 0.4% |
| pediatrics | 2 | ~10 | ~12 | 0.6% |
| mental-health | 3 | ~15 | ~18 | 0.9% |
| public-health | 2 | ~20 | ~22 | 1.1% |
| research | 4 | ~30 | ~34 | 1.7% |
| education | 2 | ~10 | ~12 | 0.6% |
| administrative | 3 | ~20 | ~23 | 1.1% |
| clinical-research-summarizing | 2 | ~20 | ~22 | 1.1% |

**Note**: The distribution is heavily skewed toward treatment and pharmacy (ToolUniverse's drug focus). We address this imbalance in query generation by over-sampling underrepresented categories.

---

## Phase 1: Description Augmentation

### Motivation

The paper "Tools Are Under-Documented" (arXiv 2510.22670) demonstrated that enriching tool descriptions with LLM-generated augmentations improves retrieval by **17.8%** on average. Raw tool descriptions often lack:

- Clinical context (when and why a physician would use this tool)
- Synonym coverage (alternative names, abbreviations)
- Parameter explanations (what inputs are needed and why)
- Use case examples (concrete scenarios)

### Augmentation Pipeline

```
Raw Description
    │
    ▼
Gemini 3 Flash (free)
    │  Prompt: "Enrich this medical AI tool description for
    │  retrieval purposes. Add clinical scenarios, medical
    │  synonyms, typical user queries, and parameter context.
    │  Keep the core meaning intact."
    │
    ▼
Augmented Description (2-3x longer, more retrievable)
```

### Augmentation Prompt Template

```
You are a medical informatics specialist. Given a medical AI tool description,
create an enriched version that would help a retrieval system match this tool
to relevant clinical queries.

TOOL NAME: {name}
CATEGORY: {category}
ORIGINAL DESCRIPTION: {description}
TAGS: {tags}

Produce an augmented description that includes:
1. The original description (preserved exactly)
2. Clinical scenarios where this tool would be used (2-3 examples)
3. Medical synonyms and alternative phrasings for key concepts
4. Who would use this tool (specialty, role)
5. What problem this tool solves in clinical workflow
6. Related medical concepts and conditions

Format: A single paragraph of 150-300 words. No markdown, no bullet points.
```

### Quality Control

- Run augmentation on all 2,049 items
- Spot-check 10% of augmented descriptions for medical accuracy
- Reject augmentations that introduce factual errors or hallucinated capabilities
- Preserve original description as a prefix (ensures exact-match queries still work)

### Expected Output

- **Input**: 2,049 raw descriptions (avg ~50 words each)
- **Output**: 2,049 augmented descriptions (avg ~200 words each)
- **Time**: ~2-3 hours on Gemini 3 Flash free tier (rate-limited)

---

## Phase 2: Synthetic Query Generation (Multi-Model Consensus)

### Strategy

Generate diverse queries that simulate how physicians, researchers, and developers would search for medical AI tools. Unlike Harvard's trace-based approach (which only captures queries from a drug reasoning agent), we explicitly design queries across multiple dimensions.

### Query Types

| Type | Description | Example | % of Total |
|------|-------------|---------|------------|
| **Direct functional** | "What does this tool do?" | "drug interaction checker" | 25% |
| **Clinical scenario** | Physician describing a patient situation | "I have a diabetic patient on 5 medications, need to check interactions" | 30% |
| **Research query** | Academic/research framing | "tool for systematic review of pharmacokinetic studies" | 15% |
| **Category-based** | Browsing by specialty | "emergency medicine triage tools" | 10% |
| **Skill-specific** | OMS-specific terminology | "verified AI skill for differential diagnosis" | 10% |
| **Problem-oriented** | Describing a workflow problem | "I spend too much time checking prior auth requirements" | 10% |

### Multi-Model Consensus Pipeline

```
                    ┌──────────────────────────┐
                    │  Tool Description + Meta  │
                    └──────────┬───────────────┘
                               │
                    ┌──────────▼───────────────┐
                    │   Gemini 3 Flash (FREE)   │
                    │   Generate 15-20 queries   │
                    │   per tool                 │
                    └──────────┬───────────────┘
                               │
                    ┌──────────▼───────────────┐
                    │   Claude Sonnet            │
                    │   Validate medical accuracy │
                    │   Score relevance 1-5       │
                    │   Flag hallucinations       │
                    └──────────┬───────────────┘
                               │
                    ┌──────────▼───────────────┐
                    │   Filter: Keep score >= 4  │
                    │   Remove duplicates         │
                    │   Balance categories         │
                    └──────────┬───────────────┘
                               │
                    ┌──────────▼───────────────┐
                    │   10-15 validated queries  │
                    │   per tool                 │
                    └──────────────────────────┘
```

### Generation Prompt (Gemini 3 Flash)

```
You are a medical informatics query generator. Given a medical AI tool,
generate diverse search queries that a physician or researcher might use
to find this exact tool.

TOOL: {name}
CATEGORY: {category}
DESCRIPTION: {augmented_description}
TAGS: {tags}
EVIDENCE LEVEL: {evidence_level}
SAFETY: {safety}

Generate 20 unique queries across these types:
- 5 direct functional queries (what the tool does)
- 6 clinical scenario queries (patient situations requiring this tool)
- 3 research queries (academic framing)
- 2 category browsing queries (specialty-level search)
- 2 skill-specific queries (referencing AI/skill/plugin terminology)
- 2 problem-oriented queries (workflow pain points)

Rules:
- Each query should be 5-30 words
- Use natural medical language (not keywords)
- Vary complexity: some simple, some detailed
- Include common abbreviations where appropriate
- Do NOT mention the tool name in the query
- Queries must be answerable ONLY by this tool, not by similar tools

Output as JSON array of objects:
[{"query": "...", "type": "direct|scenario|research|category|skill|problem"}]
```

### Validation Prompt (Claude Sonnet)

```
You are a medical accuracy reviewer. Evaluate whether each query below
would reasonably lead a physician to the given medical AI tool.

TOOL: {name}
DESCRIPTION: {description}

QUERIES:
{queries_json}

For each query, provide:
1. relevance_score (1-5): How likely is this the RIGHT tool for this query?
2. medical_accuracy (true/false): Is the medical context in the query valid?
3. specificity (high/medium/low): Could this query match many tools or just this one?
4. flag: Any concerns (hallucination, ambiguity, too generic)

Output as JSON array matching input order.
```

### Category Balancing

Because the dataset is heavily skewed toward pharmacy/treatment tools (83.6% of items), we apply over-sampling for underrepresented categories:

| Category Proportion | Queries per Tool |
|--------------------|------------------|
| > 20% of dataset | 10 queries/tool (baseline) |
| 5-20% of dataset | 15 queries/tool |
| 1-5% of dataset | 20 queries/tool |
| < 1% of dataset | 25 queries/tool |

This ensures that emergency, surgery, nursing, and pediatrics tools get proportionally more training signal despite having fewer tools.

### Expected Output

- **Raw generated**: ~40,000 queries (2,049 tools x ~20 queries each)
- **After validation**: ~30,000 queries (filtering score < 4, duplicates, generic)
- **After balancing**: ~35,000 queries (over-sampling adds ~5,000)
- **Time**: ~3-4 hours generation + ~1-2 hours validation

---

## Phase 3: Hard Negative Mining

### Why Hard Negatives Matter

MNR loss uses in-batch negatives, which are typically "easy" negatives (random tools from different categories). Hard negatives teach the model fine-grained distinctions:

- "Drug interaction checker" vs. "Drug dosing calculator" (same category, different function)
- "Pediatric dosing tool" vs. "Adult dosing tool" (similar function, different population)
- "Emergency triage" vs. "Emergency department throughput" (same setting, different purpose)

### Hard Negative Types

| Type | Description | How Generated | Count Target |
|------|-------------|---------------|-------------|
| **Same-category, wrong-function** | Tools in same category but different purpose | Category filter + random sampling | 3 per tool |
| **Similar-name, different-domain** | Tools with similar names but different specialties | Name/description TF-IDF similarity | 2 per tool |
| **BM25 near-misses** | Tools that BM25 would retrieve but are wrong | BM25 search per query, filter out correct | 3 per query |
| **Partial-match confusers** | Tools that partially match the query but miss key aspects | Manual curation for top-50 most ambiguous tools | 2 per tool |

### Mining Pipeline

```python
# Pseudocode for hard negative mining

# 1. Same-category negatives
for tool in tools:
    category_peers = [t for t in tools if t.category == tool.category and t != tool]
    hard_negs = random.sample(category_peers, min(3, len(category_peers)))

# 2. BM25 near-misses
from rank_bm25 import BM25Okapi
bm25 = BM25Okapi([t.description.split() for t in tools])
for query, correct_tool in pairs:
    bm25_results = bm25.get_top_n(query.split(), tools, n=10)
    hard_negs = [t for t in bm25_results if t != correct_tool][:3]

# 3. Embedding near-misses (using base model before fine-tuning)
base_model = SentenceTransformer("google/embeddinggemma-300m")
tool_embeddings = base_model.encode([t.description for t in tools])
for query, correct_tool in pairs:
    query_emb = base_model.encode(query)
    sims = cosine_similarity(query_emb, tool_embeddings)
    # Get top-10 excluding correct tool
    near_misses = sorted_by_sim[:10].exclude(correct_tool)
    hard_negs = near_misses[:3]
```

### Expected Output

- **Per tool**: 5-8 hard negatives
- **Per query**: 3-6 hard negatives (from BM25 + embedding search)
- **Total hard negative pairs**: ~150,000-200,000
- **Time**: ~1-2 hours (mostly embedding computation)

---

## Phase 4: Training

### Primary: EmbeddingGemma-300M with CachedMNRL

#### Configuration

```python
from sentence_transformers import SentenceTransformer, SentenceTransformerTrainer
from sentence_transformers.losses import CachedMultipleNegativesRankingLoss, MatryoshkaLoss
from sentence_transformers.training_args import SentenceTransformerTrainingArguments

# Load base model
model = SentenceTransformer("google/embeddinggemma-300m")

# Matryoshka loss wrapping CachedMNRL
inner_loss = CachedMultipleNegativesRankingLoss(
    model=model,
    mini_batch_size=32,         # Actual batch that fits in VRAM
    # Effective batch size = full dataset batch (all pairs seen as negatives)
)

loss = MatryoshkaLoss(
    model=model,
    loss=inner_loss,
    matryoshka_dims=[768, 512, 256, 128],  # Train all MRL dimensions
)

# Training arguments
args = SentenceTransformerTrainingArguments(
    output_dir="trained/oms-toolrag-gemma-v1",
    num_train_epochs=3,
    per_device_train_batch_size=128,    # CachedMNRL handles the VRAM
    learning_rate=2e-5,
    warmup_ratio=0.1,
    fp16=True,                          # T4 GPU
    evaluation_strategy="steps",
    eval_steps=500,
    save_strategy="steps",
    save_steps=500,
    logging_steps=100,
    load_best_model_at_end=True,
    metric_for_best_model="eval_mrr@5",
)
```

#### Why CachedMNRL

Standard MNR loss computes gradients for the entire batch at once, requiring all embeddings to fit in GPU memory simultaneously. CachedMNRL decouples this:

1. **Forward pass**: Encode mini-batches of 32, cache embeddings
2. **Loss computation**: Compute MNR loss over ALL cached embeddings (effective batch of 128+)
3. **Backward pass**: Recompute embeddings in mini-batches, apply cached gradients

This means a T4 with 16GB VRAM can achieve the same training signal quality as an A100 with batch size 512+, just with more compute time.

#### Why MatryoshkaLoss

MatryoshkaLoss applies the inner loss at multiple embedding dimensions simultaneously:

```
Full 768d loss (weight 1.0)
  + 512d loss (weight 1.0) on truncated embeddings
  + 256d loss (weight 1.0) on truncated embeddings
  + 128d loss (weight 1.0) on truncated embeddings
```

This trains a single model that produces meaningful embeddings at any of these dimensions, enabling flexible deployment without retraining.

#### Training Data Format

```python
from datasets import Dataset

# InputExample format for sentence-transformers
train_data = Dataset.from_dict({
    "anchor": [query_texts],           # User queries
    "positive": [tool_descriptions],    # Correct tool descriptions
    "negative": [hard_neg_descriptions] # Hard negative descriptions (optional)
})
```

### Secondary: GTE-Qwen2-1.5B with MNR

#### Configuration

```python
model = SentenceTransformer("Alibaba-NLP/gte-Qwen2-1.5B-instruct")

loss = MultipleNegativesRankingLoss(model=model)

args = SentenceTransformerTrainingArguments(
    output_dir="trained/oms-toolrag-qwen2-v1",
    num_train_epochs=3,
    per_device_train_batch_size=16,     # Constrained by VRAM
    learning_rate=2e-5,
    warmup_ratio=0.1,
    bf16=True,                          # A100 GPU
    gradient_accumulation_steps=8,      # Effective batch: 128
    evaluation_strategy="steps",
    eval_steps=200,
    save_strategy="steps",
    save_steps=200,
    logging_steps=50,
    load_best_model_at_end=True,
    metric_for_best_model="eval_mrr@5",
)
```

### Training Schedule

| Epoch | Learning Rate | Purpose |
|-------|--------------|---------|
| 1 | 0 -> 2e-5 (warmup) | Learn basic tool-query associations |
| 2 | 2e-5 (peak) | Refine category-level distinctions |
| 3 | 2e-5 -> 0 (linear decay) | Sharpen fine-grained tool boundaries |

### Checkpointing

- Save every 500 steps (EmbeddingGemma) / 200 steps (GTE-Qwen2)
- Evaluate on validation set at each checkpoint
- Keep best model by MRR@5 on validation set
- Final model = best checkpoint, not last epoch

---

## Phase 5: Evaluation

### Test Set Construction

| Test Set | Size | Source | Purpose |
|----------|------|--------|---------|
| **OMS Skills** | 200 queries | 4 queries per OMS skill, human-written | Primary: curated skill retrieval |
| **ToolUniverse** | 500 queries | Sampled from TU tools, synthetic | Secondary: broad coverage |
| **Cross-domain** | 100 queries | Multi-category queries, manually curated | Stress test: ambiguous queries |
| **Clinical scenarios** | 100 queries | Realistic physician queries, human-written | Real-world: practical relevance |

**Important**: Test sets are held out from all training data. No query in the test set appears in training, and test queries are generated by a different model or written by hand.

### Metrics

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| **MRR@5** | Mean of 1/rank for correct tool in top-5 | Average precision of first correct result |
| **Recall@1** | % of queries where correct tool is rank 1 | "Did we get it right on the first try?" |
| **Recall@5** | % of queries where correct tool is in top 5 | "Is the right tool in the short list?" |
| **Recall@10** | % of queries where correct tool is in top 10 | "Can we find it at all?" |
| **NDCG@10** | Normalized DCG considering position | Quality-weighted ranking across top 10 |

### Baseline Models

| Model | Purpose | Expected MRR@5 |
|-------|---------|----------------|
| **nomic-embed-text** | Current OMS default | ~0.40-0.50 |
| **mxbai-embed-large** | Larger generic embedding | ~0.45-0.55 |
| **ToolRAG-T1** | Harvard's model (drug-focused) | ~0.60-0.70 (on drug tools), ~0.30-0.40 (on non-drug tools) |
| **EmbeddingGemma-300M (base)** | Untuned primary candidate | ~0.50-0.60 |
| **GTE-Qwen2-1.5B (base)** | Untuned secondary candidate | ~0.50-0.60 |

### Evaluation Code

```python
from sentence_transformers import SentenceTransformer
import numpy as np

def evaluate_retrieval(model, queries, tool_descriptions, correct_indices, k_values=[1, 5, 10]):
    """Evaluate embedding model on tool retrieval task."""
    # Encode all tool descriptions once
    tool_embeddings = model.encode(tool_descriptions, normalize_embeddings=True)

    # Encode all queries
    query_embeddings = model.encode(queries, normalize_embeddings=True)

    # Compute similarity matrix
    similarities = query_embeddings @ tool_embeddings.T  # (n_queries, n_tools)

    results = {}
    for k in k_values:
        top_k_indices = np.argsort(-similarities, axis=1)[:, :k]
        recall_at_k = np.mean([
            correct_indices[i] in top_k_indices[i]
            for i in range(len(queries))
        ])
        results[f"Recall@{k}"] = recall_at_k

    # MRR@5
    top_5_indices = np.argsort(-similarities, axis=1)[:, :5]
    mrr = np.mean([
        1.0 / (np.where(top_5_indices[i] == correct_indices[i])[0][0] + 1)
        if correct_indices[i] in top_5_indices[i] else 0.0
        for i in range(len(queries))
    ])
    results["MRR@5"] = mrr

    return results
```

### Target Metrics

| Metric | Target | Stretch Goal |
|--------|--------|-------------|
| MRR@5 (overall) | > 0.85 | > 0.90 |
| Recall@1 (overall) | > 0.70 | > 0.80 |
| Recall@5 (overall) | > 0.90 | > 0.95 |
| Recall@10 (overall) | > 0.95 | > 0.98 |
| NDCG@10 (overall) | > 0.85 | > 0.90 |
| MRR@5 (OMS skills only) | > 0.90 | > 0.95 |
| MRR@5 (underrepresented categories) | > 0.80 | > 0.85 |

### Per-Category Analysis

We also compute metrics per medical category to identify weak spots:

```python
for category in OMS_CATEGORIES:
    category_queries = [q for q in test_set if q.category == category]
    category_results = evaluate_retrieval(model, category_queries, ...)
    print(f"{category}: MRR@5={category_results['MRR@5']:.4f}")
```

If any category has MRR@5 < 0.75, we generate additional training pairs for that category and retrain.

---

## Key Innovation: Multi-Model Consensus

The central methodological contribution is using **multiple LLMs in concert** for training data quality:

| Step | Model | Role | Why This Model |
|------|-------|------|----------------|
| Description augmentation | Gemini 3 Flash | Generator | Free, fast, good medical knowledge |
| Query generation | Gemini 3 Flash | Generator | Free, bulk generation at scale |
| Query validation | Claude Sonnet | Validator | Strong medical reasoning, catches hallucinations |
| Technical coverage | Codex | Verifier | Ensures technical queries are well-formed |

This is different from Harvard's single-model approach (generate traces with one LLM, extract pairs). Our consensus approach catches:
- **Gemini hallucinations**: Claude validates medical accuracy
- **Single-model blind spots**: Each model has different strengths in medical knowledge
- **Query distribution bias**: Different models generate different query styles

The cost of this consensus is minimal: Gemini is free, and Claude validation is a small fraction of the total API cost (validating is much cheaper than generating).

---

## Timeline

| Phase | Duration | Dependencies | Output |
|-------|----------|-------------|--------|
| Phase 1: Description augmentation | 3-4 hours | Source data extracted | 2,049 augmented descriptions |
| Phase 2: Query generation | 4-6 hours | Phase 1 complete | ~35,000 validated pairs |
| Phase 3: Hard negative mining | 2-3 hours | Phase 2 complete | ~150,000 hard negative pairs |
| Phase 4a: Train EmbeddingGemma | 2-3 hours | Phase 3 complete | Trained model checkpoint |
| Phase 4b: Train GTE-Qwen2 | 4-6 hours | Phase 3 complete | Trained model checkpoint |
| Phase 5: Evaluation | 1-2 hours | Phase 4 complete | Benchmark results |
| **Total** | **~2-3 days** | | Production-ready model |

Phase 4a and 4b can run in parallel on different Colab instances.
