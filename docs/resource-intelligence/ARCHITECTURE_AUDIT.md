# Zqtion Resource Intelligence — Architecture Audit

**Status:** Approved for Implementation
**Target:** Zqtion Knowledge & Discovery Layer (Crawl4AI + Original Resource Library + MCP Discovery Layer)
**Date:** October 2026

---

## 1. Executive Summary

Zqtion Resource Intelligence is a searchable, AI-readable knowledge layer designed to help founders, operators, engineers, and creators discover verified AI building blocks: tools, prompts, agent skills, open-source repositories, MCP servers, workflows, and implementation guides.

This document details the codebase audit, current system capabilities, data model, architectural design, security boundaries, and phased implementation strategy.

---

## 2. Current Zqtion Architecture Audit

### 2.1 Technology Stack
- **Framework:** Next.js 16.3.0 App Router, React 19.2.8, TypeScript 5.9.3.
- **Styling:** Tailwind CSS 3.4.1 with custom typography (`@fontsource-variable/instrument-sans`, `@fontsource/instrument-serif`), custom colors (near-black `#0D0D0E`, `#121316`, dark borders `#1F2128`, cyan/blue `#3B82F6` / `#60A5FA`).
- **Database & Backend:** Supabase PostgreSQL with Row Level Security (RLS), full-text search (`tsvector`), trigram similarity (`pg_trgm`), and schema isolation.
- **Client/Interaction Islands:** Lenis smooth scrolling, Three.js progressive desktop hero enhancement, minimal client components for forms, search, and video facades.
- **Test Framework:** Node.js native test runner (`node:test`) + `@electric-sql/pglite` (in-memory PostgreSQL with RLS and `pg_trgm` extension support), achieving 100% test pass rates with 0 external service dependencies.
- **Existing Content Pipelines:**
  - `data/`: Typed configurations for careers, insights, prompt guides, site metadata, work case studies.
  - `content/prompts/generated/`: JSON library and manifest generated through a research-to-original validation pipeline (`scripts/prompts/pipeline.mjs`).

### 2.2 Reusable Components & Patterns
The following existing architectural assets are reused and extended:
1. **Design System & Tokens:** `app/globals.css`, button styles, card layouts, badge systems, responsive grids.
2. **SEO & Structured Data Engine:** Schema.org JSON-LD builders (`components/seo/`), canonical URL generation, OpenGraph metadata conventions.
3. **PGlite Test Harness:** `tests/community-database.test.mjs` pattern allows testing PostgreSQL schema, RLS policies, GIN indexes, and search functions locally in CI/Node without requiring a running cloud database.
4. **Originality & Validation Engine:** Concepts from `scripts/prompts/pipeline.mjs` (token n-gram overlap, longest common contiguous token sequence, structural duplication detection) are adapted into the Resource Intelligence originality gate.
5. **Request & Spam Hardening:** Rate limiting via cryptographic hashing, Turnstile integration, strict input validation schemas.

---

## 3. Seed Research Discovery Audit (`cindyzhu.com.au/guides`)

### 3.1 Quantitative Mapping Results
Using our automated discovery inspector (`scripts/resource-intelligence/map_seed.py`):
- **Total Sitemap URLs:** 179
- **Guide URLs in Sitemap:** 171
- **Guide Cards in Client Library (JS bundle):** 250
- **Total Unique Guide URLs Discovered:** **250 unique URLs**
- **Topic Filters Identified:** `building`, `career`, `content`, `design`, `life`, `marketing`, `money`, `power`, `productivity`, `start`.
- **Tool Filters Identified:** `chatgpt`, `claude`, `lovart`, `nocode`, `reve`, `stack`.

