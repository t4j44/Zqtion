# Theme defaults and repository publication follow-up

Requested 21 October 2026 after local visual review. Target: `feature/zqtion-community` at `https://github.com/t4j44/Zqtion.git`.

## Behaviour

- First visit below 1024 CSS pixels: light mode, including phones and tablets.
- First visit from 1024 CSS pixels: dark mode, matching desktop navigation.
- OS appearance does not override these defaults.
- A saved explicit choice wins on either layout and persists across routes, refreshes and viewport changes.
- An unchosen visit follows the desktop breakpoint during resize. Storage-blocked manual choices remain selected for that visit.
- The inline head bootstrap chooses the theme before body paint; browser chrome and native controls use the same theme.

## Evidence scope

The original broad responsive, accessibility, screenshots and Lighthouse records remain evidence for their original source fingerprint. They were not all rerun for this small preference update. The follow-up runs typecheck, lint, all 113 unit/integration tests, a production build and the existing 22-check browser suite updated to test breakpoint defaults, OS independence and manual override persistence. Exact final results and the updated source fingerprint are recorded in `theme-default-validation.json`.

No production deployment, main-branch merge, hosted migration, provider configuration or Launchpad activation is part of this repository push. Previous performance and real-device limitations remain open.
