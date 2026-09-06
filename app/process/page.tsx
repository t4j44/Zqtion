import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, X } from "lucide-react";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { processSteps } from "@/data/site";

export const metadata: Metadata = { title: "Process", description: "How Zqtion frames, prototypes, executes, launches, and learns without using AI speed to hide weak decisions.", alternates: { canonical: "/process" } };

export default function ProcessPage() {
  return (
    <main id="main-content">
      <PageHero eyebrow="Process" title="Speed after the hard question." description="The fastest production loop is expensive when it is aimed at the wrong outcome. Zqtion tests the riskiest assumption first, then scales the work that earns confidence." primary={{ href: "/contact", label: "Bring a problem" }} />
      <section className="section-shell pb-24 sm:pb-32">
        <div className="border-t border-white/10">{processSteps.map((step) => <Reveal key={step.number} className="grid gap-7 border-b border-white/10 py-12 lg:grid-cols-[0.16fr_0.42fr_1fr]"><p className="text-xs font-bold tracking-[0.18em] text-cyan-300">{step.number}</p><h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{step.title}</h2><p className="max-w-2xl text-lg leading-8 text-white/55">{step.text}</p></Reveal>)}</div>
      </section>
      <section className="border-y border-white/10 bg-white/[0.02]"><div className="section-shell section-pad"><Reveal><p className="eyebrow">Decision gates</p><h2 className="mt-6 max-w-5xl text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl">Every stage has a reason to continue—or stop.</h2></Reveal><div className="mt-14 grid gap-5 lg:grid-cols-3">{[
        { title: "Before production", yes: "The audience, outcome, owner, and constraint are clear.", no: "The project is only a desired format or trend." },
        { title: "Before expansion", yes: "The risky interaction, shot, or workflow has passed a focused test.", no: "More volume is being used to avoid a weak prototype." },
        { title: "Before launch", yes: "Delivery, ownership, monitoring, accessibility, and rollback are known.", no: "The demo works only under ideal conditions." },
      ].map((gate) => <Reveal key={gate.title} className="panel p-7"><h3 className="text-2xl font-semibold tracking-[-0.035em]">{gate.title}</h3><p className="mt-6 flex gap-3 text-sm leading-6 text-white/58"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />{gate.yes}</p><p className="mt-4 flex gap-3 text-sm leading-6 text-white/42"><X className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />{gate.no}</p></Reveal>)}</div></div></section>
      <section className="section-shell section-pad"><Reveal className="panel grid gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="eyebrow">The first conversation</p><h2 className="mt-6 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">You do not need a perfect brief.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-white/54">Send the current situation, desired change, existing assets, deadline, and who decides. We will identify what is missing.</p></div><Link href="/contact" className="button-primary" data-analytics="service_contact_click" data-analytics-location="process_cta">Start the brief <ArrowUpRight className="h-4 w-4" /></Link></Reveal></section>
      <Footer />
    </main>
  );
}
