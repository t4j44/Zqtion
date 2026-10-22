# Structured data report

Final static HTML/schema parse: mVbL-NgMsO19eaONBe5ol. Community visible-content browser checks: tyDU1OUnwNDlsXxOBWzrH, retained with unchanged helper/source hashes in retained-regression-source-proof.json. Local scope: JSON parsing, required-field assertions and visible-content comparisons in Chromium. This is not Google Rich Results Test, Schema.org external validation or rich-result eligibility certification.

## Observed markup

Across 110 audited HTML routes, JSON-LD parsed without errors. Type counts (each occurrence): {"CollectionPage":13,"BreadcrumbList":91,"Article":22,"Organization":1,"WebSite":1,"ItemList":2,"FAQPage":2,"CreativeWork":1,"SoftwareSourceCode":1,"VideoObject":13,"ProfilePage":1}. Main raw audit: [after-audit.json](after-audit.json).

- Organization identity includes the actual company LinkedIn and owner-supplied/corroborated GitHub organization. The founder’s creator channel is no longer treated as a separate company identity. No endorsements, client list, awards or reviews were added.
- Gruffet SoftwareSourceCode includes upstream version 0.1.0, Python 3.10+ and Early release status. MIT/source repository remain attached. See inspected README/pyproject evidence in primary-source-research.md. Existing creative-work and service types remain truthful; no invented upload or modification date was added.
- Unreviewed resource pages emit navigational breadcrumbs, not a falsely qualified TechArticle. After actual human approval, the shared publication gate permits article markup with visible title/summary, author attribution and source citations. Missing historic publication dates are omitted.
- Existing Insight Article and Services markup are preserved. The library collection description no longer claims all entries are verified.

## Community visible-content verification

- /ai-experiences/83cd46ee-b7fd-4c0d-a9b7-2aeac862f90a: BreadcrumbList, QAPage
- /prompts/community/5c18f9d3-ec13-42d9-852e-8571e99d09c5: BreadcrumbList, DiscussionForumPosting
- /u/alice: ProfilePage
- /community/sitemap-index.xml: XML sitemap HTTP 200
- /community/sitemaps/0: XML sitemap HTTP 200
- /community/profile-sitemaps/0: XML sitemap HTTP 200

Real local browser checks match QAPage answer text and author identity, DiscussionForumPosting text/date/author, and ProfilePage name/Person identity to rendered public content. Profiles do not expose private email. Local fixture identities and conversations are synthetic QA data only; no production discussion was created. Dynamic Community pages use normal React stream composition; these visible-content tests execute the browser runtime. Static resource semantic HTML is separately checked with JavaScript disabled.

Accepted answers are emitted only from a real published child answer matching the stored accepted-answer relationship. Hidden or unrelated answers are rejected. The schema helper now deduplicates IDs so the same answer cannot be repeated. Unit tests cover no answers, hidden/unrelated answers, accepted vs suggested answers and duplicates. No accepted answer, rating, member, vote or testimonial was manufactured.

Community indexing/sitemap eligibility and RLS remain the existing server/database gates. Public reading stays anonymous. Fixture/test profiles are not sitemap-eligible. Hosted two-user RLS and search-engine validation still require owner access after deployment.
