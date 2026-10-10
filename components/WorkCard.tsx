import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import type { WorkItem } from "@/data/work";
import YouTubeThumb from "@/components/YouTubeThumb";

export default function WorkCard({ item, priority = false, index, sizes = "(max-width: 767px) 88vw, (max-width: 1023px) 100vw, 66vw", variant = "grid" }: { item: WorkItem; priority?: boolean; index?: number; sizes?: string; variant?: "grid" | "reel" }) {
  return (
    <article className="work-card group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#090b10]">
      <Link href={`/work/${item.slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300" data-analytics="work_view" data-analytics-work={item.slug}>
        <div className={`work-card-media relative overflow-hidden ${variant === "reel" ? "aspect-[4/3] md:aspect-[16/11]" : "aspect-[4/3]"}`} style={{ "--thumb-zoom": item.thumbZoom ?? 1 } as React.CSSProperties}>
          <YouTubeThumb
            videoId={item.videoId}
            poster={item.poster}
            alt={`Still from ${item.title}`}
            fill
            priority={priority}
            sizes={sizes}
            className="work-card-image object-cover"
          />
          <div className="work-card-shade" aria-hidden="true" />
          <span className="work-card-play" aria-hidden="true"><Play className="h-5 w-5" fill="currentColor" /></span>
          <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.15em] text-white/80 backdrop-blur-xl">
            {item.relationship}
          </span>
          {typeof index === "number" ? <span className="work-card-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span> : null}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="work-card-caption text-xs uppercase tracking-[0.16em] text-white/80">{item.discipline}</p>
                <h3 className="work-card-caption mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">{item.shortTitle}</h3>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black transition duration-300 group-hover:rotate-45 group-hover:bg-cyan-200">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
