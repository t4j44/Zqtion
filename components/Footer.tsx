'use client';

import { Linkedin, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="relative bg-[#0a0a0a] border-t border-white/5 py-20 px-6 transform-gpu will-change-auto">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative overflow-hidden rounded-xl w-12 h-12 border border-white/10 shadow-lg shadow-white/5">
                 <img src="/logo.png" alt="ZQTION Logo" className="object-cover w-full h-full" />
              </div>
              <div>
                <h3 className="text-white font-black text-2xl tracking-tight">ZQTION</h3>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Creative developer crafting high-performance digital experiences at the intersection of design and code.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-6">Explore</h4>
            <nav className="flex flex-col gap-3">
              {['Work', 'About', 'Services', 'Lab', 'Contact'].map((link) => (
                <motion.a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="text-white/60 hover:text-white transition-colors duration-300 text-sm will-change-transform"
                  whileHover={{ x: 5 }}
                  transition={{ type: 'tween', duration: 0.2 }}
                >
                  {link}
                </motion.a>
              ))}
            </nav>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-6">Connect</h4>
            <div className="space-y-4">
              <a 
                href="mailto:zqtioncontact@gmail.com" 
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 text-sm"
              >
                <Mail className="w-4 h-4" />
                zqtioncontact@gmail.com
              </a>
              <a 
                href="https://wa.me/8801340347975" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 text-sm group"
              >
                <div className="w-4 h-4 fill-current group-hover:text-[#25D366] transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382C17.112 14.202 15.344 13.332 15.013 13.256C14.685 13.178 14.444 13.136 14.204 13.498C13.966 13.856 13.279 14.664 13.068 14.903C12.859 15.143 12.651 15.174 12.291 14.993C11.931 14.814 10.771 14.433 9.395 13.208C8.307 12.239 7.572 11.042 7.362 10.683C7.152 10.323 7.34 10.128 7.519 9.95C7.68 9.79 7.877 9.534 8.057 9.324C8.237 9.115 8.297 8.966 8.417 8.725C8.537 8.486 8.477 8.277 8.357 8.038C8.236 7.796 7.276 5.432 6.885 4.475C6.495 3.548 6.109 3.668 5.841 3.668C5.599 3.668 5.328 3.668 5.06 3.668C4.788 3.668 4.337 3.771 3.978 4.162C3.616 4.552 2.625 5.483 2.625 7.373C2.625 9.263 3.977 11.093 4.19 11.362C4.4 11.632 6.946 15.556 10.843 17.238C11.77 17.638 12.493 17.876 13.051 18.053C14.225 18.428 15.289 18.375 16.126 18.25C17.062 18.11 19.006 17.072 19.412 15.932C19.816 14.793 19.816 13.834 19.696 13.623C19.578 13.414 19.278 13.293 18.917 13.111H18.919V13.113H17.472V14.382Z" />
                  </svg>
                </div>
                +880 1340-347975
              </a>
              <div className="flex items-center gap-4 pt-4">
                {[
                  { Icon: Linkedin, href: 'https://www.linkedin.com/company/zqtion/' },
                  { Icon: Mail, href: 'mailto:zqtioncontact@gmail.com' },
                ].map(({ Icon, href }, idx) => (
                  <motion.a
                    key={idx}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center
                               border border-white/10 text-white/60 hover:text-white hover:border-white/30
                               transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Zqtion. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <a href="#privacy" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#cookies" className="hover:text-white/60 transition-colors">Cookies</a>
          </div>
        </div>

        {/* Gradient Orb Background */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-t from-purple-500/10 to-transparent blur-3xl pointer-events-none" />
      </div>
    </footer>
  );
}