### 3.2 Resource & Entity Types Identified
From the 250 guide pages, the following distinct entity types are extracted:
1. **Tool:** Hosted AI services (Claude Pro/Code/Cowork, ChatGPT, Lovart, Reve, Higgsfield, Arcads, Emergent, Replit, Kombai, Fish Audio, Antigravity, VS Code, Exa, Crawl4AI).
2. **Skill:** Agent capabilities and `SKILL.md` definitions (Apple design rules skill, SEO auditor, Meta ads analysis, Council of critics, prompt enhancer).
3. **Repository:** Open-source codebases (Crawl4AI, vibe-coding boilerplates, MCP servers, UI component libraries).
4. **MCP Server:** Model Context Protocol connectors (Notion, Google Drive, Local Filesystem, GitHub, PostgreSQL).
5. **Prompt:** Operational AI instructions (structured system prompts, memory definitions, multi-step generation scripts).
6. **Workflow:** Multi-step pipelines (AI UGC generation, voice-cloned bedtime story, lead qualification and site verification, ad multiplication).
7. **Guide:** Comprehensive, step-by-step educational implementation walkthroughs.
8. **Use Case:** Concrete business or individual goals (e.g., automated competitor tracking, client research).

---

## 4. Strict Two-Layer Architecture: Private Corpus vs. Public Zqtion Knowledge

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      LAYER A: PRIVATE RESEARCH CORPUS                   │
│                                                                         │
│  - Raw Crawl4AI HTML/Markdown       - Original Authorship Claims        │
│  - Discovered Links & Tools         - Raw Source Prompts                │
│  - Content Hashes & Timestamps      - Evidence Extraction               │
│                                                                         │
│  * Strictly stored in .resource-research/ and private database schema    │
│  * NEVER exposed via public API, RPC, or client-side bundles            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                 [Originality Gate & Entity Synthesis]
                 • N-gram overlap < 0.15
                 • Longest common sequence < 18 tokens
                 • Independent Zqtion prompt/workflow design
                 • Official source & link verification
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    LAYER B: PUBLIC ZQTION KNOWLEDGE                     │
│                                                                         │
│  - /resources Hub (Search, Filter, Detail Views)                        │
│  - 100% Original Content (Create → Build → Automate Framework)          │
│  - Relationship Graph (Guide ↔ Tool ↔ Repo ↔ Skill ↔ MCP)               │
│  - Verified Evidence Levels (Verified, Tested, Reported)                │
│  - Zqtion MCP Server Endpoint (/api/resources/mcp & standalone stdio)   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Database Schema Design (Migration `008_resource_intelligence.sql`)

### 5.1 Tables
1. **`public.resource_items`**:
   - `id` (uuid primary key default gen_random_uuid())
   - `slug` (text unique not null)
   - `title` (text not null)
   - `summary` (text not null)
   - `resource_type` (text not null check in `('guide', 'prompt', 'skill', 'tool', 'model', 'repository', 'mcp_server', 'workflow', 'template', 'automation', 'use_case', 'case_study')`)
   - `category` (text not null check in `('create', 'build', 'automate', 'research', 'productivity', 'agents')`)
   - `difficulty` (text not null check in `('beginner', 'intermediate', 'advanced', 'all')`)
   - `evidence_level` (text not null check in `('verified', 'zqtion_tested', 'source_reported', 'community_reported', 'unverified')`)
   - `status` (text not null default 'draft' check in `('draft', 'review', 'published', 'stale', 'archived', 'blocked_originality')`)
   - `metadata` (jsonb not null default '{}'::jsonb)
   - `content_markdown` (text not null default '')
   - `search_vector` (tsvector generated always as GIN search target)
   - `created_at`, `updated_at`, `verified_at`, `published_at`
2. **`public.resource_relationships`**:
   - `source_id` (uuid references resource_items)
   - `target_id` (uuid references resource_items)
   - `relationship_type` (text: `uses_tool`, `requires_skill`, `implements_workflow`, `has_repository`, `connects_mcp`, `solves_use_case`, `alternative_to`)
