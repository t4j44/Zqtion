import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import Hero3D from "@/components/Hero3D";
import HeroFollowup from "@/components/HeroFollowup";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import SectionIntro from "@/components/SectionIntro";
import WorkReel from "@/components/WorkReel";
import { ClosingArtifact } from "@/components/CapabilityArtifacts";
import JsonLd, { getFAQSchema, getOrganizationSchema, getServicesSchema, getWebSiteSchema } from "@/components/seo/JsonLd";
import { engagements, faqs, processSteps, services } from "@/data/site";
import { featuredWork } from "@/data/work";

export const metadata: Metadata = {
  title: "Create. Build. Automate.",
  description: "Zqtion executes AI-enabled creative, focused web products, rapid MVPs, practical automation, and AI consultancy for teams worldwide.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <link rel="preload" as="image" type="image/avif" imageSrcSet="/hero/z-poster-512.avif 512w, /hero/z-poster-768.avif 768w, /hero/z-poster-1024.avif 1024w, /hero/z-poster-1280.avif 1280w" imageSizes="(max-width: 767px) min(82vw, 340px), min(26vw, 368px)" fetchPriority="high" />
      <SmoothScroll />
      <main id="main-content">
        <JsonLd schema={[getOrganizationSchema(), getWebSiteSchema(), getServicesSchema(services), getFAQSchema(faqs)]} />
        <Hero3D />
        <HeroFollowup />

        <WorkReel items={featuredWork} />

        <section style={{ "--cis": "1330px", "--cis-m": "2280px" } as React.CSSProperties} className="home-deferred relative overflow-hidden border-y border-white/10 bg-surface">
          <div className="signal-grid absolute inset-0 opacity-35" aria-hidden="true" />
          <div className="section-shell section-pad relative z-10">
            <Reveal><SectionIntro align="center" icon="services" eyebrow="Capabilities" title="Choose the outcome. The execution model follows." description="Each engagement starts with the smallest credible path to evidence. Scope expands only when the risk and value are visible." /></Reveal>
            <div className="mt-14 grid gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 md:grid-cols-2">
              {services.map((service) => (
                <Reveal variant="card" key={service.slug} className="bg-surface p-7 sm:p-9">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{service.eyebrow}</p>
                  <h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{service.title}</h3>
                  <p className="mt-4 text-base leading-7 text-muted">{service.summary}</p>
                  <div className="mt-7 flex flex-wrap gap-2">{service.capabilities.slice(0, 3).map((capability) => <span key={capability} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted">{capability}</span>)}</div>
                  <Link href={`/services#${service.slug}`} className="service-link mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent">Explore service <ArrowUpRight className="h-4 w-4" /></Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section style={{ "--cis": "1750px", "--cis-m": "2250px" } as React.CSSProperties} className="home-deferred section-shell section-pad">
          <Reveal><SectionIntro align="center" icon="process" eyebrow="Process" title="The risky part gets tested first." description="Motion, AI, and new technology can hide weak thinking. The process keeps evidence and business value ahead of production volume." /></Reveal>
          <div className="mt-14 border-t border-white/10">
            {processSteps.map((step) => (
              <Reveal key={step.number} className="grid gap-5 border-b border-white/10 py-8 md:grid-cols-[0.18fr_0.5fr_1fr] md:items-start">
                <span className="text-xs font-bold tracking-[0.18em] text-accent">{step.number}</span>
                <h3 className="text-2xl font-semibold tracking-[-0.035em]">{step.title}</h3>
                <p className="max-w-2xl text-base leading-7 text-muted">{step.text}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-20 grid gap-10 lg:mt-28 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <Reveal><SectionIntro icon="faq" eyebrow="Questions" title="What teams usually need to know first." description="Clear answers before a brief, scope, or commitment." /></Reveal>
            <div className="border-t border-white/10">
              {faqs.map((item, index) => (
                <details key={item.question} className="faq-item group border-b border-white/10">
                  <summary><span className="text-accent">{String(index + 1).padStart(2, "0")}</span><strong>{item.question}</strong><span className="faq-toggle" aria-hidden="true">+</span></summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section style={{ "--cis": "940px", "--cis-m": "1350px" } as React.CSSProperties} className="home-deferred section-shell section-pad border-t border-white/10">
          <Reveal><SectionIntro align="center" icon="engagements" eyebrow="Engagements" title="No fictional menu pricing. A scope you can evaluate." description="Cost depends on the real production, product, or integration risk. Zqtion recommends the smallest engagement that can produce a useful decision or launch." /></Reveal>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {engagements.map((item) => (
              <Reveal variant="card" key={item.name} className="panel p-7 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{item.duration}</p>
                <h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{item.name}</h3>
                <p className="mt-4 leading-7 text-muted">{item.description}</p>
                <p className="mt-7 flex items-center gap-2 text-sm text-secondary"><Check className="h-4 w-4 text-accent" /> Written scope before execution</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section style={{ "--cis": "460px", "--cis-m": "980px" } as React.CSSProperties} className="home-deferred section-shell section-pad border-t border-white/10">
          <Reveal><SectionIntro eyebrow="More from Zqtion" title="Keep exploring." /></Reveal>
          <div className="more-grid mt-12 grid gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/insights", label: "Insights", text: "Practical notes on AI creative production, product execution, and automation decisions." },
              { href: "/prompts", label: "Prompt Library", text: "Original prompts for design, image creation and building with AI." },
              { href: "/careers", label: "Launchpad", text: "A planned 12-week learning program for students and early-career builders inside an AI-native execution studio." },
              { href: "/about", label: "About Zqtion", text: "Zqtion uses AI to explore, produce, and systemize faster, with human judgment kept visible." },
            ].map((item) => (
              <Reveal key={item.href} className="more-tile bg-[var(--background)]">
                <Link href={item.href} className="group flex h-full min-h-[13rem] flex-col justify-between gap-8 p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300 sm:p-8">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.035em]">{item.label}</h3>
                    <p className="mt-4 text-sm leading-6 text-muted">{item.text}</p>
                  </div>
                  <span className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground group-hover:text-accent">Open <ArrowUpRight className="h-4 w-4" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <section style={{ "--cis": "540px", "--cis-m": "560px" } as React.CSSProperties} className="home-deferred section-shell pb-8 sm:pb-12">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-500/10 via-[var(--surface)] to-cyan-300/10 px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
            <div className="signal-grid absolute inset-0 opacity-25" aria-hidden="true" />
            <ClosingArtifact />
            <Reveal className="relative z-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div><p className="eyebrow">Start with the problem</p><h2 className="mt-6 max-w-4xl text-balance text-5xl font-semibold leading-[0.92] tracking-[-0.055em] sm:text-7xl">Tell us what <span className="font-editorial font-normal italic text-foreground">needs to change.</span></h2><p className="mt-6 max-w-2xl text-lg leading-8 text-muted">If the scope is still unclear, that is useful context. We will recommend a diagnostic, sprint, or a reason not to build yet.</p></div>
              <Link href="/contact" className="button-primary" data-analytics="service_contact_click" data-analytics-location="home_closing_cta">Send a project brief <ArrowUpRight className="h-4 w-4" /></Link>
            </Reveal>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
