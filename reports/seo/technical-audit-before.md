# Technical audit before changes

Baseline collected 2026-10-22T05:10:25.956Z, commit 128bfee73858003dfd89b1f4d07e0ae15bd32156, local production build ula_4u7mOH2NeIN9A0Q6S. JavaScript-disabled HTML inspection of 110 routes; isolated disposable Community fixture, not live production indexing.

- Catalogue has 28 existing entries (older tests described a minimum of 25). All 28 lack attached source URLs; all carry generic verification prose. Every entry needs an individual editorial review.
- All resource detail pages render Markdown as whitespace-preserved text, including a repeated H1 inside the text instead of semantic headings.
- Wrong resource type + valid slug returns HTTP 200, creating a duplicate page and self-canonical on the wrong path.
- Generic verification month and Free to $20/mo cost appear without supporting evidence. Summaries include unsupported 60-80% savings, benchmark data, zero leakage, and client ROI claims.
- Main sitemap includes every resource regardless of publication quality. Publication dates are historical generated values, not verified evidence.
- robots.txt blocks /_next/ assets needed to render pages and explicitly opts training bots into all public paths. Search vs training policy not separated.
- Duplicate title groups: [{"title":"Build an AI Lead Research and Website Verification Pipeline | Zqtion Resource Intelligence | Zqtion","routes":["/resources/guide/ai-lead-research-verification-pipeline","/resources/not-a-type/ai-lead-research-verification-pipeline"]}].
- Existing private Community metadata defaults noindex; published reading, server-side author/date display, safe JsonLd escaping, QAPage accepted-answer validation and database eligibility gates already exist. Preserve these rather than weakening RLS.
- Homepage/mobile feed destinations came from upstream fixes 41f307c,7672c8a,489cc75,128bfee; included before editing.
- Existing metadata uses canonical zqtion.com. www redirect and hosted bot/firewall behavior need live observations; no DNS changes authorized.

Full baseline: [before-audit.json](before-audit.json), [resource-evidence-before.json](resource-evidence-before.json). Lighthouse baseline is collected serially in performance/before; results are only claimed once recorded.
