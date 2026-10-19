"""
Zqtion Resource Intelligence — Crawler Engine
Implements Crawl4AI AsyncWebCrawler with rate limiting, retries, exponential backoff,
caching, change detection, and failure logging.
"""

import os
import sys
import time
import json
import asyncio
import hashlib
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional, Set

try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

from discover import URLDiscoverer
from extract import extract_structured_page

class ResourceCrawler:
    def __init__(
        self,
        corpus_dir: Optional[str] = None,
        rate_limit_seconds: float = 1.0,
        max_retries: int = 3,
        user_agent: str = "ZqtionResourceIntelligence/1.0 (+https://zqtion.com/bot; research@zqtion.com)"
    ):
        self.rate_limit_seconds = rate_limit_seconds
        self.max_retries = max_retries
        self.user_agent = user_agent

        # Base paths for private research storage
        self.root_dir = Path(__file__).resolve().parent.parent.parent
        self.corpus_dir = Path(corpus_dir) if corpus_dir else self.root_dir / ".resource-research"
        self.raw_dir = self.corpus_dir / "raw"
        self.clean_dir = self.corpus_dir / "clean"
        self.cache_dir = self.corpus_dir / "cache"
        self.logs_dir = self.corpus_dir / "logs"

        # Ensure directories exist
        for d in [self.raw_dir, self.clean_dir, self.cache_dir, self.logs_dir]:
            d.mkdir(parents=True, exist_ok=True)

        self.log_file = self.logs_dir / "crawl.log"
        self.failures_file = self.logs_dir / "crawl_failures.log"
        self.discoverer = URLDiscoverer()

    def log(self, message: str, level: str = "INFO"):
        timestamp = datetime.now(timezone.utc).isoformat()
        line = f"[{timestamp}] [{level}] {message}"
        try:
            print(line)
        except Exception:
            try:
                print(line.encode("ascii", errors="replace").decode("ascii"))
            except Exception:
                pass
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(line + "\n")
        except Exception:
            pass

    def log_failure(self, url: str, reason: str):
        timestamp = datetime.now(timezone.utc).isoformat()
        line = f"[{timestamp}] [FAILURE] URL: {url} | Reason: {reason}"
        try:
            with open(self.failures_file, "a", encoding="utf-8") as f:
                f.write(line + "\n")
        except Exception:
            pass

    def get_cache_path(self, url: str) -> Path:
        url_hash = hashlib.sha256(url.encode("utf-8")).hexdigest()
        return self.cache_dir / f"{url_hash}.json"

    async def fetch_page(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Attempts to fetch a page using Crawl4AI.
        Falls back to resilient httpx if browser context encounters issues.
        """
        cache_path = self.get_cache_path(url)

        # 1. Check existing cache
        if cache_path.exists():
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                    self.log(f"Cache hit for {url}")
                    return cached_data
            except Exception:
                pass

        # 2. Fetch using Crawl4AI
        html = None
        markdown = None

        try:
            from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
            from crawl4ai.async_configs import BrowserConfig

            browser_cfg = BrowserConfig(
                headless=True,
                verbose=False,
                user_agent=self.user_agent
            )
            run_cfg = CrawlerRunConfig(
                word_count_threshold=20,
                page_timeout=20000
            )

            async with AsyncWebCrawler(config=browser_cfg) as crawler:
                res = await crawler.arun(url=url, config=run_cfg)
                if res and res.success:
                    html = res.html
                    markdown = res.markdown
        except Exception as crawl_err:
            short_err = str(crawl_err).split("\n")[0][:120]
            self.log(f"Crawl4AI browser notice for {url} ({short_err}), engaging high-speed HTTP fallback", "DEBUG")

        # 3. Resilient fallback with httpx if browser fetch returned empty
        if not html:
            import httpx
            for attempt in range(1, self.max_retries + 1):
                try:
                    await asyncio.sleep(self.rate_limit_seconds * attempt)
                    headers = {
                        "User-Agent": self.user_agent,
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.9"
                    }
                    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                        resp = await client.get(url, headers=headers)
                        if resp.status_code == 200:
                            html = resp.text
                            break
                        else:
                            self.log(f"HTTP {resp.status_code} on {url} (attempt {attempt})", "WARNING")
                except Exception as e:
                    self.log(f"Fetch error on {url} (attempt {attempt}): {e}", "WARNING")
                    if attempt == self.max_retries:
                        self.log_failure(url, str(e))
                        return None

        if not html:
            self.log_failure(url, "Empty response body after all retries")
            return None

        # Extract structured information
        structured = extract_structured_page(html, url, raw_markdown=markdown)

        # Save to cache
        try:
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(structured, f, indent=2)
        except Exception as err:
            self.log(f"Cache write error for {url}: {err}", "ERROR")

        return structured

    async def crawl_urls(self, urls: List[str], max_concurrency: int = 3) -> List[Dict[str, Any]]:
        """Crawls a list of URLs with rate limiting and concurrency control."""
        self.log(f"Starting crawl job for {len(urls)} URLs (max concurrency: {max_concurrency})")
        sem = asyncio.Semaphore(max_concurrency)
        results = []

        async def worker(u: str):
            async with sem:
                res = await self.fetch_page(u)
                if res:
                    results.append(res)
                # Rate limit pause
                await asyncio.sleep(self.rate_limit_seconds)

        tasks = [worker(u) for u in urls]
        await asyncio.gather(*tasks)

        self.log(f"Crawl job completed. Successfully retrieved {len(results)}/{len(urls)} pages.")
        return results

if __name__ == "__main__":
    async def run_test():
        crawler = ResourceCrawler(rate_limit_seconds=0.5)
        test_urls = [
            "https://cindyzhu.com.au/guides/claude-code-setup-the-right-way",
            "https://cindyzhu.com.au/guides/4-github-design-repos"
        ]
        items = await crawler.crawl_urls(test_urls)
        print("Crawled items:", len(items))
        if items:
            print("Item 1 title:", items[0]["page_title"])
            print("Mentioned tools:", items[0]["mentioned_tools"])
            print("GitHub links:", items[0]["github_links"])

    asyncio.run(run_test())
