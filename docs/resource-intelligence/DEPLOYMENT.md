# Deployment & Operational Guide

## 1. Environment Configuration

Copy `.env.example` to `.env.local` for local development.

```bash
# Public Configuration
NEXT_PUBLIC_SITE_URL=https://zqtion.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key

# Server-Only Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-server-only-secret-key
RATE_LIMIT_SECRET=your-random-hmac-secret

# Resource Intelligence Crawling & Storage
CRAWLER_USER_AGENT=ZqtionResourceIntelligence/1.0 (+https://zqtion.com/bot; research@zqtion.com)
```

---

## 2. Database Migrations

Apply migration `008_resource_intelligence.sql`:

```bash
# Via Supabase CLI:
supabase db push

# Or run tests with in-memory PGlite to verify migrations locally:
npm test
```

---

## 3. Running the Discovery & Crawl Pipeline

```bash
# 1. Map seed URLs and examine filters
python scripts/resource-intelligence/map_seed.py

# 2. Run Crawl4AI extraction with rate limiting
python scripts/resource-intelligence/run_full_crawl.py --limit 15 --rate-limit 1.0

# 3. Export reports and synthesize catalogue
python scripts/resource-intelligence/export.py
```

---

## 4. Verification & Testing

```bash
# Run complete test suite (Next.js tests, PGlite migrations, Prompt library, Resource catalogue)
npm test

# Run Python unit tests for crawler, extraction, and originality engine
python -m unittest tests/test_resource_intelligence.py

# Run TypeScript type check
npm run typecheck

# Run Next.js production build
npm run build
```
