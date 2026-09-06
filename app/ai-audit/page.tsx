import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, X } from "lucide-react";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionIntro from "@/components/SectionIntro";

export const metadata: Metadata = { title: "AI opportunity audit", description: "A practical Zqtion audit for identifying useful AI creative, product, and automation opportunities before committing to a large build.", alternates: { canonical: "/ai-audit" } };

export default function AiAuditPage() {
  return (
    <main id="main-content">
      <PageHero eyebrow="AI opportunity audit" title="Find the useful AI project before funding the impressive one." description="A focused diagnostic for small teams with multiple AI ideas, unclear priorities, or a workflow they suspect should be faster." primary={{ href: "/contact?service=ai-strategy-prototyping", label: "Request the audit" }} />
      <section className="section-shell section-pad border-t border-white/10"><Reveal><SectionIntro eyebrow="The problem" title="Most AI roadmaps start too late." description="Teams often choose a tool, vendor, or agent architecture before documenting the user, workflow, data, exception rate, and cost of the current problem." /></Reveal><div className="mt-14 grid gap-5 lg:grid-cols-2"><Reveal className="panel p-7"><p className="flex items-center gap-3 text-lg font-semibold"><X className="h-5 w-5 text-rose-300" />What the audit is not</p><ul className="mt-6 grid gap-3 text-sm leading-6 text-white/52"><li>A generic list of AI tools</li><li>A promise that every workflow should be automated</li><li>A full software build hidden inside a discovery phase</li><li>A strategy deck with no next decision</li></ul></Reveal><Reveal className="panel p-7"><p className="flex items-center gap-3 text-lg font-semibold"><Check className="h-5 w-5 text-emerald-300" />What it should produce</p><ul className="mt-6 grid gap-3 text-sm leading-6 text-white/52"><li>A map of the current workflow or opportunity</li><li>Prioritized use cases with risks and dependencies</li><li>A build, prototype, manual-test, or stop recommendation</li><li>A bounded next-step scope</li></ul></Reveal></div></section>
      <section className="border-y border-white/10 bg-white/[0.02]"><div className="section-shell section-pad"><Reveal><SectionIntro eyebrow="Evaluation" title="Five questions decide whether the idea deserves a prototype." /></Reveal><div className="mt-12 border-t border-white/10">{[
        ["User", "Who experiences the problem, and how often?"], ["Value", "What time, delay, cost, risk, or missed revenue does it create?"], ["Data", "Are the inputs available, lawful to use, and consistent enough to check?"], ["Control", "Where must a person approve, correct, or stop the system?"], ["Evidence", "What result would justify continuing after a small test?"],
      ].map(([label, question], index) => <Reveal key={label} className="grid gap-4 border-b border-white/10 py-7 md:grid-cols-[0.18fr_0.35fr_1fr]"><span className="text-xs font-bold text-cyan-300">0{index + 1}</span><h3 className="text-xl font-semibold">{label}</h3><p className="text-base leading-7 text-white/52">{question}</p></Reveal>)}</div></div></section>
      <section className="section-shell section-pad"><Reveal className="panel flex flex-col gap-8 p-8 sm:p-12 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow">Request a diagnostic</p><h2 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Send the workflows or ideas competing for attention.</h2><p className="mt-5 max-w-2xl leading-7 text-white/52">Zqtion will confirm the proposed audit scope and commercial terms before any work begins.</p></div><Link href="/contact?service=ai-strategy-prototyping" className="button-primary shrink-0" data-analytics="service_contact_click" data-analytics-location="ai_audit_cta">Start the brief <ArrowUpRight className="h-4 w-4" /></Link></Reveal></section>
      <Footer />
    </main>
  );
}
