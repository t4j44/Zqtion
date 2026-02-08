'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/60 backdrop-blur-xl border-b border-neutral-800' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo Placeholder */}
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center">
            <span className="text-black font-black text-2xl">Z</span>
          </div>
          <span className="ml-3 text-white font-bold text-xl tracking-tight">ZQTION</span>
        </div>

        {/* CTA Button */}
        <motion.button
          className="px-6 py-2 border border-neutral-700 text-white text-sm font-medium rounded-md hover:border-electric hover:text-electric transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Book Execution
        </motion.button>
      </div>
    </motion.nav>
  );
}
