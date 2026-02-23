# Confluence AI Chatbot — Research

This folder contains research findings for building an AI-powered chatbot that integrates with Atlassian Confluence to improve knowledge discovery and search.

## Documents

| # | Document | Description |
|---|---|---|
| 01 | [Problem Space](01-problem-space.md) | Pain points with Confluence search, knowledge silos, and why AI/RAG solutions address them |
| 02 | [Solution Architecture](02-solution-architecture.md) | RAG architecture, Confluence APIs, embedding models, vector stores, LLM options |
| 03 | [Existing Tools & Frameworks](03-existing-tools-and-frameworks.md) | Open-source projects, RAG frameworks with Confluence connectors, UI frameworks, Atlassian Rovo |
| 04 | [Local LLM Deployment](04-local-llm-deployment.md) | Inference servers (Ollama, vLLM, llama.cpp), local models, hardware requirements, privacy |

## Key Findings

### Recommended Architecture Options

**Option A — Custom Build (Most Flexible)**
- LangChain/LlamaIndex + Confluence loader + vector store + LLM + Chainlit/Streamlit UI
- Full control, fits any deployment model (cloud, on-prem, air-gapped)

**Option B — Enterprise Platform (Fastest to Production)**
- Onyx (formerly Danswer) — MIT licensed, 40+ connectors, SSO/RBAC, permission-aware
- Deploy via Docker, minimal custom code needed

**Option C — Self-Hosted with Auto-Sync (Best for Data Freshness)**
- RAGFlow — native Confluence connector with automatic syncing
- Deep document understanding, Docker deployment

**Option D — Desktop/Simple (Lowest Barrier)**
- AnythingLLM — built-in Confluence connector, desktop app or Docker
- One-time fetch limitation

### Technology Choices

| Component | Development | Production |
|---|---|---|
| Confluence Loader | LangChain `ConfluenceLoader` | Custom with incremental sync |
| Embedding | nomic-embed-text (Ollama) | bge-large-en-v1.5 or OpenAI text-embedding-3 |
| Vector Store | ChromaDB | PGVector or Qdrant |
| LLM | Llama 3.1 8B (Ollama) | Llama 3.1 70B / GPT-4o / Claude Sonnet |
| UI | Streamlit | Chainlit (with auth) |
| Retrieval | Basic similarity search | Hybrid (dense + BM25) + reranking |
