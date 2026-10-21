# Zqtion UI audit — before

Date: 21 October 2026. Branch: feature/zqtion-community. Initial Git worktree: clean. Remote identity: https://github.com/t4j44/Zqtion.git.

## Scope and method

Existing Next.js 16.3.6 / React 19 application; Tailwind 3, 1,629-line global stylesheet, separate Prompt Library and Community styles. Fonts are installed Instrument Sans and Instrument Serif. Existing adaptive Hero3D, CSS artwork, native phone scroll, Supabase integration, Resend, Turnstile and Launchpad gates were inspected. No graph index was present. Runtime baseline used a production build with loopback SQL/RLS fixtures and simulated Auth/Storage. No hosted writes or real form submissions.

23 routes were rendered: home, work, services, process, about, contact, careers, application preview, prompt index/detail, Community feeds, public portfolio, account/saved/moderation/guidelines/share, resources, insights, privacy, terms and AI audit. Actual route/viewport rows are in `ui-audit/before-measurements.json` (152 rows). All 14 requested normal/landscape/short viewport sizes were exercised on six major surfaces; remaining routes at 320, 390, 768 and 1440 widths. Dark only: the original site had no light mode. Screenshots under `ui-audit/screenshots/before/`.

## Findings

| ID | Priority | Route/component | Evidence and user impact | Principle / correction |
|---|---|---|---|---|
| B01 | P1 | Whole site/theme | Dark-only metadata; no switch; three hard-coded color systems | Jakob: familiar persistent system-aware theme control; semantic surface/text states |
| B02 | P1 | /about, PageHero | At 320px document 454px wide | Reflow, proximity: fluid headline, min-width guards and safe long-word wrapping |
| B03 | P1 | /, shared sections | At 320px document 361px wide | Reflow: constrain grid children and heading intrinsic widths |
| B04 | P2 | /privacy | At 320px document 350px wide | Reflow: legal-text/grid wrapping |
| B05 | P2 | Navbar | Nine equal links; desktop only at 1280px; mobile ungrouped | Hick/Miller: direct core links, labeled groups and progressive disclosure |
| B06 | P1 | /resources, search/assistant | axe found unlabeled search, assistant input and difficulty selector | Jakob/Fitts: names, 44px targets, pressed filter state |
| B07 | P2 | /resources and detail | Low-contrast tertiary text; skipped shared footer; code scroller not keyboard reachable | Consistency, Fitts: semantic text, shared footer, focusable code block |
| B08 | P2 | /prompts and detail | axe contrast failures in illustration captions, small pricing text and material labels | Aesthetic-usability: correct actual colors, preserve illustrative disclosures |
| B09 | P2 | Hero atmosphere | Continuous gradient-position animation repaints a large area | Attention: static atmosphere; keep transform/opacity artwork motion |
| B10 | P2 | Mobile navigation | Existing trap/Escape present, underlying page not inert | Common Region: isolate the modal and restore scroll/focus on close/resize |
| B11 | P2 | Resource copy block | Clipboard failure only logged | Doherty/Peak-End: honest copy failure feedback and existing selection fallback |

No P0 identified. Severity describes impact, not a certification.

## Baseline measurements

Lighthouse mobile simulation, installed Chrome, local production build, default Lighthouse throttling: performance 89, accessibility 100, FCP 1.4s, LCP 3.5s, CLS 0, TBT 150ms, Speed Index 2.4s. Saved JSON, DevTools log and trace. This homepage accessibility score does not describe other routes. axe scanned 14 routes at 390 and 1440 widths; detailed rule/node evidence in `ui-audit/before-accessibility.json`. Screen-reader/device/provider acceptance was not measured.
