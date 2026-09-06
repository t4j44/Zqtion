"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { isWebGLMode, selectHeroRenderMode, type HeroRenderMode } from "@/lib/hero-mode";

const HeroWebGLScene = lazy(() => import("./HeroWebGLScene"));

type NetworkInformation = EventTarget & { saveData?: boolean; effectiveType?: string };
type NavigatorWithConnection = Navigator & { connection?: NetworkInformation; deviceMemory?: number };
type WebGLMode = Extract<HeroRenderMode, "desktop-webgl">;

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true })
      || canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    if (!context) return false;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function StaticScene() {
  return (
    <div className="hero-3d-static" aria-hidden="true">
      <div className="hero-3d-static-planet" />
      <div className="hero-3d-static-orbit hero-3d-static-orbit-one" />
      <div className="hero-3d-static-orbit hero-3d-static-orbit-two" />
      <div className="hero-poster-frame">
        <div className="hero-poster-object">
          <picture>
            <source media="(max-width: 767px)" type="image/avif" srcSet="/hero/z-poster-512.avif" />
            <source media="(max-width: 767px)" type="image/webp" srcSet="/hero/z-poster-512.webp" />
            <source
              type="image/avif"
              srcSet="/hero/z-poster-768.avif 768w, /hero/z-poster-1280.avif 1280w"
              sizes="min(26vw, 368px)"
            />
            <source
              type="image/webp"
              srcSet="/hero/z-poster-768.webp 768w, /hero/z-poster-1280.webp 1280w"
              sizes="min(26vw, 368px)"
            />
            <img
              className="hero-poster-image"
              src="/hero/z-poster-512.webp"
              width="512"
              height="512"
              alt=""
              decoding="sync"
              fetchPriority="high"
              draggable="false"
            />
          </picture>
          <span className="hero-poster-highlight" />
        </div>
      </div>
      <span className="hero-3d-static-node hero-3d-static-node-one" />
      <span className="hero-3d-static-node hero-3d-static-node-two" />
      <span className="hero-3d-static-node hero-3d-static-node-three" />
    </div>
  );
}

function SceneStage({
  mode,
  sceneReady,
  sceneFailed,
  onReady,
  onError,
}: {
  mode: HeroRenderMode;
  sceneReady: boolean;
  sceneFailed: boolean;
  onReady: () => void;
  onError: () => void;
}) {
  const interactionRef = useRef<HTMLDivElement>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pointerFrame = useRef(0);
  const gesture = useRef({ active: false, id: -1, startX: 0, startY: 0, vertical: false });
  const interactive = mode !== "static" && !sceneFailed;
  const webglEnabled = isWebGLMode(mode) && !sceneFailed;

  useEffect(() => () => {
    clearTimeout(pulseTimer.current);
    cancelAnimationFrame(pointerFrame.current);
  }, []);

  const resetPointer = () => {
    cancelAnimationFrame(pointerFrame.current);
    interactionRef.current?.style.setProperty("--hero-pointer-x", "0");
    interactionRef.current?.style.setProperty("--hero-pointer-y", "0");
  };
  const queuePointer = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!interactive || (event.pointerType === "touch" && !gesture.current.active)) return;
    if (gesture.current.active) {
      const dx = event.clientX - gesture.current.startX;
      const dy = event.clientY - gesture.current.startY;
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        gesture.current.vertical = true;
        resetPointer();
        return;
      }
      if (gesture.current.vertical) return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
    cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = requestAnimationFrame(() => {
      interactionRef.current?.style.setProperty("--hero-pointer-x", x.toFixed(3));
      interactionRef.current?.style.setProperty("--hero-pointer-y", y.toFixed(3));
    });
  };
  const endGesture = () => {
    gesture.current.active = false;
    gesture.current.id = -1;
    gesture.current.vertical = false;
    resetPointer();
  };
  const pulse = () => {
    const surface = interactionRef.current;
    if (!surface) return;
    clearTimeout(pulseTimer.current);
    surface.dataset.lit = "true";
    pulseTimer.current = setTimeout(() => { delete surface.dataset.lit; }, 400);
  };

  return (
    <div className={`hero-3d-stage hero-3d-local-stage ${sceneReady ? "hero-3d-scene-ready" : ""}`}>
      <div ref={interactionRef} className="hero-interaction-surface">
        <div className="hero-3d-stage-grid" aria-hidden="true" />
        <StaticScene />
        {webglEnabled ? (
          <Suspense fallback={null}>
            <HeroWebGLScene
              key={mode}
              mode={mode as WebGLMode}
              onReady={onReady}
              onError={onError}
            />
          </Suspense>
        ) : null}
        <div className="hero-3d-vignette" aria-hidden="true" />
        <div className="hero-interaction-glow" aria-hidden="true" />
        <div className="hero-3d-label hero-3d-label-create"><span />Create</div>
        <div className="hero-3d-label hero-3d-label-build"><span />Build</div>
        <div className="hero-3d-label hero-3d-label-automate"><span />Automate</div>
        {interactive ? (
          <button
            type="button"
            className="hero-illuminate"
            aria-label="Illuminate the Z artwork"
            onPointerDown={(event) => {
              gesture.current = {
                active: true,
                id: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                vertical: false,
              };
              queuePointer(event);
            }}
            onPointerMove={queuePointer}
            onPointerUp={endGesture}
            onPointerCancel={endGesture}
            onPointerLeave={(event) => { if (event.pointerType !== "touch") resetPointer(); }}
            onClick={pulse}
          />
        ) : null}
      </div>
    </div>
  );
}

