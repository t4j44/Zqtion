# SEO, GEO, and Content Plan

Updated: 2026-08-07

## What will actually improve AI-search visibility

There is no special GEO switch or guaranteed AI-search inclusion. Google's current guidance says conventional SEO remains foundational for generative search and prioritizes unique, non-commodity, well-organized, crawlable content. Structured data helps machines understand pages, but it does not replace evidence, authority, or useful content.

Primary guidance:

- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- https://developers.google.com/search/docs/fundamentals/get-started

## Current state

Already present:

- Page metadata and canonical URLs
- Organization, WebSite, ProfessionalService, and FAQ JSON-LD
- `robots.ts`, `sitemap.ts`, `llms.txt`, and `ai.txt`
- Service, work, pricing, contact, privacy, and terms routes

Material gaps:

- No `/insights` or article route
- No individual case-study pages with stable URLs
- No About, Process, or Industry pages
- Sitemap omits privacy and terms and cannot yet include articles/case studies
- Existing copy contains text-encoding corruption that can leak into titles, snippets, and AI extraction
- FAQ markup is present, but Google deprecated FAQ rich results in May 2026; keep useful visible FAQs but do not treat the schema as a growth lever
- No documented author/editor profiles, editorial policy, source policy, or update dates
- No Search Console, Bing Webmaster Tools, analytics, or conversion measurement documented in the repository

## Information architecture

```text
/
├── work/
│   └── [case-study]/
├── services/
│   ├── ai-advertising/
│   ├── ai-brand-films/
│   ├── websites/
│   ├── mvp-development/
│   └── ai-agents-automation/
├── industries/
│   ├── restaurants-food/
│   ├── consumer-brands/
│   └── startups/
├── process/
├── about/
├── insights/
│   ├── [category]/
│   └── [article]/
├── contact/
├── privacy/
└── terms/
```

Do not create thin pages for every keyword variation. Each route must represent a distinct buyer problem, decision, or body of evidence.

## Content clusters

### 1. AI advertising and creative production

Commercial page: `/services/ai-advertising/`

Initial articles:

- AI product ad cost: a transparent production breakdown
- AI product ads vs traditional shoots: when each approach wins
- How to preserve product accuracy in AI-generated ads
- A complete teardown of one Zqtion spec film, including limitations

### 2. AI agents and workflow automation

Commercial page: `/services/ai-agents-automation/`

Initial articles:

- The first five workflows a small business should automate
- n8n vs custom code for a lead-response workflow
- How to measure automation ROI without inventing savings
- Human approval gates for customer-facing AI agents

### 3. MVP development

Commercial page: `/services/mvp-development/`

Initial articles:

- What belongs in a four-week MVP—and what does not
- A nontechnical founder's guide to owning the source code
- Prototype vs MVP vs production product
- MVP budget template with scope, risk, and handover items

### 4. High-performance animated websites

Commercial page: `/services/websites/`

Initial articles:

- How we keep a cinematic website inside Core Web Vitals
- GSAP, Framer Motion, CSS, or video: choosing the right motion tool
- Why 100-frame scroll animations fail on mobile
- An accessibility checklist for animated agency websites

## Article standard

Every article must include:

- A direct 40–80 word answer at the top
- Named author and reviewer, with truthful bios
- Published and updated dates
- A clear problem, audience, and decision the article supports
- Original evidence: screenshots, test data, costs, process artifacts, code samples, or project observations
- Sources linked near the claims they support
- Explicit distinction between fact, estimate, and opinion
- Descriptive image alt text and captions
- An FAQ only when it answers real follow-up questions
- A contextual CTA related to the article—not a generic sales interruption
- `Article` or `BlogPosting` JSON-LD matching visible page content

## Publishing cadence

Do not target volume before proof. Start with two strong pieces per month for 90 days:

1. One evidence-rich case study or build teardown.
2. One buyer-decision guide connected to a service page.

After six pieces, use Search Console impressions, qualified visits, assisted conversions, and sales-call questions to choose the next cluster. Page count alone is not a success metric.

## Measurement

Baseline before launch, then review monthly:

- Indexed pages and crawl errors
- Non-branded impressions and clicks by topic cluster
- Queries where Zqtion appears but earns low click-through
- Article-to-service-page visits
- Qualified form submissions and WhatsApp starts by landing page
- Referrals from known AI assistants where available in analytics
- Mentions/citations in a fixed set of 20 buyer-style AI queries, tested consistently
- Core Web Vitals by page type and device

`llms.txt` and `ai.txt` can remain as supplementary machine-readable summaries, but they are not substitutes for indexable HTML pages and evidence.
