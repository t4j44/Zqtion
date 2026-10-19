# Crawl4AI Crawler & Extraction Engine

## Overview

The crawler engine (`scripts/resource-intelligence/crawler.py`) uses **Crawl4AI** (`crawl4ai 0.9.5`) backed by headless Chromium (`playwright chromium v1243`). It is engineered for resilient, respectful, and repeatable technical data extraction.

---

## Key Features

1. **Strict Discovery & Allowlisting (`discover.py`):**
   - Automatically parses `sitemap.xml` and discovers inline client-side guide links.
   - Restricts crawling strictly to allowed path patterns (`/guides/**`), ignoring unrelated site sections.
   - Strips tracking query parameters (`utm_*`, `fbclid`, `ref`) and removes `.html` extensions to produce canonical URLs.

2. **Rate Limiting & Politeness:**
   - Default 1.0 second delay between requests.
   - Controlled concurrency via `asyncio.Semaphore(max_concurrency=3)`.
   - Custom User-Agent: `ZqtionResourceIntelligence/1.0 (+https://zqtion.com/bot; research@zqtion.com)`.

3. **Two-Tier Resilient Fetching:**
   - **Primary:** Crawl4AI `AsyncWebCrawler` with headless browser context, extracting full DOM and structured markdown.
   - **Fallback:** Asynchronous HTTP client (`httpx`) with exponential backoff and jitter if the headless browser encounters display or sandbox limits.

4. **Change Detection & Content Hashing:**
   - Every crawled page is hashed using SHA-256 (`content_hash`).
   - If a page is recrawled and the clean content hash is unchanged, the pipeline avoids redundant re-processing.
   - If the hash changes, the record is flagged for re-verification (`status = 'changed'`).

5. **Failure Logging:**
   - Operational logs: `.resource-research/logs/crawl.log`
   - Failure exceptions and HTTP non-200s: `.resource-research/logs/crawl_failures.log`

---

## How to Run the Crawler

```powershell
# Crawl 10 discovered guide URLs with 1s rate limiting
python scripts/resource-intelligence/run_full_crawl.py --limit 10 --rate-limit 1.0

# Crawl all discovered guide URLs
python scripts/resource-intelligence/run_full_crawl.py --limit 0 --concurrency 3
```
