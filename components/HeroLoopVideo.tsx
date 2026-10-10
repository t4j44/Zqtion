"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pre-rendered 3D loop for phones and touch devices (rendered offline with scripts/render-3d).
 * The poster stays as first paint; this mounts after the page has loaded and goes idle, pauses offscreen
 * and in hidden tabs, and silently stays on the poster if autoplay is blocked (for example Low Power Mode).
 * The video is rendered on black and blended with `mix-blend-mode: lighten` so no background is baked in.
 */
export default function HeroLoopVideo({ onPlaying }: { onPlaying: (playing: boolean) => void }) {
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let timer = 0;
    let idle = 0;
    let cancelled = false;
    const mount = () => {
      if (cancelled) return;
      if (window.requestIdleCallback) idle = window.requestIdleCallback(() => !cancelled && setMounted(true), { timeout: 1_500 });
      else timer = window.setTimeout(() => !cancelled && setMounted(true), 400);
    };
    if (document.readyState === "complete") mount();
    else window.addEventListener("load", mount, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", mount);
      window.clearTimeout(timer);
      if (idle) window.cancelIdleCallback?.(idle);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!mounted || !video) return;
    let inView = true;
    const sync = () => {
      if (inView && !document.hidden) video.play().catch(() => onPlaying(false));
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: 0.1 });
    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      onPlaying(false);
    };
  }, [mounted, onPlaying]);

  if (!mounted) return null;
  return (
    <video
      ref={videoRef}
      className="hero-loop-video"
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => onPlaying(true)}
      onError={() => onPlaying(false)}
    >
      <source src="/3d/hero.mp4" type="video/mp4" />
    </video>
  );
}