export default function Hero3D() {
  const heroRef = useRef<HTMLElement>(null);
  const modeRef = useRef<HeroRenderMode>("static");
  const [mode, setMode] = useState<HeroRenderMode>("static");
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    let timer = 0;
    let idle = 0;
    const enableAmbientMotion = () => { hero.dataset.ambient = "true"; };
    timer = window.setTimeout(() => {
      if (window.requestIdleCallback) idle = window.requestIdleCallback(enableAmbientMotion, { timeout: 2_000 });
      else enableAmbientMotion();
    }, 3_000);
    return () => {
      window.clearTimeout(timer);
      if (idle) window.cancelIdleCallback?.(idle);
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    let inView = true;
    const update = () => { hero.dataset.motionPaused = String(!inView || document.hidden); };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); });
    observer.observe(hero);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    const profile = navigator as NavigatorWithConnection;
    const connection = profile.connection;
    const compactQuery = window.matchMedia("(max-width: 767px)");
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let webglSupported: boolean | undefined;
    const updateMode = () => {
      const mayUseWebGL = !compactQuery.matches
        && !coarsePointerQuery.matches
        && !reducedMotionQuery.matches
        && !connection?.saveData
        && connection?.effectiveType !== "2g"
        && connection?.effectiveType !== "slow-2g";
      if (mayUseWebGL && webglSupported === undefined) webglSupported = supportsWebGL();
      const nextMode = selectHeroRenderMode({
        viewportWidth: window.innerWidth,
        coarsePointer: coarsePointerQuery.matches,
        reducedMotion: reducedMotionQuery.matches,
        saveData: Boolean(connection?.saveData),
        effectiveType: connection?.effectiveType,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: profile.deviceMemory,
        webglSupported: webglSupported ?? false,
      });
      if (nextMode === modeRef.current) return;
      modeRef.current = nextMode;
      setSceneReady(false);
      if (isWebGLMode(nextMode)) setSceneFailed(false);
      setMode(nextMode);
    };
    const frame = requestAnimationFrame(updateMode);
    compactQuery.addEventListener("change", updateMode);
    coarsePointerQuery.addEventListener("change", updateMode);
    reducedMotionQuery.addEventListener("change", updateMode);
    connection?.addEventListener("change", updateMode);
    window.addEventListener("resize", updateMode, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      compactQuery.removeEventListener("change", updateMode);
      coarsePointerQuery.removeEventListener("change", updateMode);
      reducedMotionQuery.removeEventListener("change", updateMode);
      connection?.removeEventListener("change", updateMode);
      window.removeEventListener("resize", updateMode);
    };
  }, []);

  const handleReady = useCallback(() => setSceneReady(true), []);
  const handleError = useCallback(() => {
    setSceneReady(false);
    setSceneFailed(true);
  }, []);
  const effectiveMode: HeroRenderMode = sceneFailed ? "static" : mode;

  return (
    <div className="hero-journey relative isolate bg-[#050608]" data-hero-mode={effectiveMode} data-hero-tier={effectiveMode}>
      <section ref={heroRef} className="hero-3d relative min-h-svh overflow-hidden border-b border-white/10" aria-label="Zqtion introduction">
        <div className="signal-grid absolute inset-0 opacity-35" aria-hidden="true" />
        <div className="hero-3d-glow hero-3d-glow-blue" aria-hidden="true" />
        <div className="hero-3d-glow hero-3d-glow-cyan" aria-hidden="true" />
        <div className="hero-layout section-shell grid min-h-svh items-center gap-8 pb-12 pt-28 lg:grid-cols-[1.04fr_0.96fr] lg:gap-4 lg:pb-16 lg:pt-28">
          <div className="hero-copy relative z-30">
            <h1 className="hero-headline mt-6 max-w-5xl text-balance text-white">
              <span className="hero-headline-primary">Create what gets noticed.</span>
              <span className="font-editorial hero-headline-accent">Build what gets used.</span>
            </h1>
            <p className="hero-description mt-7 max-w-2xl text-pretty text-base leading-7 text-white/62 sm:text-lg sm:leading-8">Zqtion turns ambitious ideas into campaign-ready creative, focused digital products, and practical AI systems.</p>
            <div className="hero-actions mt-8 flex flex-wrap gap-3">
              <Link href="/work" className="button-primary" data-analytics="hero_primary_cta">Explore the work <ArrowUpRight className="h-4 w-4" /></Link>
              <Link href="/contact" className="button-secondary" data-analytics="hero_secondary_cta">Start a project</Link>
            </div>
            <div className="hero-capability-list mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-white/35">
              <span>Creative systems</span><span>Digital products</span><span>AI automation</span>
            </div>
          </div>
          <div className="hero-artwork relative z-20 mx-auto w-full max-w-[46rem]">
            <SceneStage mode={effectiveMode} sceneReady={sceneReady} sceneFailed={sceneFailed} onReady={handleReady} onError={handleError} />
          </div>
        </div>
        <div className="hero-scroll-cue pointer-events-none absolute inset-x-0 bottom-4 z-30 justify-center" aria-hidden="true">
          <span className="flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-white/28">Scroll to explore <ArrowDown className="h-3.5 w-3.5" /></span>
        </div>
      </section>
    </div>
  );
}
