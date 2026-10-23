"""
Zqtion Resource Intelligence — Discovery Module
Handles seed URLs, sitemaps, internal link discovery, allowlist/denylist path filtering,
URL normalization, deduplication, and canonical resolution.
"""

import re
import urllib.parse
import xml.etree.ElementTree as ET
from typing import List, Set, Dict, Any, Optional

class URLDiscoverer:
    def __init__(
        self,
        seed_url: str = "https://cindyzhu.com.au/guides",
        allowed_path_patterns: Optional[List[str]] = None,
        denied_path_patterns: Optional[List[str]] = None
    ):
        self.seed_url = seed_url
        self.parsed_seed = urllib.parse.urlparse(seed_url)
        self.base_domain = self.parsed_seed.netloc.lower()
        self.scheme = self.parsed_seed.scheme
        self.allowed_path_patterns = allowed_path_patterns or [r"^/guides(?:/.*)?$"]
        self.denied_path_patterns = denied_path_patterns or [
            r"^/contact/?$",
            r"^/privacy/?$",
            r"^/terms/?$",
            r"\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2|ttf)$"
        ]

    def normalize_url(self, raw_url: str, current_page_url: Optional[str] = None) -> Optional[str]:
        """Normalizes a URL to its canonical HTTP/HTTPS format, removing anchors and tracking params."""
        if not raw_url or not isinstance(raw_url, str):
            return None

        raw_url = raw_url.strip()
        if raw_url.startswith(("mailto:", "tel:", "javascript:", "#")):
            return None

        # Resolve relative URLs
        if current_page_url:
            raw_url = urllib.parse.urljoin(current_page_url, raw_url)
        elif raw_url.startswith("/"):
            raw_url = f"{self.scheme}://{self.base_domain}{raw_url}"
        elif not raw_url.startswith(("http://", "https://")):
            raw_url = f"{self.scheme}://{self.base_domain}/{raw_url}"

        parsed = urllib.parse.urlparse(raw_url)
        domain = parsed.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]

        # Check domain boundary
        base = self.base_domain
        if base.startswith("www."):
            base = base[4:]
        if domain != base:
            return None

        # Normalize path
        path = parsed.path
        if path.endswith(".html"):
            path = path[:-5]
        path = re.sub(r"/+", "/", path)
        if len(path) > 1 and path.endswith("/"):
            path = path[:-1]
        if not path:
            path = "/"

        # Retain only non-tracking query parameters (if any)
        query_items = urllib.parse.parse_qsl(parsed.query)
        clean_query = [
            (k, v) for k, v in query_items
            if not k.startswith("utm_") and k not in {"fbclid", "gclid", "ref", "source"}
        ]
        clean_query.sort()
        encoded_query = urllib.parse.urlencode(clean_query)

        canonical = urllib.parse.urlunparse((
            parsed.scheme.lower() or "https",
            domain,
            path,
            "",
            encoded_query,
            ""
        ))
        return canonical

    def is_allowed_path(self, canonical_url: str) -> bool:
        """Determines if the canonical URL path matches the allowlist and avoids the denylist."""
        parsed = urllib.parse.urlparse(canonical_url)
        path = parsed.path

        # Check denylist first
        for deny_pat in self.denied_path_patterns:
            if re.search(deny_pat, path, re.IGNORECASE):
                return False

        # Check allowlist
        for allow_pat in self.allowed_path_patterns:
            if re.search(allow_pat, path, re.IGNORECASE):
                return True

        return False

    def parse_sitemap(self, xml_content: str) -> List[Dict[str, Any]]:
        """Parses sitemap XML content, discovering URLs and lastmod timestamps."""
        discovered = []
        try:
            root = ET.fromstring(xml_content)
            # Remove XML namespace prefix if present
            ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            url_nodes = root.findall(".//sm:url", ns) or root.findall(".//url")
            for node in url_nodes:
                loc = node.find("sm:loc", ns) or node.find("loc")
                lastmod = node.find("sm:lastmod", ns) or node.find("lastmod")
                if loc is not None and loc.text:
                    normalized = self.normalize_url(loc.text)
                    if normalized and self.is_allowed_path(normalized):
                        discovered.append({
                            "url": normalized,
                            "lastmod": lastmod.text.strip() if lastmod is not None and lastmod.text else None,
                            "source": "sitemap"
                        })
        except Exception as e:
            print(f"[Discovery] Sitemap parse error: {e}")
        return discovered

    def discover_from_html(self, html_content: str, source_url: str) -> List[str]:
        """Extracts internal links and embedded guide cards from raw page HTML."""
        found_urls = set()

        # 1. Standard anchor hrefs
        hrefs = re.findall(r'<a\s+(?:[^>]*?\s+)?href=["\']([^"\']+)["\']', html_content, re.IGNORECASE)
        for href in hrefs:
            norm = self.normalize_url(href, source_url)
            if norm and self.is_allowed_path(norm):
                found_urls.add(norm)

        # 2. Embedded JS object literals: {t:"...", u:"guides/xyz.html", ...}
        js_cards = re.findall(r'\{\s*t:\s*"[^"]*",\s*u:\s*"([^"]+)"', html_content)
        for rel_u in js_cards:
            norm = self.normalize_url(rel_u, source_url)
            if norm and self.is_allowed_path(norm):
                found_urls.add(norm)

        # 3. HTML comments: <!-- GUIDES_CARD { ..., u:"guides/..." } -->
        comment_cards = re.findall(r'<!--\s*GUIDES_CARD\s*\{[^}]*?u:\s*"([^"]+)"', html_content)
        for rel_u in comment_cards:
            norm = self.normalize_url(rel_u, source_url)
            if norm and self.is_allowed_path(norm):
                found_urls.add(norm)

        return sorted(list(found_urls))
