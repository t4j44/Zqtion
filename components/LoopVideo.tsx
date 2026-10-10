"use client";

import { useEffect, useRef, useState } from "react";

type LoopName = "create" | "build" | "automate" | "closing";

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/**
 * Pre-rendered 3D loop (scripts/render-3d). Shows a small AVIF/WebP poster, then mounts a muted video only when the
 * visitor is close to it, plays only while visible, and stays on the poster for reduced-motion, Save-Data and slow networks.
 * Frames are rendered on black and screen-blended, so keep ancestors between this and the card background free of
 * opacity, transform, filter and mask (those would isolate the blend).
 */
export default function LoopVideo({ name, className = "" }: { name: LoopName; className?: string }) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slow = connection?.saveData || connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g";
    if (reduced || slow) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setArmed(true);
        observer.disconnect();
      }
    }, { rootMargin: "300px 0px" });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!armed || !video) return;
    let inView = true;
    const sync = () => {
      if (inView && !document.hidden) video.play().catch(() => setPlaying(false));
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: 0.05 });
    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [armed]);

  return (
    <span ref={wrapperRef} className={`loop-3d ${className}`} data-playing={playing ? "true" : "false"} aria-hidden="true">
      <picture>
        <source type="image/avif" srcSet={`/3d/${name}-poster.avif`} />
        <img className="loop-3d-poster" src={`/3d/${name}-poster.webp`} width={640} height={640} alt="" loading="lazy" decoding="async" draggable={false} />
      </picture>
      {armed ? (
        <video
          ref={videoRef}
          className="loop-3d-video"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          onError={() => setPlaying(false)}
        >
          <source src={`/3d/${name}.mp4`} type="video/mp4" />
        </video>
      ) : null}
    </span>
  );
}
