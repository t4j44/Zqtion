# Zqtion — UI/UX, Performance & "$100k–500k Studio" Audit

Audited: live site https://www.zqtion.com (desktop 1440×900, phone 390×844) + local repo `E:\zqtion\website of zqtion` (Next.js 16, React 19, Three.js, Lenis, Tailwind 3). Date: 2026-10-08.

## Status — 2026-10-10, second pass (all changes uncommitted)

Benchmarked against resend.com (desktop and phone) and our own homepage, section by section.

**Added in this pass**
- **Work reel:** the Selected Work cards now slide right to left. Desktop with a mouse: the section pins and vertical scrolling moves the cards sideways (transform-only, 1 rAF-throttled listener, sized from viewport height so it fits a 768 px laptop). Phones, touch, reduced motion and no-JS: a native swipe row with scroll snapping. Counter, progress rail, "See every project" end card, keyboard focus scrolls the card into view.
- **Footer:** rebuilt as a giant fading ZQTION wordmark, a brand block with email / LinkedIn / YouTube pills, and three tidy link columns (about 300 px tall instead of about 800 px). All targets stay 44 px.
- **Resend-style section system:** five rendered 3D icon tiles (play, layers, loop, chat, bars; about 5 KB each, real alpha) above the Work, Capabilities, Process, Questions and Engagements headings, with centered intros where they suit.
- **Phone 3D parity with desktop:** the CREATE / BUILD / AUTOMATE chips now show on phones, and the phone loop carries a tilted wire globe (the "planet" the desktop Z has).
- **Easy community access:** a "Join the community" pill under the hero buttons (goes to `/community/account?next=/ai-experiences`), a second button in the mobile menu, and a link in the footer Community column. New analytics event `community_join_click`. Checked at 375, 390, 430, 820, 1366 and 1920 px: no overflow, no overlap with the scroll cue. The phone hero's three tag words are hidden to make room for it.
- **Smaller fixes:** WhatsApp button no longer overlaps the reel hint, and on phones it now appears only after the hero scrolls away (on a 375×667 phone it covered "Start a project"); section icon size and float.

**Measured** (Lighthouse CLI, clean local production build, one machine, indicative only)

| | Performance | A11y / BP / SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|
| Mobile (3 runs) | 88, 91, 91 | 100 / 100 / 100 | 3.3–3.5 s | 60–150 ms | 0 |
| Desktop (2 runs) | 99, 99 | 100 / 100 / 100 | 0.8 s | 60–80 ms | 0 |

- Mobile LCP is still the hero poster at about 3.5 s under Lighthouse's slow-phone simulation, above the 2.5 s target in `PERFORMANCE.md`.

**Honest limits**
- Checked in Chrome and in headless Chrome phone emulation only, not on a real iPhone or in Safari (the phone video uses `mix-blend-mode`).
- Still waiting on real proof (portraits, testimonials, logos), your LinkedIn posters, and approval of `COPY_PROPOSAL.md`.

**Earlier in this work:** sharper phone poster, minimum label sizes, outlined secondary buttons, 44 px targets, one contrast fix, WhatsApp icon, per-section scroll heights, inner-page hero artwork, 1280x720 work stills with bar-cropping, Create / Build / Automate / closing 3D loops, a phone loop video, parallel shader compilation on desktop (desktop 77 to 99), homepage trimmed to 6 content blocks.

**Corrections to my first version of this audit:** the headings and alt text were fine, contrast already passed (one label excepted), the SVG logo is unusable, the 512px poster download is intentional, the mobile CTAs are visible on 844px phones, and the preload and font items were overstated. Those rows are marked below.

---

## What was and wasn't verified

