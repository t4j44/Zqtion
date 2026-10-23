"""
Zqtion Resource Intelligence — Structured Extractor Module
Extracts factual metadata, tools, skills, repositories, MCP references, workflows,
prompts, claims, and requirements from crawled pages according to Section 6.
Enforces security boundaries: text is treated as passive DATA, scrubbing prompt injections.
"""

import re
import hashlib
import urllib.parse
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from bs4 import BeautifulSoup

# Known AI Tools dictionary for factual entity detection
KNOWN_TOOLS = {
    "claude": {"name": "Claude", "company": "Anthropic", "official": "https://claude.ai", "docs": "https://docs.anthropic.com"},
    "claude code": {"name": "Claude Code", "company": "Anthropic", "official": "https://claude.ai", "docs": "https://code.claude.com/docs"},
    "claude cowork": {"name": "Claude Cowork", "company": "Anthropic", "official": "https://claude.ai", "docs": "https://docs.anthropic.com"},
    "chatgpt": {"name": "ChatGPT", "company": "OpenAI", "official": "https://chatgpt.com", "docs": "https://platform.openai.com/docs"},
    "crawl4ai": {"name": "Crawl4AI", "company": "Unclecode / Open Source", "official": "https://crawl4ai.com", "docs": "https://docs.crawl4ai.com"},
    "firecrawl": {"name": "Firecrawl", "company": "Mendable", "official": "https://firecrawl.dev", "docs": "https://docs.firecrawl.dev"},
    "lovart": {"name": "Lovart", "company": "Lovart", "official": "https://lovart.ai", "docs": ""},
    "reve": {"name": "Reve", "company": "Reve", "official": "https://reve.art", "docs": ""},
    "higgsfield": {"name": "Higgsfield", "company": "Higgsfield AI", "official": "https://higgsfield.ai", "docs": ""},
    "arcads": {"name": "Arcads", "company": "Arcads", "official": "https://arcads.ai", "docs": ""},
    "fish audio": {"name": "Fish Audio", "company": "Fish Audio", "official": "https://fish.audio", "docs": "https://docs.fish.audio"},
    "emergent": {"name": "Emergent", "company": "Emergent", "official": "https://emergent.sh", "docs": ""},
    "replit": {"name": "Replit", "company": "Replit", "official": "https://replit.com", "docs": "https://docs.replit.com"},
    "kombai": {"name": "Kombai", "company": "Kombai", "official": "https://kombai.com", "docs": ""},
    "antigravity": {"name": "Google Antigravity", "company": "Google", "official": "https://antigravity.google", "docs": ""},
    "vs code": {"name": "Visual Studio Code", "company": "Microsoft", "official": "https://code.visualstudio.com", "docs": "https://code.visualstudio.com/docs"},
    "cursort": {"name": "Cursor", "company": "Anysphere", "official": "https://cursor.com", "docs": "https://docs.cursor.com"},
    "cursor": {"name": "Cursor", "company": "Anysphere", "official": "https://cursor.com", "docs": "https://docs.cursor.com"},
    "midjourney": {"name": "Midjourney", "company": "Midjourney", "official": "https://midjourney.com", "docs": "https://docs.midjourney.com"},
    "v0": {"name": "v0 by Vercel", "company": "Vercel", "official": "https://v0.dev", "docs": "https://v0.dev/docs"},
    "bolt.new": {"name": "Bolt.new", "company": "StackBlitz", "official": "https://bolt.new", "docs": ""},
    "bolt": {"name": "Bolt.new", "company": "StackBlitz", "official": "https://bolt.new", "docs": ""},
    "exa": {"name": "Exa", "company": "Exa", "official": "https://exa.ai", "docs": "https://docs.exa.ai"},
}

KNOWN_MODELS = [
    "claude 3.5 sonnet", "claude 3.7 sonnet", "claude 3 opus", "claude 3 haiku",
    "gpt-4o", "gpt-4o-mini", "o1", "o1-mini", "o3-mini", "gpt-5", "astra",
    "gemini 1.5 pro", "gemini 1.5 flash", "gemini 2.0 flash", "gemini 3.8 flash",
    "flux", "flux.1", "sdxl", "seedance", "omni"
]

SUSPICIOUS_PROMPT_INJECTIONS = [
    r"ignore\s+(?:all\s+)?previous\s+instructions",
    r"system\s+prompt\s+override",
    r"send\s+(?:your\s+)?api\s+keys",
    r"export\s+(?:the\s+)?database",
    r"execute\s+command",
    r"rm\s+-rf",
    r"format\s+c:",
    r"drop\s+table"
]

