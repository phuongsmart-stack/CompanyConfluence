"""Streamlit chat UI for Confluence AI Chatbot."""

import streamlit as st

from src.config import ANTHROPIC_API_KEY, CONFLUENCE_API_TOKEN, CONFLUENCE_SPACE_KEYS, CONFLUENCE_URL
from src.confluence_loader import load_confluence_pages
from src.rag_pipeline import get_index_count, has_index, ingest_documents, query

st.set_page_config(
    page_title="Confluence Chatbot",
    page_icon="📚",
    layout="wide",
)

st.title("📚 Confluence AI Chatbot")

# --- Sidebar: Configuration & Ingestion ---
with st.sidebar:
    st.header("Configuration")

    # Check configuration status
    config_ok = all([CONFLUENCE_URL, CONFLUENCE_API_TOKEN, ANTHROPIC_API_KEY])
    if config_ok:
        st.success("Environment configured")
        st.caption(f"Confluence: {CONFLUENCE_URL}")
        st.caption(f"Spaces: {', '.join(CONFLUENCE_SPACE_KEYS)}")
    else:
        st.error("Missing configuration — check your `.env` file")
        missing = []
        if not CONFLUENCE_URL:
            missing.append("CONFLUENCE_URL")
        if not CONFLUENCE_API_TOKEN:
            missing.append("CONFLUENCE_API_TOKEN")
        if not ANTHROPIC_API_KEY:
            missing.append("ANTHROPIC_API_KEY")
        st.code("\n".join(missing), language=None)

    st.divider()

    # Index status
    st.header("Knowledge Base")
    indexed = has_index()
    if indexed:
        count = get_index_count()
        st.success(f"Indexed: {count} chunks")
    else:
        st.warning("No data indexed yet")

    # Space selection
    st.subheader("Spaces")
    selected_spaces = []
    for space in CONFLUENCE_SPACE_KEYS:
        if st.checkbox(space, value=True, key=f"space_{space}"):
            selected_spaces.append(space)

    # Page limit
    max_pages = st.number_input(
        "Max pages per space",
        min_value=1,
        max_value=500,
        value=100,
        step=10,
    )

    if st.button("Load & Index Confluence Pages", disabled=not config_ok):
        if not selected_spaces:
            st.error("Select at least one space")
        else:
            all_docs = []
            for space in selected_spaces:
                with st.spinner(f"Loading from {space}..."):
                    try:
                        docs = load_confluence_pages(space_key=space, max_pages=max_pages)
                        all_docs.extend(docs)
                        st.info(f"{space}: loaded {len(docs)} pages")
                    except Exception as e:
                        st.error(f"Error loading {space}: {e}")
            if all_docs:
                with st.spinner("Indexing documents..."):
                    ingest_documents(all_docs)
                st.success(f"Done! Indexed {len(all_docs)} pages from {len(selected_spaces)} space(s).")
                st.rerun()

    if indexed and st.button("Clear Index"):
        import shutil
        from src.config import CHROMA_DB_DIR
        shutil.rmtree(CHROMA_DB_DIR, ignore_errors=True)
        st.success("Index cleared")
        st.rerun()

# --- Main Chat Interface ---
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Chat input
if prompt := st.chat_input("Ask a question about your Confluence docs..."):
    if not config_ok:
        st.error("Configure your `.env` file first (see sidebar)")
    elif not has_index():
        st.warning("Load and index your Confluence pages first (see sidebar)")
    else:
        # Show user message
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        # Generate answer
        with st.chat_message("assistant"):
            with st.spinner("Searching Confluence..."):
                try:
                    answer = query(prompt)
                    st.markdown(answer)
                    st.session_state.messages.append(
                        {"role": "assistant", "content": answer}
                    )
                except Exception as e:
                    error_msg = f"Error generating answer: {e}"
                    st.error(error_msg)
                    st.session_state.messages.append(
                        {"role": "assistant", "content": error_msg}
                    )
