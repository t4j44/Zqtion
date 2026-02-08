'use client'

import { useEffect, useRef, useState } from 'react'
import { useScroll, motion, AnimatePresence } from 'framer-motion'

const FRAME_COUNT = 117 // Based on actual available frames 0-116
const FRAME_PATH = '/sequence/frame_'

export default function ScrollyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [images, setImages] = useState<HTMLImageElement[]>([])
  const [imagesLoaded, setImagesLoaded] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })

  // Preload all images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = []
    let loadedCount = 0

    const preloadImages = () => {
      for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image()
        const frameNumber = i.toString().padStart(3, '0')
        img.src = `${FRAME_PATH}${frameNumber}.webp`
        
        img.onload = () => {
          loadedCount++
          if (loadedCount === FRAME_COUNT) {
            setImagesLoaded(true)
          }
        }

        img.onerror = () => {
           console.error(`Failed to load frame ${i}`)
           loadedCount++
           if (loadedCount === FRAME_COUNT) {
             setImagesLoaded(true)
           }
        }
        
        loadedImages[i] = img
      }
      setImages(loadedImages)
    }

    preloadImages()
  }, [])

  // Render canvas based on scroll
  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      context.scale(dpr, dpr)
      render()
    }

    const render = () => {
      const progress = scrollYProgress.get()
      // Protect against negative values or overflow
      const rawIndex = Math.floor(progress * (FRAME_COUNT - 1))
      const frameIndex = Math.max(0, Math.min(rawIndex, FRAME_COUNT - 1))

      const img = images[frameIndex]
      if (!img || img.width === 0 || img.height === 0) return

      // Object-fit: cover logic
      const canvasAspect = window.innerWidth / window.innerHeight
      const imageAspect = img.width / img.height

      let drawWidth = window.innerWidth
      let drawHeight = window.innerHeight
      let offsetX = 0
      let offsetY = 0

      if (canvasAspect > imageAspect) {
        drawHeight = window.innerWidth / imageAspect
        offsetY = (window.innerHeight - drawHeight) / 2
      } else {
        drawWidth = window.innerHeight * imageAspect
        offsetX = (window.innerWidth - drawWidth) / 2
      }

      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
    }

    const unsubscribe = scrollYProgress.on('change', render)
    
    // Initial render & resize listener
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      unsubscribe()
      window.removeEventListener('resize', handleResize)
    }
  }, [imagesLoaded, images, scrollYProgress])

  return (
    <div ref={containerRef} className="relative h-[500vh] bg-zqtion-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Preloader Overlay */}
        <AnimatePresence>
          {!imagesLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-zqtion-black"
            >
              <div className="flex flex-col items-center gap-4">
                 <div className="w-64 h-1 bg-white/10 overflow-hidden">
                    <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-full bg-zqtion-blue"
                    />
                 </div>
                 <h2 className="text-white font-mono text-sm tracking-widest animate-pulse">
                   INITIALIZING ZQTION...
                 </h2>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
