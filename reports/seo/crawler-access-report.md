# Crawler access report

## Candidate policy

| Agent | Public HTML / assets | API endpoints | Purpose and decision |
|---|---|---|---|
| Googlebot / Bingbot | Allow | Disallow | Search discovery; private shells use noindex, actual data remains protected |
| OAI-SearchBot | Allow | Disallow | ChatGPT search discovery; no visibility guarantee |
| PerplexityBot | Allow | Disallow | Search discovery |
| Claude-SearchBot | Allow | Disallow | Search discovery |
| ChatGPT-User / Claude-User | Allow | Disallow | User-triggered retrieval; not proof of automatic indexing |
| GPTBot / ClaudeBot / Google-Extended | Disallow | Disallow | Training/model-development use has no explicit owner opt-in |

The wildcard group allows public content and render assets. The previous `/_next/` block was removed so search engines can render the site. APIs also return `X-Robots-Tag: noindex, nofollow`; robots alone is not privacy protection. Private account, saved, moderation, share and application pages retain noindex. Public pages may be crawled to observe that directive.

Preview configuration: `VERCEL_ENV=preview` returns disallow-all robots, an empty sitemap, and global `X-Robots-Tag: noindex, nofollow`, independently of page metadata. Local default previews used for QA deliberately simulate production metadata with fake providers; they are loopback-only and not publicly indexable.

Effective production rule matching is tested with the existing robots-parser implementation, including wildcard precedence, named agent groups, API paths, public routes and JavaScript assets. Local response evidence is in `after-audit.json`; unit command results are recorded in `checks/results.json`. These do not establish access through a real deployment's bot firewall or genuine bot IP ranges.

## Hosted observations and limitations

`external-link-results.json` records read-only live redirect probes. The apex currently redirects to www, which serves an older deployment. No hosting/firewall settings were changed. A matching candidate robots file is not live yet. The hosting owner must remove the opposing apex redirect before enabling `ZQTION_CANONICAL_APEX_REDIRECT_ENABLED=true` in a later approved release. Otherwise www and apex would loop. Do not enable that flag on the present hosting configuration.

Optional llms.txt and ai.txt now link the actual Resources, Prompts, Community, Work and Gruffet source. They identify proposed/unverified content and member authorship. No hidden model instructions, citation promises or training permission are inserted. Sources and bot distinctions: [primary-source research](primary-source-research.md).
