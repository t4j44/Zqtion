"use client";

import { useEffect, useRef, useState } from "react";
import { storyLayouts, storyPoint } from "@/lib/story-layout";

const chapters = [
  { label: "Create", title: "An idea finds its form.", text: "References, storyboards and visual experiments become a clear creative signal." },
  { label: "Build", title: "The form becomes useful.", text: "Creative decisions become interfaces and focused products that people can actually use." },
  { label: "Automate", title: "Useful becomes repeatable.", text: "Connect the workflow, reduce repetitive work and keep people in control of important decisions." },
  { label: "Zqtion", title: "One execution system.", text: "Create the signal. Build the experience. Automate what repeats." },
];

type NetworkInformation = EventTarget & { saveData?: boolean; effectiveType?: string };

export default function ExecutionStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const piecesRef = useRef<(HTMLSpanElement | null)[]>([]);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const update = () => {
      const slowNetwork = connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
      setMotionEnabled(!reducedMotion.matches && !connection?.saveData && !slowNetwork);
    };
    update();
    reducedMotion.addEventListener("change", update);
    connection?.addEventListener("change", update);
    return () => {
      reducedMotion.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const scene = sceneRef.current;
    if (!section || !scene) return;
    let frame = 0;
    let width = scene.clientWidth;
    let height = scene.clientHeight;
    const update = () => {
      frame = 0;
      if (document.hidden) return;
      const bounds = section.getBoundingClientRect();
      if (motionEnabled && (bounds.bottom < 0 || bounds.top > innerHeight)) return;
      const progress = motionEnabled ? Math.max(0, Math.min(3, (innerHeight * .28 - bounds.top) / Math.max(1, bounds.height - innerHeight * .72) * 3)) : 3;
      const scale = Math.min(1.25, width / 360, height / 300);
      piecesRef.current.forEach((piece, index) => {
        if (!piece) return;
        const [x, y, rotation, sx, sy] = storyPoint(progress, index);
        piece.style.transform = `translate3d(${x * scale}px, ${y * scale}px, 0) rotate(${rotation}deg) scale(${sx * scale}, ${sy * scale})`;
      });
      scene.style.setProperty("--connection-opacity", String(Math.max(0, 1 - Math.abs(progress - 2) * 1.8)));
      scene.dataset.phase = chapters[Math.round(progress)].label.toLowerCase();
      if (labelRef.current) labelRef.current.textContent = `${String(Math.round(progress) + 1).padStart(2, "0")} / ${chapters[Math.round(progress)].label}`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(() => { width = scene.clientWidth; height = scene.clientHeight; schedule(); });
    resize.observe(scene);
    update();
    if (motionEnabled) {
      window.addEventListener("scroll", schedule, { passive: true });
      document.addEventListener("visibilitychange", schedule);
    }
    return () => { cancelAnimationFrame(frame); resize.disconnect(); window.removeEventListener("scroll", schedule); document.removeEventListener("visibilitychange", schedule); };
  }, [motionEnabled]);

  return <section className="execution-story section-shell" ref={sectionRef} aria-label="Create, Build, Automate: one execution system">
    <div className="execution-story-visual" aria-hidden="true"><div className="execution-story-pin"><div className="execution-scene" ref={sceneRef} data-phase="create">
      <div className="execution-scene-grid" />
      <svg className="execution-connections" viewBox="0 0 360 300" fill="none"><path d="M69 67H291M69 150H291M69 233H291M69 67V233M180 67V233M291 67V233M69 67L291 233M291 67L69 233" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" /></svg>
      {storyLayouts[0].map(([x, y, rotation, sx, sy], index) => <span key={index} className="execution-piece" ref={(element) => { piecesRef.current[index] = element; }} style={{ transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${sx}, ${sy})` }}><i /></span>)}
      <div className="execution-scene-caption"><span ref={labelRef}>01 / Create</span><span>Same thinking. Different forms.</span></div>
    </div></div></div>
    <ol className="execution-chapters">{chapters.map((chapter, index) => <li key={chapter.label}><p className="eyebrow">0{index + 1} / {chapter.label}</p><h2>{chapter.title}</h2><p>{chapter.text}</p></li>)}</ol>
  </section>;
}
