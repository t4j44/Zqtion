# Design system

## Brand

Zqtion is cinematic, editorial, precise, restrained, and technically sophisticated. Preserve near-black surfaces, white typography, cyan/blue signal color, Instrument Sans, Instrument Serif, the modular Z artifact, and Create / Build / Automate.

Avoid generic neon AI styling, rainbow gradients, excessive glass, visual noise, and effects that make the site feel like a technology demo.

## Tokens

Canonical tokens live in `app/globals.css`:

- color: `--background`, `--surface`, `--surface-raised`, `--foreground`, `--text-secondary`, `--text-tertiary`, `--text-decorative`, `--line`, `--blue`, `--cyan`
- shape: `--radius-panel`, `--radius-glass`
- depth: `--shadow-glass`
- motion: `--motion-hover`, `--motion-interface`, `--motion-reveal`, `--ease-out`
- type: `--font-sans`, `--font-editorial`

## Motion rules

- Hover: 160-220 ms
- Interface state: 220-320 ms
- Reveals: 450-650 ms
- Atmosphere: 6-18 seconds
- Scroll-linked work: transform, scale, rotate, and opacity only

Do not continuously animate large blur, backdrop-filter, box-shadow, or SVG filters. Honor `prefers-reduced-motion`. Navigation glass is the only prominent bounded backdrop-filter surface.

## Interaction and accessibility

- Interactive targets should be at least 44 by 44 CSS pixels.
- Focus must remain visible and keyboard order must follow reading order.
- Text at secondary and tertiary levels must remain readable against the actual surface.
- Mobile is a dedicated composition, not a compressed desktop layout.
- Portfolio disclosures and labels are content, not decoration, and cannot be hidden for visual convenience.

## V2 composition

Phone order is navigation, large graphite Z, headline, description and CTAs. The retired AI-execution-company eyebrow stays removed. Desktop keeps its split composition. Hover/tap reflection is restrained, decorative and never required to understand the content.

The scroll story uses creative fragments, a structured interface, a connected workflow and a modular Z. Its artwork and chapter copy must not overlap on short screens. Reduced-motion visitors retain all explanatory copy.

Careers uses the same type, surface and signal colors, with a lightweight orbital illustration instead of another WebGL scene. Every track must disclose responsibilities, learning, beginner requirements, optional advantages, tools and a portfolio outcome. Unpaid status and conditional future opportunities cannot be visually minimized.

## Dual-theme refinement — 21 October 2026

The canonical palette is still in `app/globals.css`. `app/interface.css` owns navigation, reflow guards and intentional theme-specific artwork. Prompt Library and Community CSS consume the same palette through `--pl-*` / `--cq-*` aliases. Tailwind white/black opacity utilities use comma-based `rgba(var(--ink-rgb), alpha)` / `rgba(var(--canvas-rgb), alpha)`; public reading text uses named foreground/secondary/muted utilities rather than low-opacity white.

| Semantic role | Dark | Light |
|---|---|---|
| Page `--background` | #050608 | #f7f8fa |
| Surface `--surface` | #0a0c10 | #ffffff |
| Raised `--surface-raised` | #101319 | #eef1f5 |
| Primary text `--foreground` | #f5f7fb | #182231 |
| Secondary `--text-secondary` | #b6bfcc | #46556a |
| Muted `--text-tertiary` | #9aa6b6 | #53647a |
| Border/divider `--line` | white 10% | #d5dce5 |
| Control boundary `--border-control` | #596577 | #8391a4 |
| Input `--surface-input` | #10151d | #ffffff |
| Accent/link/focus `--cyan`, `--focus` | #6ee7ff | #006b86 |
| Blue `--blue` | #4f7cff | #315ed1 |
| Accent surface `--accent-soft` | #122734 | #e4f0f5 |
| Primary / text on primary | #f5f7fb / #050608 | #182231 / #ffffff |
| Success | #89e2ba | #176746 |
| Warning | #f0cd83 | #835400 |
| Error / error surface | #ffb5c2 / #291820 | #a32c44 / #fff0f2 |
| Navigation | near-black 92% | pale neutral 94% |
| Overlay | near-black 72% | ink 40% |

