"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import type { WorkItem } from "@/data/work";
import SectionIcon from "@/components/SectionIcon";
import WorkCard from "@/components/WorkCard";

/**
 * Selected work as a reel that moves right to left.
 * - Desktop with a mouse: the section pins and vertical scrolling slides the cards sideways (transform only, one rAF-throttled listener).
 * - Phones, touch devices, reduced motion and no-JS: a native swipe row with scroll snapping.
 */
export default function WorkReel({ items }: { items: WorkItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;
    const query = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let distance = 0;
    let pinned = false;

    const setProgress = (progress: number) => {
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
      if (counterRef.current) counterRef.current.textContent = `${String(Math.min(items.length, Math.round(progress * (items.length - 1)) + 1)).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    };
    const measure = () => {
      if (!pinned) return;
      distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      section.style.setProperty("--reel-height", `${distance + window.innerHeight}px`);
      update();
    };
    const update = () => {
      frame = 0;
      if (!pinned) return;
      const rect = section.getBoundingClientRect();
      const range = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / range));
      track.style.transform = `translate3d(${(-progress * distance).toFixed(1)}px, 0, 0)`;
      setProgress(progress);
    };
    const onSwipe = () => {
      if (pinned) return;
      const max = viewport.scrollWidth - viewport.clientWidth;
      setProgress(max > 0 ? viewport.scrollLeft / max : 0);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const enable = () => {
      pinned = query.matches;
      section.dataset.pinned = String(pinned);
      if (!pinned) {
        section.style.removeProperty("--reel-height");
        track.style.transform = "";
        return;
      }
      measure();
    };
    // Keyboard users tabbing to an off-screen card scroll the page so that the card slides into view.
    const onFocus = (event: FocusEvent) => {
      if (!pinned) return;
      const item = (event.target as HTMLElement).closest<HTMLElement>(".work-reel-item");
      if (!item) return;
      const range = section.offsetHeight - window.innerHeight;
      const target = Math.min(1, Math.max(0, item.offsetLeft / Math.max(1, distance)));
      window.scrollTo({ top: section.offsetTop + target * range, behavior: "instant" });
    };

    enable();
    query.addEventListener("change", enable);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    track.addEventListener("focusin", onFocus);
    viewport.addEventListener("scroll", onSwipe, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      query.removeEventListener("change", enable);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      observer.disconnect();
      track.removeEventListener("focusin", onFocus);
      viewport.removeEventListener("scroll", onSwipe);
    };
  }, [items.length]);

  return (
    <section ref={sectionRef} className="work-reel" data-pinned="false" aria-labelledby="work-reel-title">
      <div className="work-reel-sticky">
        <div className="section-shell work-reel-head">
          <div>
            <SectionIcon name="work" />
            <p className="eyebrow">Selected work</p>
            <h2 id="work-reel-title" className="mt-5 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
              Proof with the relationship made clear.
            </h2>
            <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
              Competition entries, founder-venture work, and independent experiments are labeled—not passed off as client results.
            </p>
          </div>
          <Link href="/work" className="button-secondary shrink-0" data-analytics="work_view" data-analytics-location="home_selected_work">All work <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div ref={viewportRef} className="work-reel-viewport" tabIndex={-1}>
          <ul ref={trackRef} className="work-reel-track">
            {items.map((item, index) => (
              <li key={item.slug} className="work-reel-item">
                <WorkCard item={item} index={index} variant="reel" sizes="(max-width: 1023px) 84vw, 46vw" />
              </li>
            ))}
            <li className="work-reel-item work-reel-end">
              <Link href="/work" className="work-reel-all group" data-analytics="work_view" data-analytics-location="home_reel_end">
                <span className="eyebrow">More work</span>
                <span className="work-reel-all-title">See every project</span>
                <span className="work-reel-all-arrow"><ArrowUpRight className="h-5 w-5" /></span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="section-shell work-reel-meta" aria-hidden="true">
          <span ref={counterRef} className="work-reel-counter">01 / {String(items.length).padStart(2, "0")}</span>
          <span className="work-reel-rail"><span ref={barRef} className="work-reel-bar" /></span>
          <span className="work-reel-hint"><span className="work-reel-hint-pinned">Keep scrolling</span><span className="work-reel-hint-swipe">Swipe</span> <ArrowRight className="h-3.5 w-3.5" /></span>
        </div>
      </div>
    </section>
  );
}
