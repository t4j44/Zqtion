import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import LoopVideo from "@/components/LoopVideo";
import Reveal from "@/components/Reveal";

const capabilities = [
  {
    id: "create",
    href: "/services#ai-creative-production",
    label: "Create",
    detail: "Attention, shaped",
    text: "Campaign films, product worlds, social creative, and visual systems that earn attention.",
  },
  {
    id: "build",
    href: "/services#web-products-mvps",
    label: "Build",
    detail: "Ideas, made usable",
    text: "Fast websites, product prototypes, and MVPs designed around a real user decision.",
  },
  {
    id: "automate",
    href: "/services#ai-automation-systems",
    label: "Automate",
    detail: "Repetition, engineered out",
    text: "Practical workflows that reduce repetitive work without hiding human accountability.",
  },
] as const;

export default function CapabilityArtifacts() {
  return (
    <div className="capability-artifact-grid mt-16">
      {capabilities.map((item, index) => (
        <Reveal key={item.id} delay={index * 0.07}>
          <Link href={item.href} className="capability-artifact-link block h-full rounded-[2rem]">
            <article className={`capability-artifact-card capability-artifact-card-${item.id}`}>
              <div className="capability-artifact-visual"><LoopVideo name={item.id} /></div>
              <div className="capability-artifact-copy">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/60">{item.detail}</span>
                  <span className="capability-artifact-action inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-cyan-200/70">Explore <ArrowUpRight className="h-3.5 w-3.5" /></span>
                </div>
                <h3 className="mt-5 text-4xl font-semibold tracking-[-0.05em]">{item.label}</h3>
                <p className="mt-4 text-base leading-7 text-white/52">{item.text}</p>
              </div>
            </article>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

export function ClosingArtifact() {
  return (
    <div className="closing-loop" aria-hidden="true">
      <LoopVideo name="closing" />
    </div>
  );
}