- **Verified by reading the code:** the hero render logic, scroll animation code, CSS breakpoints, fonts, caching headers, the copy in `app/page.tsx`, and `PERFORMANCE.md`.
- **Verified in the live browser:** screenshots of the homepage on desktop and mobile, plus `/work`, `/services`, `/contact` and `/about` on desktop. Also page-load timings and resource sizes, tap-target sizes, small text, and horizontal overflow.
- **Not verified:**
  - A full Lighthouse run. The command hung and I stopped it, so I have no fresh Lighthouse scores. The only Lighthouse numbers below are from your own `PERFORMANCE.md`.
  - Real-device testing (iPhone/Android GPU and thermals) and field data (CrUX).
  - Inner pages on mobile.
  - My timings came from a warm cache, so treat them as best case.

---

## 1. Why the phone version of the 3D asset "sucks"

**It isn't a bug. The code deliberately never renders 3D on phones.** The rules are in [lib/hero-mode.ts](lib/hero-mode.ts):

```ts
if (profile.viewportWidth <= 767 || profile.coarsePointer) return "mobile-poster";
```

| | Desktop | Phone |
|---|---|---|
| Renderer | Live WebGL (Three.js): extruded Z with bevel, 20+ glass panels, orbit rings, wireframe sphere, floating chips, and mouse-reactive lighting | A single flat 512px AVIF image with a CSS highlight overlay |
| Z object | ~35 KB poster, then the real scene on top | 21 KB poster, nothing else |
| Extras | CREATE / BUILD / AUTOMATE labels, wireframe globe, rim light, reflections | Labels hidden (`.hero-3d-label { display:none }` under 1023px), no globe, a few dots |

Three separate problems make it look worse than the file sizes suggest:

1. **The poster is too low-resolution.** The mobile stage is about 340 CSS px, and phones are 3× DPR, so it needs about 1000px of image. It gets 512px, which is upscaled about 2× and looks soft. This is the biggest single fix and costs about 20 KB.
2. **The poster has no depth cues.** The desktop version gets its premium look from moving reflections, a parallax sphere and rotation. A static flat render can't carry that.
3. **The rule is too blunt.** `coarsePointer` is also true for iPads, iPad Pros and touch laptops, which are fully capable of running the scene. They get the poster too.

The reason for the rule is in `PERFORMANCE.md`: the team wanted Lighthouse mobile ≥ 90, and Lighthouse simulates a very slow phone. Real phones from the last 4 years are far faster than that. You are paying a visual price on every real visitor to satisfy a lab profile.

### Fix options (best first)

**A. Pre-rendered looping video of the Z (recommended for phones).** Record the real desktop scene, or render it in Blender, as a 6–8 s seamless orbit with the reflections moving.
- Specs: 720×720 AV1/H.264 (plus WebM), about 250–500 KB, `autoplay muted loop playsinline`.
- Show the current poster as the first frame, so LCP is unchanged. Load the video after `load` and only when in view.
- Cost: no GPU, no JS, no battery drain. It looks identical on every phone.
- Add the wireframe sphere and orbit rings to the video so they exist on mobile too.

**B. Real WebGL on capable phones, started late.** The Three.js chunk is only 87 KB gzip, and the scene is a single mesh plus panels.
- Start it only after `load` plus idle plus a first touch or scroll, never during LCP. That protects the Lighthouse score.
- Gate it on `hardwareConcurrency >= 6`, not `saveData`, and not low-power mode.
- Cap DPR at 2, use a smaller panel count, render on demand, and pause when offscreen.
- Replace mouse parallax with drag-to-rotate or gyroscope tilt on phones.
- This also fixes the iPad/touch-laptop case.

**C. Do at least this (30 minutes):** regenerate the mobile poster at 1024px with DPR srcset (`512w 1x`, `1024w 2x`, `1536w 3x`). Bake the sphere, rim light and a second "lit" frame into it. Crossfade between the two frames on scroll to fake rotation.

**D. Scroll-scrubbed image sequence.** About 60 frames as AVIF (~1.5 MB total, loaded lazily) scrubbed by scroll progress. This is the Apple-style effect, and it works on every device. It fits your "scroll animation is amazing" brand.

