# Zqtion Final Website Blueprint

Updated: 2026-08-08
Position: AI execution company
Core system: CREATE / BUILD / AUTOMATE

## Homepage objective

Make a founder, CEO or growth lead understand within five seconds that Zqtion can turn AI opportunities into campaigns, digital products and operational systems—and give that visitor enough proof to submit a serious project brief.

## Homepage sequence

### 1. Immediate hero

Visible immediately, before the cinematic handoff completes:

- Zqtion identity and accessible navigation
- `CREATE. BUILD. AUTOMATE.`
- `We turn AI into business execution.`
- One-sentence explanation
- `Start a Project` and `Explore Work`

The founder/card shot lasts approximately 2–4 seconds. It cannot behave like an unskippable intro.

### 2. Trust strip

Use only truthful signals:

- Founder-led execution
- Strategy plus implementation
- AI-native production
- Global collaboration

Replace these with real client logos only when permission and evidence exist.

### 3. The business shift

Message: Zqtion does not sell AI novelty; it uses AI to create demand, build faster and operate smarter.

The digital card becomes the visual connector for the rest of the page.

### 4. CREATE / BUILD / AUTOMATE

Each pillar includes:

- One buyer outcome
- Three to six focused capabilities
- One flagship visual or loop
- One relevant case study
- One contextual CTA

The card crosses only the transitions between these pillars. It does not constantly move while the user is trying to read.

### 5. Featured work

Four launch case studies. Each card displays:

- Client/project name
- Commissioned, pilot, internal or spec status
- Challenge
- What Zqtion delivered
- Capabilities used
- Verified outcome or a clear `outcome not publicly available` state
- Link to a full case study

### 6. AI audit

A dedicated consulting offer:

`Before adopting more AI, find out where it actually belongs.`

Flow: Discover → Audit → Prioritize → Design → Implement → Measure.

### 7. Process

Discover → Diagnose → Architect → Create/Build → Review → Launch → Improve.

Each stage can expand, but essential information remains in the rendered HTML.

### 8. Engagement models

- Project
- Focused sprint
- AI audit
- Embedded AI partner

Avoid premature fixed prices until delivery economics and scope boundaries are established.

### 9. Founder and team

Show the founder, real core team, and specialist network accurately. Do not imply contractors are full-time employees. Link to genuine professional profiles where available.

### 10. Insights

Feature three evidence-led articles or case notes tied to priority services.

### 11. FAQ and final CTA

Answer actual buying questions, then complete the card-to-logo lockup beside the final project CTA.

## Required routes

```text
/
/work
/work/[case-study]
/services
/services/ai-consulting
/services/ai-creative
/services/ai-development
/services/ai-automation
/process
/about
/insights
/insights/[article]
/contact
/ai-audit
/privacy
/terms
/cookies
```

Industry pages are deferred until Zqtion has real experience or original evidence for each industry.

## Inquiry system

The project form should be a short, resumable multi-step flow:

1. Person and company
2. Needed capability
3. Business problem and desired outcome
4. Timing and budget range
5. Referral source and consent

After successful submission, show the next response time and optionally offer scheduling. Do not force every visitor into a calendar before qualification.

## Motion architecture

### Layer 1 — always available

Server-rendered semantic HTML, static art direction and fully functional navigation/forms.

### Layer 2 — lightweight polish

CSS transforms and opacity for buttons, navigation, cards, text reveals and hover/focus feedback.

### Layer 3 — signature choreography

GSAP ScrollTrigger or a carefully isolated equivalent controls the persistent card across a small number of deterministic section states.

### Layer 4 — expensive media

Hero video, frame sequence or WebGL assets load after the critical page is usable and only on suitable devices.

## Smoothness rules

- Animate only transform and opacity during continuous motion.
- Avoid layout-changing animation properties such as top, left, width and height.
- Keep one animation owner for the persistent card; do not mix competing libraries on the same element.
- Use deterministic scroll states rather than accumulating transforms.
- Pause off-screen loops and videos.
- Cancel animation work when the tab is hidden.
- Use device capability, reduced motion and data-saving signals to select an experience tier.
- Test mid-range Android first, not only a high-end desktop.
- Avoid forced smooth scrolling on touch devices when native scrolling is faster and more predictable.

## Experience tiers

| Tier | Conditions | Experience |
| --- | --- | --- |
| Full | Capable desktop, normal motion preference | Short hero media, persistent 3D card, three major scroll transitions and micro-interactions |
| Standard | Typical laptop/tablet | 2D/CSS card, reduced parallax and no heavy continuous WebGL |
| Mobile | Touch and constrained viewport | Native scroll, short/static hero, simplified card path and lightweight transitions |
| Reduced motion | User preference enabled | Static card positions, instant state changes and no autoplay cinematic movement |

## Definition of “better animation”

Animation is better only when it meets all five conditions:

1. It explains CREATE / BUILD / AUTOMATE or strengthens memory.
2. It remains responsive to input and does not delay navigation.
3. It degrades cleanly on weaker devices.
4. It preserves readable, indexable content.
5. It is measurably smooth in production rather than merely attractive in a design preview.

The goal is not the highest animation count. The goal is the strongest controlled sequence with the lowest performance and usability cost.
