import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { WorkItem } from "@/data/work";

export default function WorkCard({ item, priority = false, sizes = "(max-width: 767px) 100vw, 50vw", variant = "grid" }: { item: WorkItem; priority?: boolean; index?: number; sizes?: string; variant?: "grid" | "reel" }) {
  const poster = item.poster ?? "https://i.ytimg.com/vi/" + item.videoId + "/hqdefault.jpg";
  return <article className={"work-card work-card-" + variant}>
    <Link href={"/work/" + item.slug} className="work-card-link" data-analytics="work_view" data-analytics-work={item.slug} aria-label={"View project: " + item.shortTitle + ", " + item.relationship}>
      <div className={"work-card-media " + (item.kind === "product" ? "work-card-product" : "")}>
        {item.kind === "product" ? <div className="work-product-cover"><Image src={poster} width={164} height={164} alt="Gruffet's original ferret mark" className="work-product-mark" /><div><p className="work-product-name">Gruffet</p><p>Research businesses.<br />Keep the evidence.</p></div></div> : <Image src={poster} alt={item.kind === "website" ? "Genuine screenshot of " + item.shortTitle : "Video still from " + item.title} fill preload={priority} sizes={sizes} className="work-card-image" />}
      </div>
      <div className="work-card-content"><p className="work-card-relationship">{item.relationship}</p><h3>{item.shortTitle}</h3><p className="work-card-discipline">{item.discipline}</p><span className="work-card-action">View project <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></span></div>
    </Link>
  </article>;
}
