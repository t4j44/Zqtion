# Originality Gate & Anti-Plagiarism Engine

## Policy & Core Principles

Zqtion strictly prohibits copying, reproducing, or lightly paraphrasing third-party articles or prompts (Section 3, 11, 12).

1. **Private Research Corpus:** Third-party crawled data is strictly internal and never published.
2. **First-Principles Synthesis:** When a useful task is identified, Zqtion engineers design an original architecture, process, and prompt from scratch.
3. **Automated Verification:** No resource can be marked `published` without passing automated mathematical originality tests.

---

## Similarity Metrics & Thresholds

The `OriginalityChecker` (`scripts/resource-intelligence/originality.py`) executes four checks against all source corpus texts:

| Metric | Max Threshold | Description |
|---|---|---|
| **5-gram Overlap** | `< 15.0%` | Proportion of 5-token sequences matching the source text. |
| **Normalized Similarity** | `< 65.0%` | Jaccard unigram similarity across all unique tokens. |
| **Longest Contiguous Sequence** | `< 18 tokens` | Longest uninterrupted sequence of identical words. |
| **Structural Duplication** | `False` | Detects matching sequences of 3+ section headings. |

If any threshold is violated:
- `publication_status = 'blocked_originality'`
- The resource is blocked from public endpoints and queued for regeneration.
