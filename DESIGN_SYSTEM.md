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
