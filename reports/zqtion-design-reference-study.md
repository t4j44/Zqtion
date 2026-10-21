# Zqtion reference study — 21 October 2026

## Evidence and limits

Rendered Chromium captures and computed styles are in `ui-audit/reference-measurements.json` and `ui-audit/screenshots/references/`. Homepage, pricing, blog and documentation were captured at **390×844, 768×1024 and 1440×900**, plus the live Zqtion site at the same sizes. Browser animations and remote artwork can load later than these captures; no exact animation timing is claimed. No authenticated Resend dashboard was accessed. Documentation and the public light-mode article supply theme context, not dashboard acceptance evidence.

## Observed patterns and decisions

| Observation | Why it works | Application to Zqtion |
|---|---|---|
| Resend homepage H1 computed at 96px/96px at 1440px; 480px text box, x=168 | A bounded headline gives a clear starting point | Use fluid Zqtion Instrument Sans with Instrument Serif emphasis; keep its own wording and split hero |
| Public pricing H1 76.8px/76.8px, shared editorial voice on blog | Repeated typography connects different journeys | Shared page-heading, body, label and spacing tokens across company and discovery routes |
| Homepage H2 computed at 56px/67.2px | Clear hierarchy between opening promise and explanatory sections | Calm section headings, comfortable line height, reduced oversized section gaps |
| Pricing and homepage use disclosure in navigation rather than every destination at equal weight | Limits initial decisions while preserving access | Work and Services direct; Company, Discover and Opportunities disclosures; grouped mobile menu |
| Homepage progresses from promise to examples, product UI, trust and final CTA | Each section has a distinct job | Preserve Create/Build/Automate story, real relationship labels and existing conversion paths |
| Product examples sit within bounded surfaces | Examples are legible and visually separated | Preserve Zqtion previews; give the modular Z an intentional graphite panel in light mode |
| Mobile reference reorders content and uses a full-width primary action | Targets and text remain usable on a phone | Keep Zqtion's artwork-first phone composition, 44px theme/menu controls and scrollable menu |

The measurements above describe the rendered sample, not universal design constants. Zqtion does not adopt Resend's fonts, symbol, copy, cube, screenshots or page composition.

## Published reference material

- [Resend website thinking](https://resend.com/handbook/marketing/how-we-think-about-our-website): narrative, authentic identity, attention to detail. Applied as preserved Z storytelling and coherent page journeys.
- [Resend rebranding](https://resend.com/blog/rebranding-resend): consistent symbol and experience. Zqtion retains its original logo and modular Z.
- [Resend light mode](https://resend.com/blog/introducing-light-mode): explicit theme support. Zqtion uses its own pale neutral palette, stronger blue accent and separate surface hierarchy.
- [Primer organization](https://github.com/primer), [Brand](https://github.com/primer/brand), [Primitives](https://github.com/primer/primitives), [React](https://github.com/primer/react): distinguish foundational tokens from components and marketing composition. Applied through semantic CSS variables and accessible disclosure patterns. No Primer package installed.
- [OpenDesign](https://github.com/nexu-io/open-design): inspect rendered work, retain artifacts and iterate on concrete feedback. Applied as baseline → iteration → final screenshots and machine-readable QA. Platform not cloned or installed.
- [Laws of UX Skills](https://github.com/keysjoao/laws-of-ux-skills): component-specific heuristic findings with corrections. Used as reasoning, not as fabricated user research or a scientific usability score.

## What must stay distinct

Zqtion is a founder-led execution company with client work, independent concepts and ventures. It needs truthful portfolio disclosures and service conversion paths, not email-product pricing or invented social proof. Its Instrument pairing, cyan signal, modular Z, original work and Create. Build. Automate. positioning remain. Exact reference whitespace, proprietary fonts, branded graphics, oversized blank sections and continuous animation are not copied. No user testing or conversion uplift is claimed.
