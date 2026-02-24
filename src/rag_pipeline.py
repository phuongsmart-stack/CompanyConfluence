"""RAG pipeline: chunking, embedding, vector store, and retrieval chain."""

import os

from langchain_anthropic import ChatAnthropic
from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_text_splitters import RecursiveCharacterTextSplitter

from src.config import ANTHROPIC_API_KEY, ANTHROPIC_MODEL, CHROMA_DB_DIR, CHUNK_OVERLAP, CHUNK_SIZE

# Use a local embedding model (no API key needed)
EMBEDDING_MODEL = "all-MiniLM-L6-v2"


def get_text_splitter() -> RecursiveCharacterTextSplitter:
    """Create a text splitter tuned for Confluence content."""
    return RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n## ", "\n### ", "\n#### ", "\n\n", "\n", ". ", " "],
    )


def get_embeddings() -> HuggingFaceEmbeddings:
    """Get the embedding model (runs locally, no API key needed)."""
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
    )


def get_vector_store() -> Chroma:
    """Get or create the Chroma vector store."""
    return Chroma(
        persist_directory=CHROMA_DB_DIR,
        embedding_function=get_embeddings(),
        collection_name="confluence_pages",
    )


def ingest_documents(documents: list[Document]) -> Chroma:
    """Chunk documents and add them to the vector store."""
    splitter = get_text_splitter()
    chunks = splitter.split_documents(documents)
    print(f"Split {len(documents)} documents into {len(chunks)} chunks")

    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=get_embeddings(),
        persist_directory=CHROMA_DB_DIR,
        collection_name="confluence_pages",
    )
    print(f"Indexed {len(chunks)} chunks in ChromaDB at {CHROMA_DB_DIR}")
    return vector_store


def has_index() -> bool:
    """Check if the vector store has been populated."""
    if not os.path.exists(CHROMA_DB_DIR):
        return False
    try:
        store = get_vector_store()
        count = store._collection.count()
        return count > 0
    except Exception:
        return False


def get_index_count() -> int:
    """Return the number of chunks in the index."""
    try:
        store = get_vector_store()
        return store._collection.count()
    except Exception:
        return 0


def format_docs(docs: list[Document]) -> str:
    """Format retrieved documents into context for the LLM."""
    formatted = []
    for i, doc in enumerate(docs, 1):
        title = doc.metadata.get("title", "Unknown")
        source = doc.metadata.get("source", "")
        formatted.append(
            f"[Source {i}: {title}]\n{doc.page_content}\n(Link: {source})"
        )
    return "\n\n---\n\n".join(formatted)


SYSTEM_PROMPT = """\
You are a helpful assistant that answers questions using your company's Confluence knowledge base.

Rules:
- Answer based ONLY on the provided context. If the context doesn't contain enough information, say so.
- Cite which source(s) you used by referencing the source title and link.
- Be concise and direct.
- If multiple sources are relevant, synthesize them into a coherent answer.
- Format your response with markdown when it improves readability."""

RAG_PROMPT = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", """Context from Confluence:
{context}

Question: {question}"""),
])


def get_rag_chain():
    """Build the RAG chain: retriever -> prompt -> LLM -> output."""
    vector_store = get_vector_store()
    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 10},
    )

    llm = ChatAnthropic(
        model=ANTHROPIC_MODEL,
        api_key=ANTHROPIC_API_KEY,
        max_tokens=2048,
    )

    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | RAG_PROMPT
        | llm
        | StrOutputParser()
    )
    return chain


def query(question: str) -> str:
    """Run a question through the RAG pipeline and return the answer."""
    chain = get_rag_chain()
    return chain.invoke(question)
