# Base Model Comparison for OMS ToolRAG

> Detailed evaluation of candidate embedding models for fine-tuning on medical AI tool retrieval.

## Candidate Models

### Summary Table

| Model | Params | Embedding Dim | Context | Architecture | Pooling | Medical Fine-tune Evidence | Est. Training Time | VRAM Needed |
|-------|--------|--------------|---------|-------------|---------|---------------------------|-------------------|-------------|
| **EmbeddingGemma-300M** | 308M | 768 (MRL: 512/256/128) | 2,048 | Encoder (bi-directional, Gemma 3 + T5Gemma) | Asymmetric query/document | MIRIAD: 0.8862 NDCG@10 | ~2-3h on T4 | ~6GB fp32, ~3GB fp16 |
| **GTE-Qwen2-1.5B** | ~1.5B | 1,536 | 4,096 (128K theoretical) | Decoder (causal, Qwen2) | Last-token | None (but proven via ToolRAG-T1) | ~4-6h on A100 | ~12GB fp16, ~6GB in 4-bit |
| **Qwen3-Embedding-0.6B** | 600M | 1,024 (MRL: 32-1024) | 32,768 | Decoder (causal, Qwen3) | Last-token | None | ~3-4h on T4 | ~5GB bf16 |
| **Snowflake Arctic Embed L v2** | 303M | 1,024 | 32,768 | Encoder (XLM-RoBERTa based) | CLS token | None | ~2-3h on T4 | ~6GB fp32 |
| **nomic-embed-text** | ~137M | 768 | 8,192 | Encoder (BERT-based, rotary) | Mean pooling | None | N/A (baseline only) | ~2GB |

---

## Detailed Analysis

### EmbeddingGemma-300M (Primary Candidate)

**Source**: Google DeepMind (September 2025)
**HuggingFace**: google/embeddinggemma-300m
**Paper**: arXiv:2509.20354
**License**: Gemma license (permissive, commercial use allowed)

#### Architecture Details

- Built from **Gemma 3** foundation with **T5Gemma initialization** (encoder-style, not decoder)
- **Bi-directional attention**: Unlike decoder models, every token attends to every other token
- **Asymmetric encoding**: Separate `encode_query()` and `encode_document()` methods with different prompt templates
- **Query prompt**: `task: search result | query: {content}`
- **Document prompt**: `title: {title | "none"} | text: {content}`
- **Task-specific prompts**: Supports retrieval, QA, fact verification, classification, clustering, code retrieval

#### Matryoshka Representation Learning (MRL)

Trained with MRL to produce embeddings that are meaningful at multiple dimensionalities:

| Dimension | MTEB English Mean (Task) | MTEB English Mean (Type) | Relative to 768d |
|-----------|-------------------------|-------------------------|-------------------|
| 768 | 69.67 | 65.11 | Baseline |
| 512 | 69.18 | 64.59 | -0.7% |
| 256 | 68.37 | 64.02 | -1.9% |
| 128 | 66.66 | 62.70 | -4.3% |

This means we can deploy at 256d with only 1.9% quality loss but 3x faster similarity computation and 3x less storage.

#### Quantization-Aware Training (QAT)

Google provides QAT checkpoints with minimal quality loss:

| Quantization | MTEB English Mean | Size Reduction | Use Case |
|-------------|-------------------|----------------|----------|
| Full precision (768d) | 69.67 | Baseline (~600MB) | Server deployment |
| Q8_0 (768d) | 69.49 | ~50% (~300MB) | Standard deployment |
| Q4_0 (768d) | 69.31 | ~75% (~150MB) | Edge/CLI deployment |
| Mixed Precision (768d) | 69.32 | ~60% (~240MB) | Balanced |

#### Medical Performance Evidence

Google published results for fine-tuning EmbeddingGemma on the **MIRIAD** medical information retrieval dataset:
- **NDCG@10**: 0.8862 (beats models 2x its size)
- This demonstrates the model's capacity to learn medical domain semantics despite its small size

