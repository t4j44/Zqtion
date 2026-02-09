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
        {/* The Overlay sits inside it to scroll away with the sticky container */}
        <div className="relative">
          <ScrollyCanvas>
            <Overlay />
          </ScrollyCanvas>
        </div>

        {/* SECTION B: The Service Ecosystem */}
        <div className="isolate">
          <Services />
        </div>

        {/* SECTION C: The 'Killer Feature' Demo */}
        <PhoneDemo />

        {/* SECTION D: Portfolio & Footer */}
        <Portfolio />

      </main>
    </SmoothScroll>
  )
}
