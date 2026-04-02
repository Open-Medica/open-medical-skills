# Related Papers and References

> Annotated bibliography for the OMS ToolRAG custom embedding model project. Each entry includes why it matters to our work.

---

## Core References

### 1. TxAgent: An AI Agent for Therapeutic Reasoning Across a Universe of Tools

- **Authors**: Shanghua Gao, Richard Zhu, Zhenglun Kong, Ayush Noori, Xiaorui Su, Curtis Ginder, Theodoros Tsiligkaridis, Marinka Zitnik
- **Institution**: Harvard Medical School, MIMS Lab
- **Published**: March 2025
- **arXiv**: [2503.10970](https://arxiv.org/abs/2503.10970)
- **Code**: [github.com/mims-harvard/TxAgent](https://github.com/mims-harvard/TxAgent)

**Summary**: Introduces TxAgent, a clinical AI agent that uses multi-step reasoning and real-time biomedical knowledge retrieval across 211 tools (ToolUniverse) to analyze drug interactions, contraindications, and patient-specific treatment strategies. The ToolRAG component retrieves relevant tools from the catalog based on natural language requirements.

**Why it matters**: This is the foundational work our project extends. ToolRAG-T1 is the retrieval model we are improving upon. Key insights:
- Iterative training loop (traces -> pairs -> model -> better traces) is effective for tool retrieval
- MNR loss on (requirement, tool-description) pairs produces strong retrieval models
- GTE-Qwen2-1.5B works as a base model for tool retrieval fine-tuning
- 211 tools is the scale they validated; we need to scale to 2,049

**Key results**: 92.1% accuracy on drug reasoning tasks, variance < 0.01 across drug name variants (brand vs. generic vs. description).

---

### 2. Tools Are Under-Documented: Examining the Impact of Tool Descriptions on Tool-Augmented LLMs

- **Authors**: Various (multi-institutional)
- **Published**: October 2025
- **arXiv**: [2510.22670](https://arxiv.org/abs/2510.22670)

**Summary**: Demonstrates that the quality of tool descriptions significantly impacts retrieval accuracy. By enriching tool descriptions with LLM-generated augmentations (clinical scenarios, parameter explanations, synonyms), retrieval improves by an average of 17.8%.

**Why it matters**: Directly justifies our Phase 1 (Description Augmentation). Key findings:
- Raw tool descriptions are often terse, ambiguous, or missing critical context
- LLM-augmented descriptions improve retrieval without changing the model architecture
- The improvement is additive with model fine-tuning (augmentation + fine-tuning > either alone)
- Even simple augmentations (adding 2-3 use case sentences) help significantly

**Key result**: 17.8% average improvement in tool retrieval accuracy from description augmentation alone.

---

### 3. Retrieval Models Aren't Tool-Savvy: Benchmarking Tool Retrieval for Large Language Agents

- **Authors**: Various
- **Published**: March 2025
- **arXiv**: [2503.01763](https://arxiv.org/abs/2503.01763)

**Summary**: Establishes benchmarks for tool retrieval and demonstrates that general-purpose retrieval models (designed for document/passage retrieval) significantly underperform on tool retrieval tasks. The structure and semantics of tool descriptions differ fundamentally from natural language documents.

**Why it matters**: Justifies the need for a custom fine-tuned model rather than using off-the-shelf embeddings. Key findings:
- General retrieval models (MTEB top performers) drop 20-40% on tool retrieval vs. document retrieval
- Tool descriptions have unique characteristics: imperative mood, parameter specifications, API-style formatting
- Fine-tuning on tool-specific data closes much of the gap
- Hard negatives from same-category tools are critical for training

**Key result**: Custom tool retrieval models outperform general embeddings by 25-40% on tool retrieval benchmarks.

---

## Embedding Models

### 4. EmbeddingGemma: Powerful and Lightweight Text Representations

- **Authors**: Vera Schechter, Sahil Dua, Biao Zhang, Daniel Salz, et al.
- **Institution**: Google DeepMind
- **Published**: September 2025
- **arXiv**: [2509.20354](https://arxiv.org/abs/2509.20354)
- **Model**: [google/embeddinggemma-300m](https://huggingface.co/google/embeddinggemma-300m)

**Summary**: A 300M parameter encoder-based embedding model built from Gemma 3 with T5Gemma initialization. Achieves state-of-the-art performance for its size class across MTEB benchmarks (69.67 English Mean Task). Features Matryoshka Representation Learning (768/512/256/128 dimensions) and Quantization-Aware Training (QAT) for efficient deployment.

**Why it matters**: Our primary candidate model. Key advantages:
- Encoder architecture (bi-directional attention) is theoretically optimal for embeddings
- Google published MIRIAD medical fine-tuning results (NDCG@10 = 0.8862), proving medical domain viability
- MRL enables deploy-anywhere flexibility without retraining
- QAT checkpoints achieve near-full-precision quality at 4-bit (<200MB)
- Asymmetric query/document prompts match our retrieval use case
- 308M params fits on Colab T4 free tier with CachedMNRL

**Key results**: MTEB English 69.67 (768d), 68.37 (256d, only -1.9%), MIRIAD medical NDCG@10 = 0.8862.

---

### 5. GTE-Qwen2: General Text Embeddings with Qwen2

- **Authors**: Alibaba-NLP team
- **Institution**: Alibaba Group
- **Model**: [Alibaba-NLP/gte-Qwen2-1.5B-instruct](https://huggingface.co/Alibaba-NLP/gte-Qwen2-1.5B-instruct)

**Summary**: A decoder-based embedding model using the Qwen2 architecture with last-token pooling and L2 normalization. The 1.5B version was used as the base for Harvard's ToolRAG-T1, making it the only model proven to work for biomedical tool retrieval.

**Why it matters**: Our secondary candidate model and the reference architecture. Key facts:
- Exact base model Harvard used for ToolRAG-T1 (validated for tool retrieval)
- 1.5B parameters provides higher capacity for memorizing 2,049 tool distinctions
- Last-token pooling with causal attention has known trade-offs vs. encoder models
- 1,536 embedding dimensions (fixed, no MRL)
- Requires A100 for training (does not fit on free Colab)

**Key results**: MTEB English 67.20, proven tool retrieval via ToolRAG-T1.

---

### 6. Qwen3-Embedding: Advancing Text Embedding and Reranking Through Foundation Models

- **Authors**: Yanzhao Zhang, Mingxin Li, Dingkun Long, et al.
- **Institution**: Alibaba/Qwen team
- **Published**: June 2025
- **arXiv**: [2506.05176](https://arxiv.org/abs/2506.05176)
- **Model**: [Qwen/Qwen3-Embedding-0.6B](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B)

**Summary**: Next-generation embedding model from the Qwen family. The 0.6B version achieves 70.70 on MTEB English (outperforming GTE-Qwen2-1.5B at 67.20 despite being 2.5x smaller). Features MRL support (dimensions 32-1024) and instruction-aware encoding.

**Why it matters**: Potential upgrade path. Key observations:
- Outperforms GTE-Qwen2-1.5B with fewer parameters (0.6B vs 1.5B)
- MRL support means flexible deployment similar to EmbeddingGemma
- Instruction-aware encoding could help with query-time task specification
- Decoder architecture (same trade-off as GTE-Qwen2)
- No medical domain fine-tuning evidence yet

**Key results**: MTEB English 70.70 (0.6B), MTEB Multilingual 64.33 (0.6B).

---

## Training Methods

### 7. Efficient Natural Language Response Suggestion for Smart Reply (Multiple Negatives Ranking Loss)

- **Authors**: Matthew Henderson, Rami Al-Rfou, Brian Strope, Yun-Hsuan Sung, Laszlo Lukacs, Ruiqi Guo, Sanjiv Kumar, Balint Miklos, Ray Kurzweil
- **Institution**: Google
- **Published**: 2017
- **arXiv**: [1705.00652](https://arxiv.org/abs/1705.00652)

**Summary**: Introduces the Multiple Negatives Ranking (MNR) loss function for training retrieval models using in-batch negatives. Each positive pair in the batch serves as a negative for all other queries, eliminating the need for explicit negative sampling.

**Why it matters**: MNR is the loss function used by both Harvard's ToolRAG and our training pipeline. Key properties:
- Loss = -log(exp(sim(q, d+)) / sum(exp(sim(q, d_j)))) -- InfoNCE formulation
- In-batch negatives scale with batch size (larger batch = more negatives = better signal)
- No negative sampling overhead -- all computation is "useful"
- Temperature parameter controls distribution sharpness
- CachedMNRL extends this to decouple gradient computation from batch size

**Key result**: Foundation for modern contrastive embedding training. Used by all sentence-transformers retrieval models.

---

### 8. Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks

- **Authors**: Nils Reimers, Iryna Gurevych
- **Institution**: TU Darmstadt
- **Published**: 2019
- **arXiv**: [1908.10084](https://arxiv.org/abs/1908.10084)
- **Code**: [sentence-transformers](https://www.sbert.net/)

**Summary**: Establishes the sentence-transformers framework for training and using sentence embeddings. Introduces the Siamese network approach where a shared encoder processes both sentences, and a loss function trains the model to produce similar embeddings for semantically similar texts.

**Why it matters**: Our training framework. Key contributions:
- `SentenceTransformer` class wraps any transformer model for embedding tasks
- Standardized training with `SentenceTransformerTrainer` and HuggingFace Trainer API
- Pooling strategies: mean, CLS, last-token (all supported)
- Pre-built loss functions: MNR, triplet, contrastive, cosine similarity
- Evaluation tools: InformationRetrievalEvaluator, EmbeddingSimilarityEvaluator

**Key result**: Created the de facto standard library for embedding model training and inference.

---

### 9. Matryoshka Representation Learning

- **Authors**: Aditya Kusupati, Gantavya Bhatt, Aniket Rege, Matthew Wallingford, Aditya Sinha, Vivek Ramanujan, William Howard-Snyder, Kaifeng Chen, Sham Kakade, Prateek Jain, Ali Farhadi
- **Published**: 2022
- **arXiv**: [2205.13147](https://arxiv.org/abs/2205.13147)

**Summary**: Introduces a training technique that produces embeddings meaningful at any prefix dimension. By applying the loss function at multiple truncation points (e.g., 768, 512, 256, 128), a single model produces embeddings that can be truncated to any of these sizes at deployment time with graceful quality degradation.

**Why it matters**: Enables our flexible deployment strategy for EmbeddingGemma. Key insights:
- A 768d MRL-trained model at 256d often matches or beats a model trained specifically at 256d
- Quality degrades gracefully: typically <2% loss at half dimension, <5% at quarter
- No retraining needed to change deployment dimension
- Combined with quantization (QAT), enables extreme compression: Q4_0 at 128d = ~25x smaller than fp32 at 768d
- `MatryoshkaLoss` in sentence-transformers wraps any inner loss function

**Key result**: Train once, deploy anywhere. Critical for OMS where we need CLI (128d), web search (256d), and server (768d) from the same model.

---

## Tool Retrieval and RAG

### 10. ToolUniverse: A Comprehensive Biomedical Tool Database

- **Authors**: Harvard MIMS Lab
- **Institution**: Harvard Medical School
- **Code**: [github.com/mims-harvard/ToolUniverse](https://github.com/mims-harvard/ToolUniverse)
- **PyPI**: [tooluniverse](https://pypi.org/project/tooluniverse/)

**Summary**: A curated catalog of 1,995 biomedical tools consolidated from trusted sources including all US FDA-approved drugs since 1939 and validated clinical insights from Open Targets. Each tool has structured metadata: name, description, parameters, source, and category.

**Why it matters**: Primary data source for our training set. Key facts:
- 1,995 tools (we add 54 OMS skills/plugins for 2,049 total)
- Structured format with descriptions, parameters, and metadata
- Focused on pharmacology and drug reasoning (our biggest category)
- Python API for programmatic access
- MIT license, freely usable

**Key limitation**: Heavy drug/pharmacology bias. Most tools are drug-related. OMS needs coverage of all 14 medical categories.

---

### 11. Tool RAG: Agentic Retrieval Augmented Generation for Tool Retrieval

- **Authors**: Red Hat AI team
- **Published**: November 2025
- **Source**: Red Hat blog / documentation

**Summary**: Describes the Tool Retrieval Augmented Generation pattern -- using embedding models to retrieve relevant tools from a catalog before passing them to an LLM agent. The pattern is: embed tool descriptions -> store in vector DB -> at query time, embed query -> retrieve top-k tools -> pass to agent.

**Why it matters**: Architectural reference for our deployment. Key patterns:
- Pre-compute tool embeddings at index time (not at query time)
- Use asymmetric encoding (query prompt vs. document prompt)
- Top-k retrieval followed by optional re-ranking
- Integration with agent frameworks (LangChain, LlamaIndex, MCP)
- Hybrid search: combine dense retrieval (embeddings) with sparse retrieval (BM25/keywords)

---

### 12. MTEB: Massive Text Embedding Benchmark

- **Authors**: Niklas Muennighoff, Nouamane Tazi, Loic Magne, Nils Reimers
- **Published**: 2022 (continuously updated)
- **arXiv**: [2210.07316](https://arxiv.org/abs/2210.07316)
- **Leaderboard**: [huggingface.co/spaces/mteb/leaderboard](https://huggingface.co/spaces/mteb/leaderboard)

**Summary**: The standard benchmark suite for evaluating text embedding models. Covers 8 task types (classification, clustering, pair classification, reranking, retrieval, STS, summarization, bitext mining) across 58+ datasets in English, plus multilingual and code variants.

**Why it matters**: Our reference for comparing base model quality and understanding model capabilities. Key observations:
- MTEB retrieval scores do not directly predict tool retrieval performance (per "Retrieval Models Aren't Tool-Savvy")
- However, higher MTEB scores generally correlate with better fine-tuning starting points
- We report MTEB scores for context but evaluate on our own tool retrieval benchmarks
- The leaderboard helps identify new candidate models as they are released

---

## Additional References

### 13. CachedMultipleNegativesRankingLoss

- **Source**: sentence-transformers library documentation
- **Docs**: [sbert.net/docs/package_reference/sentence_transformer/losses.html](https://www.sbert.net/docs/package_reference/sentence_transformer/losses.html)

**Summary**: Extension of MNR loss that caches embeddings across mini-batches, allowing the effective batch size (number of negatives) to be much larger than what fits in GPU memory. This is particularly important for small GPUs where batch size is constrained.

**Why it matters**: Enables training EmbeddingGemma-300M on Colab T4 free tier with effective batch sizes of 512+. Without CachedMNRL, we would be limited to batch size ~32 on T4, which would produce a weaker model due to fewer in-batch negatives.

---

### 14. MIRIAD: Medical Information Retrieval and Augmented Diagnosis

- **Source**: Google DeepMind (referenced in EmbeddingGemma paper)

**Summary**: A medical information retrieval benchmark used by Google to validate EmbeddingGemma's medical domain capabilities. EmbeddingGemma achieved NDCG@10 = 0.8862 on MIRIAD after fine-tuning.

**Why it matters**: Demonstrates that EmbeddingGemma can be effectively fine-tuned for medical retrieval tasks. The 0.8862 NDCG@10 score on a medical benchmark gives us confidence that the model has sufficient capacity for medical AI tool retrieval.

---

### 15. Nomic Embed Text v1.5

- **Authors**: Nomic AI
- **Model**: [nomic-ai/nomic-embed-text-v1.5](https://huggingface.co/nomic-ai/nomic-embed-text-v1.5)

**Summary**: A 137M parameter open-source embedding model with 8K context and 768-dimensional output. Used widely for RAG applications due to its small size, fast inference, and decent quality.

**Why it matters**: Current default embedding model in OMS CLI (`oms find-tools`). Serves as our primary baseline. If our fine-tuned model cannot meaningfully outperform nomic-embed-text on tool retrieval, the fine-tuning effort is not justified.

---

## Citation Format

When referencing this project:

```bibtex
@misc{oms_toolrag_2026,
    title={OMS ToolRAG: Custom Embedding Model for Medical AI Tool Retrieval},
    author={IntelMedica.ai},
    year={2026},
    url={https://github.com/Open-Medica/open-medical-skills/tree/main/oms-models}
}
```

---

## Reading Order

For someone new to this project, the recommended reading order is:

1. **This document** (related-papers.md) -- understand the landscape
2. **toolrag-analysis.md** -- deep dive into what Harvard built and its limitations
3. **base-model-comparison.md** -- why we chose our candidate models
4. **training-methodology.md** -- how we plan to train our model
5. **integration_guide.md** -- how the trained model integrates into OMS
