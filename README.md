# Zqtion website

Production website for Zqtion, a founder-led AI execution company working across creative production, digital products, and practical automation.

## Stack

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS plus the Zqtion design system in `app/globals.css`
- Framer Motion for bounded interface/reveal motion
- Three.js as a progressive desktop hero enhancement
- Supabase for inquiries, anonymous conversion events, and persistent form rate limits
- Resend for inquiry email delivery and Cloudflare Turnstile for bot protection

## V2 and Launchpad

The local V2 adds a phone-first Z hero, a four-stage Create / Build / Automate / Z scroll story, `/careers`, fourteen complete track pages and a three-step application preview. See `docs/V2_LAUNCHPAD_REPORT.md` for measured results and outstanding acceptance gates.

The detailed briefs resolve the program to **12 weeks, 14 tracks, up to 3 places each, 8–12 hours/week, remote-first, unpaid and learning-first**. Initial intake is 18+. Places, mentors, dates and eligible jurisdictions are not yet confirmed. Paid opportunities and recommendations are conditional.

`LAUNCHPAD_APPLICATIONS_ENABLED` defaults to false. The preview validates locally and does not transmit or save answers. Do not enable intake until supervision, accepted jurisdictions, program terms, privacy/retention and controlled delivery tests are approved.

No ShaderGradient, liquid-glass, React Three Fiber, carousel, or second smooth-scroll dependency is used. Their visual principles are implemented with existing Three.js, CSS, and browser APIs.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Quality gates:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Rendering policy

Useful content and the CSS Z render immediately. Desktop-class devices can progressively load the Three.js scene. Ordinary phones use the DOM/CSS scene and native momentum scrolling. Reduced-motion, Save Data, slow-network, low-power, hidden-tab, and offscreen states avoid unnecessary animation work.

## Content truth policy

Portfolio relationship labels and disclosures are required. Competition entries, independent concepts, and creative-lab work must never be described as commissioned client work. Do not invent awards, client relationships, revenue, conversion, or performance results.

## Backend setup

Copy variable names from `.env.example`; never commit real values. Apply the Supabase migrations in order:

1. `supabase/migrations/001_website_inquiries.sql`
2. `supabase/migrations/002_analytics_attribution_rate_limits.sql`
3. `supabase/migrations/003_launchpad_applications.sql` (only after explicit approval to prepare Launchpad intake)

Production inquiry delivery fails securely if persistent rate limiting or Turnstile is unavailable. Analytics is anonymous, honors Do Not Track, excludes form content and arbitrary URL query strings, and never blocks navigation or form delivery. It is disabled by default; enable `NEXT_PUBLIC_ANALYTICS_ENABLED=true` only after applying migration 002 and approving reporting/retention settings.

See `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `PERFORMANCE.md`, `SECURITY.md`, `DEPLOYMENT.md`, and `QA_CHECKLIST.md` for operating detail.
