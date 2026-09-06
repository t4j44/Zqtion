# Zqtion agent guide

## Company and truth

Zqtion is a founder-led AI execution company: Create campaign-ready creative, Build useful digital products, and Automate practical systems. Portfolio relationship labels and disclosures are mandatory. Never invent clients, commissions, awards, commercial metrics, outcomes, testimonials, prices, or delivery guarantees.

## Stack and structure

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS and `app/globals.css`
- Framer Motion, Lenis, Three.js
- Supabase, Resend, Cloudflare Turnstile
- routes in `app/`, shared UI in `components/`, content in `data/`, SQL in `supabase/migrations/`

## Implementation rules

- Preserve the near-black, white, cyan/blue, Instrument Sans/Serif visual language.
- Mobile performance is a product requirement. Phones use native scroll and the CSS/DOM hero; Three.js is progressive desktop enhancement.
- Use transform/opacity for scroll-linked motion. Avoid continuously animated blur, backdrop-filter, box-shadow, or SVG filters.
- Respect reduced motion, Save Data, slow networks, low-power devices, hidden tabs, and offscreen state.
- Keep targets at least 44 by 44 CSS pixels, visible keyboard focus, correct semantics, and WCAG 2.2 AA contrast.
- Keep YouTube behind the video facade and optimize thumbnails with `next/image`.
- Prefer CSS, React, Framer Motion, existing Three.js, and browser APIs before adding a dependency.
- Every indexable route needs a unique title, description, canonical URL, one clear H1, and accurate structured data.
- Never add fake `lastModified`, `uploadDate`, or case-study metrics.
- Do not expose service-role, Resend, Turnstile, or HMAC secrets to client code.
- Production form protection must fail securely; analytics must fail harmlessly.

## Required verification

Run `npm run typecheck`, `npm run lint`, and `npm run build`. Browser-test the production build at the widths in `QA_CHECKLIST.md`; check overflow, console, keyboard navigation, reduced motion, WebGL fallback, video facade, form validation/failure, SEO routes, and broken links. Do not claim Lighthouse or real-device results that were not measured.

## Git and release

Preserve unrelated user changes. Do not commit, push, deploy, apply hosted migrations, or change production configuration without explicit user authorization.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
