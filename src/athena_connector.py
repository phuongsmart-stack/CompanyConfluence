"""Athena connector: discover schemas, list tables, and run queries."""

import boto3
from pyathena import connect
from pyathena.cursor import DictCursor

from src.config import ATHENA_DATABASE, ATHENA_S3_OUTPUT, ATHENA_WORKGROUP, AWS_REGION


def _get_athena_client():
    """Return a boto3 Athena client."""
    return boto3.client("athena", region_name=AWS_REGION)


def _get_connection(database: str | None = None):
    """Return a PyAthena connection."""
    return connect(
        s3_staging_dir=ATHENA_S3_OUTPUT,
        region_name=AWS_REGION,
        work_group=ATHENA_WORKGROUP,
        schema_name=database or ATHENA_DATABASE,
        cursor_class=DictCursor,
    )


def list_databases() -> list[str]:
    """List all databases (catalogs) available in Athena."""
    client = _get_athena_client()
    databases = []
    paginator = client.get_paginator("list_databases")
    for page in paginator.paginate(CatalogName="AwsDataCatalog"):
        for db in page["DatabaseList"]:
            databases.append(db["Name"])
    return sorted(databases)


def list_tables(database: str | None = None) -> list[str]:
    """List all tables in the given database."""
    db = database or ATHENA_DATABASE
    client = _get_athena_client()
    tables = []
    paginator = client.get_paginator("list_table_metadata")
    for page in paginator.paginate(CatalogName="AwsDataCatalog", DatabaseName=db):
        for table in page["TableMetadataList"]:
            tables.append(table["Name"])
    return sorted(tables)


def get_table_schema(table_name: str, database: str | None = None) -> dict:
    """Get column names, types, and partition keys for a table."""
    db = database or ATHENA_DATABASE
    client = _get_athena_client()
    resp = client.get_table_metadata(
        CatalogName="AwsDataCatalog",
        DatabaseName=db,
        TableName=table_name,
    )
    meta = resp["TableMetadata"]

    columns = [
        {"name": col["Name"], "type": col["Type"]}
        for col in meta.get("Columns", [])
    ]
    partitions = [
        {"name": col["Name"], "type": col["Type"]}
        for col in meta.get("PartitionKeys", [])
    ]

    return {
        "table": table_name,
        "database": db,
        "columns": columns,
        "partition_keys": partitions,
        "table_type": meta.get("TableType", ""),
    }


def get_database_schema(database: str | None = None) -> list[dict]:
    """Get schemas for all tables in a database."""
    tables = list_tables(database)
    schemas = []
    for table in tables:
        try:
            schemas.append(get_table_schema(table, database))
        except Exception as e:
            schemas.append({"table": table, "error": str(e)})
    return schemas


def format_schema_for_llm(schemas: list[dict]) -> str:
    """Format database schemas into a text summary for the LLM."""
    lines = []
    for schema in schemas:
        if "error" in schema:
            lines.append(f"Table: {schema['table']} (error reading schema)")
            continue
        lines.append(f"Table: {schema['database']}.{schema['table']}")
        if schema["columns"]:
            lines.append("  Columns:")
            for col in schema["columns"]:
                lines.append(f"    - {col['name']} ({col['type']})")
        if schema["partition_keys"]:
            lines.append("  Partition Keys:")
            for pk in schema["partition_keys"]:
                lines.append(f"    - {pk['name']} ({pk['type']})")
        lines.append("")
    return "\n".join(lines)


def run_query(sql: str, database: str | None = None) -> list[dict]:
    """Execute a SQL query against Athena and return results as dicts."""
    conn = _get_connection(database)
    cursor = conn.cursor()
    cursor.execute(sql)
    results = cursor.fetchall()
    return results


def preview_table(table_name: str, database: str | None = None, limit: int = 10) -> list[dict]:
    """Return a few sample rows from a table."""
    db = database or ATHENA_DATABASE
    sql = f'SELECT * FROM "{db}"."{table_name}" LIMIT {limit}'
    return run_query(sql, db)


def is_athena_configured() -> bool:
    """Check if Athena configuration is present."""
    return bool(ATHENA_S3_OUTPUT and AWS_REGION)
