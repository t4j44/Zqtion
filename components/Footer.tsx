'use client'

import { Youtube, Linkedin, Twitter, Github, Mail, Phone } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="relative bg-[#0a0a0a] border-t border-white/5 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-white to-white/60 rounded-xl flex items-center justify-center">
                <span className="text-black font-black text-2xl">Z</span>
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
                  className="text-white/60 hover:text-white transition-colors duration-300 text-sm"
                  whileHover={{ x: 5 }}
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
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 text-sm"
              >
                <Phone className="w-4 h-4" />
                +880 1340-347975
              </a>
              <div className="flex items-center gap-4 pt-4">
                {[
                  { Icon: Twitter, href: 'https://twitter.com' },
                  { Icon: Github, href: 'https://github.com' },
                  { Icon: Linkedin, href: 'https://www.linkedin.com/company/zqtion/about/' },
                  // { Icon: Youtube, href: 'https://youtube.com' },
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
  )
}
