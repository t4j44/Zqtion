# Zqtion Resource Intelligence — Data Model & Schema

## Overview

The data model is implemented via PostgreSQL migration `supabase/migrations/008_resource_intelligence.sql`. It enforces strict schema isolation between private research data and public knowledge assets, protected by Row Level Security (RLS).

---

## 1. Schema Isolation

- **`resource_private` Schema:**
  Contains `crawl_pages`. Access is revoked from `public`, `anon`, and `authenticated`. Accessible only by `service_role`.
- **`public` Schema:**
  Contains `resource_items`, `resource_relationships`, `resource_sources`. RLS policies restrict public reads exclusively to `status = 'published'`.

---

## 2. Table Specifications

### `public.resource_items`
Core polymorphic table for all public building blocks.

| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `uuid` | Primary Key, `gen_random_uuid()` |
| `slug` | `text` | Unique, lowercase hyphenated, `<= 120` chars |
| `title` | `text` | Length between 2 and 180 chars |
| `summary` | `text` | Concise answer-first summary (10–1000 chars) |
| `resource_type` | `text` | Check in: `guide`, `prompt`, `skill`, `tool`, `model`, `repository`, `mcp_server`, `workflow`, `template`, `automation`, `use_case`, `case_study` |
| `category` | `text` | Check in: `create`, `build`, `automate`, `research`, `productivity`, `agents` |
| `difficulty` | `text` | `beginner`, `intermediate`, `advanced`, `all` |
| `evidence_level`| `text` | `verified`, `zqtion_tested`, `source_reported`, `community_reported`, `unverified` |
| `status` | `text` | `draft`, `review`, `published`, `stale`, `archived`, `blocked_originality` |
| `metadata` | `jsonb` | Type-specific structured parameters |
| `content_markdown`| `text`| Complete original Markdown body |
| `tags` | `text[]` | Array of taxonomy keywords |
| `tools` | `text[]` | Array of associated tools |
| `search_vector` | `tsvector`| Generated tsvector across title, summary, category, and type |
| `published_at` | `timestamptz`| Timestamp when published |
| `verified_at` | `timestamptz`| Timestamp when last verified |

### `public.resource_relationships`
Directed graph edges linking resources.

| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `uuid` | Primary Key |
| `source_id` | `uuid` | References `resource_items(id)` ON DELETE CASCADE |
| `target_id` | `uuid` | References `resource_items(id)` ON DELETE CASCADE |
| `relationship_type` | `text` | `uses_tool`, `requires_skill`, `implements_workflow`, `has_repository`, `connects_mcp`, `solves_use_case`, `alternative_to`, `related_to` |

### `public.resource_sources`
Tracks attribution and verification evidence.

| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `uuid` | Primary Key |
| `resource_id` | `uuid` | References `resource_items(id)` ON DELETE CASCADE |
| `source_url` | `text` | Origin URL |
| `source_type` | `text` | `official_doc`, `github_repo`, `product_site`, `research_guide`, `community`, `other` |
| `is_primary` | `boolean` | True if official documentation or primary repo |
