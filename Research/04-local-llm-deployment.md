# Local/Private LLM Deployment Options and Embedding Models

## Executive Summary

This document covers options for deploying LLMs and embedding models locally or in private infrastructure, enabling fully self-hosted Confluence AI chatbots that keep data within organizational boundaries. It covers inference servers, model options, hardware requirements, and deployment strategies.

## 1. Local LLM Inference Servers

### Ollama

- **Website:** https://ollama.com/
- **Best for:** Easiest local LLM deployment, development, small teams
- **Features:**
  - One-command model download and serving (`ollama pull llama3.1`)
  - REST API compatible with OpenAI format
  - Supports both chat models and embedding models
  - Automatic GPU detection (NVIDIA, Apple Silicon, AMD)
  - Model library with 100+ models
  - Modelfile for custom model configurations
- **Embedding models available:** nomic-embed-text, mxbai-embed-large, all-minilm, snowflake-arctic-embed
- **Limitations:** Single-user optimized, no built-in load balancing, limited batch processing

### llama.cpp / llama-cpp-python

- **Repository:** https://github.com/ggerganov/llama.cpp
- **Best for:** Maximum performance, resource-constrained environments
- **Features:**
  - C/C++ implementation, minimal dependencies
  - GGUF model format with quantization (Q4_K_M, Q5_K_M, Q8_0)
  - CPU inference with AVX/AVX2/AVX-512 optimization
  - GPU offloading (CUDA, Metal, Vulkan, SYCL)
  - Server mode with OpenAI-compatible API
- **Quantization impact:**
  - Q4_K_M: ~4.5 bits/param, ~50% memory reduction, minimal quality loss
  - Q5_K_M: ~5.5 bits/param, ~40% memory reduction, near-lossless
  - Q8_0: ~8 bits/param, ~20% memory reduction, virtually lossless
- **Strengths:** Smallest memory footprint, runs on CPU-only machines

### vLLM

- **Repository:** https://github.com/vllm-project/vllm
- **Best for:** High-throughput production serving, multiple concurrent users
- **Features:**
  - PagedAttention for efficient memory management
  - Continuous batching for high throughput
  - Tensor parallelism for multi-GPU
  - OpenAI-compatible API server
  - Supports embedding models
  - Speculative decoding
- **Strengths:** 2-4x higher throughput than HuggingFace Transformers
- **Requirements:** NVIDIA GPU with CUDA, significant VRAM

### Text Generation Inference (TGI)

- **Repository:** https://github.com/huggingface/text-generation-inference
- **Best for:** Production HuggingFace model serving
- **Features:**
  - Optimized transformer inference (Flash Attention, Paged Attention)
  - Continuous batching, token streaming
  - Multi-GPU via tensor parallelism
  - Docker-first deployment
  - Quantization support (GPTQ, AWQ, EETQ, bitsandbytes)
- **Strengths:** Production-ready, well-documented, HuggingFace ecosystem integration

### LocalAI

- **Repository:** https://github.com/mudler/LocalAI
- **Best for:** Drop-in OpenAI API replacement
- **Features:**
  - 100% compatible with OpenAI API specification
  - Supports text generation, embeddings, audio, images
  - Multiple backends (llama.cpp, transformers, vLLM)
  - No GPU required (but recommended)
  - Docker deployment
- **Strengths:** Zero code changes to switch from OpenAI to local

## 2. Local LLM Models

### Small Models (4-8GB RAM)

| Model | Parameters | Quant Size | Strengths |
|---|---|---|---|
| Phi-3 Mini | 3.8B | ~2.3GB (Q4) | Smallest viable model, good reasoning |
| Gemma 2 2B | 2.6B | ~1.8GB (Q4) | Google's efficient small model |
| Qwen 2.5 3B | 3B | ~2GB (Q4) | Strong multilingual |
| Llama 3.2 3B | 3B | ~2GB (Q4) | Meta's compact model |

### Medium Models (8-16GB RAM)

