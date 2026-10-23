# Model Context Protocol (MCP) Server Guide

## Overview

The Zqtion Resource Intelligence MCP Server exposes our curated knowledge layer to compatible AI agents (Claude Code, Google Antigravity, Cursor, Windsurf, custom agents).

Endpoints available:
- **HTTP/JSON-RPC 2.0:** `/api/resources/mcp`
- **Standalone Stdio:** `python scripts/resource-intelligence/mcp_server.py`

---

## 1. Response Envelope Standard (Section 23)

Every MCP tool call returns a structured, machine-readable envelope:

```json
{
  "answer": "Concise direct answer to the query.",
  "resources": [
    {
      "slug": "crawl4ai-web-crawler-framework",
      "title": "Crawl4AI Open-Source Web Crawler and Extraction Framework",
      "summary": "...",
      "resourceType": "repository",
      "evidenceLevel": "verified",
      "tools": ["Crawl4AI"]
    }
  ],
  "why": "Explanation of architectural trade-offs.",
  "alternatives": ["Firecrawl Cloud", "Playwright"],
  "evidence": ["Verified against official repository."],
  "limitations": ["Requires local Python runtime."],
  "verified_at": "2026-10-15T00:00:00Z"
}
```

---

## 2. Supported Tools Manifest

1. `search_resources(query, types, category, limit)`: Universal keyword and filtered search.
2. `find_prompt(task, model)`: Task-oriented prompt discovery with structured output schemas.
3. `find_skill(task, agent)`: Agent skill discovery (`SKILL.md`) with security risk classification.
4. `find_repo(topic, language)`: Audited open-source code repositories.
5. `find_mcp(service)`: Connectors for PostgreSQL, Notion, Google Drive, Filesystem.
6. `find_tool(task, maxCostMonthly)`: AI tools evaluated for API availability and cost.
7. `recommend_stack(task, budgetMonthly, experienceLevel)`: Multi-component architecture recommendations.
8. `build_workflow(goal, constraints)`: Step-by-step pipeline with failure modes.
9. `compare_resources(slugA, slugB)`: Head-to-head architectural comparison.
10. `get_resource(slug)`: Canonical structured record.
11. `related_resources(slug)`: Graph traversal of connected items.
12. `verify_resource(slug)`: Evidence provenance and freshness.

---

## 3. Client Configuration

### Claude Desktop / Claude Code (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "zqtion-resources": {
      "command": "python",
      "args": [
        "E:\\zqtion\\website of zqtion\\scripts\\resource-intelligence\\mcp_server.py"
      ]
    }
  }
}
```

### HTTP / Remote Calling
```bash
curl -X POST https://zqtion.com/api/resources/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "recommend_stack", "args": {"task": "Automate lead research for under $50/mo"}}'
```
