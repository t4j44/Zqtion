'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Video, Aperture, Cpu } from 'lucide-react';

const services = [
  {
    id: 'ai-video',
    title: 'AI VIDEO STUDIO',
    icon: Video,
    gradient: 'from-blue-600/20 via-purple-900/40 to-black',
    highlight: 'text-blue-400',
    items: ['VFX & Motion Graphics', 'AI Commercials', 'Brand Storytelling', 'AI UGC']
  },
  {
    id: 'visual-ops',
    title: 'VISUAL OPS',
    icon: Aperture,
    gradient: 'from-red-600/20 via-orange-900/40 to-black',
    highlight: 'text-orange-400',
    items: ['Product Photo Remastering', 'Social Posters', 'High-End Retouching', 'Batch Processing']
  },
  {
    id: 'web-arch',
    title: 'WEB ARCHITECTURE',
    icon: Cpu,
    gradient: 'from-emerald-600/20 via-cyan-900/40 to-black',
    highlight: 'text-emerald-400',
    items: ['0.5s Mobile Menus', 'Headless Shopify', 'Dynamic Booking', 'WebGL Experiences']
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black overflow-x-hidden">
      {/* Background Ambient Light */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 pt-32 pb-20 max-w-7xl mx-auto px-6">
        <motion.h1 
          className="text-6xl md:text-9xl font-black tracking-tighter mb-20 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          OPERATIONAL
          <br />
          MENU.
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <SpotlightCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SpotlightCard({ service, index }: { service: any, index: number }) {
  const phoneNumber = '8801340347975';
  const message = encodeURIComponent(`I want to book: ${service.title}`);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.div
      className="group relative h-full min-h-[500px] rounded-3xl border border-white/10 overflow-hidden bg-neutral-900/30 backdrop-blur-sm"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + (index * 0.1), duration: 0.6 }}
      whileHover={{ y: -5 }}
    >
      {/* Dynamic Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
      
      {/* Content */}
      <div className="relative h-full p-8 flex flex-col z-20">
        <div className="mb-6 p-4 rounded-full bg-white/5 w-fit border border-white/10 backdrop-blur-md">
            <service.icon className={`w-8 h-8 ${service.highlight}`} />
        </div>

        <h3 className="text-3xl font-bold tracking-tight mb-8 group-hover:text-white transition-colors duration-300">
            {service.title}
        </h3>

        <ul className="space-y-4 mb-auto">
            {service.items.map((item: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-neutral-400 group-hover:text-neutral-200 transition-colors">
                    <div className={`w-1.5 h-1.5 rounded-full ${service.highlight.replace('text-', 'bg-')}`} />
                    <span className="text-lg font-medium">{item}</span>
                </li>
            ))}
        </ul>

        <div className="mt-12">
            <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between w-full px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group-hover:border-white/20"
            >
                <span className="font-bold tracking-wide">BOOK VIA WHATSAPP</span>
                <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </a>
        </div>
      </div>
    </motion.div>
  );
}
