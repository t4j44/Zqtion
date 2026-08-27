import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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

function CreateArtifact() {
  return (
    <div className="artifact-scene artifact-create" aria-hidden="true">
      <span className="artifact-aura" />
      <span className="create-plane create-plane-back" />
      <span className="create-plane create-plane-middle" />
      <span className="create-plane create-plane-front">
        <i />
        <b />
      </span>
      <span className="create-lens" />
    </div>
  );
}

function BuildArtifact() {
  return (
    <div className="artifact-scene artifact-build" aria-hidden="true">
      <span className="artifact-aura" />
      <span className="build-window build-window-back" />
      <span className="build-window build-window-middle" />
      <span className="build-window build-window-front">
        <i className="build-window-bar" />
        <i className="build-window-copy" />
        <i className="build-window-card build-window-card-one" />
        <i className="build-window-card build-window-card-two" />
      </span>
      <span className="build-cursor" />
    </div>
  );
}

function AutomateArtifact() {
  return (
    <div className="artifact-scene artifact-automate" aria-hidden="true">
      <span className="artifact-aura" />
      <span className="automate-core"><i /></span>
      <span className="automate-orbit automate-orbit-one"><i /></span>
      <span className="automate-orbit automate-orbit-two"><i /></span>
      <span className="automate-orbit automate-orbit-three"><i /></span>
      <span className="automate-signal automate-signal-one" />
      <span className="automate-signal automate-signal-two" />
    </div>
  );
}

const visuals = {
  create: <CreateArtifact />,
  build: <BuildArtifact />,
  automate: <AutomateArtifact />,
};

export default function CapabilityArtifacts() {
  return (
    <div className="capability-artifact-grid mt-16">
      {capabilities.map((item, index) => (
        <Reveal key={item.id} delay={index * 0.07}>
          <Link href={item.href} className="capability-artifact-link block h-full rounded-[2rem]" aria-label={`Explore ${item.label} services`}>
            <article className={`capability-artifact-card capability-artifact-card-${item.id}`}>
              <div className="capability-artifact-visual">{visuals[item.id]}</div>
              <div className="capability-artifact-copy">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/38">{item.detail}</span>
                  <span className="capability-artifact-action inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-cyan-200/70">Explore <ArrowUpRight className="h-3.5 w-3.5" /></span>
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
    <div className="closing-artifact" aria-hidden="true">
      <span className="closing-artifact-ring closing-artifact-ring-one" />
      <span className="closing-artifact-ring closing-artifact-ring-two" />
      <span className="closing-artifact-core"><i /></span>
      <span className="closing-artifact-node closing-artifact-node-one" />
      <span className="closing-artifact-node closing-artifact-node-two" />
    </div>
  );
}