3. **`public.resource_sources`**:
   - `id` (uuid primary key)
   - `resource_id` (uuid references resource_items)
   - `source_url` (text not null), `source_type` (text), `source_title` (text), `is_primary` (boolean)
   - `last_verified_at` (timestamptz)
4. **`resource_private.crawl_pages`**:
   - Internal table restricted strictly to service role.
   - Stores raw crawling output, private markdown, source hash, HTTP headers, extraction metadata.

### 5.2 Row Level Security (RLS)
- Public / Anon / Authenticated roles can **only** execute `SELECT` on `resource_items` where `status = 'published'`.
- Write operations (`INSERT`, `UPDATE`, `DELETE`) are prohibited for public roles; available only to `service_role`.
- `resource_private` schema has all privileges revoked from public, anon, and authenticated.

---

## 6. Proposed Route Structure

- `/resources`: Resource Intelligence Hub (Universal search, filters, category tabs, featured workflows).
- `/resources/[type]/[slug]`: Canonical resource detail page (e.g. `/resources/guides/build-ai-lead-research-pipeline`, `/resources/tools/crawl4ai`).
- `/api/resources`: Fast JSON API supporting search, filtering, and graph traversal.
- `/api/resources/mcp`: Model Context Protocol HTTP/SSE endpoint.
- `/admin/resources`: Private review and publication dashboard (protected by admin authorization).

---

## 7. MCP Server Architecture

Exposes standard JSON-RPC 2.0 tools for AI clients:
- `search_resources`: Full-text and filtered resource discovery.
- `find_prompt`: Task-oriented prompt recommendation with input variable schemas.
- `find_skill`: Agent skill discovery with security risk classification.
- `find_repo`: Open-source repository lookup with license and maintenance health.
- `find_mcp`: MCP server connection discovery for external services.
- `recommend_stack`: Stack recommendation tailored to task, budget, and skill level.
- `build_workflow`: Multi-component workflow synthesis.
- `compare_resources`: Direct architectural comparison between two tools/approaches.
- `get_resource`: Full structured record for a canonical slug.
- `related_resources`: Graph traversal of linked building blocks.
- `verify_resource`: Evidence provenance and freshness status.

---

## 8. Security & Hardening Strategy

1. **Untrusted Data Isolation:**
   - Text extracted from external websites, READMEs, or SKILL.md files is treated strictly as passive data.
   - Robust prompt-injection filters scrub override instructions (`ignore previous instructions`, `send credentials`, etc.).
   - Code blocks from external sources are never executed in the crawler or server environment.
2. **Secrets & Credentials:**
   - No service role keys, Turnstile secrets, or private database credentials exposed to client-side code.
3. **Safe Fallbacks:**
   - If PostgreSQL `pg_trgm` or external vector services are unavailable, the system transparently falls back to PostgreSQL GIN tsvector full-text search.
4. **Originality Defense:**
   - Automated similarity checker rejects any article or prompt exceeding 15% 5-gram overlap or 18 consecutive tokens with any private corpus source.

---

## 9. Phased Implementation Plan

| Phase | Milestone | Key Artifacts |
|---|---|---|
| **Phase 1** | Audit & Discovery | `ARCHITECTURE_AUDIT.md`, `map_seed.py`, `seed_map.json` |
| **Phase 2** | Crawl4AI Pipeline | `crawler.py`, `extract.py`, `normalize.py`, private corpus storage |
| **Phase 3** | Quality & Originality | `originality.py`, `verify.py`, evidence classification |
| **Phase 4** | Database & Migrations | `008_resource_intelligence.sql`, PGlite test suite |
| **Phase 5** | Public UI & Search | `/resources` hub, resource detail views, SEO JSON-LD |
| **Phase 6** | MCP Server Layer | MCP tools, `/api/resources/mcp`, `mcp_server.py` |
| **Phase 7** | Admin & Review | Verification queue, review workflow |
| **Phase 8** | QA & Reports | Crawl summary report, opportunity gap report, unit tests |
