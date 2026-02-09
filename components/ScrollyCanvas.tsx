'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, useSpring, motion, AnimatePresence } from 'framer-motion';
import { FRAME_COUNT, preloadImages } from '@/lib/canvas-utils';

export default function ScrollyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Scroll Progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Use a spring physics for the frame index to make scrubbing buttery smooth
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.0001
  });

  useEffect(() => {
    let isMounted = true;
    
    const load = async () => {
      const loadedImages = await preloadImages(FRAME_COUNT);
      if (isMounted) {
        setImages(loadedImages);
        setIsLoaded(true);
      }
    };
    load();

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!isLoaded || !images.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { alpha: false }); // alpha: false optimizes performance if no transparency needed
    if (!context) return;

    // High DPI scaling
    const setCanvasSize = () => {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        
        // CSS size
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        
        context.scale(dpr, dpr);
        
        // Settings for crisp rendering
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Render Loop
    const render = () => {
        // Map 0-1 progress to 0-(totalFrames-1)
        const progress = smoothProgress.get();
        const frameIndex = Math.min(
            FRAME_COUNT - 1,
            Math.max(0, Math.floor(progress * (FRAME_COUNT - 1)))
        );

        const img = images[frameIndex];
        if (!img) return;

        // --- RENDER LOGIC ---
        const canvasW = window.innerWidth;
        const canvasH = window.innerHeight;
        
        // 1. Calculate aspect ratio fill (object-fit: cover)
        const imgRatio = img.width / img.height;
        const canvasRatio = canvasW / canvasH;

        let drawW, drawH, offsetLeft, offsetTop;

        if (canvasRatio > imgRatio) {
            drawW = canvasW;
            drawH = canvasW / imgRatio;
            offsetLeft = 0;
            offsetTop = (canvasH - drawH) / 2;
        } else {
            drawH = canvasH;
            drawW = canvasH * imgRatio;
            offsetTop = 0;
            offsetLeft = (canvasW - drawW) / 2;
        }

        // 2. Cinematic Zoom Effect
        // Start significantly zoomed out so pixels are compressed = sharper look
        // Then smoothly zoom into full size as the ZQTION text appears
        const zoomStart = 0.65;  // Much smaller = denser pixels = hides low resolution
        const zoomEnd = 1.02;    // Slight overshoot for cinematic punch
        
        // Ease-out cubic curve: fast at start, gentle landing
        const t = Math.min(1, progress * 2.5); // Zoom completes by ~40% scroll (when ZQTION appears)
        const easedT = 1 - Math.pow(1 - t, 3);
        const currentZoom = zoomStart + (easedT * (zoomEnd - zoomStart));
        
        // 3. Focus Pull: blur at the very start to mask compression artifacts
        // Gradually clears to sharp as you scroll (first 15% of scroll)
        const blurAmount = Math.max(0, (1 - progress * 6.67)) * 2.5; // 2.5px blur fading to 0
        if (blurAmount > 0.1) {
            context.filter = `blur(${blurAmount}px)`;
        } else {
            context.filter = 'none';
        }
        
        // Apply zoom to dimensions
        const finalW = drawW * currentZoom;
        const finalH = drawH * currentZoom;
        const finalX = (canvasW - finalW) / 2;
        const finalY = (canvasH - finalH) / 2;

        // 4. Draw
        context.clearRect(0, 0, canvasW, canvasH);
        
        // Pixel rounding to avoid aliasing artifacts
        context.drawImage(
            img,
            Math.floor(finalX),
            Math.floor(finalY),
            Math.ceil(finalW),
            Math.ceil(finalH)
        );
    };

    // Subscribing to frame changes
    const unsubscribe = smoothProgress.on("change", () => {
        requestAnimationFrame(render);
    });
    
    // Initial draw
    requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      unsubscribe();
    };
  }, [isLoaded, images, smoothProgress]);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-neutral-900 will-change-scroll">
        <div className="sticky top-0 h-screen w-full overflow-hidden transform-gpu">
            <canvas 
                ref={canvasRef} 
                className="block w-full h-full object-cover touch-none will-change-transform"
                style={{
                    filter: "contrast(1.08) saturate(1.15) brightness(1.02)", // Color grading to mask compression
                    imageRendering: 'auto',
                    transform: 'translateZ(0)'
                }}
            />
            {/* Vignette: darkens edges to hide stretched pixels at borders */}
            <div className="absolute inset-0 z-[5] pointer-events-none"
                 style={{
                     background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)'
                 }}
            />
            {/* Texture Overlay for Cinematic Grain */}
            <div className="absolute inset-0 z-10 opacity-[0.05] pointer-events-none mix-blend-overlay"
                 style={{ 
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                 }} 
            ></div>
            
            {/* Loading State */}
            <AnimatePresence>
                {!isLoaded && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black"
                    >
                       <span className="text-white font-mono text-xs tracking-widest animate-pulse">LOADING ASSETS...</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
}
