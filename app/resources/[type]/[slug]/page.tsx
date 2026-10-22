import { notFound } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { getResourceBySlug, getRelatedResources, getCatalogue } from "@/lib/resources/service";
import { resourceIndexable } from "@/lib/resources/publication";
import { evidenceLabels } from "@/lib/resources/evidence";
import { safeArticleHref } from "@/lib/resources/markdown";
import ArticleMarkdown from "@/components/resources/ArticleMarkdown";
import { PromptCopyBlock } from "@/components/resources/PromptCopyBlock";
import { ResourceCard } from "@/components/resources/ResourceCard";
import JsonLd, { getBreadcrumbSchema } from "@/components/seo/JsonLd";
import { siteConfig } from "@/data/site";
import "@/components/resources/article.css";

type Props = { params: Promise<{ type: string; slug: string }> };
export async function generateStaticParams() { return (await getCatalogue()).filter(item => item.status === "published").map(item => ({ type: item.resourceType, slug: item.slug })); }
async function resourceFor(params: Props["params"]) {
  const { type, slug } = await params, resource = await getResourceBySlug(slug);
  if (!resource || resource.resourceType !== type || resource.slug !== slug) notFound();
  return resource;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resourceFor(params), canonical = `${siteConfig.url}/resources/${r.resourceType}/${r.slug}`, index = resourceIndexable(r);
  return { title: r.title, description: r.summary, alternates: { canonical }, robots: { index, follow: true }, openGraph: { title: r.title, description: r.summary, url: canonical, type: "article", images: ["/og-image.png"] }, twitter: { card: "summary_large_image", title: r.title, description: r.summary, images: ["/og-image.png"] } };
}
export default async function ResourceDetailPage({ params }: Props) {
  const r = await resourceFor(params), related = await getRelatedResources(r.slug, 3), canonical = `${siteConfig.url}/resources/${r.resourceType}/${r.slug}`, qualified = resourceIndexable(r);
  const breadcrumbs = getBreadcrumbSchema([{ name: "Home", url: siteConfig.url }, { name: "Resources", url: `${siteConfig.url}/resources` }, { name: r.title, url: canonical }]);
  const article = { "@context": "https://schema.org", "@type": "TechArticle", headline: r.title, description: r.summary, url: canonical, mainEntityOfPage: canonical, inLanguage: "en", image: `${siteConfig.url}/og-image.png`, author: { "@type": "Organization", name: "Zqtion", url: siteConfig.url }, publisher: { "@id": `${siteConfig.url}/#organization` }, citation: (r.sources || []).map(source => source.sourceUrl) };
  return <><main id="main-content" className="resource-page min-h-screen">
    <JsonLd schema={qualified ? [breadcrumbs, article] : [breadcrumbs]} />
    <header className="border-b border-[var(--line)] pt-28 pb-8 lg:pt-32"><div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="resource-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/resources">Resources</Link><span>/</span><span aria-current="page">{r.resourceType.replaceAll("_", " ")}</span></nav>
      <p className="cq-kicker">{r.category} / {evidenceLabels[r.evidenceLevel]}</p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-tight">{r.title}</h1>
      <p className="mt-4 text-base text-secondary leading-relaxed max-w-3xl">{r.summary}</p>
      <p className="resource-byline">By <Link href="/about">Zqtion editorial</Link> · {r.difficulty} · {String(r.metadata.target_user || "Builders evaluating this workflow")}</p>
      {!qualified && <aside className="resource-evidence" aria-label="Evidence status"><strong>Implementation notes — review pending.</strong> This page has no documented Zqtion execution result. Treat examples as proposals, check the linked references, and test on disposable data before adoption. Pricing, compatibility and outcomes are unverified.</aside>}
    </div></header>
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <ArticleMarkdown markdown={r.contentMarkdown.replace(/^#\s+[^\n]+\n+/, "")} />
      <section className="resource-sources" aria-labelledby="resource-sources"><h2 id="resource-sources">References and evidence</h2><p>Reference documentation describes the underlying tools. It does not establish that this particular workflow has been executed or that its results are reproducible.</p><ul>{(r.sources || []).filter(source => safeArticleHref(source.sourceUrl)).map(source => <li key={source.sourceUrl}><a href={source.sourceUrl} rel="noopener noreferrer">{source.sourceTitle}</a></li>)}</ul>{!r.sources?.length && <p>No supporting source URL is attached yet.</p>}</section>
      <PromptCopyBlock label="Resource API example (MCP tool arguments)" language="json" code={JSON.stringify({ tool: "get_resource", args: { slug: r.slug } }, null, 2)} />
      {related.length > 0 && <section className="mt-12" aria-labelledby="related-resources"><h2 className="text-xl font-bold" id="related-resources">Related resources</h2><div className="mt-5 grid gap-6 sm:grid-cols-3">{related.map(item => <ResourceCard key={item.id} resource={item} />)}</div></section>}
      <nav className="resource-next" aria-label="Continue learning"><Link href="/resources">Resource Library</Link><Link href="/prompts/methods">Evaluate your prompts</Link><Link href="/ai-experiences">Discuss an experiment</Link><Link href="/work">See original work</Link><Link href="/services#ai-automation-systems">Implementation services</Link></nav>
    </div>
  </main><Footer /></>;
}
