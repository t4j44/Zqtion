export const FRAME_COUNT = 111;

/**
 * Utility function to generate frame URLs
 * @param frameNumber - Frame index (0-110)
 * @returns Full URL to the frame image
 */
export function getFrameUrl(frameNumber: number): string {
  const paddedNumber = frameNumber.toString().padStart(3, '0')
  return `/sequence/frame_${paddedNumber}.webp`
}

/**
 * Preload images with concurrent batching for speed
 */
export async function preloadImages(
  frameCount: number,
  onProgress?: (loaded: number, total: number) => void
): Promise<HTMLImageElement[]> {
  const images: HTMLImageElement[] = new Array(frameCount);
  let loadedCount = 0;

  // We'll load in batches to avoid overwhelming the browser's network stack
  // though for ~100 images, modern browsers handle parallel requests well.
  
  const loadSingleImage = (index: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = getFrameUrl(index);
      
      img.onload = () => {
        images[index] = img;
        loadedCount++;
        if (onProgress) onProgress(loadedCount, frameCount);
        resolve();
      };
      
      img.onerror = () => {
        console.error(`Failed to load frame ${index}`);
        // Even if error, we resolve to populate the array (maybe with a placeholder or null)
        // treating it as 'loaded' to not block the whole app.
        loadedCount++;
        if (onProgress) onProgress(loadedCount, frameCount);
        resolve();
      };
    });
  };

  const promises = [];
  for (let i = 0; i < frameCount; i++) {
    promises.push(loadSingleImage(i));
  }

  await Promise.all(promises);
  return images;
}