My recommendation is A + C now, then B as a later upgrade.

---

## 2. Is the site "super fast"? Evidence

**Good (measured on the live site, warm cache):**
- TTFB ~58 ms, DOMContentLoaded ~185 ms, load ~400 ms.
- 623 DOM nodes. No long tasks recorded during load.
- JS about 346 KB encoded across 11 chunks. CSS 18 KB. Fonts 51 KB. Hero poster 34 KB.
- No horizontal overflow at 390px.
- `Three.js` is lazy-loaded only for capable desktops. Lenis is desktop-only. YouTube iframes only load on Play. Poster assets have 1-year immutable caching.
- The codebase clearly cares about performance and has tests for it (`tests/hero-mode.test.mjs`).

**Not yet "super fast" on mobile, by your own numbers:** `PERFORMANCE.md` records mobile Lighthouse 90, LCP **3.37 s**, TBT 138 ms. The doc's own target is LCP ≤ 2.5 s, so mobile LCP currently misses it. The doc itself says not to claim the target is achieved.

### Performance issues to fix

| # | Finding | Fix |
|---|---|---|
| P1 | ~~Fonts preload~~ **Not changed.** Both fonts have `preload: false` in [app/layout.tsx:19,28](app/layout.tsx), which contradicts `PERFORMANCE.md`. But with `display: swap` the H1 paints in the fallback font, so preloading would not improve LCP; it only reduces the visible font swap. | Left as is. If the swap bothers you, preload Instrument Sans (29 KB) and re-measure. |
| P2 | ~~Preload the poster~~ **Not needed.** The poster `<img>` is already in the server-rendered HTML with `fetchPriority="high"`; Lighthouse confirms it is discoverable and priority-hinted. | None. |
| P3 | ~~Desktop downloads the 512 poster~~ **Not a bug.** [globals.css:466](app/globals.css) uses `z-poster-512.avif` as the CSS mask for the highlight overlay, so desktop needs it. | None. |
| P4 | **`content-visibility:auto` with a fixed `contain-intrinsic-size: auto 900px`** on every homepage section. Measured real heights were 540–2480 px on desktop and 520–2280 px on mobile, so the scrollbar jumped as sections rendered. | **Fixed:** per-section desktop and mobile estimates via `--cis` / `--cis-m` in [app/page.tsx](app/page.tsx) and [globals.css](app/globals.css). |
| P5 | ~~Use the SVG logo~~ **Not possible.** `Zqtion logo.svg` is 1.8 MB with embedded raster images, not a real vector. The 256px PNG at 35 KB is fine. | A true vector Z mark could be drawn from the WebGL shape later. Low priority. |
| P6 | **`og-image.png` is 346 KB.** | Not changed (kept the filename and format so social previews stay stable). Optional: re-export smaller. |
| P7 | **Work card thumbnails were YouTube `hqdefault.jpg` (480×360), displayed up to 1314 px wide.** The browser received only 380×285 pixels, so they looked blurry. | **Fixed:** now `maxresdefault.jpg` (1280×720, verified to exist for all 10 videos) with automatic fallback to `hqdefault`, plus accurate `sizes`. Delivered images are now ≥ 883×496. Your own exported stills would still be better and remove the YouTube dependency. |
| P8 | **`@media` and Tailwind arbitrary CSS is spread over a 1,756-line `globals.css`** with hero rules defined in several places (e.g. `.hero-poster-frame` width set at lines 429, 1678, 1743). | Not a speed problem now, but it is the cause of most layout fragility. Split per component. |
| P9 | **Run the real checks.** | Run `npm run build && npm start`, then Lighthouse mobile and desktop 3× each. Record results in `PERFORMANCE.md`. Add PageSpeed Insights (field data) once there is traffic. |

**Verdict:** desktop is fast. Mobile is good (about 90 in lab), but not "super fast" until P1–P4 land and the LCP target is met. Don't trade the mobile 3D quality for the score. Use option A (video after load) and both can be true.

