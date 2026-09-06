"use client";

import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const compactViewport = window.matchMedia("(max-width: 767px)");
    let lenis: { raf: (time: number) => void; destroy: () => void } | undefined;
    let frame = 0;
    const tick = (time: number) => {
      lenis?.raf(time);
      frame = requestAnimationFrame(tick);
    };

    let generation = 0;
    const stop = () => {
      generation += 1;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lenis?.destroy();
      lenis = undefined;
    };
    const update = async () => {
      stop();
      if (reducedMotion.matches || coarsePointer.matches || compactViewport.matches) return;
      const currentGeneration = generation;
      const Lenis = (await import("lenis")).default;
      if (currentGeneration !== generation || reducedMotion.matches || coarsePointer.matches || compactViewport.matches) return;
      lenis = new Lenis({
        duration: 0.6,
        easing: (t) => 1 - Math.pow(1 - t, 4),
        smoothWheel: true,
        wheelMultiplier: 1,
      });
      frame = requestAnimationFrame(tick);
    };
    update();
    reducedMotion.addEventListener("change", update);
    coarsePointer.addEventListener("change", update);
    compactViewport.addEventListener("change", update);

    return () => {
      reducedMotion.removeEventListener("change", update);
      coarsePointer.removeEventListener("change", update);
      compactViewport.removeEventListener("change", update);
      stop();
    };
  }, []);

  return null;
}
