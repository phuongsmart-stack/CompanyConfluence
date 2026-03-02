"""Streamlit chat UI for Confluence AI Chatbot with Athena AI Queries."""

import re

import streamlit as st

from src.config import ANTHROPIC_API_KEY, CONFLUENCE_API_TOKEN, CONFLUENCE_SPACE_KEYS, CONFLUENCE_URL


def _extract_sql(text: str) -> str | None:
    """Extract SQL from a markdown ```sql code block."""
    match = re.search(r"```sql\s*\n(.*?)```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None

st.set_page_config(
    page_title="Confluence & Athena AI",
    page_icon="📚",
    layout="wide",
)

st.title("📚 Confluence & Athena AI Assistant")

# --- Tabs ---
tab_confluence, tab_athena = st.tabs(["💬 Confluence Chat", "🔍 Athena AI Queries"])

# ============================================================
# TAB 1: Confluence Chat (original functionality)
# ============================================================
with tab_confluence:
    from src.confluence_loader import load_confluence_pages
    from src.rag_pipeline import get_index_count, has_index, ingest_documents, query

    col_sidebar, col_chat = st.columns([1, 3])

    with col_sidebar:
        st.header("Configuration")
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

        st.header("Knowledge Base")
        indexed = has_index()
        if indexed:
            count = get_index_count()
            st.success(f"Indexed: {count} chunks")
        else:
            st.warning("No data indexed yet")

        st.subheader("Spaces")
        selected_spaces = []
        for space in CONFLUENCE_SPACE_KEYS:
            if st.checkbox(space, value=True, key=f"space_{space}"):
                selected_spaces.append(space)

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

    with col_chat:
        st.subheader("Ask about your Confluence docs")
        if "messages" not in st.session_state:
            st.session_state.messages = []

        for msg in st.session_state.messages:
            with st.chat_message(msg["role"]):
                st.markdown(msg["content"])

        if prompt := st.chat_input("Ask a question about your Confluence docs...", key="confluence_chat"):
            if not config_ok:
                st.error("Configure your `.env` file first (see sidebar)")
            elif not has_index():
                st.warning("Load and index your Confluence pages first (see sidebar)")
            else:
                st.session_state.messages.append({"role": "user", "content": prompt})
                with st.chat_message("user"):
                    st.markdown(prompt)

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

# ============================================================
# TAB 2: Athena AI Queries
# ============================================================
with tab_athena:
    from src.athena_connector import (
        get_table_schema,
        is_athena_configured,
        list_databases,
        list_tables,
        preview_table,
        run_query as athena_run_query,
    )
    from src.athena_ai import explain_database, explain_query, generate_query

    athena_ok = is_athena_configured() and bool(ANTHROPIC_API_KEY)

    col_schema, col_ai = st.columns([1, 2])

    # --- Left column: Schema Explorer ---
    with col_schema:
        st.header("Schema Explorer")

        if not athena_ok:
            st.error("Missing Athena configuration — add these to your `.env` file:")
            st.code("ATHENA_S3_OUTPUT=s3://your-bucket/athena-results/\nAWS_REGION=us-east-1", language=None)
            st.info("AWS credentials are loaded from your environment or ~/.aws/credentials.")
            st.stop()

        st.success("Athena connected")

        # Database selector
        try:
            databases = list_databases()
        except Exception as e:
            st.error(f"Error listing databases: {e}")
            databases = []

        if databases:
            selected_db = st.selectbox("Database", databases, key="athena_db")
        else:
            selected_db = st.text_input("Database name", key="athena_db_input")

        if selected_db:
            # List tables
            try:
                tables = list_tables(selected_db)
                st.subheader(f"Tables ({len(tables)})")
                for table in tables:
                    with st.expander(table):
                        try:
                            schema = get_table_schema(table, selected_db)
                            st.markdown("**Columns:**")
                            for col in schema["columns"]:
                                st.text(f"  {col['name']} ({col['type']})")
                            if schema["partition_keys"]:
                                st.markdown("**Partition Keys:**")
                                for pk in schema["partition_keys"]:
                                    st.text(f"  {pk['name']} ({pk['type']})")
                        except Exception as e:
                            st.error(f"Error: {e}")
            except Exception as e:
                st.error(f"Error listing tables: {e}")

            if st.button("Explain this database with AI"):
                with st.spinner("Analyzing database schema..."):
                    try:
                        explanation = explain_database(selected_db)
                        st.markdown(explanation)
                    except Exception as e:
                        st.error(f"Error: {e}")

    # --- Right column: AI Query Generator ---
    with col_ai:
        st.header("AI Query Generator")

        if not athena_ok:
            st.stop()

        mode = st.radio(
            "Mode",
            ["Generate query from question", "Explain existing SQL", "Run SQL query"],
            horizontal=True,
            key="athena_mode",
        )

        if mode == "Generate query from question":
            st.markdown("Describe what data you want in plain English:")
            question = st.text_area(
                "Your question",
                placeholder="e.g., Show me the top 10 customers by total sales in the last 30 days",
                key="athena_question",
            )
            if st.button("Generate Query", disabled=not question, key="athena_gen"):
                with st.spinner("Generating SQL query..."):
                    try:
                        result = generate_query(question, selected_db)
                        st.markdown(result)

                        # Store generated query for optional execution
                        st.session_state["last_generated_query"] = result
                    except Exception as e:
                        st.error(f"Error generating query: {e}")

            # Offer to run the generated query
            if "last_generated_query" in st.session_state:
                if st.button("Run generated query", key="athena_run_gen"):
                    # Extract SQL from markdown code block
                    raw = st.session_state["last_generated_query"]
                    sql = _extract_sql(raw)
                    if sql:
                        with st.spinner("Running query..."):
                            try:
                                results = athena_run_query(sql, selected_db)
                                if results:
                                    st.dataframe(results)
                                else:
                                    st.info("Query returned no results.")
                            except Exception as e:
                                st.error(f"Query error: {e}")
                    else:
                        st.warning("Could not extract SQL from the generated response.")

        elif mode == "Explain existing SQL":
            sql_input = st.text_area(
                "Paste your SQL query",
                placeholder="SELECT * FROM ...",
                height=150,
                key="athena_sql_explain",
            )
            if st.button("Explain Query", disabled=not sql_input, key="athena_explain_btn"):
                with st.spinner("Analyzing query..."):
                    try:
                        explanation = explain_query(sql_input, selected_db)
                        st.markdown(explanation)
                    except Exception as e:
                        st.error(f"Error: {e}")

        elif mode == "Run SQL query":
            sql_run = st.text_area(
                "Enter SQL to execute",
                placeholder="SELECT * FROM my_table LIMIT 10",
                height=150,
                key="athena_sql_run",
            )
            if st.button("Execute", disabled=not sql_run, key="athena_exec_btn"):
                with st.spinner("Running query on Athena..."):
                    try:
                        results = athena_run_query(sql_run, selected_db)
                        if results:
                            st.dataframe(results)
                            st.caption(f"{len(results)} rows returned")
                        else:
                            st.info("Query returned no results.")
                    except Exception as e:
                        st.error(f"Query error: {e}")

        # Chat history for Athena
        st.divider()
        st.subheader("Athena Chat History")
        if "athena_messages" not in st.session_state:
            st.session_state.athena_messages = []

        for msg in st.session_state.athena_messages:
            with st.chat_message(msg["role"]):
                st.markdown(msg["content"])

        if athena_prompt := st.chat_input("Ask anything about your data...", key="athena_chat"):
            st.session_state.athena_messages.append({"role": "user", "content": athena_prompt})
            with st.chat_message("user"):
                st.markdown(athena_prompt)

            with st.chat_message("assistant"):
                with st.spinner("Thinking..."):
                    try:
                        answer = generate_query(athena_prompt, selected_db)
                        st.markdown(answer)
                        st.session_state.athena_messages.append(
                            {"role": "assistant", "content": answer}
                        )
                    except Exception as e:
                        error_msg = f"Error: {e}"
                        st.error(error_msg)
                        st.session_state.athena_messages.append(
                            {"role": "assistant", "content": error_msg}
                        )


