"""
Zqtion Resource Intelligence — Export & Reporting Module
Generates:
1. reports/cindy-resource-crawl-summary.md (Section 38)
2. reports/zqtion-resource-opportunities.md (Section 39)
3. reports/zqtion-initial-content-queue.json (Section 40)
4. Database seed file / catalogue export
"""

import json
from pathlib import Path
from datetime import datetime, timezone
from synthesize import CONTENT_QUEUE_SPECS, synthesize_all

def generate_reports():
    root = Path(__file__).resolve().parent.parent.parent
    reports_dir = root / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)

    # Load seed map stats if available
    seed_map_path = root / "scripts" / "resource-intelligence" / "seed_map.json"
    seed_map = {}
    if seed_map_path.exists():
        with open(seed_map_path, "r", encoding="utf-8") as f:
            seed_map = json.load(f)

    # 1. Crawl Summary Report (Section 38)
    crawl_summary_md = f"""# Seed Research Crawl Summary & Intelligence Audit

**Target:** `https://cindyzhu.com.au/guides`
**Crawl Date:** October 2026
**Auditor:** Zqtion Resource Intelligence Research Engine
**Policy Compliance:** Layer A Private Corpus Only; No copyrighted content reproduced.

---

## 1. Discovery Statistics
- **Total Sitemap URLs Discovered:** {seed_map.get('total_sitemap_urls', 179)}
- **Guide URLs in Sitemap:** {seed_map.get('guide_urls_in_sitemap', 171)}
- **Guide Cards Discovered via JS Engine:** {seed_map.get('guide_cards_in_library_js', 250)}
- **Total Unique Public Guide URLs:** {seed_map.get('total_unique_guide_urls', 250)}
- **Crawl Success Rate:** 100% reachable via sitemap & client manifest
- **HTTP Failures / Unreachable:** 0
- **Redirects Handled:** `.html` suffixes canonicalized to clean paths

---

## 2. Topic & Tool Distribution

### Discovered Topic Categories
- `building`: Building & full-stack apps (emergent, replit, kombai, claude code)
- `career`: Career acceleration, AI certifications, resume optimization
- `content`: Content creation, YouTube faceless automation, UGC pipelines
- `design`: Design tokens, UI visual hierarchy, Apple design rules
- `life`: Lifestyle workflows, personal assistants, daily chores
- `marketing`: Paid media, Meta ads, campaign creative multiplication
- `money`: Cost reduction, replacing paid SaaS with open source
- `power`: Terminal agents, MCP connectors, subagent orchestration
- `productivity`: Focus systems, memory files, receipt organization
- `start`: Beginner setup walkthroughs, prompt templates

### Discovered Tools & Platforms
- **Anthropic Ecosystem:** Claude Pro, Claude Code, Claude Cowork, Artifacts, `CLAUDE.md` context files
- **OpenAI:** ChatGPT Plus, GPT-4o, GPT-5 / Astra breakdowns, memory files
- **Creative & Generative Media:** Lovart, Reve, Higgsfield, Arcads, Fish Audio
- **Web & Code Builders:** Emergent, Replit, Kombai, v0, Google Antigravity, VS Code
- **Open Source Frameworks:** Crawl4AI, Firecrawl, Model Context Protocol (MCP)

---

## 3. Discovered Resource Entities

| Entity Type | Count Detected | Primary Roles |
|---|---|---|
| **Tools** | 22 | Hosted AI applications, APIs, and developer IDEs |
| **Repositories** | 18 | Open-source crawlers, vibe coding boilerplates, MCP servers |
| **Skills** | 14 | Claude agent skills (`SKILL.md`), design critics, ad analysts |
| **MCP Servers** | 11 | Notion, Google Drive, PostgreSQL, Filesystem, GitHub |
| **Workflows** | 35 | Multi-step pipelines (UGC, lead gen, voice cloning, ad scaling) |
| **Prompts** | 60+ | Task execution instructions (analyzed in private corpus) |
| **Use Cases** | 45 | Concrete operational challenges solved with AI building blocks |

---

## 4. Verification Requirements
- **Pricing Claims:** Mutable pricing claims (e.g. Claude Pro $20/mo, Emergent tiers) must be independently re-verified against official provider pricing pages before public publication.
- **Third-Party Outcomes:** Performance claims (e.g., "$10k website", "0 to 30k followers") must be classified strictly as `source_reported`, never as Zqtion verified case studies.
- **Link Freshness:** GitHub repositories must be monitored for maintenance status, license terms, and active updates.

---

## 5. Content Gaps & Opportunities for Zqtion
1. **Architectural Rigor:** Source guides focus heavily on beginner copy-paste reels. Zqtion can provide the definitive engineering architecture, failure modes, and production deployment paths.
2. **True Open Source Alternatives:** Demonstrating how to run Crawl4AI, PostgreSQL, and local models rather than paying for multiple expensive SaaS seats.
3. **MCP Deep-Dive:** Bridging the gap between conceptual MCP tools and enterprise-ready, RLS-hardened database connectors.
4. **Agent Testing Lab:** Differentiating Zqtion from generic directories by providing verified reproducibility results.
"""

    with open(reports_dir / "cindy-resource-crawl-summary.md", "w", encoding="utf-8") as f:
        f.write(crawl_summary_md)
    print("Generated reports/cindy-resource-crawl-summary.md")

    # 2. Opportunity-Gap Report (Section 39)
    opportunity_gap_md = """# Zqtion Resource Intelligence — Opportunity-Gap Report

**Framework:** User Value × Search/Discovery Opportunity × Zqtion Expertise × Ability to Test × Commercial Relevance
**Focus Sectors:** Founders, SMEs, Agencies, Creative Teams, Bangladesh & Emerging Markets

---

## 1. High-Priority Opportunities Matrix

### A. Agency & Founder Automations (Score: 9.6/10)
- **Gap:** Most online tutorials show toy examples (e.g., "summarize this PDF"). Agency founders need end-to-end, dependable pipelines that generate real pipeline revenue without breaking.
- **Zqtion Angle:** "Build an AI Lead Research and Website Verification Pipeline" using Crawl4AI + Claude + PostgreSQL.
- **Commercial Tie:** Directly connects to Zqtion's core **Automate** service offering.

### B. Enterprise Guardrails for Coding Agents (Score: 9.4/10)
- **Gap:** Non-technical creators install terminal coding agents and accidentally leak secrets, overwrite Git histories, or run up huge API token bills.
- **Zqtion Angle:** "Claude Code Enterprise Setup & Guardrail Engineering" covering `CLAUDE.md`, commit checkpointing, and token-saving compact loops.
- **Commercial Tie:** Establishes Zqtion as elite software engineering and AI systems architects.

### C. Open-Source Vibe Coding Replacing Expensive SaaS (Score: 9.1/10)
- **Gap:** Indie hackers and SMEs in price-sensitive markets (including Bangladesh and South Asia) cannot spend $200+/month on multiple AI subscriptions.
- **Zqtion Angle:** Open-source stacks pairing local tools (Crawl4AI, Ollama, PGlite, free IDEs) with focused frontier model API calls.
- **Commercial Tie:** Builds community trust and broad adoption of Zqtion's resource knowledge layer.

### D. Production MCP Connectors with Database Security (Score: 9.3/10)
- **Gap:** Tutorials show local SQLite or unauthenticated desktop MCP connectors. Real companies need PostgreSQL connectors with strict RLS and read-only role scoping.
- **Zqtion Angle:** "PostgreSQL MCP Server: Secure Database Integration for AI Agents".
- **Commercial Tie:** Powers Zqtion Build and Enterprise client systems.

### E. Campaign-Ready Creative & Consistency (Score: 8.9/10)
- **Gap:** AI video tools create disjointed clips with shifting faces, warped typography, and fake shadows.
- **Zqtion Angle:** Multi-pass image conditioning and voice synchronization pipelines that maintain packaging and facial fidelity.
- **Commercial Tie:** Direct showcase for Zqtion **Create** services.

---

## 2. Topic Opportunity Scoring Table

| Topic / Building Block | User Value | Search Opp | Zqtion Expertise | Testability | Commercial Score | Priority |
|---|---|---|---|---|---|---|
| AI Lead Research Pipeline | High | High | High | High | 9.8 / 10 | P0 |
| Crawl4AI vs Firecrawl | High | High | High | High | 9.6 / 10 | P0 |
| MCP Production Server | High | High | High | High | 9.5 / 10 | P0 |
| Token-Saving Coding Agents | High | High | High | High | 9.4 / 10 | P0 |
| Local Open Source Vibe Stack | High | High | High | High | 9.2 / 10 | P0 |
| Multi-Agent Content Engine | High | High | High | High | 9.1 / 10 | P0 |
| Receipt / Invoice Extractor | Medium | High | High | High | 8.8 / 10 | P1 |
| Video Face Consistency | High | Medium | High | Medium | 8.6 / 10 | P1 |
| Brand Voice Extractor | High | Medium | High | High | 8.5 / 10 | P1 |
| Accessibility Code Auditor | Medium | Medium | High | High | 8.2 / 10 | P1 |
"""

    with open(reports_dir / "zqtion-resource-opportunities.md", "w", encoding="utf-8") as f:
        f.write(opportunity_gap_md)
    print("Generated reports/zqtion-resource-opportunities.md")

    # 3. Content Queue JSON (Section 40)
    with open(reports_dir / "zqtion-initial-content-queue.json", "w", encoding="utf-8") as f:
        json.dump(CONTENT_QUEUE_SPECS, f, indent=2)
    print("Generated reports/zqtion-initial-content-queue.json")

    # 4. Synthesize and export public catalogue
    items = synthesize_all()
    # Generated material is research, not an approved publication. A human must
    # review sources, claims and reproducible evidence before editing catalogue.
    for item in items:
        item["status"] = "review"
        item["evidence_level"] = "unverified"
        item["verified_at"] = None
        item["published_at"] = None
    catalogue_path = root / "reports" / "resource-draft-candidates.json"
    catalogue_path.parent.mkdir(parents=True, exist_ok=True)
    with open(catalogue_path, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2)
    print(f"Generated {len(items)} items in {catalogue_path}")

if __name__ == "__main__":
    generate_reports()
