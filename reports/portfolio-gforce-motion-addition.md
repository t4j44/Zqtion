# G Force Tyres motion addition — 22 October 2026

Added **G Force Tyres — Motion Explainer** to `/work` under **Motion design & commercials**, with its own case study at `/work/g-force-tyres-motion-explainer`.

## Source and relationship

- Owner supplied: https://www.youtube.com/shorts/qIWd8cvsoKk
- Official published title: “we made a motion saas for g force tyer mobile- https://www.gforcetyres-mobile.co.uk/”.
- Official oEmbed publisher: Tajuddin Ahamed / @BuildwithTajuddin.
- Browser-observed duration: 36.021 seconds; decoded frame 608×1080, portrait. Observed material includes fitting-location choices, tyre-size guidance, large type and interface motion.
- Label: Creative lab, with owner-supplied attribution. The motion film is separate from the delivered website case study. No separate client commission, endorsement, software attribution or commercial result is asserted.
- Genuine YouTube thumbnail optimized to a 28,858-byte WebP. Original bytes, oEmbed response, source screenshot and media-manifest hash are retained.

## Implementation

Reuses the existing portrait video facade and intentional playback behaviour. The cards retain one project link, while the detail page provides a portrait player and original YouTube link. Metadata, structured data and sitemap inclusion derive from the existing work catalogue. The asset-generation script and existing discovery/interaction checks include this Short.

Homepage featured order, themes, shared components, APIs, Community/Auth/RLS, contact workflows and hosting configuration are unchanged.

## Verification observed for this addition

| Check | Result |
|---|---|
| Typecheck | PASS |
| Repository lint and final targeted lint | PASS |
| Tests | 117 passed, 0 failed |
| Production build | PASS; 110 static pages |
| Portfolio interaction suite | 14 passed, 0 failures/page errors |
| Added project and listing | 32 route/theme/viewport checks, 0 overflow/page errors |
| Portrait media | Correct aspect ratio, real poster loaded, no initial iframe, correct iframe activated on intent |
| Structured data and navigation | VideoObject, canonical, H1, motion grouping and original source link verified |

The responsive checks cover 320, 360, 390, 430, 768, 1024, 1440 and 1920px in both themes. Player activation uses isolated iframe transport; actual third-party delivery is not certified by that fixture. The public source was inspected separately in the browser.

The earlier broad audits and Lighthouse runs belong to the prior release at `eeb29442`; they were not rerun or relabelled as measurements of this addition. This change does not establish physical-device, Safari, hosted-provider or production performance acceptance.

## Evidence

- [Phone card, light](portfolio-audit/gforce-motion/motion-projects-light-390.png)
- [Desktop card, dark](portfolio-audit/gforce-motion/motion-projects-dark-1440.png)
- [Phone case study, light](portfolio-audit/gforce-motion/project-light-390.png)
- [Desktop case study, dark](portfolio-audit/gforce-motion/project-dark-1440.png)
- [Responsive results](portfolio-audit/gforce-motion/browser-results.json)
- [Portfolio interactions](portfolio-audit/gforce-motion/interaction-results.json)
- [Source metadata](portfolio-audit/gforce-motion/source-oembed.json)

Publication is limited to the user-authorized `feature/zqtion-community` branch. No main merge, force push, production deploy or hosted database change is included. The publication commit is identified in Git history and the completion response.
