# Session Handoff — March 8, 2026

## Goal
Download all company Confluence pages and extract the **metrics glossary**.

## Current Status
**Blocked — waiting on Confluence credentials from Phuong.**

## What's Been Done
- Explored the project repo (`CompanyConfluence/`), which contains a Confluence RAG chatbot codebase
- Identified existing Confluence connection code in `src/confluence_loader.py` and `src/config.py`
- Confirmed there is **no `.env` file** with actual credentials — only a `.env.example` template
- Config references two Confluence spaces: `DATA` and `tech`

## Next Steps (in order)

### 1. Provide Confluence Credentials
Phuong needs to supply the following (create a `.env` file in the project root):

```
CONFLUENCE_URL=https://your-instance.atlassian.net
CONFLUENCE_EMAIL=your-email@company.com
CONFLUENCE_API_TOKEN=your-api-token-here
CONFLUENCE_SPACE_KEY=DATA
```

- **API token** can be generated at: https://id.atlassian.com/manage-profile/security/api-tokens
- Decide which space keys to download — config has `DATA` and `tech`, confirm if both or others

### 2. Write Download Script
Write a Python script that:
- Connects to Confluence using the existing `src/confluence_loader.py` and `atlassian-python-api`
- Downloads **all pages** from the specified space(s)
- Saves each page as a clean markdown file in `20260308 Confluence Pages/` subfolder
- Preserves page titles and folder hierarchy from ancestor paths

### 3. Install Dependencies & Run
```bash
pip install -r requirements.txt --break-system-packages
python download_confluence_pages.py
```

### 4. Extract Metrics Glossary
- Search the downloaded pages for metrics/glossary/KPI content
- Compile into a usable format

## Key Files
| File | Purpose |
|------|---------|
| `src/confluence_loader.py` | Existing Confluence client + HTML-to-text converter |
| `src/config.py` | Environment variable config (spaces: `DATA`, `tech`) |
| `.env.example` | Template for credentials |
| `requirements.txt` | Python dependencies (includes `atlassian-python-api`, `beautifulsoup4`) |
