'use client'

import { Twitter, Github, Linkedin, Mail } from 'lucide-react'

// Enhanced Video Embed Component with Aspect Ratio Support
const VideoEmbed = ({ 
  videoId, 
  title, 
  isVertical = false 
}: { 
  videoId: string; 
  title: string;
  isVertical?: boolean;
}) => {
  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/50 hover:border-zqtion-blue/50 transition-all duration-300 group flex flex-col h-full">
      <div className={`relative w-full ${isVertical ? 'aspect-[9/16]' : 'aspect-video'} bg-black`}>
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        />
      </div>
      <div className="p-4 border-t border-white/5">
        <h3 className="text-sm font-bold text-white truncate">{title}</h3>
      </div>
    </div>
  )
}

export default function Portfolio() {
  // Main Feature (Standard 16:9)
  const heroVideo = { 
    id: 'VwDoPRrh54c', 
    title: "Brand Anthem: The Zqtion Way" 
  }

  // Shorts / Reels (Vertical 9:16)
  const shorts = [
    { id: 'Xo3gnXB2qK0', title: "Production Logic" },
    { id: 'GkyqartrbWo', title: "Visual Synthesis" },
    { id: 'xCimfv7TVO8', title: "Automated Scale" },
    { id: 'a5MKUYqTuYw', title: "Creative Ops" },
    { id: 'XyELtgnSmVM', title: "Workflow Speed" },
    { id: 'Sjs6kCwQJOA', title: "System Architecture" },
    { id: 'tlUPzwuj7ck', title: "Output Velocity" },
    { id: '0UvUsmJEROM', title: "Render Efficiency" },
    { id: 'hNXUm7NUo2Q', title: "Final Engagement" },
  ]

  return (
    <>
      <section className="relative z-20 bg-zqtion-black py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-24">
          
          {/* Header */}
          <div className="max-w-xl">
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Selected Works</h2>
             <div className="h-1 w-20 bg-zqtion-blue mb-8" />
             <p className="text-xl text-neutral-400">
               High-impact visuals engineered for conversion. From long-form narratives to viral shorts.
             </p>
          </div>

          {/* 1. Main Feature Video */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zqtion-blue"></span>
              Featured Production
            </h3>
            <div className="w-full max-w-4xl">
               <VideoEmbed videoId={heroVideo.id} title={heroVideo.title} />
            </div>
          </div>

          {/* 2. Shorts Grid */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zqtion-blue"></span>
              Viral Shorts & Reels
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {shorts.map((video, idx) => (
                <VideoEmbed 
                  key={idx} 
                  videoId={video.id} 
                  title={video.title} 
                  isVertical={true} 
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 bg-black border-t border-neutral-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">Z</div>
            <span className="text-xl font-bold tracking-tight text-white">ZQTION</span>
          </div>

          {/* Copyright */}
          <div className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} Zqtion. Execution, Automated.
          </div>

          {/* Socials */}
          <div className="flex gap-6">
            <a href="#" className="text-neutral-400 hover:text-white transition-colors"><Twitter size={20}/></a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors"><Github size={20}/></a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors"><Linkedin size={20}/></a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors"><Mail size={20}/></a>
          </div>

        </div>
      </footer>
    </>
  )
}
