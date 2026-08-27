import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionIntro from "@/components/SectionIntro";
import { siteConfig, team } from "@/data/site";

export const metadata: Metadata = { title: "About", description: "Zqtion is a founder-led AI execution company working globally across creative production, product building, and practical automation.", alternates: { canonical: "/about" } };

export default function AboutPage() {
  return (
    <main id="main-content">
      <PageHero eyebrow="About Zqtion" title="Independent by design. Accountable by default." description="Zqtion is a founder-led AI execution company working globally across creative, digital products, and automation with a small-team operating model and explicit project truth." primary={{ href: "/contact", label: "Work with Zqtion" }} secondary={{ href: siteConfig.linkedin, label: "LinkedIn" }} />
      <section className="section-shell section-pad border-t border-white/10"><Reveal className="grid gap-10 lg:grid-cols-[0.65fr_1fr]"><SectionIntro eyebrow="Why it exists" title="The space between a deck and a shipped result." /><div className="grid gap-6 text-lg leading-8 text-white/58"><p>AI has reduced the cost of producing options. It has not removed the need for direction, product judgment, narrative, quality control, or honest claims.</p><p>Zqtion exists to close that execution gap: framing the outcome, testing the risk, producing the work, and building systems that the client or team can understand after launch.</p><p>The company is intentionally early. Public work includes independent concepts, a competition entry, creative experiments, and founder-venture execution. Those relationships are disclosed rather than presented as a larger client history.</p></div></Reveal></section>
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="section-shell section-pad">
          <Reveal>
            <SectionIntro
              eyebrow="Team"
              title="A small core with a clear role."
              description="A lean multidisciplinary team combining strategy, creative production, post-production and engineering."
            />
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {team.map((member, index) => (
              <Reveal key={member.name} delay={index * 0.08} className="h-full">
                <div className="panel h-full flex items-start gap-5 sm:gap-6 p-7 sm:p-8 transition-all duration-300 ease-out hover:border-cyan-300/30 hover:bg-white/[0.035] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 motion-reduce:transition-none">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] text-sm font-bold text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    {member.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300 leading-relaxed">
                      {member.role}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">
                      {member.name}
                    </h3>
                    <p className="mt-4 leading-7 text-white/52 text-pretty">
                      {member.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section-shell section-pad"><Reveal><SectionIntro eyebrow="Principles" title="What should remain true as Zqtion grows." /></Reveal><div className="mt-12 grid gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 md:grid-cols-2">{[
        ["Evidence over theatre", "Do not turn experiments into client claims or prototypes into production results."],
        ["Human judgment stays named", "AI can accelerate output; ownership and important approvals cannot disappear."],
        ["Prototype before scale", "Test the fragile part before creating a large inventory of work."],
        ["Speed includes performance", "A rich experience that is slow, inaccessible, or fragile is not finished."],
      ].map(([title, text]) => <Reveal key={title} className="bg-[#050608] p-8"><h3 className="text-2xl font-semibold tracking-[-0.035em]">{title}</h3><p className="mt-4 leading-7 text-white/52">{text}</p></Reveal>)}</div></section>
      <section className="section-shell pb-12"><Reveal className="panel flex flex-col gap-8 p-8 sm:p-12 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow">Remote by design · Working globally</p><h2 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Build with a small team that shows its assumptions.</h2></div><Link href="/contact" className="button-primary shrink-0">Start a conversation <ArrowUpRight className="h-4 w-4" /></Link></Reveal></section>
      <Footer />
    </main>
  );
}
