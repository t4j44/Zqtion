'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/50 backdrop-blur-xl will-change-transform"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left: Logo & Brand */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative overflow-hidden rounded-xl w-10 h-10 border border-white/10 shadow-lg shadow-white/5">
           <img src="/logo.png" alt="ZQTION Logo" className="object-cover w-full h-full" />
        </div>
        <span className="text-xl font-bold tracking-tighter text-white group-hover:text-neutral-300 transition-colors">
          ZQTION
        </span>
      </Link>

      {/* Right: CTA */}
      <motion.button
        className="hidden md:flex items-center gap-2 px-6 py-2 border border-white/20 rounded-full text-sm font-medium text-white hover:bg-white hover:text-black transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
            // Scroll to services or open contact
             window.location.href = 'mailto:zqtioncontact@gmail.com?subject=Start Execution'
        }}
      >
        <span>START EXECUTION</span>
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.nav>
  );
}