#### Strengths for OMS

1. **Encoder architecture is theoretically superior for embeddings**: Bi-directional attention means both the query and document get full context understanding. Every token sees every other token, producing richer representations.
2. **Proven medical fine-tuning recipe**: Google's MIRIAD results provide a validated path -- we know the model can learn medical retrieval.
3. **MRL means deploy-anywhere flexibility**: Train once at 768d, deploy at 128d for CLI, 256d for real-time search, 768d for maximum quality. No retraining needed.
4. **Tiny footprint**: Q4_0 quantized with 256d embeddings = <200MB model + minimal vector storage. Viable for CLI distribution.
5. **CachedMNRL compatibility**: Because the model is small (308M), CachedMNRL can simulate massive batch sizes (512+) even on a T4 GPU. This is critical for MNR loss, where more negatives = better training signal.
6. **Free training**: Fits on Google Colab T4 free tier.
7. **Fast inference**: ~10-20ms per query on GPU, ~50-100ms on CPU. Sub-100ms is achievable even on modest hardware.

#### Weaknesses for OMS

1. **2K context limit**: Tool descriptions longer than ~2,048 tokens will be truncated. Most OMS skill descriptions are short (100-500 tokens), but some SKILL.md files and ToolUniverse tool docs can be longer.
2. **Gemma license**: While permissive, it is not Apache-2.0. Need to verify compatibility with OMS Apache-2.0 licensing.
3. **No instruction-following in prompts**: Unlike Qwen3-Embedding, EmbeddingGemma uses fixed task prompts rather than free-form instructions. This limits query-time customization.

---

### GTE-Qwen2-1.5B (Secondary Candidate)

**Source**: Alibaba-NLP
**HuggingFace**: Alibaba-NLP/gte-Qwen2-1.5B-instruct
**License**: Apache-2.0
**Used by**: Harvard ToolRAG-T1 (proven for tool retrieval)

#### Architecture Details

- **Qwen2 decoder** with causal (autoregressive) attention
- **Last-token pooling**: The embedding is taken from the last token's hidden state (which has attended to all previous tokens via causal attention)
- **GQA**: Grouped Query Attention with 12 query heads and 2 KV heads
- **Max position embeddings**: 131,072 (but ToolRAG-T1 limits to 2,048 in sentence_bert_config)
- **Hidden size**: 1,536 (this IS the embedding dimension)

#### Actual Configuration (from downloaded model)

```json
{
  "architectures": ["Qwen2Model"],
  "hidden_size": 1536,
  "num_hidden_layers": 28,
  "num_attention_heads": 12,
  "num_key_value_heads": 2,
  "intermediate_size": 8960,
  "hidden_act": "silu",
  "vocab_size": 151646,
  "max_position_embeddings": 131072
}
```

#### Pooling Configuration

```json
{
  "word_embedding_dimension": 1536,
  "pooling_mode_lasttoken": true,
  "include_prompt": true
}
```

#### MTEB Performance

| Benchmark | Score |
|-----------|-------|
| MTEB Multilingual Mean (Task) | 59.45 |
| MTEB English Mean (Task) | 67.20 |
| C-MTEB Mean (Task) | 67.12 |

#### Strengths for OMS

1. **Proven for tool retrieval**: ToolRAG-T1 is literally this model fine-tuned for tool retrieval. We know it works.
2. **Higher capacity**: 1.5B parameters can memorize more fine-grained distinctions between 2,049 tools.
3. **Longer effective context**: Even limited to 4,096 tokens, it handles longer tool descriptions than EmbeddingGemma's 2K.
4. **Apache-2.0 license**: Fully compatible with OMS licensing.
5. **Established ecosystem**: Widely used, well-supported in sentence-transformers, many fine-tuning examples available.

#### Weaknesses for OMS

