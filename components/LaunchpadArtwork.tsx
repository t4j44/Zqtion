import { ArrowUpRight } from "lucide-react";

/** Decorative, server-rendered artwork: no canvas, animation loop or image request. */
export default function LaunchpadArtwork() {
  return (
    <div className="launchpad-art" aria-hidden="true">
      <div className="launchpad-orbit launchpad-orbit-one" />
      <div className="launchpad-orbit launchpad-orbit-two" />
      <div className="launchpad-art-axis" />
      <div className="launchpad-core"><ArrowUpRight strokeWidth={1.1} /><span>YOUR NEXT<br />CHAPTER</span></div>
      <span className="launchpad-art-tag launchpad-art-tag-one">01 / Creative</span>
      <span className="launchpad-art-tag launchpad-art-tag-two">02 / Growth</span>
      <span className="launchpad-art-tag launchpad-art-tag-three">03 / Intelligence</span>
      <span className="launchpad-art-tag launchpad-art-tag-four">04 / Technology</span>
      <span className="launchpad-art-caption">A place to start. A standard to grow into.</span>
    </div>
  );
}
