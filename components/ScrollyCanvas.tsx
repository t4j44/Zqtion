"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FRAME_COUNT, getFrameUrl } from "@/lib/canvas-utils";

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

function HeroCopy({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "relative z-20 flex min-h-[88svh] flex-col justify-end px-5 pb-12 pt-28" : ""}>
      <p className="eyebrow">AI execution company · Working globally</p>
      <h1 className={`${compact ? "mt-5 text-5xl sm:text-6xl" : "mt-6 text-6xl md:text-7xl xl:text-[7.8rem]"} max-w-6xl text-balance font-semibold leading-[0.88] tracking-[-0.06em] text-white`}>
        Create what gets noticed. Build what gets used.
      </h1>
      <p className={`${compact ? "mt-6 text-base" : "mt-7 max-w-2xl text-lg"} text-pretty leading-7 text-white/62`}>
        Zqtion turns ambitious ideas into campaign-ready creative, focused digital products, and practical AI systems.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/work" className="button-primary">Explore the work <ArrowUpRight className="h-4 w-4" /></Link>
        <Link href="/contact" className="button-secondary">Start a project</Link>
      </div>
    </div>
  );
}

export default function ScrollyCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Array<HTMLImageElement | undefined>>(new Array(FRAME_COUNT));
  const [animated, setAnimated] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 95, damping: 28, mass: 0.2, restDelta: 0.0005 });

  const introOpacity = useTransform(smoothProgress, [0, 0.14, 0.23], [1, 1, 0]);
  const introY = useTransform(smoothProgress, [0, 0.22], [0, -34]);
  const buildOpacity = useTransform(smoothProgress, [0.29, 0.39, 0.53, 0.61], [0, 1, 1, 0]);
  const buildY = useTransform(smoothProgress, [0.29, 0.41], [28, 0]);
  const automateOpacity = useTransform(smoothProgress, [0.62, 0.73, 0.88], [0, 1, 1]);
  const automateY = useTransform(smoothProgress, [0.62, 0.76], [28, 0]);
  const progressScale = useTransform(smoothProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const slowNetwork = connection?.saveData || connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g";
    const wideEnough = window.matchMedia("(min-width: 900px)").matches;
    const frame = requestAnimationFrame(() => {
      setAnimated(Boolean(wideEnough && !reducedMotion && !slowNetwork));
    });
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  useEffect(() => {
    if (!animated) return;
    let cancelled = false;
    let loaded = 0;

    const loadFrame = (index: number) => new Promise<void>((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (!cancelled) imagesRef.current[index] = image;
        loaded += 1;
        if (!cancelled) {
          setLoadProgress(Math.round((loaded / FRAME_COUNT) * 100));
          if (index === 0) setReady(true);
        }
        resolve();
      };
      image.onerror = () => {
        loaded += 1;
        resolve();
      };
      image.src = getFrameUrl(index);
    });

    const order = [0, 28, 55, 82, 110, ...Array.from({ length: FRAME_COUNT }, (_, index) => index).filter((index) => ![0, 28, 55, 82, 110].includes(index))];
    let cursor = 0;
    const worker = async () => {
      while (!cancelled && cursor < order.length) {
        const index = order[cursor++];
        await loadFrame(index);
      }
    };

    Promise.all(Array.from({ length: 6 }, worker)).catch(() => undefined);
    return () => { cancelled = true; };
  }, [animated]);

  useEffect(() => {
    if (!animated || !ready || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let pendingFrame = 0;

    const nearestLoaded = (target: number) => {
      if (imagesRef.current[target]) return imagesRef.current[target];
      for (let distance = 1; distance < FRAME_COUNT; distance += 1) {
        const before = target - distance;
        const after = target + distance;
        if (before >= 0 && imagesRef.current[before]) return imagesRef.current[before];
        if (after < FRAME_COUNT && imagesRef.current[after]) return imagesRef.current[after];
      }
      return undefined;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      const progress = smoothProgress.get();
      const target = Math.round(progress * (FRAME_COUNT - 1));
      const image = nearestLoaded(target);
      if (!image) return;

      const imageRatio = image.naturalWidth / image.naturalHeight;
      const viewportRatio = width / height;
      let drawWidth = width;
      let drawHeight = width / imageRatio;
      if (viewportRatio < imageRatio) {
        drawHeight = height;
        drawWidth = height * imageRatio;
      }

      const zoom = 1 + Math.sin(progress * Math.PI) * 0.025;
      drawWidth *= zoom;
      drawHeight *= zoom;
      const x = (width - drawWidth) / 2;
      const y = (height - drawHeight) / 2;

      context.filter = "contrast(1.06) saturate(1.04)";
      context.fillStyle = "#050608";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, x, y, drawWidth, drawHeight);
    };

    const requestDraw = () => {
      cancelAnimationFrame(pendingFrame);
      pendingFrame = requestAnimationFrame(draw);
    };

    const unsubscribe = smoothProgress.on("change", requestDraw);
    window.addEventListener("resize", resize, { passive: true });
    resize();

    return () => {
      cancelAnimationFrame(pendingFrame);
      unsubscribe();
      window.removeEventListener("resize", resize);
    };
  }, [animated, ready, smoothProgress]);

  if (!animated) {
    return (
      <section className="relative min-h-[88svh] overflow-hidden bg-[#050608]">
        <div className="absolute inset-0 bg-[url('/sequence/frame_055.webp')] bg-cover bg-[58%_center] opacity-55" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/55 to-black/35" aria-hidden="true" />
        <div className="section-shell"><HeroCopy compact /></div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative h-[340vh] bg-black" aria-label="Zqtion introduction">
      <div className="sticky top-0 h-svh overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/68 via-black/18 to-black/20" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-black/28" aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.065] [background-image:url('data:image/svg+xml,%3Csvg_viewBox=%220_0_180_180%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%22.75%22_numOctaves=%222%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22100%25%22_height=%22100%25%22_filter=%22url(%23n)%22_opacity=%22.8%22/%3E%3C/svg%3E')]" aria-hidden="true" />

        <motion.div style={{ scaleX: progressScale }} className="absolute bottom-0 left-0 z-30 h-0.5 w-full origin-left bg-cyan-300" aria-hidden="true" />

        {!ready ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#050608]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">Preparing sequence {loadProgress}%</p>
          </div>
        ) : null}

        <div className="section-shell relative z-20 h-full">
          <motion.div style={{ opacity: introOpacity, y: introY }} className="absolute inset-x-5 bottom-14 sm:inset-x-8 sm:bottom-16 lg:inset-x-16">
            <HeroCopy />
          </motion.div>

          <motion.div style={{ opacity: buildOpacity, y: buildY }} className="absolute left-5 top-1/2 max-w-3xl -translate-y-1/2 sm:left-8 lg:left-16">
            <p className="eyebrow">Create · Build</p>
            <h2 className="mt-5 text-balance text-6xl font-semibold leading-[0.9] tracking-[-0.06em] text-white md:text-8xl">From signal to something real.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/62">Creative direction, web products, and prototypes shaped around the outcome—not around a fixed production menu.</p>
          </motion.div>

          <motion.div style={{ opacity: automateOpacity, y: automateY }} className="absolute bottom-16 right-5 max-w-3xl text-right sm:right-8 lg:bottom-20 lg:right-16">
            <p className="eyebrow justify-end">Automate · Learn</p>
            <h2 className="mt-5 text-balance text-6xl font-semibold leading-[0.9] tracking-[-0.06em] text-white md:text-8xl">Execution, automated.</h2>
            <p className="ml-auto mt-6 max-w-xl text-lg leading-8 text-white/62">Systems that accelerate repeatable work while keeping judgment, approvals, and accountability human.</p>
            <Link href="/services" className="button-primary mt-8">See how we work <ArrowDown className="h-4 w-4" /></Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
