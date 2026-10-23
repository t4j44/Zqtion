/** 1280×720 still. Exists for HD uploads; callers fall back to `youtubeThumbnailFallback`. */
export const youtubeThumbnail = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

/** 480×360 still. YouTube generates it for every video. */
export const youtubeThumbnailFallback = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
