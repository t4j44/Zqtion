import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { WorkItem } from "@/data/work";
import SectionIcon from "@/components/SectionIcon";
import WorkCard from "@/components/WorkCard";
import WorkReelScroller from "@/components/WorkReelScroller";

export default function WorkReel({ items }: { items: WorkItem[] }) {
  return <section className="work-reel" data-pinned="false" aria-labelledby="work-reel-title">
    <div className="section-shell work-reel-head"><div><SectionIcon name="work" /><p className="eyebrow">Selected work</p><h2 id="work-reel-title" className="mt-5 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-6xl">Built. Released. Put into motion.</h2><p className="mt-5 max-w-xl text-pretty text-base leading-7 text-muted sm:text-lg sm:leading-8">A delivered website, an open-source product, motion design and cinematic storytelling. The relationship stays visible on every project.</p></div><Link href="/work" className="button-secondary shrink-0" data-analytics="work_view" data-analytics-location="home_selected_work">All work <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></div>
    <WorkReelScroller count={items.length}><ul className="work-reel-track">{items.map(item=><li key={item.slug} className="work-reel-item"><WorkCard item={item} variant="reel" sizes="(max-width: 639px) 84vw, (max-width: 1023px) 60vw, 480px" /></li>)}</ul></WorkReelScroller>
  </section>;
}
