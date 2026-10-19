import urllib.request
import re
import json
import xml.etree.ElementTree as ET

def map_seed():
    headers = {"User-Agent": "ZqtionResourceIntelligence/1.0 (+https://zqtion.com)"}

    # 1. Fetch and parse sitemap
    req = urllib.request.Request("https://cindyzhu.com.au/sitemap.xml", headers=headers)
    with urllib.request.urlopen(req) as resp:
        xml_data = resp.read()

    root = ET.fromstring(xml_data)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

    sitemap_urls = []
    guide_urls_sitemap = []
    for url in root.findall("sm:url", ns):
        loc = url.find("sm:loc", ns)
        lastmod = url.find("sm:lastmod", ns)
        if loc is not None and loc.text:
            url_str = loc.text.strip()
            sitemap_urls.append({
                "url": url_str,
                "lastmod": lastmod.text if lastmod is not None else None
            })
            if "/guides/" in url_str:
                guide_urls_sitemap.append(url_str)

    # 2. Fetch and parse /guides page HTML
    req = urllib.request.Request("https://cindyzhu.com.au/guides", headers=headers)
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8", errors="replace")

    js_guides = []
    # Pattern to match: {t:"...", u:"...", topic:"...", tool:"..."}
    pattern = re.compile(r'\{\s*t:\s*"([^"]+)",\s*u:\s*"([^"]+)",\s*topic:\s*"([^"]+)",\s*tool:\s*"([^"]+)"\s*\}')
    for m in pattern.finditer(html):
        title, rel_url, topic, tool = m.groups()
        # Normalize relative url to canonical
        # rel_url is typically "guides/xyz.html" or "guides/xyz"
        clean_slug = rel_url.replace(".html", "").strip("/")
        if not clean_slug.startswith("guides/"):
            clean_slug = f"guides/{clean_slug}"
        full_url = f"https://cindyzhu.com.au/{clean_slug}"
        js_guides.append({
            "title": title,
            "relative_url": rel_url,
            "normalized_url": full_url,
            "topic": topic,
            "tool": tool
        })

    # Combine unique guide URLs
    all_guide_urls = set(guide_urls_sitemap)
    for g in js_guides:
        all_guide_urls.add(g["normalized_url"])

    stats = {
        "total_sitemap_urls": len(sitemap_urls),
        "guide_urls_in_sitemap": len(guide_urls_sitemap),
        "guide_cards_in_library_js": len(js_guides),
        "total_unique_guide_urls": len(all_guide_urls),
        "topics_found": sorted(list(set(g["topic"] for g in js_guides))),
        "tools_found": sorted(list(set(g["tool"] for g in js_guides))),
        "sample_guides": js_guides[:5],
        "all_unique_urls": sorted(list(all_guide_urls))
    }

    with open("scripts/resource-intelligence/seed_map.json", "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)

    print(f"Total sitemap URLs: {stats['total_sitemap_urls']}")
    print(f"Guide URLs in sitemap: {stats['guide_urls_in_sitemap']}")
    print(f"Guide cards in JS: {stats['guide_cards_in_library_js']}")
    print(f"Total unique guide URLs discovered: {stats['total_unique_guide_urls']}")
    print(f"Topics: {stats['topics_found']}")
    print(f"Tools: {stats['tools_found']}")

if __name__ == "__main__":
    map_seed()
