import ScrollyCanvas from '@/components/ScrollyCanvas'
import Overlay from '@/components/Overlay'
import Services from '@/components/Services'
import PhoneDemo from '@/components/PhoneDemo'
import Portfolio from '@/components/Portfolio'
import SmoothScroll from '@/components/SmoothScroll'

export default function Home() {
  return (
    <SmoothScroll>
      <main className="bg-zqtion-black min-h-screen font-sans selection:bg-zqtion-blue selection:text-white">
        
        {/* SECTION A: The Hero Engine (Scroll Depth: 500vh) */}
        {/* The ScrollyCanvas component handles the tall 'height' internally to drive the scroll animation */}
        {/* The Overlay sits fixed on top of it */}
        <div className="relative">
          <ScrollyCanvas />
          <Overlay />
        </div>

        {/* SECTION B: The Service Ecosystem */}
        <Services />

        {/* SECTION C: The 'Killer Feature' Demo */}
        <PhoneDemo />

        {/* SECTION D: Portfolio & Footer */}
        <Portfolio />

      </main>
    </SmoothScroll>
  )
}
