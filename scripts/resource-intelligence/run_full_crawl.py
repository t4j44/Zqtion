"""
Zqtion Resource Intelligence — Full Crawl Pipeline Runner
Orchestrates URL discovery, Crawl4AI execution, structured extraction,
normalization, verification, and private research corpus storage.
"""

import sys
import json
import asyncio
import argparse
from pathlib import Path

try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

from discover import URLDiscoverer
from crawler import ResourceCrawler
from normalize import EntityNormalizer
from verify import ResourceVerifier

async def main():
    parser = argparse.ArgumentParser(description="Zqtion Resource Intelligence Crawler")
    parser.add_argument("--limit", type=int, default=15, help="Number of URLs to crawl (default: 15; 0 for all)")
    parser.add_argument("--rate-limit", type=float, default=1.0, help="Delay between requests in seconds")
    parser.add_argument("--concurrency", type=int, default=3, help="Max concurrent browser tabs")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent.parent
    seed_map_file = root / "scripts" / "resource-intelligence" / "seed_map.json"

    if not seed_map_file.exists():
        print("Running seed mapping first...")
        from map_seed import map_seed
        map_seed()

    with open(seed_map_file, "r", encoding="utf-8") as f:
        seed_data = json.load(f)

    urls = seed_data.get("all_unique_urls", [])
    if args.limit > 0:
        urls = urls[:args.limit]

    print(f"[*] Starting crawl for {len(urls)} target URLs (Rate limit: {args.rate_limit}s, Concurrency: {args.concurrency})...")
    crawler = ResourceCrawler(rate_limit_seconds=args.rate_limit)
    records = await crawler.crawl_urls(urls, max_concurrency=args.concurrency)

    print(f"[+] Successfully extracted {len(records)} structured records.")

    # Save private corpus index
    corpus_index_file = crawler.corpus_dir / "index.json"
    with open(corpus_index_file, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)
    print(f"[+] Private corpus index saved to: {corpus_index_file}")

    # Entity normalization and summary
    normalizer = EntityNormalizer()
    verifier = ResourceVerifier()

    all_tools = {}
    all_repos = {}
    all_skills = {}

    for rec in records:
        for tool in rec.get("mentioned_tools", []):
            if tool not in all_tools:
                all_tools[tool] = normalizer.normalize_tool(tool, rec)
        for repo_url in rec.get("github_links", []):
            if repo_url not in all_repos:
                all_repos[repo_url] = normalizer.normalize_repository(repo_url, rec)
        for skill in rec.get("skills_mentioned", []):
            if skill not in all_skills:
                all_skills[skill] = normalizer.normalize_skill(skill, rec)

    print(f"[+] Normalized Entities: {len(all_tools)} Tools, {len(all_repos)} Repositories, {len(all_skills)} Skills.")

if __name__ == "__main__":
    asyncio.run(main())
