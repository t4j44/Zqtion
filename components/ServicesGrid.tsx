'use client';

import { motion } from 'framer-motion';
import { Video, Image as ImageIcon, Code2, ArrowRight } from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';

export default function ServicesGrid() {
  return (
    <section className="py-32 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-5xl md:text-6xl font-black text-white mb-16 text-center tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Our Systems
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI Video Studio (Span 2) */}
          <motion.div
            className="md:col-span-2 bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 hover:border-neutral-700 transition-all duration-300 group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Video className="w-6 h-6 text-electric" />
                  <h3 className="text-2xl font-bold text-white">AI Video Studio</h3>
                </div>
                <p className="text-neutral-400 text-lg">VFX & Storytelling</p>
              </div>
              <ArrowRight className="w-6 h-6 text-neutral-600 group-hover:text-electric group-hover:translate-x-1 transition-all duration-300" />
            </div>
            
            {/* Video Placeholder */}
            <div className="relative w-full h-64 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-electric/20 to-transparent opacity-50" />
              <Video className="w-16 h-16 text-neutral-700" />
            </div>
          </motion.div>

          {/* Card 2: Visual Ops (Span 1) */}
          <motion.div
            className="md:col-span-1 bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 hover:border-neutral-700 transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <ImageIcon className="w-6 h-6 text-electric" />
              <h3 className="text-2xl font-bold text-white">Visual Ops</h3>
            </div>
            <p className="text-neutral-400 text-lg mb-6">Product Photography Remastering</p>
            
            {/* Before/After Slider */}
            <BeforeAfterSlider />
          </motion.div>

          {/* Card 3: Web Architecture (Span 3) */}
          <motion.div
            className="md:col-span-3 bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 hover:border-neutral-700 transition-all duration-300 group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Code2 className="w-8 h-8 text-electric" />
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Web Architecture</h3>
                  <p className="text-neutral-400 text-xl">Static Sites. Zero Latency.</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-8 text-sm">
                <div className="text-center">
                  <div className="text-4xl font-black text-electric">0.5s</div>
                  <div className="text-neutral-500">Load Time</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-white">100</div>
                  <div className="text-neutral-500">PageSpeed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-white">∞</div>
                  <div className="text-neutral-500">Scale</div>
                </div>
              </div>
              <ArrowRight className="w-8 h-8 text-neutral-600 group-hover:text-electric group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
