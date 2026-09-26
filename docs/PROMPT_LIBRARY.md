# Prompt library maintenance

The website owns its public content. The scraped corpus at `E:\projects\zqtion-prompt-corpus` is read-only research; it is never required on the production host.

## Local workflow

```powershell
$env:ZQTION_PROMPT_CORPUS_PATH = 'E:\projects\zqtion-prompt-corpus'
npm run prompts:inspect
npm run prompts:normalize
npm run prompts:sync
npm run prompts:validate
npm test
npm run typecheck
npm run lint
npm run build
npm run start -- --port 3100
# In a second terminal:
npm run prompts:seo
```

The offline scripts read the process environment, not `.env.local`. The documented Windows directory is the local fallback. Use an explicit environment variable on another workstation. Production runs `npm run build` against the generated snapshot and does not run the corpus sync. There are no new dependencies or provider credentials.

`prompts:inspect` prints source counts and malformed records. `prompts:normalize` extracts conservative general principles and provenance into ignored `.prompt-research/knowledge.json`. `prompts:sync` validates the hand-authored editorial records, compares each against every available prompt body, excludes flagged records, writes a public allowlist and reports results. It does **not** call a model or rewrite source text. Do not describe this deterministic editorial pipeline as autonomous original-content generation.

## Content ownership and editing

- Author a distinct task in `scripts/prompts/originals.mjs`. Research IDs remain in that offline module and `.prompt-research`; they are not part of public records.
- Keep IDs and slugs stable. Assign an explicit unused ID in the editorial `stableIds` map; ordering does not change existing saved identities.
- Supply variables with matching `{{UPPERCASE_KEYS}}`, explanations, anatomy, mistakes, tips, specifications, an illustrative example and honest dates.
- Use separately written concepts and wording. Do not copy screenshots, paraphrase source prompts, or treat a passing similarity score as a rights grant.
- Source rights reports distinguish research access from reproduction. Do not automate publication of source material.
- Run sync and review `PROMPT_ORIGINALITY_REPORT.md` and `PROMPT_LIBRARY_QA_REPORT.md`. Detailed source matches stay private.
- Inspect preview and body, then run the HTML audit against a fresh production server. Set `PROMPT_QA_ORIGIN` if using another localhost port.
- Commit the generated `content/prompts/generated/library.json` and `manifest.json` with the authored changes when a commit is authorized. Never commit `.prompt-research` or the corpus.

Invalid corpus records are skipped and reported. Invalid/overlapping editorial records are excluded. A wholly rejected batch preserves the previous public dataset. The current corpus has two resource listicles with no prompt body; these are intentionally excluded. Synchronization checks all available prompt bodies, not only the editorially referenced ones.

## Data access and routes

`lib/prompts/service.ts` is server-only. It exposes search, lookup, category/tool collections, related prompts, methods, populated hubs and sitemap routes. `core.ts` holds pure search, ranking, summary projection and deterministic customization. The public schema is in `types.ts`. Locale and optional lesson IDs support later education/localization work without creating duplicate routes today.

Main and category collections render initial results on the server and progressively enhance filtering through `/api/prompts`. The API searches all public prompt text but returns at most nine card summaries. `/api/prompts/[slug]` returns only one default-customized public prompt for card copying. Neither endpoint reads the corpus. Static detail and method pages retain full useful HTML before client execution.

Routes: `/prompts`, `/prompts/{ui,image,vibe-coding}`, `/prompts/[category]/[slug]`, `/prompts/tools`, `/prompts/tools/[tool]`, `/prompts/methods`, `/prompts/methods/[method]`, `/prompts/methodology`. Empty categories and industry hubs return 404. Add industry hubs only when enough distinct content exists.

All library URLs use the existing `siteConfig.url` canonical policy. Filters canonicalize to their clean collection path. Search/filter URLs and API routes are excluded from the sitemap. The API sends `X-Robots-Tag: noindex`. Do not introduce a redirect that conflicts with hosting-level canonical routing.

## UX and measurement

Saves use versioned localStorage on the current browser origin. They survive reload and synchronize between tabs on that origin, not between accounts or devices. Invalid or disabled storage fails harmlessly with feedback. Customized values stay in component memory and are never sent in analytics.

The existing analytics switch and Do Not Track controls apply. Events: prompt_view, prompt_copy, prompt_search, prompt_filter, prompt_customize, related_prompt_click. Only prompt slug, category, tool and result count are added to the metadata allowlist. Raw search text and customization values are excluded. Provider receipt has not been verified locally.

Previews are CSS/DOM illustrations, explicitly labelled as concepts. No external images, animation dependency or model-generation claim is introduced. The site is dark-only; no second theme system was added.

## Future extension boundaries

An MCP adapter can call the same pure/service functions later; no MCP server or new authentication/database system is included. Before large-scale expansion, precompute the search index, add semantic duplicate review and collect tool/model/version evaluation evidence. Do not generate empty hubs to inflate indexable pages.

## Verification limits

Lexical overlap is not semantic originality or legal clearance. Prompt structure checks are not model-output tests. Browser emulation is not physical-device certification. SEO metadata and readable HTML do not guarantee rankings or AI recommendations. Local builds do not verify deployment, analytics storage or external providers.
