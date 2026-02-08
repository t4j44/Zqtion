'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function Overlay() {
  const containerRef = useRef<HTMLDivElement>(null)
  // We share the same scroll context as the ScrollyCanvas parent
  // But since this component sits *inside* the sticky container conceptually (or parallel to it),
  // we might need to reference the whole page scroll or just trust the viewport position if it's fixed.
  // Ideally, this component is placed INSIDE the sticky container of ScrollyCanvas or parallel to it.
  // For simplicity, let's assume this component is rendered FIXED on top of the viewport.
  
  const { scrollYProgress } = useScroll()

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

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center mix-blend-difference">
      
      {/* Brand Name */}
      <motion.div 
        style={{ opacity: brandOpacity, scale: brandScale, y: brandY }}
        className="absolute text-center"
      >
        <h1 className="text-[12vw] md:text-[15vw] font-bold tracking-tighter text-white leading-none">
          ZQTION
        </h1>
      </motion.div>

      {/* Tagline */}
      <motion.div
        style={{ opacity: taglineOpacity, x: taglineX }}
        className="absolute left-8 md:left-24 top-1/2 -translate-y-1/2 max-w-2xl"
      >
        <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-white leading-tight">
          EXECUTION,<br />
          <span className="text-zqtion-blue">AUTOMATED.</span>
        </h2>
      </motion.div>

      {/* The Promise */}
      <motion.div
        style={{ opacity: promiseOpacity, x: promiseX }}
        className="absolute right-8 md:right-24 bottom-1/3 max-w-2xl text-right"
      >
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
          Ideas are cheap.<br />
          We build systems.
        </h2>
      </motion.div>

    </div>
  )
}
