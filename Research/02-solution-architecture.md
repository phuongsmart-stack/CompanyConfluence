# Solution Architecture: RAG for Confluence AI Chatbot

## Executive Summary

Retrieval-Augmented Generation (RAG) is the dominant architectural pattern for building AI chatbots that answer questions from enterprise knowledge bases like Confluence. This document covers RAG architecture, embedding models, vector stores, LLM options, and Confluence API integration patterns.

## RAG Architecture Overview

### What is RAG?

RAG combines information retrieval with language model generation. Instead of relying solely on an LLM's training data, RAG:

1. **Retrieves** relevant documents from a knowledge base using semantic search
2. **Augments** the LLM's prompt with the retrieved context
3. **Generates** an answer grounded in the retrieved information

### RAG Pipeline Components

```
[Confluence] → [Data Loader] → [Chunker] → [Embedder] → [Vector Store]
                                                              ↓
[User Query] → [Embedder] → [Retriever] → [Reranker] → [LLM] → [Response]
```

### Ingestion Pipeline (Offline)

1. **Data Loading:** Extract pages, comments, and attachments from Confluence via REST API
2. **Preprocessing:** Convert Confluence storage format (XHTML) to clean text, handle macros, strip formatting
3. **Chunking:** Split documents into overlapping chunks (typically 500-1000 tokens)
4. **Embedding:** Convert chunks to dense vector representations
5. **Indexing:** Store vectors and metadata in a vector database

### Query Pipeline (Online)

1. **Query Embedding:** Convert user question to a vector
2. **Retrieval:** Find top-k similar chunks from the vector store
3. **Reranking (optional):** Re-score results using a cross-encoder for better precision
4. **Context Assembly:** Combine retrieved chunks into a prompt
5. **Generation:** LLM generates an answer grounded in the context
6. **Citation:** Include source page links in the response

## Confluence API Integration

### API Versions

| Aspect | REST API v1 | REST API v2 |
|---|---|---|
| Availability | Cloud, Server, Data Center | Cloud only |
| Base path | `/wiki/rest/api/` | `/wiki/api/v2/` |
| Pagination | Offset-based | Cursor-based (faster, no data loss) |
| Performance | Baseline | Up to 30x faster for bulk retrieval |
| Content IDs | Numeric | UUID strings |

### Key Endpoints for Data Extraction

**REST API v1:**
- `GET /rest/api/content?spaceKey={key}&type=page` — List pages in a space
- `GET /rest/api/content/{id}?expand=body.storage,version,space` — Get page with body
- `GET /rest/api/content/{id}/child/attachment` — Get attachments
- `GET /rest/api/content/search?cql={query}` — Search with CQL

**REST API v2 (Cloud only):**
- `GET /wiki/api/v2/spaces/{id}/pages?body-format=storage` — Pages in a space with body
- `GET /wiki/api/v2/pages/{id}?body-format=storage` — Single page with body
- `GET /wiki/api/v2/pages/{id}/attachments` — Attachments for a page

### Authentication Methods

| Method | Cloud | Server/DC | Details |
|---|---|---|---|
| API Token + Basic Auth | Yes | No | Email as username, API token as password |
| OAuth 2.0 (3LO) | Yes | No | Three-legged OAuth for apps |
| Basic Auth (password) | No | Yes | Username + password |
| Personal Access Token | No | Yes (DC 7.9+) | Token-only, no username needed |
| OAuth 1.0a | No | Yes | Three-legged, requires app link config |

### Python Libraries

- **atlassian-python-api:** Community-maintained, supports Cloud and Server/DC
  - Key methods: `get_all_pages_from_space()`, `get_page_by_id()`, `get_all_spaces()`
- **LangChain ConfluenceLoader:** Built-in, supports space_key, page_ids, attachments
- **LlamaIndex ConfluenceReader:** Supports space_key, page_ids, label, CQL queries

### Content Format

- **Storage format (XHTML):** Native Confluence format, needs HTML-to-text conversion
- **Atlas Doc Format (JSON):** Structured format, Cloud only
- **Attachments:** PDF, Word, Excel, images — require separate download and text extraction

## Embedding Models

### Cloud Embedding APIs

| Model | Provider | Dimensions | Context | Notes |
|---|---|---|---|---|
| text-embedding-3-large | OpenAI | 3072 (configurable) | 8191 tokens | Best quality, supports dimension reduction |
| text-embedding-3-small | OpenAI | 1536 (configurable) | 8191 tokens | Good balance of quality and cost |
| voyage-3-large | Voyage AI | 1024 | 32K tokens | Top-tier retrieval quality |
| embed-v4.0 | Cohere | 1536 | 512 tokens | Multilingual, search-optimized |

### Local/Self-Hosted Embedding Models

| Model | Dimensions | Context | Size | Notes |
|---|---|---|---|---|
| nomic-embed-text | 768 | 8192 tokens | 274M params | Excellent for local deployment via Ollama |
| all-MiniLM-L6-v2 | 384 | 512 tokens | 22.7M params | Very fast, good for prototyping |
| bge-large-en-v1.5 | 1024 | 512 tokens | 335M params | Strong retrieval performance |
| e5-large-v2 | 1024 | 512 tokens | 335M params | Competitive with commercial models |
| gte-large | 1024 | 512 tokens | 335M params | Open-source, strong on MTEB |
| mxbai-embed-large | 1024 | 512 tokens | 335M params | Available via Ollama |
| snowflake-arctic-embed-l | 1024 | 512 tokens | 335M params | Strong retrieval, Apache 2.0 |

### Embedding Deployment Options

