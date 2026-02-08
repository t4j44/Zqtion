'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function ScrollOverlay() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })

  // Section opacities based on scroll progress
  const section1Opacity = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0])
  const section1Y = useTransform(scrollYProgress, [0, 0.25], [0, -100])
  
  const section2Opacity = useTransform(scrollYProgress, [0.2, 0.35, 0.5], [0, 1, 0])
  const section2Y = useTransform(scrollYProgress, [0.2, 0.5], [50, -50])
  
  const section3Opacity = useTransform(scrollYProgress, [0.45, 0.6, 0.8], [0, 1, 0])
  const section3Y = useTransform(scrollYProgress, [0.45, 0.8], [50, -50])
  
  const section4Opacity = useTransform(scrollYProgress, [0.75, 0.85, 1], [0, 1, 1])
  const section4Y = useTransform(scrollYProgress, [0.75, 1], [50, 0])

  return (
    <div ref={containerRef} className="pointer-events-none" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen w-full flex items-center justify-center">
        
        {/* Section 1: Hero Intro */}
        <motion.div
          style={{ opacity: section1Opacity, y: section1Y }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-6"
          >
            ZQTION
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-xl md:text-3xl text-white/70 font-light tracking-wide"
          >
            Creative Developer
          </motion.p>
        </motion.div>

        {/* Section 2: Philosophy */}
        <motion.div
          style={{ opacity: section2Opacity, y: section2Y }}
          className="absolute left-8 md:left-20 top-1/2 -translate-y-1/2 max-w-2xl"
        >
          <p className="text-4xl md:text-6xl font-bold text-white leading-tight">
            I build digital<br />
            <span className="text-white/50">experiences that</span><br />
            matter.
          </p>
        </motion.div>

        {/* Section 3: Approach */}
        <motion.div
          style={{ opacity: section3Opacity, y: section3Y }}
          className="absolute right-8 md:right-20 top-1/2 -translate-y-1/2 max-w-2xl text-right"
        >
          <p className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Bridging<br />
            <span className="text-white/50">design and</span><br />
            engineering.
          </p>
        </motion.div>

        {/* Section 4: Call to Action */}
        <motion.div
          style={{ opacity: section4Opacity, y: section4Y }}
          className="absolute inset-0 flex items-center justify-center text-center px-6"
        >
          <div className="space-y-6">
            <h2 className="text-5xl md:text-7xl font-bold text-white">
              Selected Work
            </h2>
            <p className="text-lg md:text-xl text-white/60">
              Scroll to explore
            </p>
            <div className="flex justify-center pt-4">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-6 h-10 border-2 border-white/40 rounded-full p-1"
              >
                <div className="w-1 h-3 bg-white/60 rounded-full mx-auto" />
              </motion.div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
