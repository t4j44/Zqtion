'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function ScrollIndicator() {
  const { scrollYProgress } = useScroll()
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <>
      {/* Fixed Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
          style={{ width }}
        />
      </motion.div>

      {/* Scroll Down Hint (appears on load, fades on scroll) */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        style={{
          opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0])
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/40 text-xs tracking-widest uppercase">
            Scroll to explore
          </p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-6 h-10 border-2 border-white/30 rounded-full p-1.5"
          >
            <div className="w-1 h-3 bg-white/50 rounded-full mx-auto" />
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}
