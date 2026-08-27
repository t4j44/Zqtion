import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { insights } from "@/data/insights";

export const metadata: Metadata = { title: "Insights", description: "Practical Zqtion guides on AI creative production, product execution, and workflow automation.", alternates: { canonical: "/insights" } };

export default function InsightsPage() {
  return (
    <main id="main-content">
      <PageHero eyebrow="Insights" title="Answers useful enough to cite." description="Original, practical guidance on creative production, product execution, and automation. Written for founders and small teams making real build decisions." />
      <section className="section-shell pb-24 sm:pb-32"><div className="border-t border-white/10">{insights.map((article, index) => <Reveal key={article.slug}><article className="group grid gap-6 border-b border-white/10 py-10 lg:grid-cols-[0.18fr_0.9fr_0.4fr] lg:items-start"><p className="text-xs font-bold tracking-[0.18em] text-cyan-300">0{index + 1} · {article.category}</p><div><h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.04em] transition group-hover:text-cyan-100 sm:text-4xl">{article.title}</h2><p className="mt-4 max-w-2xl leading-7 text-white/50">{article.description}</p></div><div className="flex items-center justify-between gap-4 lg:justify-end"><span className="text-xs text-white/35">{article.readTime}</span><Link href={`/insights/${article.slug}`} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] hover:bg-white hover:text-black" aria-label={`Read ${article.title}`}><ArrowUpRight className="h-4 w-4" /></Link></div></article></Reveal>)}</div></section>
      <Footer />
    </main>
  );
}