def sanitize_untrusted_text(text: str) -> str:
    """Neutralizes potential prompt injection markers and normalizes whitespace."""
    if not text:
        return ""
    clean = text
    for pattern in SUSPICIOUS_PROMPT_INJECTIONS:
        clean = re.sub(pattern, "[FILTERED_INJECTION_ATTEMPT]", clean, flags=re.IGNORECASE)
    return clean.strip()

def extract_structured_page(
    html: str,
    source_url: str,
    raw_markdown: Optional[str] = None
) -> Dict[str, Any]:
    """
    Parses a guide page HTML into the standard structured extraction record (Section 6).
    """
    soup = BeautifulSoup(html, "html.parser")

    # 1. Base URL metadata
    parsed = urllib.parse.urlparse(source_url)
    source_domain = parsed.netloc.lower()

    canonical_tag = soup.find("link", rel="canonical")
    canonical_url = canonical_tag["href"].strip() if canonical_tag and canonical_tag.get("href") else source_url

    # Author
    meta_author = soup.find("meta", attrs={"name": "author"})
    source_author = meta_author["content"].strip() if meta_author and meta_author.get("content") else "Cindy Zhu"

    # Title
    title_tag = soup.find("title")
    h1_tag = soup.find("h1")
    og_title = soup.find("meta", property="og:title")
    page_title = ""
    if h1_tag and h1_tag.get_text(strip=True):
        page_title = h1_tag.get_text(strip=True)
    elif og_title and og_title.get("content"):
        page_title = og_title["content"].strip()
    elif title_tag:
        page_title = title_tag.get_text(strip=True).split("·")[0].split("|")[0].strip()
    page_title = sanitize_untrusted_text(page_title)

    # Meta description
    meta_desc = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", property="og:description")
    meta_description = sanitize_untrusted_text(meta_desc["content"]) if meta_desc and meta_desc.get("content") else ""

    # Headings
    headings = []
    for h in soup.find_all(["h1", "h2", "h3", "h4"]):
        text = h.get_text(strip=True)
        if text:
            headings.append(sanitize_untrusted_text(text))

    # Tags & Topics
    topic_tags = []
    tool_tags = []

    # Find gtag badges
    for tag_el in soup.find_all(class_=re.compile(r"gtag")):
        classes = tag_el.get("class", [])
        text = tag_el.get_text(strip=True)
        if "topic" in classes:
            topic_tags.append(text.lower())
        elif "tool" in classes:
            tool_tags.append(text.lower())

    # Also check inline comment or script card if available
    card_comment = re.search(r'<!--\s*GUIDES_CARD\s*\{([^}]*)\}\s*-->', html)
    if card_comment:
        kv = card_comment.group(1)
        topic_m = re.search(r'topic:\s*"([^"]+)"', kv)
        tool_m = re.search(r'tool:\s*"([^"]+)"', kv)
        if topic_m and topic_m.group(1).lower() not in topic_tags:
            topic_tags.append(topic_m.group(1).lower())
        if tool_m and tool_m.group(1).lower() not in tool_tags:
            tool_tags.append(tool_m.group(1).lower())

    # Text content extraction for entity mining
    body = soup.find("div", class_="guidebody") or soup.find("main") or soup.find("body") or soup
    body_text = body.get_text(separator="\n", strip=True) if body else ""
    sanitized_body = sanitize_untrusted_text(body_text)

    # Links extraction
    github_links = []
    official_doc_links = []
    external_links = []

    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if not href or href.startswith(("#", "javascript:", "mailto:")):
            continue
        full_href = urllib.parse.urljoin(source_url, href)
        parsed_href = urllib.parse.urlparse(full_href)
        domain = parsed_href.netloc.lower()

        if "github.com" in domain and len(parsed_href.path.strip("/").split("/")) >= 2:
            github_links.append(full_href.split("#")[0].rstrip("/"))
        elif "docs." in domain or "/docs" in parsed_href.path:
            official_doc_links.append(full_href)
        elif domain and not domain.endswith(source_domain.replace("www.", "")):
            external_links.append(full_href)

    github_links = sorted(list(set(github_links)))
    official_doc_links = sorted(list(set(official_doc_links)))
    external_links = sorted(list(set(external_links)))

    # Mentioned Tools
    mentioned_tools = set(tool_tags)
    lower_body = sanitized_body.lower()
    for tool_key, info in KNOWN_TOOLS.items():
        if re.search(r'\b' + re.escape(tool_key) + r'\b', lower_body):
            mentioned_tools.add(info["name"])

    # Mentioned Models
    mentioned_models = []
    for model in KNOWN_MODELS:
        if re.search(r'\b' + re.escape(model) + r'\b', lower_body):
            mentioned_models.append(model)

    # Skills mentioned
    skills_mentioned = []
    skill_matches = re.findall(r'(\b[A-Za-z0-9_-]+\s+(?:skill|plugin|agent\s+skill)\b)', sanitized_body, re.IGNORECASE)
    for sm in skill_matches:
        cleaned_skill = sm.strip().title()
        if len(cleaned_skill) < 40 and cleaned_skill not in skills_mentioned:
            skills_mentioned.append(cleaned_skill)

    # MCP Servers mentioned
    mcp_servers_mentioned = []
    if re.search(r'\bmcp\b|model\s+context\s+protocol', lower_body):
        # Look for phrases like "Notion MCP", "MCP server for X", "Google Drive MCP"
        mcp_matches = re.findall(r'([A-Za-z0-9_-]+(?:\s+[A-Za-z0-9_-]+)?\s+MCP(?:-server)?)', sanitized_body, re.IGNORECASE)
        for m in mcp_matches:
            c = m.strip()
            if len(c) < 35 and c not in mcp_servers_mentioned:
                mcp_servers_mentioned.append(c)

    # Workflow Concepts & Steps
    workflow_concepts = []
    step_elements = soup.find_all(["ol", "ul"], class_=re.compile(r"steps|cardgrid"))
    for steplist in step_elements:
        for li in steplist.find_all("li"):
            st = li.get_text(" ", strip=True)
            if len(st) > 10 and len(st) < 300:
                workflow_concepts.append(sanitize_untrusted_text(st))

    # Pricing claims detection (e.g. "$20/month", "free plan", "$5k", "Pro ($20/mo)")
    pricing_claims = []
    price_matches = re.findall(r'(\$\d+(?:[kK]|,\d{3})?(?:\s*(?:/\s*(?:mo|month|year)|total))?)', sanitized_body)
    for p in price_matches:
        if p not in pricing_claims:
            pricing_claims.append(p)

    # Requirements
    requirements = []
    req_sections = soup.find_all(class_=re.compile(r"minicard|cardgrid|requirements"))
    for rc in req_sections:
        for card in rc.find_all(class_=re.compile(r"minicard")):
            t = card.get_text(" ", strip=True)
            if t and len(t) < 250:
                requirements.append(sanitize_untrusted_text(t))

    # Clean source markdown representation (Private corpus only)
    source_md = raw_markdown or ""
    if not source_md:
        # Generate clean structured text representation
        source_md = f"# {page_title}\n\n"
        if meta_description:
            source_md += f"> {meta_description}\n\n"
        source_md += sanitized_body

    content_hash = hashlib.sha256(source_md.encode("utf-8")).hexdigest()

    return {
        "source_url": source_url,
        "canonical_url": canonical_url,
        "source_domain": source_domain,
        "source_author": source_author,
        "page_title": page_title,
        "meta_description": meta_description,
        "published_at": None,
        "updated_at": None,
        "crawled_at": datetime.now(timezone.utc).isoformat(),
        "language": "en",
        "topic": sorted(list(set(topic_tags))),
        "tool_tags": sorted(list(set(tool_tags))),
        "difficulty": "intermediate" if "power" in topic_tags else "beginner",
        "content_type": "guide",
        "headings": headings,
        "mentioned_tools": sorted(list(mentioned_tools)),
        "mentioned_models": sorted(list(set(mentioned_models))),
        "mentioned_platforms": ["macOS", "Windows"] if "windows" in lower_body or "mac" in lower_body else [],
        "github_links": github_links,
        "official_doc_links": official_doc_links,
        "external_links": external_links,
        "skills_mentioned": skills_mentioned,
        "mcp_servers_mentioned": mcp_servers_mentioned,
        "workflow_concepts": workflow_concepts,
        "use_cases": [page_title] if page_title else [],
        "claims": [],
        "examples": [],
        "pricing_claims": pricing_claims,
        "limitations": [],
        "requirements": requirements,
        "source_markdown_private": source_md,
        "content_hash": content_hash
    }
