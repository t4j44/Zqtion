'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

export default function Overlay() {
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null)
  
  useEffect(() => {
    // Find the ScrollyCanvas container div (h-[400vh])
    const container = document.querySelector('[class*="h-[400vh]"]') as HTMLElement
    setScrollContainer(container)
  }, [])

  // Track scroll progress of the ScrollyCanvas container
  const { scrollYProgress } = useScroll({
    target: scrollContainer as any,
    offset: ['start start', 'end end']
  })

  // 0% - 20%: Brand Name "ZQTION"
  const brandOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.25], [0, 1, 1, 0])
  const brandScale = useTransform(scrollYProgress, [0, 0.15], [0.9, 1])
  const brandY = useTransform(scrollYProgress, [0, 0.2], [50, 0])

  // 30% - 50%: Tagline "EXECUTION, AUTOMATED."
  const taglineOpacity = useTransform(scrollYProgress, [0.25, 0.35, 0.45, 0.55], [0, 1, 1, 0])
  const taglineX = useTransform(scrollYProgress, [0.25, 0.35], [-50, 0])

  // 60% - 80%: Promise "Ideas are cheap. We build systems."
  const promiseOpacity = useTransform(scrollYProgress, [0.55, 0.65, 0.75, 0.85], [0, 1, 1, 0])
  const promiseX = useTransform(scrollYProgress, [0.55, 0.65], [50, 0])

  // Hide overlay completely once past the hero section to prevent mix-blend-difference glitches
  const overlayOpacity = useTransform(scrollYProgress, [0.85, 0.95], [1, 0])
  const overlayVisibility = useTransform(scrollYProgress, (v) => v >= 0.98 ? 'hidden' as const : 'visible' as const)

  return (
    <motion.div 
      style={{ opacity: overlayOpacity, visibility: overlayVisibility }}
      className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center mix-blend-difference">
      
      {/* Brand Name */}
      <motion.div 
        style={{ opacity: brandOpacity, scale: brandScale, y: brandY }}
        className="absolute text-center will-change-transform"
      >
        <h1 className="text-[12vw] md:text-[15vw] font-bold tracking-tighter text-white leading-none">
          ZQTION
        </h1>
      </motion.div>

      {/* Tagline */}
      <motion.div
        style={{ opacity: taglineOpacity, x: taglineX }}
        className="absolute left-8 md:left-24 top-1/2 -translate-y-1/2 max-w-2xl will-change-transform"
      >
        <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-white leading-tight">
          EXECUTION,<br />
          <span className="text-zqtion-blue">AUTOMATED.</span>
        </h2>
      </motion.div>

      {/* The Promise */}
      <motion.div
        style={{ opacity: promiseOpacity, x: promiseX }}
        className="absolute right-8 md:right-24 bottom-1/3 max-w-2xl text-right will-change-transform"
      >
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
          Ideas are cheap.<br />
          We build systems.
        </h2>
      </motion.div>

    </motion.div>
  )
}
