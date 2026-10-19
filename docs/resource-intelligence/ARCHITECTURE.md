# Zqtion Resource Intelligence — Technical Architecture

## 1. System Overview

Zqtion Resource Intelligence combines three interconnected subsystems:
1. **Research & Extraction Engine (Python / Crawl4AI):** Discovers, parses, sanitizes, and indexes external technical material into a private research corpus.
2. **Knowledge & Relationship Graph (PostgreSQL / Supabase / Next.js):** Normalizes building blocks into typed entities (Guides, Tools, Repositories, Skills, Prompts, MCP Servers, Workflows, Case Studies) connected through polymorphic graph edges.
3. **Dual Delivery Interface (Web & MCP Protocol):** Serves human users via a Next.js 16 App Router UI (`/resources`) and AI agents via a standard Model Context Protocol (MCP) JSON-RPC endpoint (`/api/resources/mcp` and `mcp_server.py`).

```text
[ Seed Sources / Web ]
         │
         ▼
[ Crawl4AI Crawler ] ──(Rate Limit / Caching)──► [ Layer A: Private Corpus ]
                                                              │
                                                     (Originality Gate & Synthesis)
                                                              │
                                                              ▼
                                                 [ Layer B: Public Knowledge ]
                                                              │
                                     ┌────────────────────────┴────────────────────────┐
                                     ▼                                                 ▼
                          [ Next.js Web UI ]                                  [ Zqtion MCP Server ]
                           • /resources Hub                                    • /api/resources/mcp
                           • /resources/[type]/[slug]                          • mcp_server.py (stdio)
                           • Search & Filter Island                            • 12 Agent Tools
```

---

## 2. Component Structure

- `scripts/resource-intelligence/`:
  - `discover.py`: Discovers URLs from sitemaps, HTML anchors, and client scripts. Enforces path allowlist (`/guides/**`) and canonicalizes paths.
  - `crawler.py`: AsyncWebCrawler integration with rate limiting, retries, and local filesystem caching.
  - `extract.py`: Extracts structured schema fields and scrubs prompt-injection attempts.
  - `normalize.py`: Normalizes extracted raw records into typed entities.
  - `verify.py`: Validates links, tests security boundaries, and determines evidence levels.
  - `originality.py`: Mathematical similarity checker (5-gram overlap, LCS contiguous sequence, structural heading equality).
  - `synthesize.py`: Builds original Zqtion resources following the 15-point Create-Build-Automate framework.
  - `export.py`: Generates crawl summaries, opportunity-gap reports, and catalogue manifests.
  - `mcp_server.py`: Standalone stdio MCP server for agent pairing.

- `lib/resources/`:
  - `types.ts`: TypeScript interfaces for polymorphic ResourceItems, Relationships, Sources, and MCP responses.
  - `service.ts`: Search, token ranking, filter faceting, and relationship traversal.
  - `mcp.ts`: Shared MCP tool execution logic.

- `components/resources/`:
  - `ResourceCard.tsx`: Accessible building block preview card with evidence badges.
  - `ResourceSearchFilter.tsx`: Interactive client island for searching and faceted filtering.
  - `AskZqtionAssistant.tsx`: Natural-language AI architecture recommendation interface.
  - `PromptCopyBlock.tsx`: One-click copy block for code and prompt specifications.

- `app/resources/`:
  - `page.tsx`: Main Hub route.
  - `[type]/[slug]/page.tsx`: Canonical detail page with JSON-LD structured data.

- `app/api/resources/`:
  - `route.ts`: Fast JSON search and filtering API.
  - `mcp/route.ts`: MCP JSON-RPC 2.0 endpoint.
