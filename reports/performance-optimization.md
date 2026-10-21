# Performance optimization — measured release candidate

## Controlled results

Twenty primary comparison runs: five before and five final after for each device condition. Twenty earlier candidate runs remain in `performance/iteration-1` and `performance/iteration-2`, for forty raw runs total. Raw reports, traces, network logs, browser version and full settings remain in `portfolio-audit/performance/`. The executable settings-equality check passes. The old score of 85 is historical context, not a comparable five-run baseline. Final build: `5waZFY_KtfsDPJlSv6P1W`.

| Median metric | Mobile before | Mobile after | Desktop before | Desktop after |
|---|---:|---:|---:|---:|
| Lighthouse performance | 87 | 92 | 86 | 99 |
| Score range | 80–91 | 89–92 | 81–94 | 99–100 |
| LCP | 3.514s | 3.333s | 0.836s | 0.742s |
| Total blocking time | 218.9ms | 73ms | 307.5ms | 0ms |
| CLS | 0 | 0 | 0 | 0 |
| Script bytes transferred | 169,914 | 165,017 | 364,195 | 171,731 |
| Host CPU benchmark index | 1,431 | 2,021.5 | 1,919.5 | 2,139 |

Machine-readable medians, minima, maxima, all run values, LCP nodes and main-thread categories: [performance-before-after.json](performance-before-after.json).

Mobile: Chrome 155, 390×844, DPR 1.75, light theme, simulated 150ms RTT / 1638.4Kbps / 4× CPU. Desktop: same Chrome executable, 1440×900, DPR 1, dark theme, simulated 40ms RTT / 10240Kbps / 1× CPU. Each run starts a fresh Chrome profile with cold browser cache; the local production server is warmed. Heavy QA browsers were stopped during measurement. Before and after use the same theme defaults and configuration. There was no warm-cache comparison or physical-device benchmark.

**Interpretation:** final median scores improve over baseline; run ranges overlap and individual slower runs are retained. Transfer reductions are directly observed. Host benchmark drift, particularly on mobile, limits causal attribution of timing and score deltas; the entire improvement must not be credited to code alone. No statistical significance or production p75 claim is made.

## LCP and main-thread findings

The mobile LCP element before and after is `img.hero-poster-image`, inside the existing modular Z artwork, using `/hero/z-poster-768.avif`. The raw breakdown attributes substantial time to rendering after the resource arrives. Representative run 2 records 950ms native element-render delay before and 696ms after. These are native trace subparts, not the simulated 3.333s median Lighthouse LCP, and must not be added together as if measured on the same clock.

Desktop LCP before: `div.hero-poster-frame > div.hero-poster-object > picture > img.hero-poster-image`; after: `div.hero-poster-frame > div.hero-poster-object > picture > img.hero-poster-image` (run 2; exact nodes retained for all runs).

The baseline also fetched a second Z image solely for its highlight mask, and requested the decorative phone video during initial loading. Desktop eagerly downloaded and initialized the optional Three.js experience. Framework script evaluation and style/layout still form a substantial portion of mobile main-thread work. Mobile median native script evaluation is 1,039ms before / 659.5ms after; style/layout is 570.8ms / 384.7ms. Full per-run category breakdowns are retained rather than treating TBT as field INP.

## Implemented changes

- Preload the genuine responsive Z LCP image with matching `srcset`/`sizes`; decode asynchronously.
- Reuse the decoded poster's actual `currentSrc` for its highlight mask, eliminating the duplicate 512px poster request. Browser checks confirm one poster URL during navigation.
- Keep the complete poster immediately available. Start optional desktop WebGL and the original phone video when the visitor hovers, focuses or presses the artwork. There is no artificial timer designed to move work outside the benchmark window. Reduced-motion, Save Data, slow-network and offscreen/hidden-tab paths remain in place.
- Keep portfolio cards and descriptive content on the server. A small client component handles only native horizontal movement and progress. Remove desktop pinned-scroll measurement/listener work and obsolete card overlay/pinned CSS.
- Cache authentic supplied media locally as responsive previews, retain stable dimensions and use native lazy loading for below-fold images. No early YouTube iframe or third-party player script is introduced.
- Prefer WebP in the existing Next image optimizer after isolating an AVIF-path stall on legacy stills. A direct comparison on one affected local image timed out at 10 seconds for AVIF and returned WebP in 71ms. The original hero's directly served AVIF remains unchanged. All portfolio stills are subsequently checked while visible; this is local delivery evidence, not hosted-optimizer certification.
- Preserve existing licensed fonts; add no runtime dependency, API cache, database index or pooling layer.

This is a real tradeoff: optional artwork activation now incurs the deferred media/GPU cost. Navigation Lighthouse results do not prove that first 3D activation is instant or that it meets a physical-device interaction budget. The phone activation/fallback path is browser-tested; GPU/device acceptance remains open.

## Remaining costs and verdict

**Performance acceptance: PARTIAL.** Both median Lighthouse objectives and CLS are met. **Mobile LCP remains 3.333s, exceeding the 2.5s goal by 0.833s.** Lighthouse flags the 768px poster as larger than its roughly 560px effective display target in this simulated phone condition (16,397 estimated avoidable bytes in final run 2). The render-blocking stylesheet transfers 22,217 bytes, with 160ms estimated savings in that run. Mobile framework evaluation and rendering remain measurable. Those estimates are opportunities, not promised future gains.

Field INP, field LCP p75, Safari and physical Android/iPhone scroll/GPU behaviour remain unverified. Lighthouse TBT is a laboratory measure, not INP. No hosted CDN or provider configuration was changed. Read-only header observations are recorded separately; local API response sizes and headers do not establish hosted database performance. Production performance acceptance is not granted by this report.
