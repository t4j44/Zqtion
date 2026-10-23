# Offline 3D renders

Short seamless loops of the Zqtion 3D language (graphite metal, cyan accents), rendered once with Three.js in headless Chrome and shipped as small muted videos in `public/3d/`. Visitors never run WebGL for these, so they look identical and cost no GPU on every phone.

| Scene | Used by | Output |
| --- | --- | --- |
| `hero` | phone/touch hero ([HeroLoopVideo](../../components/HeroLoopVideo.tsx)) | `hero.mp4` |
| `create`, `build`, `automate` | home capability cards ([LoopVideo](../../components/LoopVideo.tsx)) | `<name>.mp4`, `<name>-poster.avif/.webp` |
| `closing` | closing call-to-action ([LoopVideo](../../components/LoopVideo.tsx)) | `closing.mp4`, posters |
| `icon-work`, `icon-services`, `icon-process`, `icon-faq`, `icon-engagements` | 3D icon tiles above section headings ([SectionIcon](../../components/SectionIcon.tsx)) | `<name>.avif/.webp` with real alpha |
| `heroCg` | experiments only (fully procedural Z) | not shipped |

## Render

Needs ffmpeg on PATH, Google Chrome, and puppeteer-core (not a project dependency):

```bash
npm i --no-save puppeteer-core
node scripts/render-3d/render.mjs hero --size 896 --frames 120 --fps 24 --crf 26 --out public/3d
node scripts/render-3d/render.mjs create --size 720 --frames 120 --fps 24 --crf 28 --out public/3d
```

Icons are stills with a transparent background: `node scripts/render-3d/render.mjs icon-work --only still --alpha --t 0 --size 384 --out public/3d`.

`--only still --t 0.3` renders a single frame (to `<scene>-poster.png`) for art direction. `--webm` also writes a VP9 version.

Every scene is a pure function of loop time `t` in `[0, 1)` (see `scenes.js`, `services.js`), so frame 0 and the last frame match and the loop is seamless. Keep rotations to whole turns, or to the symmetry of the object (the gear turns two teeth, the core a quarter turn).

## Rules the page relies on

- **Hero video**: its box is exactly the poster box, so it can never become a larger LCP paint than the poster (a bigger box made the video the LCP element and cost about 0.4 s). Rings and satellites must stay inside the frame.
- **Hero background**: rendered on `#050608` and blended with `mix-blend-mode: lighten` so it dissolves into the page. Nothing between the video and `.hero-journey` may create a stacking context in phone mode (see the comment in `globals.css`).
- **Service and closing loops** are rendered on pure black and `screen`-blended over the card. Do not put `opacity`, `transform`, `filter` or `mask` on their ancestors inside the card.
- Keep each video under about 350 KB. Videos load only near the viewport, play only while visible, and stay on the poster for reduced-motion, Save-Data and slow-network visitors.

## Art direction

The hero reuses the hand-made `artifacts/hero-z-poster-master.png` (a plane lit by a moving sheen) rather than the procedural Z, because it looks better. Add new scenes to `services.js` or `scenes.js` and register them in the `scenes` map at the bottom of `scenes.js`.
