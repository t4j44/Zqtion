"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { youtubeThumbnail, youtubeThumbnailFallback } from "@/lib/youtube-thumbnail";

type YouTubeThumbProps = Omit<ImageProps, "src"> & { videoId: string; poster?: string };

/** Sharp 1280px still with an automatic fall back to the 480px still for videos without an HD thumbnail. */
export default function YouTubeThumb({ videoId, poster, alt, ...props }: YouTubeThumbProps) {
  const [fallback, setFallback] = useState(false);
  if (poster) return <Image {...props} alt={alt} src={poster} />;
  return (
    <Image
      {...props}
      alt={alt}
      src={fallback ? youtubeThumbnailFallback(videoId) : youtubeThumbnail(videoId)}
      onError={() => setFallback(true)}
    />
  );
}
