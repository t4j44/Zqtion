import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionIntro from "@/components/SectionIntro";
import JsonLd, { getBreadcrumbSchema, getServicesSchema } from "@/components/seo/JsonLd";
import { engagements, services } from "@/data/site";

export const metadata: Metadata = {
  title: "Services",
  description: "AI creative production, web products, rapid MVPs, AI automation, and practical AI consultancy from Zqtion.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <main id="main-content">
      <JsonLd schema={[getServicesSchema(services), getBreadcrumbSchema([{ name: "Home", url: "https://zqtion.com" }, { name: "Services", url: "https://zqtion.com/services" }])]} />
      <PageHero eyebrow="Services" title="Execution shaped around the outcome." description="Zqtion combines creative production, product building, and practical automation. Each project begins with evidence, constraints, and the smallest credible next move." primary={{ href: "/contact", label: "Discuss a project" }} secondary={{ href: "/work", label: "View the work" }} />

      <section className="section-shell pb-24 sm:pb-32">
        <div className="border-t border-white/10">
          {services.map((service, index) => (
            <article key={service.slug} id={service.slug} className="scroll-mt-28 border-b border-white/10 py-16 sm:py-20">
              <Reveal className="grid gap-10 lg:grid-cols-[0.34fr_0.66fr]">
                <div><p className="text-xs font-bold tracking-[0.18em] text-cyan-300">0{index + 1} · {service.eyebrow}</p><h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">{service.title}</h2></div>
                <div className="grid gap-8">
                  <p className="max-w-3xl text-xl leading-8 text-white/62">{service.summary}</p>
                  <div className="grid gap-8 sm:grid-cols-2">
                    <div><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Capabilities</h3><ul className="mt-5 grid gap-3">{service.capabilities.map((item) => <li key={item} className="flex items-start gap-3 text-sm text-white/62"><Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />{item}</li>)}</ul></div>
                    <div><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Designed to produce</h3><ul className="mt-5 grid gap-3">{service.outcomes.map((item) => <li key={item} className="flex items-start gap-3 text-sm text-white/62"><Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />{item}</li>)}</ul></div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">A fit for</p><p className="mt-3 text-sm leading-6 text-white/56">{service.idealFor}</p></div>
                  <Link href={`/contact?service=${service.slug}`} className="inline-flex w-fit items-center gap-2 text-sm font-semibold hover:text-cyan-300">Brief this service <ArrowUpRight className="h-4 w-4" /></Link>
                </div>
              </Reveal>
            </article>
          ))}
        </div>
      </section>

      <section id="engagements" className="scroll-mt-24 border-y border-white/10 bg-white/[0.02]">
        <div className="section-shell section-pad">
          <Reveal><SectionIntro eyebrow="Commercial model" title="Scope first. Quote second." description="Publishing an arbitrary low starting price would hide the real production and technical differences between projects. Zqtion provides a written scope and quote after the problem is understood." /></Reveal>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">{engagements.map((item) => <Reveal key={item.name} className="panel p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">{item.duration}</p><h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{item.name}</h3><p className="mt-4 leading-7 text-white/52">{item.description}</p></Reveal>)}</div>
        </div>
      </section>

      <section className="section-shell section-pad"><Reveal className="panel grid gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="eyebrow">Not sure which service?</p><h2 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Start with the outcome, not the label.</h2><p className="mt-5 max-w-2xl leading-7 text-white/52">Send the current situation, desired change, and deadline. If a smaller diagnostic is the better first step, that is what we will recommend.</p></div><div className="flex flex-wrap gap-3"><Link href="/ai-audit" className="button-secondary" data-analytics="ai_audit_click" data-analytics-location="services_cta">Explore the AI audit</Link><Link href="/contact" className="button-primary" data-analytics="service_contact_click" data-analytics-location="services_cta">Send the brief <ArrowUpRight className="h-4 w-4" /></Link></div></Reveal></section>
      <Footer />
    </main>
  );
}