---

## 3. UI/UX flaws

### Critical / high

1. **Mobile hero is image-first.** On a 390×844 screen the Z fills the top half, the H1 starts at about y=430, and both CTAs are visible at about y=700 (verified; my first reading of this was wrong). It is acceptable on 844px phones, and the CSS already shrinks the stage on short screens. Only reconsider if you want the headline above the Z.
2. **Inner pages feel like a different, cheaper site.** `/work`, `/services`, `/contact` and `/about` open with a big text-only hero on a flat dark background. No 3D, no motion, no imagery. Your $100k+ impression is made on the homepage and lost the moment someone clicks. Fix: reuse the Z or a smaller artifact per page, with a distinct visual for each (Work: a reel strip, Services: the three artifacts, Contact: a calm gradient with the form).
3. **The About page has no faces.** Four team members are shown as initials in circles (TA, MA, MH, SY). Premium buyers want to see who they're hiring. Add real portraits (consistent lighting and crop), or stylized portraits if you prefer to stay anonymous. Initials make it look like a template.
4. **Empty or black media in Selected Work.** I saw a blank black card area for "The Call" while scrolling. YouTube thumbnails load late, and there's no placeholder. Fix: reserve space with a blurred dominant-color placeholder, and use your own optimized posters (P7). Better still, play a 3–5 s muted looping preview on hover (desktop) and in view (mobile).
5. ~~**Contrast failures**~~ **Corrected.** Computed colors on the live site all pass AA (5.6:1 to 18.9:1) because `globals.css` remaps `text-white/30…45` to `#939ca9`. One real failure remained: `text-white/38` on the capability-card labels (about 3.6:1). **Fixed** (now `text-white/60`).
6. **Text too small.** Captions and labels were 8.5–10.7px. **Fixed:** raised to about 10.5–11.5px minimum (the scene caption on phones is now 10.5px).
7. **Tap targets.** Corrected: footer links already had 44px height (only the width of short labels was under 44). The real offenders were the homepage "About Zqtion" and three "Read article" links at 20px tall. **Fixed** (min 44px), and footer links now have a 44px minimum width.

### Medium

8. **CTA hierarchy.** "Start a project" appears three times above the fold on desktop (nav button, hero secondary, plus the nav). The secondary hero button is dark-on-dark and reads as disabled. Make "Start a project" the single white primary, and "Explore the work" a visible outline or ghost button.
9. **The WhatsApp button uses a generic chat-bubble icon** ([components/WhatsAppButton.tsx](components/WhatsAppButton.tsx)). Visitors don't know what it does, and an unlabeled bubble looks like a support widget. Use the WhatsApp glyph, with a short label that expands on hover or first view. It also overlaps text on mobile, so hide it while scrolling and show it on scroll pause.
10. **Pinned scroll animation on mobile is confusing.** The visual is pinned at the top (`position:absolute; inset:0` over the text) with the chapter text below. On small screens the text sits under the artifact and the scene is only about 220–270px tall. Make the visual larger on mobile (50% of the viewport), and show the current chapter number as a sticky mini-progress (01 02 03 04).
11. **The scroll experience is long: ~15,000px, 9+ sections.** Selected work → capabilities → process → engagements → point of view → insights → FAQ → prompt library → Launchpad → closing CTA. That's a lot of "Reveal" blocks of similar weight. Cut or merge:
   - Move "Point of view", "Insights", "Prompt library" and "Launchpad" off the homepage (or into one compact "More from Zqtion" row).
   - Keep: Hero → Story → Work → Services → Process → Proof/Testimonials → FAQ → CTA.
12. **No social proof.** There are no client logos, testimonials, metrics or press. The honest "we don't overclaim" tone is a good value, but a visitor with a budget needs one thing to trust. Add specific, real proof: view counts for the films, competition result (only what you can truthfully claim), a founder quote, "built with" logos, or a short "what the client said". If you have none yet, add a "results from our own launch" or "behind the scenes" section.
13. **Mobile menu:** only one `aria-expanded` found on the page. Check focus trap, Esc to close, and scroll lock. Also add the primary CTA inside the open menu.