- **Ollama:** Easiest local deployment, supports nomic-embed-text, mxbai-embed-large
- **HuggingFace Transformers:** Direct model loading, maximum flexibility
- **TEI (Text Embeddings Inference):** HuggingFace's optimized inference server
- **vLLM:** High-throughput serving, supports embedding models

## Vector Stores

### Options Comparison

| Store | Type | Persistence | Scalability | Best For |
|---|---|---|---|---|
| **ChromaDB** | Embedded | Local files | Small-medium | Prototyping, single-user |
| **FAISS** | Library | In-memory + disk | Medium-large | High-performance search |
| **PGVector** | PostgreSQL extension | Database | Production | Teams already using PostgreSQL |
| **Weaviate** | Dedicated DB | Distributed | Enterprise | Hybrid search, auto-schema |
| **Qdrant** | Dedicated DB | Distributed | Enterprise | High performance, filtering |
| **Milvus** | Dedicated DB | Distributed | Enterprise | Massive scale |
| **LanceDB** | Embedded | Local files | Small-medium | Serverless, multimodal |

### Recommendation

- **Prototyping:** ChromaDB (zero config, works with LangChain/LlamaIndex out of the box)
- **Production single-instance:** PGVector (reliable, SQL-compatible, easy backup)
- **Production distributed:** Qdrant or Weaviate (dedicated vector DB with filtering, hybrid search)

## LLM Options

### Cloud LLMs

| Model | Provider | Context Window | Strengths |
|---|---|---|---|
| GPT-4o | OpenAI | 128K | Best overall quality, fast |
| GPT-4o-mini | OpenAI | 128K | Cost-effective, good quality |
| Claude Sonnet 4.6 | Anthropic | 200K | Large context, excellent reasoning |
| Claude Haiku 4.5 | Anthropic | 200K | Fast, cost-effective |
| Gemini 2.0 Flash | Google | 1M | Largest context window |

### Local/Self-Hosted LLMs

| Model | Parameters | RAM Required | Strengths |
|---|---|---|---|
| Llama 3.1 8B | 8B | 8GB+ | Best open-source at size, fast |
| Llama 3.1 70B | 70B | 48GB+ | Near-GPT-4 quality |
| Mistral 7B | 7.3B | 8GB+ | Fast, efficient |
| Mixtral 8x7B | 46.7B (MoE) | 32GB+ | MoE architecture, good quality |
| Qwen 2.5 7B | 7B | 8GB+ | Strong multilingual |
| Phi-3 Mini | 3.8B | 4GB+ | Smallest viable model |
| DeepSeek-R1 | 7B-671B | Varies | Strong reasoning |
| Gemma 2 9B | 9B | 12GB+ | Good instruction following |

### Local LLM Serving Options

- **Ollama:** Easiest setup, automatic model management, REST API
- **llama.cpp:** Maximum performance, C++ native, supports quantization
- **vLLM:** High-throughput production serving, PagedAttention
- **text-generation-inference (TGI):** HuggingFace's production server
- **LocalAI:** Drop-in OpenAI API replacement

## Advanced RAG Techniques

### Chunking Strategies

| Strategy | Description | Best For |
|---|---|---|
| Fixed-size | Split at token/character boundaries | Simple, predictable |
| Recursive | Split by separators (headers, paragraphs) | Structured documents |
| Semantic | Split at topic boundaries using embeddings | High-quality retrieval |
| Document-aware | Respect Confluence page structure (headings, sections) | Confluence-specific |

### Retrieval Enhancement

- **Hybrid Search:** Combine dense vectors (semantic) + BM25 (keyword) for better recall
- **Reranking:** Use cross-encoder models (e.g., BGE-reranker, Cohere Rerank) to reorder results
- **Query Expansion:** Reformulate user query to improve retrieval
- **HyDE (Hypothetical Document Embeddings):** Generate a hypothetical answer, embed it, and search
- **Multi-query:** Generate multiple query variants and merge results
- **Parent Document Retrieval:** Index small chunks but retrieve the full parent document

### Context Assembly

- **Stuff method:** Concatenate all retrieved chunks into the prompt (simple, limited by context window)
- **Map-reduce:** Process each chunk separately, then combine summaries
- **Refine:** Iteratively refine the answer with each chunk

## Recommended Architecture Stack

### Minimum Viable Product (MVP)

```
Confluence API → LangChain ConfluenceLoader → RecursiveTextSplitter
    → nomic-embed-text (Ollama) → ChromaDB
    → Llama 3.1 8B (Ollama) → Streamlit UI
```

### Production

```
Confluence API → Custom loader with incremental sync → Semantic chunking
    → text-embedding-3-small (OpenAI) or nomic-embed-text (self-hosted)
    → PGVector or Qdrant
    → Hybrid retrieval + BGE Reranker
    → GPT-4o / Claude Sonnet or Llama 3.1 70B (self-hosted)
    → Chainlit UI with authentication
```

## Sources

- Atlassian Confluence REST API v2: https://developer.atlassian.com/cloud/confluence/rest/v2/intro/
- Atlassian Authentication Guide: https://developer.atlassian.com/developer-guide/auth/
- LangChain Confluence Loader: https://docs.langchain.com/oss/python/integrations/document_loaders/confluence
- LlamaIndex Confluence Reader: https://docs.llamaindex.ai/en/stable/api_reference/readers/confluence/
- MTEB Leaderboard: https://huggingface.co/spaces/mteb/leaderboard
- Ollama Model Library: https://ollama.com/library
- atlassian-python-api: https://atlassian-python-api.readthedocs.io/confluence.html