| Model | Parameters | Quant Size | Strengths |
|---|---|---|---|
| **Llama 3.1 8B** | 8B | ~4.7GB (Q4) | Best overall at this size, strong instruction following |
| Mistral 7B v0.3 | 7.3B | ~4.4GB (Q4) | Fast, efficient, good at RAG |
| Qwen 2.5 7B | 7B | ~4.4GB (Q4) | Strong coding and multilingual |
| Gemma 2 9B | 9.2B | ~5.5GB (Q4) | Good instruction following |
| DeepSeek-R1 8B | 8B | ~4.7GB (Q4) | Strong reasoning capabilities |

### Large Models (32-64GB RAM)

| Model | Parameters | Quant Size | Strengths |
|---|---|---|---|
| Llama 3.1 70B | 70B | ~40GB (Q4) | Near-GPT-4 quality |
| Mixtral 8x7B | 46.7B (MoE) | ~26GB (Q4) | MoE — only activates 12B per token |
| Qwen 2.5 72B | 72B | ~41GB (Q4) | Strong overall |
| DeepSeek-R1 70B | 70B | ~40GB (Q4) | Excellent reasoning |
| Command R+ | 104B | ~60GB (Q4) | Designed for RAG, with citation |

### Recommendation for Confluence RAG

- **Development/Prototyping:** Llama 3.1 8B (Q4_K_M via Ollama) — good quality, runs on most hardware
- **Production (self-hosted):** Llama 3.1 70B or Mixtral 8x7B — high quality, needs GPU server
- **RAG-specific:** Command R+ has built-in citation/grounding capabilities ideal for RAG

## 3. Embedding Models for Local Deployment

### Via Ollama

| Model | Dimensions | Context | Size | Quality (MTEB) |
|---|---|---|---|---|
| **nomic-embed-text** | 768 | 8192 | 274M | Strong |
| mxbai-embed-large | 1024 | 512 | 335M | Strong |
| all-minilm | 384 | 512 | 23M | Good (fast) |
| snowflake-arctic-embed-l | 1024 | 512 | 335M | Strong |

### Via HuggingFace / Sentence-Transformers

| Model | Dimensions | Context | Quality | License |
|---|---|---|---|---|
| **BAAI/bge-large-en-v1.5** | 1024 | 512 | Top-tier | MIT |
| BAAI/bge-m3 | 1024 | 8192 | Strong, multilingual | MIT |
| intfloat/e5-large-v2 | 1024 | 512 | Strong | MIT |
| thenlper/gte-large | 1024 | 512 | Strong | MIT |
| Alibaba-NLP/gte-Qwen2-7B | 3584 | 131072 | SOTA | Apache 2.0 |

### Recommendation

- **Development:** nomic-embed-text via Ollama (easiest setup, good quality, 8K context)
- **Production:** BAAI/bge-large-en-v1.5 via sentence-transformers or TEI (top-tier retrieval)
- **Multilingual:** BAAI/bge-m3 (supports 100+ languages)

## 4. Hardware Requirements

### Minimum (Development / Single User)

| Component | Requirement |
|---|---|
| CPU | Modern x86_64 with AVX2 (or Apple M1+) |
| RAM | 16GB (for 7-8B models) |
| GPU | Optional — CPU inference works but is slow |
| Storage | 20GB for models + 10GB for vector DB |

### Recommended (Small Team, 5-20 users)

| Component | Requirement |
|---|---|
| CPU | 8+ cores |
| RAM | 32GB |
| GPU | NVIDIA RTX 3090/4090 (24GB VRAM) or Apple M2/M3 Pro |
| Storage | 100GB SSD |

### Production (Organization-wide)

| Component | Requirement |
|---|---|
| CPU | 16+ cores |
| RAM | 64GB+ |
| GPU | NVIDIA A100 (40/80GB) or 2x RTX 4090 |
| Storage | 500GB+ NVMe SSD |
| Network | Low-latency connection to Confluence instance |

### Apple Silicon Notes

- M1/M2/M3 chips have unified memory — all RAM is available as "VRAM"
- M2 Ultra (192GB) can run 70B models at reasonable speed
- M3 Max (128GB) is excellent for development with large models
- Metal acceleration is well-supported by Ollama and llama.cpp

## 5. Deployment Architectures