### Low

14. **Footer** is a single tall column on desktop with a large blank right side. Use 3 columns (Explore / Connect / Legal) and put a CTA band above it.
15. **No back-to-top or progress indicator** on a very long page.
16. **Service cards say "Explore service"/"EXPLORE" but the entire card isn't clickable.** Make the whole card a link with hover and focus states.
17. **Images/headings.** Corrected: the three images with empty alt are the decorative logo and poster (correct practice), and the headings are not empty (my tool read them as empty because off-screen sections are skipped by content-visibility). Lighthouse accessibility is 100. Nothing to fix.
18. **Motion safety:** `prefers-reduced-motion`, Save-Data and slow network are handled in the hero and story code, which is good. Check the CSS ambient animations and the reveal animations also stop for reduced motion.
19. **Page transitions:** none. Adding a short view transition (opacity and a tiny translate) between pages would hide the hard cut and make the whole site feel app-grade.

---

## 4. "AI slop" — what makes it read as generated

The site is much better than typical AI output, but these patterns are visible and a design-savvy buyer will spot them:

**Visual patterns**
- The same recipe on every section: uppercase, wide-tracked cyan eyebrow with a small line ("— SELECTED WORK") → big tight H2 → grey paragraph → card grid with 1px borders and 1.75rem radius. It's consistent, but it makes every section look interchangeable. Vary the layouts: one full-bleed, one horizontal scroller, one big number or quote, one asymmetric split.
- Dark navy + cyan + glassy rounded cards is the default "AI SaaS" palette. Your Z logo and the extruded metal look are the distinctive part. Lean into it: use one signature accent that isn't generic cyan (a warm highlight on the metal, or a single bold brand color), and use the 3D language in the section artifacts.
- Numbered labels everywhere (01/02/03, "01 / CREATE", "02 / BUILD", process 01–04, FAQ 01–N). Keep numbers where order matters (process), and remove them from FAQ and chapter eyebrows.
- The pinned "artifact" is built from about 12 identical 52×36px CSS rectangles. It works, but it's the visual weak point of an otherwise strong story. Upgrade these to the same 3D panels as the hero (render them to sprites or use the same Three.js materials).

**Copy patterns (very characteristic of generated text)**
- The "X, not Y" and "Useful X, not Y" structure: "Useful answers, not content volume.", "No fictional menu pricing. A scope you can evaluate.", "Proof with the relationship made clear.", "Evidence over theatre", "Independent by design. Accountable by default."
- Abstract nouns instead of outcomes: "execution loop", "create the signal", "operating model", "ideas made usable", "repetition, engineered out". A buyer can't picture what they receive.
- Defensive honesty repeated in many places: "No award or placement is claimed", "labeled—not passed off as client results", "Independent concepts are disclosed", "does not use AI as an excuse for unsupported claims". It's an admirable principle, but stated this often it sounds anxious and puts the weakness (little client history) in front of every visitor. Say it once, clearly, on the Work page, and let the other pages sell.
- Tripled lists everywhere (Create / Build / Automate, three engagement cards, three insight cards, three artifacts). Break the rhythm in at least one place.
- Em dashes in headings and the heavy use of colons.

**Rewrite direction (examples to show the style, not final copy)**
- Instead of "One company across the gap between idea and execution." → say what you ship: "Films, websites and AI workflows — made by one small team, delivered in weeks."
- Instead of "Create the signal. Build the experience. Automate what repeats." → "We make the campaign, build the site it lands on, and automate the follow-up."
- Add concrete specifics: turnaround times, team size, what a first call looks like, one example deliverable with a number.

---

## 5. Recommendations to reach the "wow" level

