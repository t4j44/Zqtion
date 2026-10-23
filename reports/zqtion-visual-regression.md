# Zqtion visual regression evidence

Date: 21 October 2026. This is a local production-build comparison, not a screenshot of deployed changes.

## Coverage

- Before: 152 rendered layout rows, 23 routes, dark theme only. Three measured document overflows: Home 361px, About 454px and Privacy 350px at a 320px viewport. No page errors.
- Candidate: 360 rows, 30 routes, two themes; zero document overflows and zero page errors in that matrix.
- Six main surfaces (/ , /prompts, /ai-experiences, /resources, /careers/apply, /contact) use all 14 viewport sizes. Other routes use 320×640, 390×844, 768×1024 and 1440×900. Do not interpret the total as every possible route at every possible size.
- Sizes: 320×640, 360×800, 375×812, 390×844, 412×915, 430×932, 768×1024, 820×1180, 1024×768, 1280×800, 1440×900, 1920×1080, 844×390 landscape and 1024×600 short desktop.
- Nested samples cover work case study, career track, resource guide, insight, prompt workbench, tools/methods/methodology and public portfolio. Community identity/content is explicitly a local fixture.

Machine-readable rows: `ui-audit/before-measurements.json`, `ui-audit/after-measurements.json`. Screenshot directories: `ui-audit/screenshots/before/`, `iteration1/`, `after/`, `interactions/` and `references/`.

## Actual visual review loop

1. Read route/component/CSS/asset inventory and capture the unchanged local build.
2. First themed build: inspect phone and desktop homepage, Prompt Library, Community, Resources, Careers, Contact, About and public portfolio.
3. Found dark service-card backgrounds carrying light-theme ink; corrected to semantic surfaces. Found a pale Careers checklist left outside the token migration; corrected. Corrected Prompt Library illustration captions/small type and resource code-surface contrast.
4. Rebuilt and repeated both-theme screenshot and axe scans. Added proper ARIA roles following manual inspection of axe's inconclusive flags.
5. Homepage capture visits deferred story content and temporarily disables content-visibility/contain-intrinsic-size only in the QA browser. Chromium otherwise captures offscreen placeholders as blank regions even after scrolling. This exposes the existing content for full-page screenshots/contrast checks without changing its colors, layout rules, copy or production loading behavior. Final homepage rows are measured with that capture stabilization; other routes retain normal runtime styles. Earlier unstabilized captures remain under before/ and iteration1/.
6. Inspected menu states, footer, error/success states and application steps. Keyboard focus/cleanup, direct routes, refresh and storage behavior have executable assertions.

## How to read screenshots

- `home-{theme}-{width}-fold.png`: initial composition at 390 and 1440 widths.
- `{route}-{theme}-{width}.png`: full-page route at the four main widths. Slash-separated routes use hyphens.
- `navigation-{theme}-320.png`: open small-phone menu. Desktop discovery and landscape menu captures are under `interactions/`.
- `footer-{theme}-{width}.png`: shared footer at phone/desktop sizes.
- Interaction captures include contact error/success, resource error, application validation, steps 2/3, and menu states.
- Review crops are crops of saved screenshots, not regenerated artwork or mocked UI.

## Limits

There was no pre-existing golden-image test suite for these routes; this is before/after capture, geometry assertions, visual inspection and an iterative correction loop, not a zero-difference pixel oracle. Dark/light changes are intentional. Main screenshot captures use reduced motion for stable evidence. Sticky/scroll-linked sequences cannot be fully represented by one full-page image. Existing browser suites exercise live scrolling and normal motion; real touch-device smoothness, Safari behavior, screen-reader usability and visual preference still require device/human acceptance. 320px/360px reflow approximates 400% zoom of a wider layout; it is not a literal browser-zoom measurement.
