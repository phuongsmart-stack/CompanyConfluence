"""AI-powered Athena query generation using Claude."""

from langchain_anthropic import ChatAnthropic
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from src.athena_connector import format_schema_for_llm, get_database_schema
from src.config import ANTHROPIC_API_KEY, ANTHROPIC_MODEL

SCHEMA_EXPLAIN_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """\
You are a data analyst assistant. You help users understand their Amazon Athena databases.

Given the database schema below, provide a clear, concise explanation of:
- What the database appears to contain (its purpose)
- Key tables and their relationships
- Important columns and what they likely represent
- Any partitioning strategy in use

Use markdown formatting for readability."""),
    ("human", """Database schema:

{schema}

Please explain this database."""),
])

QUERY_GEN_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """\
You are an expert Amazon Athena SQL query writer. Generate Athena-compatible SQL \
(Presto/Trino syntax) based on the user's natural-language request.

Rules:
- Use ONLY the tables and columns provided in the schema below.
- Always qualify table names with the database name.
- Use partition columns in WHERE clauses when possible for performance.
- Return ONLY the SQL query inside a ```sql code block, followed by a brief \
explanation of what the query does.
- If the request is ambiguous, state your assumptions.
- Do NOT use functions or syntax that Athena does not support.
- Limit results to 100 rows by default unless the user specifies otherwise."""),
    ("human", """Database schema:

{schema}

User request: {question}"""),
])

QUERY_EXPLAIN_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """\
You are an expert Amazon Athena SQL analyst. Explain the given SQL query in plain English.

Provide:
- A summary of what the query does
- Breakdown of each clause (SELECT, FROM, WHERE, JOIN, GROUP BY, etc.)
- Any performance considerations (partitions, large scans, etc.)
- Suggestions for improvement if applicable

Use markdown formatting."""),
    ("human", """Database schema:

{schema}

SQL query to explain:
```sql
{sql}
```"""),
])


def _get_llm():
    return ChatAnthropic(
        model=ANTHROPIC_MODEL,
        api_key=ANTHROPIC_API_KEY,
        max_tokens=2048,
    )


def explain_database(database: str) -> str:
    """Use AI to explain what a database contains based on its schema."""
    schemas = get_database_schema(database)
    schema_text = format_schema_for_llm(schemas)
    chain = SCHEMA_EXPLAIN_PROMPT | _get_llm() | StrOutputParser()
    return chain.invoke({"schema": schema_text})


def generate_query(question: str, database: str) -> str:
    """Generate an Athena SQL query from a natural-language question."""
    schemas = get_database_schema(database)
    schema_text = format_schema_for_llm(schemas)
    chain = QUERY_GEN_PROMPT | _get_llm() | StrOutputParser()
    return chain.invoke({"schema": schema_text, "question": question})


def explain_query(sql: str, database: str) -> str:
    """Explain an existing SQL query in plain English."""
    schemas = get_database_schema(database)
    schema_text = format_schema_for_llm(schemas)
    chain = QUERY_EXPLAIN_PROMPT | _get_llm() | StrOutputParser()
    return chain.invoke({"schema": schema_text, "sql": sql})
