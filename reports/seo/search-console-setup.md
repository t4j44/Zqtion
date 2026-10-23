# Search Console, Bing and measurement setup

## Existing verification checked first

The read-only DNS inspection found a Google verification TXT record. The value was intentionally omitted from all output and reports. No Google or Bing verification meta tag was detected on the tested live www homepage. DNS presence does not prove which account owns the property or grant access. No authenticated Search Console/Bing connector is available in this task.

Before proposing another token or DNS change, the owner should open existing **zqtion.com Domain property → Settings → Ownership verification** and check verified owners. Request access from the existing owner if necessary. Preserve the current record. Check for an existing Bing property and its verification state as well. A missing HTML tag is not evidence that either account is unverified.

## Canonical hosting must be resolved first

Observed apex → www redirect and older www content do not match this candidate's canonical https://zqtion.com URLs. Owner sequence for a separately approved deployment:

1. Link the intended project/deployment and confirm apex TLS and content.
2. Remove the hosted apex → www redirect. Verify apex returns the intended site without redirecting to www.
3. Choose one www → apex mechanism. The candidate's `ZQTION_CANONICAL_APEX_REDIRECT_ENABLED` flag is off by default; enable only after step 2 if using the app rule. Preserve path and query, verify no loop, and avoid a conflicting platform redirect.
4. Check Production versus Preview environment variables, bot/firewall rules, 404 behavior and noindex headers. Preview must remain noindex. Do not change DNS as part of this source push.
5. Use Google URL Inspection on representative canonical pages and a noindex resource draft. Confirm rendered HTML, selected canonical and indexing status. Inspect sitemap fetch status for `/sitemap.xml` and `/community/sitemap-index.xml`. Community sitemaps fail closed when unavailable and exclude private/ineligible records.

## Submissions and reporting

Only after deployment/ownership checks: submit the two sitemap URLs in existing Google and Bing properties. Do not submit noindex, private, fixture, query-filter, staging or unreviewed resource URLs. Inspect actual Search Console reporting availability for Web and generative-AI appearances; documentation currently differs between pages. Export observed clicks, impressions, landing page, query, country/device and available AI reporting without inventing baselines. In Bing inspect crawl/indexing and available AI reports in the owner's account.

IndexNow is optional for participating engines. The owner must choose an approved host, provision the official host-verification file and retain its key privately. Prepare a small deduplicated changed-URL list from the deployed sitemap and reviewed content. Submit only changed canonical public URLs through the documented API, record status, then verify indexing separately. **No key was generated, file published or notification sent.** Google Search is not promised as an IndexNow participant. See [official protocol](https://www.indexnow.org/documentation).

## Privacy-preserving attribution

Existing analytics are opt-in and Do Not Track handling is preserved. Keep referrer attribution at origin level; do not add raw queries, fragments, emails, OAuth tokens or Community drafts to analytics. Review actual referring domains from approved, consent-respecting aggregate reports. Do not label every direct visit as AI traffic. Compare like-for-like periods after deployment, acknowledge seasonality and low sample size, and record conversions only when an actual privacy-compliant event exists.

No external account, DNS, property, analytics configuration, sitemap submission or distribution post was changed in this task. Manual distribution recommendations are in [primary-source research](primary-source-research.md) and [content roadmap](content-quality-roadmap.md).
