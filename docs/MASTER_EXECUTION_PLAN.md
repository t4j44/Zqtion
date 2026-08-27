# Zqtion Website Master Execution Plan

Updated: 2026-08-07
Status: Discovery and foundation
Source of truth: `Zqtion_Animated_Website_A_to_Z_Project_Context.md`

## North-star outcome

Build a founder-led agency website that wins qualified conversations by proving Zqtion can create, build, and automate. Visual distinction supports that outcome; it is not the outcome itself.

## Locked concept retained

- Short founder/card cinematic introduction
- One persistent digital Zqtion card through the homepage
- CREATE / BUILD / AUTOMATE capability structure
- Card resolves into the brand mark near the final contact scene
- Inner pages are simpler and faster than the homepage
- Speculative, internal, pilot, and commissioned work are labeled accurately

## Phase 0 — Foundation and validation

- [x] Read the project context and inventory the current repository
- [x] Establish initial global and Bangladesh competitor set
- [x] Define measurable website benchmark
- [ ] Confirm the primary launch audience and geographic focus
- [ ] Choose the single primary conversion: project brief, discovery call, or WhatsApp
- [ ] Audit every public claim, price, team detail, and portfolio label
- [ ] Fix text-encoding corruption across source files
- [ ] Record production performance baseline

Exit condition: one approved audience, one primary CTA, verified claims, and baseline metrics.

## Phase 1 — Content and conversion foundation

- [ ] Finalize positioning and homepage copy hierarchy
- [ ] Create four complete case studies with stable routes
- [ ] Add About, Process, and focused service pages
- [ ] Replace the contact `mailto:` flow with a reliable server-side form
- [ ] Add spam protection, validation, delivery logging, and privacy consent
- [ ] Add analytics events for CTA clicks, form starts, form completions, and case-study engagement

Exit condition: the static, no-animation experience is credible and conversion-complete.

## Phase 2 — Motion prototype

- [ ] Storyboard the three signature motion moments
- [ ] Produce an interactive low-resolution card prototype
- [ ] Test desktop, mid-range Android, iPhone, keyboard, and reduced-motion paths
- [ ] Set an explicit animation asset budget before final production
- [ ] Validate that text remains selectable, readable, and present in the DOM

Exit condition: motion increases comprehension or memorability without blocking navigation or failing the performance budget.

## Phase 3 — Production homepage

- [ ] Implement the short hero handoff
- [ ] Implement the persistent card journey with deterministic section states
- [ ] Add static poster and low-power fallbacks
- [ ] Prevent animation preloads from competing with LCP assets
- [ ] Add error recovery for missing frames, WebGL/canvas failures, and resize/orientation changes
- [ ] Complete accessibility and cross-browser QA

Exit condition: production Core Web Vitals targets are met and all fallbacks work.

## Phase 4 — SEO/GEO publishing system

- [ ] Add typed article and case-study content models
- [ ] Add `/insights`, category, author, and article routes
- [ ] Generate article/case-study entries in sitemap
- [ ] Add Article, Breadcrumb, Video, and relevant service structured data that matches visible content
- [ ] Publish the initial six-article evidence-led content set
- [ ] Configure Search Console, Bing Webmaster Tools, and submission workflows

Exit condition: all strategic pages are crawlable, internally linked, measurable, and supported by original evidence.

## Phase 5 — Optimization

- [ ] Review 30 days of behavior and search data
- [ ] Test hero copy and CTA—not the entire visual system at once
- [ ] Improve the highest-impression, lowest-conversion pages
- [ ] Expand only the topic clusters that generate qualified demand
- [ ] Add advanced personalization or AI features only after the core journey converts

## Performance budget

| Metric | Target |
| --- | --- |
| LCP | <= 2.5 seconds at p75 |
| INP | <= 200 ms at p75 |
| CLS | <= 0.1 at p75 |
| Initial route JavaScript | <= 170 KB compressed, with a lower target where practical |
| Initial critical images/video poster | <= 500 KB total on mobile |
| Fonts | Maximum two families and four loaded weights/styles |
| Homepage motion | Lazy-load after critical content; no 100+ frame eager preload |

## Architecture guardrails

- Server-render all indexable content.
- Keep animation controllers in isolated client components.
- Use CSS transforms/opacity for ordinary motion; reserve canvas/WebGL for effects that materially require it.
- Feature-detect capabilities and respect `prefers-reduced-motion` and data-saving settings.
- Use a content schema so service, work, article, SEO, and structured-data fields do not drift apart.
- Never add a metric, testimonial, client, or result without stored evidence and approval.

## Working-file organization

```text
docs/
├── MASTER_EXECUTION_PLAN.md
├── COMPETITOR_RESEARCH.md
├── SEO_GEO_CONTENT_PLAN.md
├── decisions/          # one short record per material decision
├── research/           # dated research snapshots and source links
└── qa/                 # performance, accessibility, and launch results
```

Code remains under `app/`, `components/`, `data/`, `lib/`, and `public/`. Generated animation frames must be moved under a named public asset version when approved; duplicate source ZIPs and raw production assets should not ship with the application.

## Immediate next sprint

1. Approve the updated Zqtion facts, primary audience and primary CTA.
2. Fix encoding corruption and confirm the current build baseline.
3. Convert four existing projects into evidence-rich case-study pages.
4. Build the static homepage information architecture from `FINAL_WEBSITE_BLUEPRINT.md`.
5. Implement the production inquiry backend described in `VERCEL_PRODUCTION_ARCHITECTURE.md`.
6. Prototype the card journey against the performance budget.
7. Deploy a Vercel preview, test it, then connect the domain after approval.

Do not begin a full cinematic rebuild before items 1–4 are complete. Otherwise Zqtion risks producing an impressive homepage with weak proof, weak search coverage, and no reliable conversion funnel.