Decorative lines do not establish control boundaries. Inputs use the stronger control token. Focus is 2px with a 4px offset. Contrast must be checked against the actual composed surface, including opacity, gradients and images. A palette table alone is not WCAG certification.

### Type and rhythm

- Display: `--type-display`, clamp(2.8rem, 5.7vw, 6.8rem); preserve the phone hero's dedicated line composition.
- Page H1: `--type-h1`, clamp(2.8rem, 7vw, 6.8rem), 1.02 line height.
- H2: `--type-h2`, clamp(2.1rem, 4.5vw, 4.6rem), 1.04 line height.
- H3: `--type-h3`, clamp(1.3rem, 2vw, 2rem).
- Body: `--type-body`, 1rem, usually 1.7–1.85 line height; lead uses `--type-lead`, 1–1.25rem.
- Labels/captions: `--type-label` / `--type-caption`, .75rem. Tiny text inside illustrative thumbnails is decorative artwork, not a body-text size precedent.
- Editorial: installed Instrument Serif italic, 400. Body/interface: installed Instrument Sans, 400–700. Code: `--font-code`, system monospace. No new typeface download.
- Spacing: `--space-1/2/3/4/6/8/12/16` = 4/8/12/16/24/32/48/64px at the default root size. These are shared building blocks; existing responsive composition remains.
- Container: `--container` = 90rem; `--gutter` = clamp(1.25rem,4vw,4rem). Shared sections use clamp(4rem,8vw,7rem); phone overrides stay deliberate.
- Long headings can wrap anywhere as a final overflow guard; code uses its own scroll region and remains keyboard reachable.

### Theme behavior

`lib/theme.ts` initializes `data-theme` in the document head before body paint. First visit uses light below 1024px and dark from 1024px, matching the desktop navigation breakpoint regardless of OS appearance. A stored explicit light/dark choice takes priority; the key is `zqtion-theme`. The toggle works without a page reload, persists across routes/refreshes and synchronizes other tabs. Unchosen visits follow the viewport breakpoint; explicit choices remain selected during resize. Storage exceptions fall back safely, and manual choices still last for the current visit when storage is blocked. Native controls and theme-color metadata follow the selected theme. Only the expected root/meta client differences suppress hydration warnings; child-content mismatches are not suppressed.

The one 44×44 theme control stays beside the hamburger on phones and near the project CTA on desktop. Its accessible name says the action (Switch to light/dark theme). Icons move only a few pixels. No spin or floating theme widget.

Portfolio images/video captions and miniature prompt examples keep their designed media palette. The light-mode hero has an explicitly graphite artwork surface, preserving the original Z and video blending. Other page content follows the active theme; no blanket image inversion. Never set a whole content section to a fixed dark color while its text consumes light-theme tokens.

### Motion and navigation

Micro feedback: `--motion-hover` 200ms. Interface/page-state transitions: `--motion-interface` 220ms. Reveal: `--motion-reveal` 500ms. Easing: `--ease-out` cubic-bezier(.16,1,.3,1). Existing reveal and artwork timing remains where tied to composition. Background atmosphere no longer continuously animates gradient position. New disclosure animation uses transform/opacity. Reduced motion removes new transitions/animations and retains readable content.

Keep native phone scrolling and existing adaptive hero eligibility. Do not add a motion library. WebGL is progressive desktop enhancement; reduced-motion and ordinary-phone paths remain static/CSS/poster based.

Desktop uses Work/Services plus Company, Discover and Opportunities disclosures beginning at 1024px. Mobile shows labeled groups, internal vertical scrolling, current-page state and project/community actions. Open mobile navigation makes the background inert, traps Tab, handles Escape, restores trigger focus and previous body overflow, and cleans up when crossing the desktop breakpoint.

Measured solid-token contrast: 26 pairs passed, minimum normal-text contrast 5.34:1 and minimum input-boundary contrast 3.10:1. See reports/ui-audit/token-contrast.json. Gradients, images and translucent surfaces still require contextual review. Code scrollers expose named regions; contribution actions expose named groups.
