# ToolRAG-T1: Deep Analysis of Harvard's Tool Retrieval Model

> Analysis of the ToolRAG-T1-GTE-Qwen2-1.5B model from Harvard MIMS, used in the TxAgent clinical reasoning system.

## Overview

ToolRAG-T1 is a fine-tuned embedding model designed to retrieve the correct biomedical tool from a catalog of 211 tools based on natural language task requirements. It is a core component of Harvard's TxAgent system (arXiv 2503.10970), which uses multi-step reasoning and real-time tool retrieval to analyze drug interactions, contraindications, and patient-specific treatment strategies.

**HuggingFace**: [mims-harvard/ToolRAG-T1-GTE-Qwen2-1.5B](https://huggingface.co/mims-harvard/ToolRAG-T1-GTE-Qwen2-1.5B)

---

## Architecture

### Base Model

| Property | Value |
|----------|-------|
| **Base model** | Alibaba-NLP/gte-Qwen2-1.5B-instruct |
| **Architecture** | Qwen2Model (decoder-based, causal attention) |
| **Parameters** | ~1.5B (total_size: 6,173,075,456 bytes in safetensors) |
| **Hidden size** | 1,536 |
| **Layers** | 28 |
| **Attention heads** | 12 (2 KV heads, GQA) |
| **Intermediate size** | 8,960 |
| **Activation** | SiLU |
| **Vocab size** | 151,646 |
| **Max position embeddings** | 131,072 (theoretical) |
| **RoPE theta** | 1,000,000 |
| **Precision** | float32 (stored), fp16/bf16 (inference) |

### Sentence Transformer Pipeline

From the model's `modules.json`, the pipeline is:

```
Input Text
    │
    ▼
[0] sentence_transformers.models.Transformer
    │  Qwen2Model backbone
    │  Tokenizes and encodes input
    │
    ▼
[1] sentence_transformers.models.Pooling
    │  Mode: last-token pooling (pooling_mode_lasttoken: true)
    │  Embedding dimension: 1,536
    │  include_prompt: true
    │
    ▼
[2] sentence_transformers.models.Normalize
    │  L2 normalization
    │
    ▼
Output: 1536-dim unit vector
```

Key details from `1_Pooling/config.json`:
- **Pooling mode**: Last token only (not CLS, not mean)
- **Embedding dimension**: 1,536
- **Include prompt**: Yes (the prompt prefix is included in the pooled representation)

### Prompt Template

From `config_sentence_transformers.json`:
```
Instruct: Given a web search query, retrieve relevant passages that answer the query
Query: {input_text}
```

This is the standard GTE-Qwen2 prompt, applied to queries but not to documents/tool descriptions.

### Sentence-BERT Config

From `sentence_bert_config.json`:
- **Max sequence length**: 2,048 tokens (not the full 131K of the base Qwen2)
- **Case sensitive**: Yes (do_lower_case: false)

### Framework Versions

From `config_sentence_transformers.json`:
- sentence-transformers: 3.0.1
- transformers: 4.45.1
- PyTorch: 2.3.1+cu121

---

## Training

### Loss Function

**Multiple Negatives Ranking Loss (MNR / InfoNCE)**

MNR treats each (query, positive_document) pair in a mini-batch as a positive example, and all other documents in the batch as implicit negatives. This is mathematically equivalent to InfoNCE contrastive loss:

```
L = -log( exp(sim(q, d+) / tau) / sum_j(exp(sim(q, d_j) / tau)) )
```

Where `sim` is cosine similarity and `tau` is a temperature parameter (typically 0.05 for MNR).

The key advantage: no explicit negative sampling required. Larger batch sizes = more implicit negatives = better training signal. This is why CachedMNRL (which decouples gradient computation from batch size) is particularly valuable for smaller GPUs.

### Training Data

The training data consists of (requirement, tool-description) pairs extracted from TxAgent reasoning traces. The "requirement" is a natural language description of what the agent needs (e.g., "find drug interactions for metformin and lisinopril"), and the "tool-description" is the full text description of the matching tool from ToolUniverse.

**Data generation was iterative (2-stage boot-strapping):**

#### Stage 1: Seed Data Collection
1. Start with no ToolRAG model
2. Use only reference information from questions to identify initial tool sets
3. Run TxAgent with these tools to generate reasoning traces
4. Extract (requirement, tool) pairs from successful traces
5. Train initial ToolRAG model on these seed pairs

#### Stage 2: Iterative Refinement
1. Deploy the Stage 1 ToolRAG model in TxAgent's TOOL PROVIDER module
2. TxAgent now retrieves tools dynamically (not just from reference info)
3. Collect new reasoning traces where tools were retrieved by ToolRAG
4. Extract new (requirement, tool) pairs from these improved traces
5. Retrain ToolRAG on the expanded dataset
6. Repeat steps 1-5

This iterative approach is notable because:
- It creates a **self-improving loop**: better retrieval leads to better traces, which lead to better training data
- The Stage 2 data better reflects **real-world retrieval patterns** since tools are retrieved dynamically
- It is conceptually similar to RLHF's iterative data collection, but for retrieval rather than generation

### Undisclosed Training Details

The TxAgent paper and model card do **not** disclose:

| Parameter | Status | Likely Range (estimated) |
|-----------|--------|-------------------------|
| Total training pairs | Not disclosed | 5,000-50,000 (based on 211 tools x 10-100 traces) |
| Number of epochs | Not disclosed | 1-5 |
| Batch size | Not disclosed | 32-128 |
| Learning rate | Not disclosed | 1e-5 to 5e-5 |
| Warmup steps | Not disclosed | 10% of total steps |
| Training hardware | Not disclosed | Likely A100 or H100 |
| Training duration | Not disclosed | Hours, not days |
| Evaluation metrics during training | Not disclosed | Likely MRR and Recall |

The `training_args.bin` file exists in the model repo but is a serialized PyTorch binary -- it would contain the exact hyperparameters used during training.

---

## Inference Pipeline (from TxAgent Codebase)

### ToolFinder Class

The ToolRAG model is used through TxAgent's `ToolFinder` class, which handles the full retrieval pipeline:

```python
# Simplified from TxAgent source
class ToolFinder:
    def __init__(self, model_path, tool_descriptions):
        self.model = SentenceTransformer(model_path)
        # Encode all tool descriptions at initialization
        self.tool_embeddings = self.model.encode(tool_descriptions)

    def find_tools(self, query, top_k=5):
        # Encode the query
        query_embedding = self.model.encode(query)
        # Compute cosine similarity against all tools
        similarities = cosine_similarity(query_embedding, self.tool_embeddings)
        # Return top-k tools
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        return [self.tools[i] for i in top_indices]
```

### Key Implementation Details

1. **All tool descriptions are pre-encoded** at initialization -- only the query is encoded at inference time
2. **Cosine similarity** is used for ranking (enabled by L2 normalization in the model pipeline)
3. **No re-ranking** -- the embedding similarity score is the final ranking signal
4. **Tool metadata** (name, parameters, source) is returned alongside similarity scores
5. **Top-k** is configurable but typically 5-10 tools are retrieved per query

### Performance Characteristics

- **Encoding a single query**: ~50-100ms on GPU, ~200-500ms on CPU (estimated for 1.5B model)
- **Similarity search over 211 tools**: <1ms (small catalog, simple dot product)
- **Total inference latency**: Dominated by query encoding time
- **Memory**: ~3GB in fp16, ~6GB in fp32

---

## Limitations for OMS

### 1. Domain Coverage Gap

ToolRAG-T1 was trained exclusively on drug reasoning tools from ToolUniverse:
- **211 tools total**: FDA-approved drug databases, Open Targets clinical insights
- **Single domain**: Pharmacology, drug interactions, contraindications
- **No coverage of**: Surgery tools, nursing assessments, emergency protocols, imaging analysis, mental health screening, public health surveillance, administrative tools, research methodologies

OMS spans **14 medical categories** with fundamentally different query patterns:

| OMS Category | Example Query | ToolRAG-T1 Coverage |
|--------------|---------------|---------------------|
| diagnosis | "differential diagnosis generator for chest pain" | None |
| treatment | "drug interaction checker for transplant patients" | Partial |
| pharmacy | "medication dosing calculator" | Partial |
| emergency | "triage protocol for mass casualty events" | None |
| surgery | "surgical instrument identification tool" | None |
| nursing | "wound assessment documentation" | None |
| pediatrics | "growth chart percentile calculator" | None |
| mental-health | "PHQ-9 depression screening tool" | None |
| lab-imaging | "radiology report summarizer" | None |
| public-health | "disease outbreak tracker" | None |
| research | "clinical trial eligibility screener" | None |
| education | "medical board exam question generator" | None |
| administrative | "prior authorization form filler" | None |
| clinical-research-summarizing | "systematic review data extractor" | None |

### 2. Scale Mismatch

| Aspect | ToolRAG-T1 | OMS Requirement |
|--------|-----------|-----------------|
| Tools indexed | 211 | 2,049 |
| Domain breadth | 1 (pharmacology) | 14 categories |
| Tool metadata | Name + description | Name, description, category, evidence level, safety, install methods, tags |
| Query diversity | Drug reasoning only | Clinical scenarios, skill search, category browsing, research queries |

### 3. Architecture Considerations

The decoder-based (causal attention) architecture of GTE-Qwen2 has trade-offs for embedding tasks:

**Strengths:**
- Can leverage pre-trained language understanding from causal LM training
- Last-token pooling captures full sequence context (the last token "sees" everything before it)
- Larger capacity (1.5B) can memorize more tool distinctions

**Weaknesses:**
- Causal attention means each token only attends to previous tokens -- no bi-directional context
- Encoder-based models (like EmbeddingGemma, BERT-family) use bi-directional attention, which is theoretically better for understanding the full input simultaneously
- 6x larger than EmbeddingGemma-300M with potentially marginal quality improvement for our task

### 4. No Multi-Tool Scenarios

ToolRAG-T1's training data comes from single-tool retrieval in TxAgent traces. OMS queries may require **multiple tools** (e.g., "I need to check drug interactions AND calculate pediatric dosing" should retrieve both tools). The model has no training signal for multi-tool scenarios.

### 5. No Metadata-Aware Retrieval

ToolRAG-T1 matches queries to raw text descriptions only. It has no awareness of structured metadata like:
- Evidence level (high/moderate/low)
- Safety classification (safe/caution/restricted)
- Installation method preferences
- Category filters

This means it cannot handle queries like "find a high-evidence diagnosis tool" or "show me verified emergency tools only."

---

## Key Takeaways for OMS ToolRAG

1. **MNR loss works** -- it is the right loss function for our task, proven by Harvard's results
2. **Iterative training improves quality** -- but we can shortcut this with synthetic query generation (cheaper and faster than running a full agent system)
3. **The base model matters less than the training data** -- ToolRAG-T1 achieves strong results with a standard GTE-Qwen2 base, suggesting our training data quality is the critical factor
4. **Description quality is paramount** -- the model only sees text descriptions, so richer descriptions = better retrieval (confirmed by "Tools Are Under-Documented" paper)
5. **A smaller model may suffice** -- EmbeddingGemma at 300M with bi-directional attention could match or beat a 1.5B decoder model on our task, especially with Matryoshka training for flexible deployment

---

## References

- Gao, S. et al. (2025). "TxAgent: An AI Agent for Therapeutic Reasoning Across a Universe of Tools." arXiv:2503.10970.
- TxAgent GitHub: https://github.com/mims-harvard/TxAgent
- ToolUniverse GitHub: https://github.com/mims-harvard/ToolUniverse
- ToolRAG-T1 on HuggingFace: https://huggingface.co/mims-harvard/ToolRAG-T1-GTE-Qwen2-1.5B
- GTE-Qwen2 base: https://huggingface.co/Alibaba-NLP/gte-Qwen2-1.5B-instruct
