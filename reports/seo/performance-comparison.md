# Lighthouse lab comparison

Baseline ula_4u7mOH2NeIN9A0Q6S; final candidate mVbL-NgMsO19eaONBe5ol. Three serial cold-profile runs for each of two routes and two devices; 24 raw reports retained. Existing Lighthouse CLI and system Chrome, simulated throttling, loopback production server. No build or broad browser suite ran alongside final measurements. A targeted ESLint run overlapped the first slow mobile sample; that valid sample is retained, and the host remains an uncontrolled shared machine. Host CPU, caches and background work remain uncontrolled. Valid slow samples are retained; only invalid trace-recorder attempts are retried and archived. The first mobile samples show homepage JavaScript 239,740 → 240,071 bytes and resource JavaScript 174,158 → 174,216 bytes; total resource transfer 309,182 → 328,672 bytes as semantic content/styles expand. CPU benchmark indices differ (homepage 993.5 → 712.5; resource 1,378 → 874). Across all runs, host benchmark indices span 778–2483.5 before and 187.5–3162.5 after. These differences limit causal attribution and do not excuse an observed median drop. See [diagnostics](performance/asset-observations.json).

| Page / device | Performance before → after (run scores) | LCP before → after | CLS after | TBT after | A11y / SEO / best practices after |
|---|---|---|---|---|---|
| Home / mobile | 88 → 84 (88/83/92 → 47/88/84) | 3430 → 3496 ms | 0 | 308 ms | 96 / 100 / 100 |
| Resource / mobile | 91 → 85 (91/91/95 → 85/82/91) | 2819 → 2969 ms | 0 | 402 ms | 100 / 69 / 100 |
| Home / desktop | 99 → 77 (99/98/99 → 99/61/77) | 809 → 772 ms | 0 | 544 ms | 100 / 100 / 100 |
| Resource / desktop | 100 → 79 (100/100/100 → 78/79/100) | 602 → 1121 ms | 0 | 413 ms | 100 / 69 / 100 |

Observed regression candidates: /resources/guide/ai-lead-research-verification-pipeline mobile, / desktop, /resources/guide/ai-lead-research-verification-pipeline desktop. These remain unresolved comparison candidates; they are not a clean performance pass. Large within-build score and CPU-benchmark variation also affects the unchanged homepage, so these measurements do not isolate a code regression. Do not optimize product behavior based solely on this confounded sample.

An unreviewed resource intentionally returns noindex: a lower Lighthouse SEO score for that directive is expected and is not a reason to index unsupported content. Homepage mobile accessibility findings and axe incomplete checks remain separate manual-review needs. Lab TBT is not field INP; no field Core Web Vitals, physical-phone, production-CDN or ranking improvement is established. Raw evidence: [before](performance/before/summary.json), [after](performance/after/summary.json), [comparison](performance/comparison.json).