1. **Decoder architecture for embeddings**: Causal attention means tokens can only attend to previous tokens. While last-token pooling captures the full left context, it does not have the symmetric bi-directional understanding of encoder models.
2. **Large for edge deployment**: At ~3GB in fp16 (6GB fp32), it is too large for CLI distribution or edge devices.
3. **No MRL support**: Fixed 1,536-dimension output. Cannot trade quality for speed at deployment time.
4. **Requires A100 for training**: 12GB+ VRAM needed in fp16. Does not fit on Colab free T4 (16GB) with reasonable batch sizes.
5. **Slower inference**: ~50-100ms per query on GPU vs ~10-20ms for EmbeddingGemma.

---

### Qwen3-Embedding-0.6B (Additional Candidate)

**Source**: Alibaba/Qwen team (June 2025)
**HuggingFace**: Qwen/Qwen3-Embedding-0.6B
**Paper**: arXiv:2506.05176
**License**: Apache-2.0

#### Architecture Details

- **Qwen3 decoder** (Qwen3ForCausalLM architecture)
- **Hidden size**: 1,024
- **Layers**: 28
- **Attention**: 16 heads, 8 KV heads (GQA), head_dim=128
- **Max context**: 32,768 tokens
- **MRL support**: Flexible dimensions from 32 to 1,024
- **Instruction-aware**: Custom `Instruct: {task}\nQuery: {text}` format

#### Actual Configuration (from downloaded model)

```json
{
  "architectures": ["Qwen3ForCausalLM"],
  "hidden_size": 1024,
  "num_hidden_layers": 28,
  "num_attention_heads": 16,
  "num_key_value_heads": 8,
  "intermediate_size": 3072,
  "max_position_embeddings": 32768,
  "vocab_size": 151669
}
```

#### MTEB Performance

| Benchmark | Qwen3-Embedding-0.6B | GTE-Qwen2-1.5B | EmbeddingGemma-300M |
|-----------|----------------------|-----------------|---------------------|
| MTEB Multilingual Mean (Task) | **64.33** | 59.45 | 61.15 |
| MTEB English Mean (Task) | **70.70** | 67.20 | 69.67 |

Notably, Qwen3-Embedding-0.6B at 600M parameters outperforms GTE-Qwen2-1.5B at 1.5B parameters on both English and multilingual benchmarks.

#### Strengths for OMS

1. **Strong MTEB scores**: Outperforms both GTE-Qwen2-1.5B and EmbeddingGemma-300M on general benchmarks
2. **MRL support**: Flexible output dimensions (32-1024), similar flexibility to EmbeddingGemma
3. **32K context**: Handles any tool description length
4. **Instruction-aware**: Can provide task-specific instructions at query time for better retrieval
5. **Apache-2.0**: Fully compatible
6. **Moderate size**: 600M is between EmbeddingGemma (308M) and GTE-Qwen2 (1.5B)

#### Weaknesses for OMS

1. **Decoder architecture**: Same causal attention limitation as GTE-Qwen2
2. **No medical fine-tuning evidence**: Unlike EmbeddingGemma (MIRIAD results), no published medical domain performance
3. **Newer model**: Less community fine-tuning experience, fewer examples available
4. **Requires transformers >= 4.51.0**: Newer dependency requirement
5. **Larger than EmbeddingGemma**: 2x the parameters, which means 2x the VRAM and training time

---

### Snowflake Arctic Embed L v2 (Candidate)

**Source**: Snowflake
**HuggingFace**: Snowflake/snowflake-arctic-embed-l-v2.0
**License**: Apache-2.0

#### Key Properties

| Property | Value |
|----------|-------|
| Parameters | ~303M |
| Embedding dimension | 1,024 |
| Max context | 32,768 tokens |
| Architecture | Encoder (XLM-RoBERTa based) |
| MRL support | Yes (via Matryoshka training) |
| Pooling | CLS token |

#### Strengths for OMS

