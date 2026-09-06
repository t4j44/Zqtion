import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, MoveRight } from "lucide-react";
import Hero3D from "@/components/Hero3D";
import HeroFollowup from "@/components/HeroFollowup";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import SectionIntro from "@/components/SectionIntro";
import WorkCard from "@/components/WorkCard";
import { ClosingArtifact } from "@/components/CapabilityArtifacts";
import JsonLd, { getFAQSchema, getOrganizationSchema, getServicesSchema, getWebSiteSchema } from "@/components/seo/JsonLd";
import { engagements, faqs, processSteps, services } from "@/data/site";
import { featuredWork } from "@/data/work";
import { insights } from "@/data/insights";

export const metadata: Metadata = {
  title: "Create. Build. Automate.",
  description: "Zqtion executes AI-enabled creative, focused web products, rapid MVPs, practical automation, and AI consultancy for teams worldwide.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <SmoothScroll />
      <main id="main-content">
        <JsonLd schema={[getOrganizationSchema(), getWebSiteSchema(), getServicesSchema(services), getFAQSchema(faqs)]} />
        <Hero3D />
        <HeroFollowup />

        <section className="home-deferred section-shell section-pad border-t border-white/10">
          <Reveal className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <SectionIntro eyebrow="Selected work" title="Proof with the relationship made clear." description="Competition entries, founder-venture work, and independent experiments are labeled—not passed off as client results." />
            <Link href="/work" className="button-secondary shrink-0" data-analytics="work_view" data-analytics-location="home_selected_work">All work <ArrowRight className="h-4 w-4" /></Link>
          </Reveal>
          <div className="home-work-grid mt-14 grid gap-6 md:grid-cols-2">
            {featuredWork.map((item, index) => <Reveal variant="visual" key={item.slug} delay={(index % 2) * 0.06}><WorkCard item={item} index={index} /></Reveal>)}
          </div>
        </section>

        <section className="home-deferred relative overflow-hidden border-y border-white/10 bg-[#080a0e]">
          <div className="signal-grid absolute inset-0 opacity-35" aria-hidden="true" />
          <div className="section-shell section-pad relative z-10">
            <Reveal><SectionIntro eyebrow="Capabilities" title="Choose the outcome. The execution model follows." description="Each engagement starts with the smallest credible path to evidence. Scope expands only when the risk and value are visible." /></Reveal>
            <div className="mt-14 grid gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 md:grid-cols-2">
              {services.map((service) => (
                <Reveal variant="card" key={service.slug} className="bg-[#080a0e] p-7 sm:p-9">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{service.eyebrow}</p>
                  <h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{service.title}</h3>
                  <p className="mt-4 text-base leading-7 text-white/52">{service.summary}</p>
                  <div className="mt-7 flex flex-wrap gap-2">{service.capabilities.slice(0, 3).map((capability) => <span key={capability} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/48">{capability}</span>)}</div>
                  <Link href={`/services#${service.slug}`} className="service-link mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-cyan-300">Explore service <ArrowUpRight className="h-4 w-4" /></Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="home-deferred section-shell section-pad">
          <Reveal><SectionIntro eyebrow="Process" title="The risky part gets tested first." description="Motion, AI, and new technology can hide weak thinking. The process keeps evidence and business value ahead of production volume." /></Reveal>
          <div className="mt-14 border-t border-white/10">
            {processSteps.map((step) => (
              <Reveal key={step.number} className="grid gap-5 border-b border-white/10 py-8 md:grid-cols-[0.18fr_0.5fr_1fr] md:items-start">
                <span className="text-xs font-bold tracking-[0.18em] text-cyan-300">{step.number}</span>
                <h3 className="text-2xl font-semibold tracking-[-0.035em]">{step.title}</h3>
                <p className="max-w-2xl text-base leading-7 text-white/52">{step.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="home-deferred section-shell section-pad border-t border-white/10">
          <Reveal><SectionIntro eyebrow="Engagements" title="No fictional menu pricing. A scope you can evaluate." description="Cost depends on the real production, product, or integration risk. Zqtion recommends the smallest engagement that can produce a useful decision or launch." /></Reveal>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {engagements.map((item) => (
              <Reveal variant="card" key={item.name} className="panel p-7 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">{item.duration}</p>
                <h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{item.name}</h3>
                <p className="mt-4 leading-7 text-white/52">{item.description}</p>
                <p className="mt-7 flex items-center gap-2 text-sm text-white/66"><Check className="h-4 w-4 text-cyan-300" /> Written scope before execution</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="home-deferred border-y border-white/10 bg-white/[0.02]">
          <div className="section-shell section-pad">
            <Reveal className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <SectionIntro eyebrow="Point of view" title="AI speed is useful only when judgment stays visible." />
              <div className="grid gap-6 text-lg leading-8 text-white/58">
                <p>Zqtion uses AI to explore, produce, and systemize faster. It does not use AI as an excuse for unsupported claims, invisible automation, or generic work.</p>
                <p>Independent concepts are disclosed. Product assumptions are tested. Important approvals remain human. That discipline matters more than the number of tools in the stack.</p>
                <Link href="/about" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white hover:text-cyan-300">About Zqtion <MoveRight className="h-4 w-4" /></Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="home-deferred section-shell section-pad">
          <Reveal className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"><SectionIntro eyebrow="Insights" title="Useful answers, not content volume." description="Practical notes on AI creative production, product execution, and automation decisions." /><Link href="/insights" className="button-secondary shrink-0">All insights <ArrowRight className="h-4 w-4" /></Link></Reveal>
          <div className="mt-14 grid gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 lg:grid-cols-3">
            {insights.map((article) => (
              <Reveal key={article.slug} className="group bg-[#050608] p-7 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">{article.category} · {article.readTime}</p>
                <h3 className="mt-6 text-2xl font-semibold leading-tight tracking-[-0.035em] group-hover:text-cyan-100">{article.title}</h3>
                <p className="mt-4 text-sm leading-6 text-white/48">{article.description}</p>
                <Link href={`/insights/${article.slug}`} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">Read article <ArrowUpRight className="h-4 w-4" /></Link>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="home-deferred section-shell section-pad border-t border-white/10">
          <Reveal><SectionIntro eyebrow="Questions" title="What teams usually need to know first." description="Clear answers before a brief, scope, or commitment." /></Reveal>
          <div className="mt-12 border-t border-white/10">
            {faqs.map((item, index) => (
              <details key={item.question} className="faq-item group border-b border-white/10">
                <summary><span className="text-cyan-300">{String(index + 1).padStart(2, "0")}</span><strong>{item.question}</strong><span className="faq-toggle" aria-hidden="true">+</span></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="home-deferred section-shell launchpad-teaser">
          <div><p className="eyebrow">Build with us</p><h2>Start before <span className="font-editorial font-normal">you feel ready.</span></h2><p>Zqtion Launchpad is a planned 12-week learning program for students and early-career builders inside an AI-native execution studio.</p><p className="text-sm">14 tracks · Up to 3 places per track · Remote-first · Part-time · Unpaid</p></div>
          <Link href="/careers" className="button-secondary">Explore Launchpad <ArrowUpRight className="h-4 w-4" /></Link>
        </section>

        <section className="home-deferred section-shell pb-8 sm:pb-12">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-500/22 via-[#0a0d14] to-cyan-300/10 px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
            <div className="signal-grid absolute inset-0 opacity-25" aria-hidden="true" />
            <ClosingArtifact />
            <Reveal className="relative z-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div><p className="eyebrow">Start with the problem</p><h2 className="mt-6 max-w-4xl text-balance text-5xl font-semibold leading-[0.92] tracking-[-0.055em] sm:text-7xl">Tell us what <span className="font-editorial font-normal italic text-white/92">needs to change.</span></h2><p className="mt-6 max-w-2xl text-lg leading-8 text-white/58">If the scope is still unclear, that is useful context. We will recommend a diagnostic, sprint, or a reason not to build yet.</p></div>
              <Link href="/contact" className="button-primary" data-analytics="service_contact_click" data-analytics-location="home_closing_cta">Send a project brief <ArrowUpRight className="h-4 w-4" /></Link>
            </Reveal>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
