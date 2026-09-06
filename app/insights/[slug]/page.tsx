import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Footer from "@/components/Footer";
import JsonLd, { getArticleSchema, getBreadcrumbSchema } from "@/components/seo/JsonLd";
import { getInsightBySlug, insights } from "@/data/insights";
import { siteConfig } from "@/data/site";

export function generateStaticParams() { return insights.map((article) => ({ slug: article.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getInsightBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/insights/${article.slug}` },
    openGraph: {
      type: "article",
      url: `/insights/${article.slug}`,
      title: article.title,
      description: article.description,
      publishedTime: `${article.published}T00:00:00Z`,
      images: ["/og-image.png"],
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.description, images: ["/og-image.png"] },
  };
}

export default async function InsightPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getInsightBySlug(slug);
  if (!article) notFound();
  return (
    <main id="main-content">
      <JsonLd schema={[getArticleSchema(article), getBreadcrumbSchema([{ name: "Home", url: siteConfig.url }, { name: "Insights", url: `${siteConfig.url}/insights` }, { name: article.title, url: `${siteConfig.url}/insights/${article.slug}` }])]} />
      <article>
        <header className="section-shell pb-16 pt-32 sm:pb-20 sm:pt-40"><Link href="/insights" className="inline-flex items-center gap-2 text-sm text-white/48 hover:text-white"><ArrowLeft className="h-4 w-4" /> All insights</Link><p className="eyebrow mt-10">{article.category} · {article.readTime}</p><h1 className="mt-6 max-w-6xl text-balance text-5xl font-semibold leading-[0.93] tracking-[-0.055em] sm:text-7xl lg:text-8xl">{article.title}</h1><p className="mt-7 max-w-3xl text-xl leading-8 text-white/55">{article.description}</p><time dateTime={article.published} className="mt-7 block text-xs uppercase tracking-[0.15em] text-white/30">Published {new Date(`${article.published}T00:00:00Z`).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</time></header>
        <div className="section-shell pb-24 sm:pb-32"><div className="grid gap-12 border-t border-white/10 pt-10 lg:grid-cols-[0.3fr_0.7fr]"><aside><p className="text-xs font-bold uppercase tracking-[0.17em] text-cyan-300">Short answer</p><p className="mt-4 text-base leading-7 text-white/62">{article.answer}</p></aside><div className="max-w-3xl">{article.sections.map((section) => <section key={section.heading} className="border-b border-white/10 pb-12 pt-2 first:pt-0 last:border-0"><h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-6 text-lg leading-8 text-white/58">{paragraph}</p>)}{section.bullets ? <ul className="mt-6 grid gap-3">{section.bullets.map((bullet) => <li key={bullet} className="border-l border-cyan-300/40 pl-4 text-base leading-7 text-white/58">{bullet}</li>)}</ul> : null}</section>)}</div></div></div>
      </article>
      <section className="section-shell pb-12"><div className="panel flex flex-col gap-8 p-8 sm:p-12 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow">Apply the thinking</p><h2 className="mt-6 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Bring Zqtion a real execution problem.</h2></div><Link href="/contact" className="button-primary shrink-0" data-analytics="service_contact_click" data-analytics-location="insight_cta">Start a project <ArrowUpRight className="h-4 w-4" /></Link></div></section>
      <Footer />
    </main>
  );
}