### Single-Machine Deployment

```
[Machine]
├── Ollama (LLM + Embeddings)
├── ChromaDB / PGVector (Vector Store)
├── Python App (RAG Pipeline)
└── Streamlit / Chainlit (UI)
```

Best for: Development, small teams, proof of concept

### Docker Compose Deployment

```yaml
services:
  ollama:
    image: ollama/ollama
    volumes: [ollama_data:/root/.ollama]
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]

  vectordb:
    image: qdrant/qdrant
    volumes: [qdrant_data:/qdrant/storage]

  app:
    build: .
    depends_on: [ollama, vectordb]
    ports: ["8000:8000"]

  ui:
    build: ./ui
    depends_on: [app]
    ports: ["8501:8501"]
```

Best for: Team deployment, reproducible environments

### Kubernetes Deployment

```
[K8s Cluster]
├── LLM Serving (vLLM / TGI on GPU nodes)
├── Embedding Service (TEI on GPU/CPU nodes)
├── Vector DB (Qdrant / Weaviate StatefulSet)
├── RAG API (Deployment, HPA)
├── UI (Deployment, Ingress)
└── Confluence Sync Job (CronJob)
```

Best for: Organization-wide deployment, auto-scaling, high availability

## 6. Privacy and Security Considerations

### Data Privacy

- **Self-hosted models:** All data stays within organizational boundaries
- **No external API calls:** Eliminates data leakage concerns
- **Compliance:** Meets requirements for GDPR, HIPAA, SOC2 where data residency matters
- **Air-gapped deployment:** Possible with pre-downloaded models and offline vector stores

### Security Best Practices

- Store Confluence API tokens in secrets management (Vault, K8s Secrets, env vars)
- Respect Confluence permission model — filter retrieved content by user permissions
- Encrypt vector store at rest
- Use TLS for all internal service communication
- Implement authentication on the chat UI (Chainlit supports Okta, Azure AD, Google)
- Audit logging for all queries and retrieved documents

### Permission-Aware RAG

A critical consideration: the RAG system must respect Confluence's access controls. Options:
1. **Pre-filtered indexing:** Only index content accessible to all target users (simplest)
2. **Query-time filtering:** Store permission metadata with each chunk, filter at retrieval time
3. **User-impersonation:** Use the querying user's credentials to verify access to retrieved documents
4. **Onyx/Danswer approach:** Mirrors source system permissions automatically (most sophisticated)

## 7. Cost Comparison: Local vs. Cloud

### Cloud LLM Costs (per 1M tokens, approximate)

| Model | Input | Output |
|---|---|---|
| GPT-4o | $2.50 | $10.00 |
| GPT-4o-mini | $0.15 | $0.60 |
| Claude Sonnet 4.6 | $3.00 | $15.00 |
| Claude Haiku 4.5 | $0.80 | $4.00 |

### Local LLM Costs (hardware investment)

| Setup | Hardware Cost | Monthly Running Cost |
|---|---|---|
| Development (RTX 4090) | ~$1,600 | ~$50 (electricity) |
| Production (A100 80GB) | ~$15,000 | ~$200 (electricity) |
| Cloud GPU (A100, on-demand) | $0 | ~$2,000-3,000/month |
| Cloud GPU (A100, reserved) | $0 | ~$1,000-1,500/month |

### Break-Even Analysis

- For low usage (<100K queries/month): Cloud APIs are more cost-effective
- For medium usage (100K-500K queries/month): Break-even depends on model choice
- For high usage (>500K queries/month) or strict privacy requirements: Self-hosted pays off

## Sources

- Ollama: https://ollama.com/
- llama.cpp: https://github.com/ggerganov/llama.cpp
- vLLM: https://github.com/vllm-project/vllm
- TGI: https://github.com/huggingface/text-generation-inference
- LocalAI: https://github.com/mudler/LocalAI
- MTEB Leaderboard: https://huggingface.co/spaces/mteb/leaderboard
- Ollama Model Library: https://ollama.com/library
- HuggingFace Model Hub: https://huggingface.co/models
- NVIDIA GPU Pricing: https://www.nvidia.com/
