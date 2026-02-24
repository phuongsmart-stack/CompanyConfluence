"""Load and process pages from Confluence Cloud."""

from __future__ import annotations

import re

from atlassian import Confluence
from bs4 import BeautifulSoup
from langchain_core.documents import Document

from src.config import (
    CONFLUENCE_API_TOKEN,
    CONFLUENCE_EMAIL,
    CONFLUENCE_SPACE_KEY,
    CONFLUENCE_URL,
    MAX_PAGES_PER_SPACE,
)


def get_confluence_client() -> Confluence:
    """Create an authenticated Confluence client."""
    return Confluence(
        url=CONFLUENCE_URL,
        username=CONFLUENCE_EMAIL,
        password=CONFLUENCE_API_TOKEN,
        cloud=True,
    )


def clean_html(html_content: str) -> str:
    """Convert Confluence storage format HTML to clean text."""
    soup = BeautifulSoup(html_content, "lxml")

    # Remove script and style elements
    for element in soup(["script", "style"]):
        element.decompose()

    # Handle tables: convert to readable text
    for table in soup.find_all("table"):
        rows = []
        for tr in table.find_all("tr"):
            cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
            rows.append(" | ".join(cells))
        table.replace_with("\n".join(rows) + "\n")

    # Handle code blocks
    for code in soup.find_all("ac:structured-macro", {"ac:name": "code"}):
        code_text = code.get_text(strip=True)
        code.replace_with(f"\n```\n{code_text}\n```\n")

    # Handle lists properly
    for ul in soup.find_all("ul"):
        items = []
        for li in ul.find_all("li", recursive=False):
            items.append(f"- {li.get_text(strip=True)}")
        ul.replace_with("\n".join(items) + "\n")

    for ol in soup.find_all("ol"):
        items = []
        for i, li in enumerate(ol.find_all("li", recursive=False), 1):
            items.append(f"{i}. {li.get_text(strip=True)}")
        ol.replace_with("\n".join(items) + "\n")

    text = soup.get_text(separator="\n")
    # Collapse multiple blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def load_confluence_pages(
    space_key: str | None = None,
    max_pages: int = MAX_PAGES_PER_SPACE,
) -> list[Document]:
    """Load pages from a Confluence space and return as LangChain Documents."""
    space_key = space_key or CONFLUENCE_SPACE_KEY
    if not space_key:
        raise ValueError(
            "No space key provided. Set CONFLUENCE_SPACE_KEY in .env or pass it as argument."
        )

    client = get_confluence_client()
    documents = []
    start = 0
    limit = 50

    print(f"Loading pages from Confluence space '{space_key}' (max {max_pages})...")

    while len(documents) < max_pages:
        batch_limit = min(limit, max_pages - len(documents))
        pages = client.get_all_pages_from_space(
            space=space_key,
            start=start,
            limit=batch_limit,
            expand="body.storage,version,ancestors",
        )

        if not pages:
            break

        for page in pages:
            if len(documents) >= max_pages:
                break

            html_body = page.get("body", {}).get("storage", {}).get("value", "")
            text = clean_html(html_body)

            if not text.strip():
                continue

            # Build the page URL
            page_url = f"{CONFLUENCE_URL}/wiki/spaces/{space_key}/pages/{page['id']}"

            # Get ancestor path for context
            ancestors = page.get("ancestors", [])
            ancestor_path = " > ".join(a.get("title", "") for a in ancestors)

            metadata = {
                "source": page_url,
                "title": page["title"],
                "page_id": page["id"],
                "space_key": space_key,
                "version": page.get("version", {}).get("number", 1),
                "last_modified": page.get("version", {}).get("when", ""),
                "ancestor_path": ancestor_path,
            }

            # Prepend title to content for better retrieval
            full_text = f"# {page['title']}\n\n{text}"
            documents.append(Document(page_content=full_text, metadata=metadata))

        print(f"  Loaded {len(documents)} pages...")
        start += batch_limit

        if len(pages) < batch_limit:
            break

    print(f"Total: {len(documents)} pages loaded from '{space_key}'")
    return documents
