import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { WorkItem } from "@/data/work";

export default function WorkCard({ item, priority = false }: { item: WorkItem; priority?: boolean }) {
  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035]">
      <Link href={`/work/${item.slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#090b10]">
          <Image
            src={`https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`}
            alt={`Still from ${item.title}`}
            fill
            unoptimized
            priority={priority}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
          <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-white/75 backdrop-blur-xl">
            {item.relationship}
          </span>
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/50">{item.discipline}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">{item.shortTitle}</h3>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black transition duration-300 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
