'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/80 z-10" />
        <div className="w-full h-full bg-gradient-to-b from-black via-black/50 to-black z-20 absolute" />
        {/* Video Placeholder */}
        <div className="w-full h-full bg-neutral-950" />
      </div>

      {/* Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-6 text-center">
        <motion.h1
          className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          EXECUTION,
          <br />
          AUTOMATED.
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          We turn static assets into viral systems. AI Video. High-Perf Web. Visual Ops.
        </motion.p>

        <motion.button
          className="px-12 py-5 bg-electric text-white font-bold text-lg rounded-md hover:bg-electric/90 transition-all duration-300 shadow-lg shadow-electric/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          DEPLOY SYSTEM
        </motion.button>

        {/* Animated Down Arrow */}
        <motion.div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 1,
            repeat: Infinity,
            repeatType: 'reverse',
            repeatDelay: 0.5,
          }}
        >
          <ChevronDown className="w-8 h-8 text-neutral-600" strokeWidth={1.5} />
        </motion.div>
      </div>
    </section>
  );
}
