'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Play, Server, Layers } from 'lucide-react'
import { useState } from 'react'

const services = [
  {
    id: 1,
    title: "AI Video Studio",
    subtitle: "Automated Content Pipelines",
    description: "Generative video workflows that scale your narrative 100x.",
    icon: Play,
    colSpan: "md:col-span-2",
    bg: "bg-neutral-900", 
    gradient: "from-purple-900/50 to-blue-900/50"
  },
  {
    id: 2,
    title: "Visual Ops",
    subtitle: "Workflow Automation",
    description: "Before/After logic for creative teams.",
    icon: Layers,
    colSpan: "md:col-span-1",
    interactive: true
  },
  {
    id: 3,
    title: "Web Architecture",
    subtitle: "Zero Latency Systems",
    description: "Next.js 14 infrastructure built for immediate conversion.",
    icon: Server,
    colSpan: "md:col-span-3",
    gradient: "from-neutral-900 to-neutral-800"
  }
]

export default function Services() {
  const [sliderValue, setSliderValue] = useState(50)

  return (
    <section className="relative z-20 bg-zqtion-black py-32 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
        
        {services.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`
              group relative overflow-hidden rounded-3xl border border-neutral-800 
              bg-neutral-900/40 backdrop-blur-md hover:border-zqtion-blue/30 transition-all duration-500
              ${service.colSpan}
            `}
          >
            {/* Background Gradient */}
            {!service.interactive && (
               <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient || 'from-neutral-900 to-neutral-900'} opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
            )}

            {/* Special Interactive Card (Visual Ops) */}
            {service.interactive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 {/* Before/After Slider Demo */}
                 <div className="relative w-full h-full select-none">
                    <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center text-white/20 font-bold text-4xl">
                        BEFORE
                    </div>
                    <div 
                        className="absolute inset-0 bg-zqtion-blue overflow-hidden flex items-center border-r-2 border-white"
                        style={{ width: `${sliderValue}%` }}
                    >
                         <div 
                           className="h-full flex items-center justify-center absolute left-0 top-0 text-white font-bold text-4xl" 
                           style={{ width: `${sliderValue > 0 ? (100 / sliderValue) * 100 : 0}%`, minWidth: '100%' }}
                          >
                           AFTER
                         </div>
                    </div>
                    {/* Input range overlay */}
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={sliderValue} 
                      onChange={(e) => setSliderValue(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-20 touch-none"
                    />
                 </div>
              </div>
            )}

            {/* Content Overlay */}
            <div className={`relative h-full flex flex-col justify-end p-8 z-10 pointer-events-none ${service.interactive ? 'bg-gradient-to-t from-black/80 to-transparent' : ''}`}>
               <div className="w-12 h-12 mb-4 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <service.icon className="w-5 h-5 text-white" />
               </div>
               
               <h3 className="text-3xl font-bold text-white mb-2">{service.title}</h3>
               <p className="text-white/60 mb-2">{service.subtitle}</p>
               <p className="text-sm text-white/40">{service.description}</p>
               
               <div className="absolute top-8 right-8 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-8 h-8 text-white" />
               </div>
            </div>

          </motion.div>
        ))}

      </div>
    </section>
  )
}