**The principle:** premium agency sites win on (a) one unforgettable interactive moment, (b) restraint and consistency, (c) specific proof, and (d) perfect polish on every screen size. You already have (a) and the foundation of (b).

### Hero
- Same hero on every device: video/sequence on phone (section 1), WebGL on desktop.
- Add a "Start a project" CTA with a subtle magnetic hover on desktop, and a sticky bottom CTA bar on mobile after the hero.
- A short loader or intro reveal (the Z assembles from the panels) only on first visit, skippable, and never blocking LCP.

### Scroll story
- Keep the Execution story. Upgrade the pieces to the real 3D panels, add scroll-linked camera movement on desktop, and a pinned progress on mobile.
- Add one more cinematic beat after Work: a horizontal scroll reel of the films with live previews.

### Work
- Replace YouTube thumbnails with your own stills and looping previews.
- Each case study: a full-bleed hero video, a "challenge → approach → result" with one real number, and a next-project link.

### Trust
- Real portraits on About, client or collaborator logos, 1–3 testimonials, a "how we work" with a named founder, and a Calendly/booking option beside the form (lower friction than a long brief).

### Interaction polish
- Cursor-reactive lighting on the cards (desktop), tap feedback on mobile, smooth page transitions, consistent focus rings, and animated underline on nav links.
- A custom 404 and a proper loading state for the contact form with a success screen that shows what happens next.

### Consistency
- Create a single `design-tokens` file for spacing/type/radius and split `globals.css` per component. Add Playwright screenshot tests at 360, 390, 768, 1024, 1440 and 1920 px so a change to one breakpoint never breaks another.

---

## 6. Prioritized action plan

**Week 1 — quick wins (high impact, low effort)**
1. Regenerate the mobile hero poster at 1024/1536px with DPR srcset (1.C).
2. Preload Instrument Sans (P1). Fix the 512 poster downloading on desktop (P3). Use the SVG logo (P5).
3. Fix contrast and minimum font size (flaws 5, 6). Fix tap targets to 44px (7).
4. Make "Start a project" the single primary CTA; fix the ghost button (8).
5. Add `alt` text and remove empty headings (17). Correct `contain-intrinsic-size` (P4).
6. Replace the WhatsApp icon and tidy its behavior (9).

**Weeks 2–3 — the big visual wins**
7. Pre-rendered looping Z video for phones with sphere and orbits baked in (1.A).
8. Mobile hero re-layout: headline first (flaw 1).
9. Own work thumbnails, hover/inview previews (P7, flaw 4).
10. Portraits on About; add 1–3 proof items (flaws 3, 12).
11. Upgrade inner-page heroes so they match the homepage (flaw 2).

**Weeks 4+ — the "$500k" layer**
12. Capable-phone WebGL, started late (1.B), and/or the scroll-scrubbed sequence (1.D).
13. Real 3D panels in the scroll story; page transitions.
14. Cut the homepage by about 30%; vary the section layouts; rewrite the copy for outcomes and specifics (sections 3.11 and 4).
15. Playwright visual tests across breakpoints; Lighthouse CI on every deploy; record real numbers in `PERFORMANCE.md`.

---

## Appendix — key code locations

- Mobile vs desktop hero decision: [lib/hero-mode.ts](lib/hero-mode.ts), [components/Hero3D.tsx](components/Hero3D.tsx)
- WebGL scene: [components/HeroWebGLScene.tsx](components/HeroWebGLScene.tsx)
- Scroll story: [components/ExecutionStory.tsx](components/ExecutionStory.tsx), CSS at `globals.css:1499–1515` and `1686–1695`
- Mobile hero CSS: `globals.css:1674–1685`, `1742–1746`
- Deferred sections: `globals.css:1491–1492`
- Fonts: [app/layout.tsx](app/layout.tsx)
- Homepage content: [app/page.tsx](app/page.tsx)
- Existing performance policy and numbers: [PERFORMANCE.md](PERFORMANCE.md)
