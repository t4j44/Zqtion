import CapabilityArtifacts from "@/components/CapabilityArtifacts";
import ExecutionStory from "@/components/ExecutionStory";
import Reveal from "@/components/Reveal";
import SectionIntro from "@/components/SectionIntro";

export default function HeroFollowup() {
  return (
    <div className="hero-followup-deferred relative isolate bg-[#050608]">
      <section className="hero-proof-strip relative z-20 border-y border-white/10 bg-[#050608]/96">
        <div className="section-shell flex flex-col gap-4 py-6 text-xs font-semibold uppercase tracking-[0.16em] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <span>Founder-led</span><span>Creative production</span><span>Web products</span><span>AI automation</span><span>Remote collaboration</span>
        </div>
      </section>
      <ExecutionStory />
      <section className="hero-operating-section section-shell section-pad relative z-20">
        <Reveal>
          <SectionIntro
            eyebrow="The operating model"
            title={<>One company across the gap between <span className="font-editorial font-normal italic text-white/90">idea and execution.</span></>}
            description="Most teams do not need another strategy deck or a disconnected production vendor. They need a small, senior execution loop that can create the signal, build the experience, and automate what repeats."
          />
        </Reveal>
        <CapabilityArtifacts />
      </section>
    </div>
  );
}
