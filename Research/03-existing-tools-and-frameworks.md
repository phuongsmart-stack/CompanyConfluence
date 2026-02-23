# Existing Tools and Frameworks for Confluence AI Chatbots

## Executive Summary

This document catalogs open-source projects, RAG frameworks, and platforms that can be used to build an AI chatbot for Confluence. It covers purpose-built Confluence chatbot projects, enterprise platforms with Confluence connectors, RAG frameworks with native Confluence support, and UI frameworks for chat interfaces.

## 1. Existing Open-Source Confluence Chatbot Projects

### a) RAG-Chatbot-with-Confluence (BastinFlorian)

- **Repository:** https://github.com/BastinFlorian/RAG-Chatbot-with-Confluence
- **License:** MIT
- **Stack:** LangChain + OpenAI + Streamlit
- **Description:** A help-desk-style Q&A bot with a Streamlit UI that uses company Confluence data. Includes data loading from Confluence, smart chunking, LLM instantiation, and RAG model evaluation.
- **Notable:** Extended by Taranis (ag-tech company) into a production internal chatbot.

### b) confluence-chatbot (dirk-weimar)

- **Repository:** https://github.com/dirk-weimar/confluence-chatbot
- **Stack:** Python + OpenAI ChatGPT + Streamlit
- **Description:** A command-line tool combining ChatGPT with Confluence Wiki. Requires Confluence Cloud with personal API token and OpenAI account.

### c) Confluence RAG on GKE (Medium tutorial)

- **Stack:** LangChain + OpenAI + Streamlit + Docker + GKE
- **Description:** Complete project with CI/CD pipeline, containerized with Docker, deployed to Google Kubernetes Engine via GitHub Actions.

## 2. Enterprise Platforms with Confluence Connectors

### Onyx (formerly Danswer)

- **Repository:** https://github.com/onyx-dot-app/onyx
- **License:** MIT (Community Edition)
- **Description:** The most production-ready open-source option. Enterprise search and AI assistant connecting to 40+ knowledge sources including Confluence, Google Drive, Slack, GitHub, Salesforce.
- **Features:**
  - Agents, Web Search, RAG, MCP, Deep Research
  - SSO (OIDC/SAML/OAuth2), RBAC
  - Document permissioning that mirrors user access from external apps
  - Hybrid search (embeddings + BM25 + reranking + knowledge graphs)
  - Deploy on laptop, on-premise, or cloud

### AnythingLLM

- **Repository:** https://github.com/Mintplex-Labs/anything-llm
- **Website:** https://anythingllm.com/
- **Description:** All-in-one AI application with built-in Confluence data connector. Supports Username/Access Token and PAT authentication. Downloads all documents from a Confluence space by Space Key.
- **Limitation:** Data connector fetches data once; re-syncing requires repeating the process (experimental sync feature exists with data-loss warnings).

### RAGFlow

- **Repository:** https://github.com/infiniflow/ragflow
- **Website:** https://ragflow.io/
- **Description:** Open-source RAG engine with native Confluence data source connector. Supports automatic syncing with configurable refresh frequency.
- **Strengths:** Deep document understanding via DeepDoc, enterprise-grade context layer for AI agents.

## 3. RAG Frameworks with Confluence Support

### Confluence Connector Comparison

| Framework | Native Confluence Connector | Auth Methods | Load By | Auto-Sync |
|---|---|---|---|---|
| **LangChain** | Yes (`ConfluenceLoader`) | Username/API key, OAuth2, PAT, Cookies | space_key, page_ids | No |
| **LlamaIndex** | Yes (`ConfluenceReader`) | OAuth, API token | space_key, page_ids, label, folder_id, CQL | No |
| **Haystack** | No (custom needed) | N/A | N/A | N/A |
| **RAGFlow** | Yes (native) | API token | Space-level | Yes |
| **Verba** | No | N/A | N/A | N/A |
| **PrivateGPT** | No | N/A | N/A | N/A |
| **LocalGPT** | No | N/A | N/A | N/A |
| **Quivr** | No | N/A | N/A | N/A |

### LangChain

- **Repository:** https://github.com/langchain-ai/langchain
- **Confluence Loader:** `langchain_community.document_loaders.ConfluenceLoader`
- **Features:**
  - Load by `space_key`, `page_ids`, or both
  - `include_attachments=True` for PDF, PNG, JPEG, SVG, Word, Excel
  - `limit` (per-batch, default 50) and `max_pages` (total cap, default 1000)
  - Authentication: username/api_key, OAuth2, PAT, cookies
- **Strengths:** 50K+ integrations, fastest prototyping, enormous community
- **Note:** LangChain4j (Java) does not yet have a ConfluenceDocumentLoader

### LlamaIndex

- **Package:** `llama-index-readers-confluence` (v0.4.3)
- **Install:** `pip install llama-index-readers-confluence`
- **Load Methods (mutually exclusive):** `space_key`, `page_ids`, `label`, `folder_id`, `cql`
- **Advanced Features:**
  - Custom parsers for specific file types (implement `BaseReader`)
  - `process_attachment_callback` and `process_document_callback` for filtering
  - Event instrumentation for monitoring ingestion
  - `fail_on_error=False` for resilient processing
