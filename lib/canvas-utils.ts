/**
 * Utility function to generate frame URLs
 * @param frameNumber - Frame index (0-116)
 * @returns Full URL to the frame image
 */
export function getFrameUrl(frameNumber: number): string {
  const paddedNumber = frameNumber.toString().padStart(3, '0')
  return `/sequence/frame_${paddedNumber}_delay-0.067s.webp`
}

/**
 * Utility to map scroll progress to frame index
 * @param progress - Scroll progress (0-1)
 * @param totalFrames - Total number of frames
 * @returns Frame index to display
 */
export function progressToFrame(progress: number, totalFrames: number): number {
  return Math.min(Math.floor(progress * totalFrames), totalFrames - 1)
}

/**
 * Preload images with progress callback
 * @param frameCount - Total frames to load
 * @param onProgress - Callback with loading progress
 * @returns Promise that resolves with loaded images
 */
export async function preloadImages(
  frameCount: number,
  onProgress?: (loaded: number, total: number) => void
): Promise<HTMLImageElement[]> {
  const images: HTMLImageElement[] = []
  let loadedCount = 0

  const loadPromises = Array.from({ length: frameCount }, (_, i) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.src = getFrameUrl(i)

      img.onload = () => {
        loadedCount++
        onProgress?.(loadedCount, frameCount)
        images[i] = img
        resolve(img)
      }

      img.onerror = () => {
        reject(new Error(`Failed to load frame ${i}`))
      }
    })
  })

  await Promise.all(loadPromises)
  return images
}
