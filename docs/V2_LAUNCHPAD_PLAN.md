# V2 and Launchpad execution plan

Source reconciliation, 2026-09-04: the detailed Launchpad briefs supersede the general brief's 8-week / 10-role description. Use 12 weeks, 14 tracks, up to 3 places per track (capacity ceiling 42, not a promise to fill). Initial intake is 18+. The program is unpaid, part-time, remote-first, training-led, and does not guarantee employment.

## P0

- Current mobile hero puts copy before the artwork and reserves space for a partly clipped visual. Replace with stable first-paint artwork above the headline, 280–340px high, without changing desktop's split composition.
- Application collection has no implementation. Create validated, bounded, same-origin intake with explicit consent, age confirmation, Turnstile and persistent rate limiting. Default intake to closed until supervision, jurisdiction review, retention policy and delivery are approved.
- Turnstile implicit rendering is unsafe across client-side route transitions. Use a shared explicit widget with reset, expiration, error, and unmount lifecycle handling.

## P1

- Brighten graphite front faces and edges; add restrained pointer/tap reflection, with static reduced-motion and data-saving tiers.
- Replace the copy-only mobile story with a shared DOM transformation from creative fragments to interface to workflow to Z. Native scroll controls progress directly.
- Add /careers, 14 complete track detail pages, a role-aware application page, curriculum, pods, progression, eligibility, selection, certification and transparent FAQ.
- Add Careers to shared navigation/footer and a compact homepage teaser.
- Remove the retired hero eyebrow, apply differentiated reveal variants, remove below-fold image priority, correct VideoObject URL semantics and homepage schema selection.

## P2

- Update sitemap, discovery text, metadata, privacy and canonical operating documentation.
- Add tests for track completeness, consent, age, links, field limits, selections and intake behavior.
- Re-run production build, lint, types, tests, responsive/keyboard/failure-mode checks and performance measurement; report actual results, not a 9.5 claim.

## Boundaries

Preserve all existing uncommitted work. No commits, pushes, deployments, hosted migrations or production configuration changes. No new visual runtime libraries. No live applicant data or emails during QA. SQL may be authored locally but not applied to hosted services. No claim that mentors, cohort dates, jurisdiction eligibility or paid roles have already been confirmed.

## Architecture

`data/careers.ts` is the single source of program terms and track content. Server-rendered /careers and /careers/[track] retain complete readable content without JavaScript. /careers/apply hosts the interactive application and passes server-side intake status. A dedicated API stores applications separately from sales inquiries; records are not included in anonymous analytics. Existing public portfolio labels remain unchanged.

No graphify graph exists in the current repository. The implementation map is derived directly from routes, imports and source inspection rather than creating an unrelated graph artifact.
