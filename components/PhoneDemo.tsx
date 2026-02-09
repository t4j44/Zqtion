'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function PhoneDemo() {
  return (
    <section className="relative z-20 bg-zqtion-black py-32 px-6 border-t border-white/5 overflow-hidden transform-gpu">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center will-change-scroll">
        
        {/* Left: Copy */}
        <div className="space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Your PDF menu is<br/> 
            <span className="text-white/40">losing customers.</span>
          </h2>
          <p className="text-xl text-white/60 max-w-lg leading-relaxed">
            Static files are dead. We build 0.5s load-time systems that convert traffic into revenue. Zero friction. Zero latency.
          </p>
          
          <div className="flex gap-4 pt-4">
            <button className="px-8 py-4 bg-zqtion-blue hover:bg-blue-600 text-white font-bold rounded-full transition-all">
              See the Difference
            </button>
          </div>
        </div>

        {/* Right: Phone Demo */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Phone Frame */}
          <div className="relative w-[300px] h-[600px] bg-black border-8 border-neutral-900 rounded-[3rem] shadow-2xl overflow-hidden ring-1 ring-white/10">
            
            {/* Dynamic Notch */}
            <div className="absolute top-0 inset-x-0 h-7 bg-black z-20 mx-auto w-40 rounded-b-2xl" />
            
            {/* Screen Content */}
            <div className="absolute inset-0 bg-neutral-950 flex flex-col">
              
              {/* Header */}
              <div className="h-20 bg-neutral-900/50 backdrop-blur-md flex items-end pb-3 px-6 border-b border-white/5 z-10">
                <span className="text-white font-bold tracking-tight">MENU</span>
              </div>

              {/* Scrolling List */}
              <div className="flex-1 overflow-hidden relative">
                {/* Looping Content */}
                <motion.div
                  className="absolute w-full px-4 py-4 space-y-3 will-change-transform"
                  animate={{ y: [0, -300] }}
                  transition={{
                    duration: 10,
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  {/* Duplicated list for seamless loop - 2 Sets */}
                  {[...Array(2)].map((_, listIndex) => (
                    <div key={listIndex} className="space-y-3 pb-3">
                      {[
                        { name: "Double Smash", price: "$16" },
                        { name: "Truffle Fries", price: "$8" },
                        { name: "Spicy Rigatoni", price: "$22" },
                        { name: "Wagyu Slider", price: "$18" },
                        { name: "Crispy Calamari", price: "$14" },
                        { name: "Caesar Salad", price: "$12" },
                      ].map((item, i) => (
                        <div key={`${listIndex}-${i}`} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-white text-sm font-medium">{item.name}</span>
                          <span className="text-zqtion-blue font-bold">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </motion.div>
                
                {/* Gradient Overlays for smoothness */}
                <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-neutral-950 to-transparent z-10" />
                <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-neutral-950 to-transparent z-10" />
              </div>
              
              {/* Bottom Bar */}
              <div className="h-20 bg-neutral-900/80 backdrop-blur-md border-t border-white/5 px-6 flex items-center justify-between z-20">
                <div className="w-full h-12 bg-zqtion-blue rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                    <span className="text-white text-xs font-bold">ADD TO CART</span>
                </div>
              </div>

            </div>
          </div>
          
          {/* Decorative Glow */}
          <div className="absolute -inset-10 bg-zqtion-blue/20 blur-3xl -z-10 rounded-full opacity-50" />
        </div>

      </div>
    </section>
  )
}