1. **Encoder architecture**: Bi-directional, same theoretical advantage as EmbeddingGemma
2. **32K context**: Handles long tool descriptions
3. **MRL support**: Flexible deployment dimensions
4. **Apache-2.0**: Compatible
5. **Similar size to EmbeddingGemma**: ~303M parameters

#### Weaknesses for OMS

1. **No medical performance data**: No published medical domain benchmarks
2. **XLM-RoBERTa base**: Older foundation than Gemma 3
3. **Less established for domain fine-tuning**: Fewer community examples of fine-tuning for specialized retrieval
4. **Higher default dimension**: 1,024 vs 768 means more storage per vector

---

### nomic-embed-text (Baseline Only)

**Source**: Nomic AI
**HuggingFace**: nomic-ai/nomic-embed-text-v1.5
**License**: Apache-2.0

#### Key Properties

| Property | Value |
|----------|-------|
| Parameters | ~137M |
| Embedding dimension | 768 |
| Max context | 8,192 tokens |
| Architecture | Encoder (BERT-based with rotary embeddings) |
| Pooling | Mean pooling |

#### Role in OMS

Currently used as the default embedding model in OMS CLI for `find-tools`. It provides reasonable keyword-overlap retrieval but lacks the capacity for nuanced medical tool retrieval. Serves as the baseline to beat.

---

## Decision Framework

### Primary Decision: EmbeddingGemma-300M

EmbeddingGemma is the primary candidate because it uniquely combines:

1. **Encoder architecture** for optimal embedding quality
2. **Proven medical fine-tuning** (MIRIAD NDCG@10 = 0.8862)
3. **Matryoshka dimensions** for flexible deployment
4. **Smallest footprint** (308M params, <200MB quantized)
5. **Free training** on Colab T4
6. **Fastest inference** (~10-20ms on GPU)

### Secondary Decision: GTE-Qwen2-1.5B

GTE-Qwen2 is the secondary candidate because:

1. **Proven for tool retrieval** (Harvard validated this exact architecture)
2. **Higher capacity** for 2,049 tools
3. **Longer context** for detailed tool descriptions
4. **Apache-2.0** license (simpler than Gemma license)

### When to Choose Each

```
IF EmbeddingGemma MRR@5 >= GTE-Qwen2 MRR@5 (on OMS benchmarks):
    → Deploy EmbeddingGemma everywhere (smaller, faster, cheaper)

IF GTE-Qwen2 MRR@5 > EmbeddingGemma MRR@5 by >5%:
    → Deploy GTE-Qwen2 for server/Qdrant (quality priority)
    → Deploy EmbeddingGemma for CLI/edge (size priority)

IF both underperform targets (MRR@5 < 0.80):
    → Consider Qwen3-Embedding-0.6B as alternative
    → Investigate training data quality before switching models
```

### Upgrade Path

If initial results are promising but we want even better quality:

1. **Qwen3-Embedding-0.6B**: Strong general MTEB scores, instruction-aware, MRL support
2. **Qwen3-Embedding-4B**: Significantly higher capacity (68.10 MTEB English Mean Type)
3. **Ensemble**: Use EmbeddingGemma for fast initial retrieval, re-rank with a larger model

---

## Hardware Requirements Summary

| Model | Training GPU | Training VRAM | Inference GPU | Inference VRAM | CPU Inference |
|-------|-------------|---------------|---------------|----------------|---------------|
| EmbeddingGemma-300M | T4 (free Colab) | ~6GB | Any | ~1-2GB | Yes (~100ms) |
| GTE-Qwen2-1.5B | A100 (Colab Pro) | ~20GB | T4+ | ~3-6GB | Slow (~500ms+) |
| Qwen3-Embedding-0.6B | T4 (free Colab) | ~8GB | Any | ~2-3GB | Yes (~200ms) |
| Snowflake Arctic L v2 | T4 (free Colab) | ~6GB | Any | ~1-2GB | Yes (~100ms) |
| nomic-embed-text | N/A (baseline) | N/A | Any | ~1GB | Yes (~50ms) |
