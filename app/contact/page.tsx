import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Globe2, Mail, MessageCircle } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import JsonLd, { getBreadcrumbSchema } from "@/components/seo/JsonLd";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = { title: "Start a project", description: "Send Zqtion a project brief for AI creative production, a web product or MVP, practical automation, or AI consultancy.", alternates: { canonical: "/contact" } };

const serviceLabels: Record<string, string> = {
  "ai-creative-production": "AI creative production",
  "web-products-mvps": "Web product or MVP",
  "ai-automation-systems": "AI automation or system",
  "ai-strategy-prototyping": "AI consultancy or prototype",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const query = await searchParams;
  const defaultService = query.service ? serviceLabels[query.service] || "" : "";
  return (
    <main id="main-content" className="contact-page">
      <JsonLd schema={getBreadcrumbSchema([{ name: "Home", url: siteConfig.url }, { name: "Contact", url: `${siteConfig.url}/contact` }])} />
      <header className="section-shell contact-intro">
        <p className="eyebrow">Start a project</p>
        <h1>Tell us about your project.</h1>
        <p className="contact-intro-description">Share what you&apos;re building, the outcome you need, and a little context. We&apos;ll review your brief.</p>
      </header>
      <section className="section-shell pb-24 sm:pb-32">
        <div className="contact-layout grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="panel contact-form-panel p-5 sm:p-8"><ContactForm defaultService={defaultService} /></div>
          <aside className="grid content-start gap-5">
            <a href={`mailto:${siteConfig.email}`} className="panel group flex items-center justify-between gap-4 p-6" data-analytics="email_click" data-analytics-location="contact_page"><div className="flex items-center gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05]"><Mail className="h-4 w-4 text-accent" /></span><div><p className="text-xs uppercase tracking-[0.15em] text-muted">Email</p><p className="mt-1 text-sm text-secondary">{siteConfig.email}</p></div></div><ArrowUpRight className="h-4 w-4 text-muted transition group-hover:text-foreground" /></a>
            <a href={`${siteConfig.whatsapp}?text=${encodeURIComponent("I want to discuss a project with Zqtion.")}`} target="_blank" rel="noreferrer" className="panel group flex items-center justify-between gap-4 p-6" data-analytics="whatsapp_click" data-analytics-location="contact_page"><div className="flex items-center gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05]"><MessageCircle className="h-4 w-4 text-accent" /></span><div><p className="text-xs uppercase tracking-[0.15em] text-muted">WhatsApp</p><p className="mt-1 text-sm text-secondary">{siteConfig.phone}</p></div></div><ArrowUpRight className="h-4 w-4 text-muted transition group-hover:text-foreground" /></a>
            <div className="panel flex items-center gap-4 p-6"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05]"><Globe2 className="h-4 w-4 text-accent" /></span><div><p className="text-xs uppercase tracking-[0.15em] text-muted">Availability</p><p className="mt-1 text-sm text-secondary">Remote collaboration · {siteConfig.location}</p></div></div>
            <div className="contact-services"><h2 className="text-sm font-semibold text-foreground">Where we can help</h2><ul>{Object.entries(serviceLabels).map(([slug,label])=><li key={slug}><Link href={`/services#${slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-secondary underline-offset-4 hover:underline">{label}<ArrowUpRight className="h-3.5 w-3.5" /></Link></li>)}</ul></div>
            <div className="contact-expectations"><h2 className="text-sm font-semibold text-foreground">What happens next</h2><p className="mt-3 text-sm leading-6 text-secondary">We review the outcome, existing work and constraints. If we need more context, we&apos;ll ask before discussing an approach and scope.</p></div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.045] p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Before work begins</p><p className="mt-3 text-sm leading-6 text-muted">You receive a written scope, assumptions, deliverables, commercial terms, and an approval path. This form does not create a contract or request payment.</p></div>
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}
