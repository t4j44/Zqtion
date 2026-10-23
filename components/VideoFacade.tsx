"use client";

import { useEffect, useId, useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import YouTubeThumb from "@/components/YouTubeThumb";

export default function VideoFacade({
  videoId,
  title,
  videoUrl,
  portrait = false,
  priority = false,
  poster,
}: {
  videoId: string;
  title: string;
  videoUrl: string;
  portrait?: boolean;
  priority?: boolean;
  poster?: string;
}) {
  const [active, setActive] = useState(false);
  const playerId = useId();
  useEffect(()=>{
    const stopOtherPlayer=(event:Event)=>{if(event instanceof CustomEvent&&event.detail!==playerId)setActive(false);};
    window.addEventListener("zqtion-video-play",stopOtherPlayer);
    return ()=>window.removeEventListener("zqtion-video-play",stopOtherPlayer);
  },[playerId]);

  return (
    <div className={`video-shell ${portrait ? "video-shell-portrait" : "aspect-video"}`}>
      {active ? (
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <>
          <YouTubeThumb
            videoId={videoId}
            poster={poster}
            alt={`Video still from ${title}`}
            fill
            priority={priority}
            sizes={portrait ? "(max-width: 768px) 100vw, 40vw" : "(max-width: 768px) 100vw, 70vw"}
            className="object-cover transition duration-700 group-hover:scale-[1.025]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10" />
          <button
            type="button"
            onClick={() => { window.dispatchEvent(new CustomEvent("zqtion-video-play",{detail:playerId})); setActive(true); }}
            className="absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300"
            aria-label={`Watch video: ${title}`}
            data-analytics="work_view"
            data-analytics-video={videoId}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white backdrop-blur-xl transition duration-300 hover:scale-105 hover:bg-white hover:text-black sm:h-16 sm:w-16">
              <Play className="ml-1 h-5 w-5" fill="currentColor" />
            </span>
            <span className="video-watch-label">Watch video</span>
          </button>
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute right-4 top-4 z-10 flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3 py-2 text-xs font-medium text-white/80 backdrop-blur-lg hover:text-white"
          >
            YouTube <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </>
      )}
    </div>
  );
}
