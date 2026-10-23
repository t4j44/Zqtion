# Zqtion performance comparison

Date: 21 October 2026. Local production builds, Lighthouse 13.5.0, installed Headless Chrome 155, mobile simulation, localhost HTTP, simulated 4× CPU slowdown and 150ms RTT. Both primary measurements used the same Lighthouse command/configuration. The baseline had a fixed dark theme; the candidate follows the simulated browser's default light preference. These are laboratory samples, not field p75 metrics.

| Metric | Before | Final candidate | Interpretation |
|---|---:|---:|---|
| Performance score | 89 | 85 | Final run is lower; no non-regression signoff |
| Lighthouse accessibility, homepage | 100 | 100 | Does not certify the rest of the site or WCAG compliance |
| FCP | 1.382s | 1.116s | Earlier first content in these samples |
| LCP | 3.500s | 3.679s | **Target <=2.5s NOT MET**; above baseline in this sample; repeated device profiling needed |
| CLS | 0.00017 | 0 | Within the <=0.1 goal in these samples |
| Total blocking time | 150.6ms | 246.5ms | Laboratory proxy; this is not INP |
| Speed Index | 2.359s | 2.008s | Similar visual completion |
| JS transferred | 169,066 bytes | 169,917 bytes | +851 bytes (+0.50%); no new runtime package |
| JS decoded | 515,962 bytes | 519,203 bytes | +3,241 bytes (+0.63%) |
| Script requests | 10 | 10 | Observed during the Lighthouse page load |
| Host CPU benchmark index | 1818 | 1593 | Host conditions drifted; avoid causal or statistical claims |

Artifacts: `ui-audit/lighthouse-before.json`, `lighthouse-after.json`, corresponding `.trace.json` / `.devtoolslog.json`, and `performance-summary.json`.

## Retained slower sample

The intermediate run scored 70, LCP 3.895s and TBT 713.5ms with a CPU benchmark index of 801. It is retained as `lighthouse-iteration2.json`; it is not silently discarded. The same primary framework chunk that cost about 661ms of CPU before cost about 1,583ms in that run, while script transfer changed only 851 bytes. This supports host-load interference as a plausible contributor; it does not prove that all of the slowdown was external. A preceding candidate rerun scored 90 with a benchmark of 1488 (retained as lighthouse-pre-cta.json). The frozen final build scored 85 with a benchmark of 1593. Both were measured before launching other QA browsers. These samples vary enough that a performance improvement or absence of regression cannot be established.

## Changes relevant to performance

- No new website runtime dependency, animation framework, font family or image asset.
- Installed Instrument Sans is preloaded; editorial font remains local with swap behavior.
- Continuous gradient-position atmosphere animation removed. Existing transform/opacity artwork and reduced-motion fallbacks preserved.
- Native phone scrolling and desktop-only WebGL eligibility retained. The normal-motion touch trace reports `mobile-poster`, zero canvases; reduced-motion test reports static artwork.
- Shared theme selection uses a small head bootstrap and one compact navigation control. Avoids a reload and preserves cached routes.

## Interaction evidence and remaining gates

`ui-audit/interaction-trace.json` and `interaction-trace.zip` record real synthetic theme/menu interactions in a 390×844 touch context. The first trace was taken alongside screenshot/accessibility scans; event durations reached 496ms. It is retained as interaction-trace-loaded.json/.zip. A follow-up with the other QA browsers stopped recorded 120ms and 232ms interactions (maximum 232ms), saved in interaction-trace.json/.zip. Entries below 16ms are omitted. These synthetic samples are not field INP and do not establish the <=200ms target.

**Verdict: PARTIAL.** CLS meets the laboratory goal. LCP remains above goal, and final TBT is worse than baseline. Performance non-regression is not signed off. Field LCP/INP p75, mobile network behavior, physical phone GPU/scroll smoothness and repeated controlled performance baselines remain unverified. No production performance or conversion claim is made. A performance follow-up should profile the existing hydration/style tasks and poster rendering on a representative phone before a release decision.