- **Strengths:** 150+ data connectors, specialized indexing

### Haystack (deepset)

- **Repository:** https://github.com/deepset-ai/haystack
- **Confluence Support:** No dedicated connector
- **Workaround:** Write custom Haystack component using Confluence REST API, or use LangChain's ConfluenceLoader to extract documents and feed into Haystack pipeline
- **Strengths:** Model/vendor-agnostic, modular pipeline design, strong for production RAG

### Other Frameworks (No Native Confluence Support)

| Framework | Description | Confluence Workaround |
|---|---|---|
| **Verba** (Weaviate) | User-friendly RAG UI, semantic caching | Import via local files (export from Confluence first) |
| **PrivateGPT** | 100% offline, production-ready | File-based ingestion (CSV, DOC, PDF, TXT, HTML, Markdown) |
| **LocalGPT** | 100% offline, hybrid search | File-based (PDF, DOCX, TXT planned) |
| **Quivr** | Opinionated RAG, any LLM/vector store | Export and ingest via Megaparse |

## 4. UI Frameworks for Chat Interfaces

### Comparison

| Framework | Best For | Chat Support | Auth | LLM Integration |
|---|---|---|---|---|
| **Streamlit** | Broad apps + chat | `st.chat_message`, `st.chat_input` (manual history) | Community auth libs | Manual |
| **Chainlit** | Production chatbots | Native async, purpose-built | Okta, Azure AD, Google | LangChain, LlamaIndex, OpenAI built-in |
| **Gradio** | Quick ML demos | `gr.ChatInterface` (auto history) | Basic | HuggingFace ecosystem |
| **Open WebUI** | Self-hosted LLM interface | Full-featured | Built-in | Ollama, OpenAI-compatible |

### Recommendations

- **Chainlit:** Best for dedicated conversational AI chatbot — native async, authentication, LangChain/LlamaIndex integration
- **Streamlit:** Best for broader application combining chat with dashboards/admin panels; most commonly used in existing Confluence RAG projects
- **Gradio:** Ideal for rapid prototyping and internal demos
- **Open WebUI:** Best for teams wanting a ready-to-use self-hosted LLM interface

## 5. Atlassian Official AI Solutions

### Rovo (Atlassian Intelligence)

- **Website:** https://www.atlassian.com/software/rovo
- **Availability:** Cloud Standard, Premium, and Enterprise plans only
- **Features:**
  - **Rovo Search:** Unified NL search across Jira, Confluence, JSM, and 40+ connected tools
  - **Rovo Chat:** AI-generated answers from all connected sources
  - **Rovo Agents:** Customizable AI agents for project tracking, automating responses
  - **Rovo Deep Research:** Multi-step agentic search producing cited reports
  - **Rovo Studio:** Build agents and automations with or without code
- **Pricing:** Included free across most plans as of 2025
- **Limitations:** Cloud-only, data processed externally, limited customization, credit-based usage

### Marketplace Solutions

- **Responsa ChatBot for Confluence:** OpenAI-powered conversational AI for Confluence
- **eesel AI:** Connects help desks and knowledge bases (Confluence, Google Docs)

## 6. Architectural Options Summary

### Option A: Lightweight Custom Build

```
Data: LangChain ConfluenceLoader or LlamaIndex ConfluenceReader
Vector Store: ChromaDB (dev) / PGVector (prod) / Qdrant (scale)
LLM: OpenAI / Anthropic / Ollama (local)
UI: Chainlit or Streamlit
Reference: BastinFlorian/RAG-Chatbot-with-Confluence
```

### Option B: Enterprise Platform (Onyx/Danswer)

```
Platform: Onyx — MIT licensed, 40+ connectors, SSO, RBAC, document permissioning
Deploy: Docker, on-premise or cloud
Customize: Custom agents, configurable retrieval
```

### Option C: Self-Hosted with Auto-Sync (RAGFlow)

```
Platform: RAGFlow — native Confluence connector, auto-sync
Deploy: Docker
Strength: Deep document understanding, configurable refresh
```

### Option D: Desktop/Simple (AnythingLLM)

```
Platform: AnythingLLM — built-in Confluence connector
Deploy: Desktop app or Docker
Limitation: One-time fetch (experimental sync)
```

## Sources

- https://github.com/BastinFlorian/RAG-Chatbot-with-Confluence
- https://github.com/dirk-weimar/confluence-chatbot
- https://github.com/onyx-dot-app/onyx
- https://github.com/Mintplex-Labs/anything-llm
- https://github.com/infiniflow/ragflow
- https://docs.langchain.com/oss/python/integrations/document_loaders/confluence
- https://docs.llamaindex.ai/en/stable/api_reference/readers/confluence/
- https://github.com/deepset-ai/haystack
- https://github.com/weaviate/Verba
- https://docs.privategpt.dev/manual/document-management/ingestion
- https://github.com/PromtEngineer/localGPT
- https://github.com/QuivrHQ/quivr
- https://www.atlassian.com/software/rovo
- https://www.atlassian.com/software/confluence/ai
