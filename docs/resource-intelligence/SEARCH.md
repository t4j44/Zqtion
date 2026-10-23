# Search & Semantic Retrieval Architecture

## 1. Dual Retrieval Strategy

Zqtion Resource Intelligence combines three layers of search to ensure visitors and agents find exact matches as well as conceptually related resources:

1. **PostgreSQL GIN Full-Text Search (`tsvector`):**
   - Weighted text search combining Title (weight `A`), Summary (weight `B`), and Category/Type (weight `C`).
   - Uses `websearch_to_tsquery('simple', ...)` for natural Boolean handling (`"exact phrase"`, `or`, `-negation`).
   - GIN index `resource_items_search_idx` delivers sub-millisecond execution over tens of thousands of items.

2. **Trigram Fuzzy Similarity (`pg_trgm`):**
   - Tolerates minor typos and misspellings in queries.
   - Falls back gracefully to standard full-text search if the optional extension is not available.

3. **In-Memory Token Ranking (Edge / Next.js Server Components):**
   - In Next.js server components and `/api/resources`, search is augmented with multi-field token scoring across title (+50), tools (+15), tags (+15), and summary (+10).
   - Instant response times with 0 external network hops.

---

## 2. Graph Traversal

Resources do not exist in isolation. Every item exposes related graph connections:
- A **Guide** (`ai-lead-research-verification-pipeline`) links to:
  - Tool: `Crawl4AI`
  - Repository: `unclecode/crawl4ai`
  - Prompt: `prompt-b2b-prospect-qualification-tech-stack`
  - MCP Server: `PostgreSQL MCP`
- Traversals are computed via `public.resource_related(slug, limit)` in SQL or `getRelatedResources()` in TypeScript.
