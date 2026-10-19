"""
Zqtion Resource Intelligence — Cindy Zhu Guides Connector (Source #001)
Source Type: expert_guides (Tier C: Independent Expert)
Ingestion Method: crawl4ai / sitemap
Role: Extract practical creator workflows, prompt structures, tools, and business challenges.
"""

from typing import List, Dict, Any
from pathlib import Path
import json
from .base import BaseConnector

class CindyGuidesConnector(BaseConnector):
    def fetch(self) -> List[Dict[str, Any]]:
        """
        Reads existing crawled Layer A cache or loads seed map.
        """
        cache_dir = Path(__file__).resolve().parent.parent.parent.parent / ".resource-research" / "cache"
        index_file = Path(__file__).resolve().parent.parent.parent.parent / ".resource-research" / "index.json"

        results = []
        if index_file.exists():
            with open(index_file, "r", encoding="utf-8") as f:
                results = json.load(f)
        elif cache_dir.exists():
            for fpath in cache_dir.glob("*.json"):
                try:
                    with open(fpath, "r", encoding="utf-8") as f:
                        results.append(json.load(f))
                except Exception:
                    continue

        # If no local cache yet, provide representative seed records
        if not results:
            seed_map_path = Path(__file__).resolve().parent.parent / "seed_map.json"
            if seed_map_path.exists():
                with open(seed_map_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for item in data.get("guides", [])[:20]:
                        results.append({
                            "source_url": item.get("url"),
                            "page_title": item.get("title", ""),
                            "topics": [item.get("topic", "start")],
                            "tool_tags": [item.get("tool", "claude")],
                            "content": f"Practical guide: {item.get('title')}"
                        })
        return results

    def normalize(self, raw_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Normalizes extracted practical creator guides into entity items."""
        normalized = []
        for raw in raw_items:
            slug = raw.get("slug") or raw.get("source_url", "").split("/")[-1].replace(".html", "")
            if not slug:
                continue

            title = raw.get("page_title") or raw.get("title", slug.replace("-", " ").title())
            topics = raw.get("topics") or raw.get("topic") or ["automate"]
            tools = raw.get("tool_tags") or raw.get("tools") or ["Claude"]

            category = "automate"
            if any(t in ["content", "design", "video"] for t in topics):
                category = "create"
            elif any(t in ["building", "power", "stack"] for t in topics):
                category = "build"

            normalized.append({
                "type": "guide",
                "source_id": self.source_id,
                "slug": f"guide-{slug}",
                "title": title,
                "summary": f"Practical creator methodology for {title.lower()} discovered from Source #001.",
                "category": category,
                "difficulty": "intermediate",
                "evidence_level": "source_reported",
                "tools": [t.title() for t in tools if isinstance(t, str)],
                "tags": [category, "creator-guide", "practical-workflow"] + [str(t).lower() for t in topics],
                "source_provenance": {
                    "source_id": self.source_id,
                    "authority": self.authority_level,
                    "url": raw.get("source_url") or f"https://cindyzhu.com.au/guides/{slug}"
                }
            })
        return normalized
