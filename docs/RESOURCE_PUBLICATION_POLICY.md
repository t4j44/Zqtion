# Resource publication and evidence policy

The catalogue is curated source, not a synthesis output target. Generators now write `reports/resource-draft-candidates.json` with review status. They must never overwrite `content/resources/catalogue.json`. No new article was published by this SEO release.

## Evidence labels

- **Tested with documented method:** a reproducible method, exact versions/input, dated result artifact and limitations are attached. Executing a small code example does not establish an end-to-end workflow or client result.
- **Source reported:** the precise factual claim is supported by an attached direct source. A provider homepage alone does not support pricing, performance or compatibility claims.
- **Community experience:** attributed to the actual member and displayed as their experience, not a Zqtion recommendation.
- **Unverified — review pending:** no sufficient supporting evidence. Proposed architecture, future tests and illustrative examples must be labelled as such.

All 28 existing catalogue entries were individually audited. They have no attached execution evidence and substantial repeated scaffolding. They remain publicly readable at their existing URLs, with corrected claims and references, but are excluded from the search sitemap and marked noindex until review. This policy does not noindex the Resource Library, Prompt Library, portfolio, insights or eligible public Community content.

## Human review before indexing

1. Pick an existing URL. Define its distinct reader, task and useful outcome; merge redundant topics by a reviewed redirect plan if needed. Do not publish overlapping copies.
2. Replace generic steps with actual configuration, prerequisites, examples, expected behavior and failure cases. Preserve meaningful material and acknowledge uncertainty.
3. Check every source against the exact claim. Record the provider URL and date for changing facts. A successful HTTP response is only link reachability.
4. Remove unsupported price/benchmark/verification/client claims. Distinguish licenses from total operating cost. Record an actual test method and result, even when the result fails.
5. A **human editor** reviews accuracy, originality/rights, privacy, usefulness and evidence. Agent QA cannot approve itself as human review.
6. Add the approval to `content/resources/editorial-reviews.json`, keyed by slug, using the shape below. `contentHash` must be the SHA-256 of title, summary and Markdown joined by newline (the `resourceContentHash` helper computes it). The method and evidence URLs must be publicly usable HTTPS links. They must refer to this article's actual evidence, not placeholders.

```json
{
  "existing-slug": {
    "decision": "approved",
    "reviewer": "Actual human reviewer",
    "reviewedAt": "Actual ISO review timestamp",
    "contentHash": "Actual SHA-256 from resourceContentHash",
    "methodUrl": "https://your-real-method-page",
    "evidenceUrl": "https://your-real-result-artifact"
  }
}
```

This example is documentation, not an approval. The committed review registry is empty. Runtime uses the same gate for metadata, article schema and the main sitemap; edits to title, summary or body invalidate approval. A trusted editor controls Git review entries; this is not identity authentication or a substitute for editorial judgment. Changing a source/evidence label or claim requires repeating review even if a smaller automatic check does not detect it.

## Verification

Run unit tests, typecheck, lint, build, `npm run prompts:seo`, and `node scripts/seo/audit.mjs after` against the isolated production preview. Inspect SSR HTML with JavaScript disabled, source links, article anchors, both themes and phone reflow. Use the test reports only for the source/build they measured. Confirm hosted headers and Google URL Inspection after an independently authorized deployment.
