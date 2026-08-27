import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { navigation, siteConfig } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050608]">
      <div className="section-shell py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.35fr_0.65fr_0.65fr]">
          <div>
            <Link href="/" className="flex w-fit items-center gap-3" aria-label="Zqtion home">
              <span className="relative h-11 w-11 overflow-hidden rounded-xl border border-white/10 bg-black">
                <Image src="/logo.png" alt="" fill sizes="44px" className="object-cover" />
              </span>
              <span className="font-extrabold tracking-[0.18em]">ZQTION</span>
            </Link>
            <p className="mt-6 max-w-md text-2xl font-medium leading-tight tracking-[-0.035em] text-white/78">
              Founder-led execution for creative, digital products, and practical automation.
            </p>
            <p className="mt-5 text-sm text-white/42">Remote collaboration for teams worldwide.</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">Explore</p>
            <nav className="mt-5 flex flex-col items-start gap-3" aria-label="Footer navigation">
              {navigation.map((item) => <Link key={item.href} href={item.href} className="text-sm text-white/62 transition hover:text-white">{item.label}</Link>)}
              <Link href="/contact" className="text-sm text-white/62 transition hover:text-white">Contact</Link>
            </nav>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">Connect</p>
            <div className="mt-5 flex flex-col items-start gap-3">
              <a href={`mailto:${siteConfig.email}`} className="text-sm text-white/62 transition hover:text-white">Email</a>
              <a href={siteConfig.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-white/62 transition hover:text-white">LinkedIn <ArrowUpRight className="h-3.5 w-3.5" /></a>
              <a href={siteConfig.youtube} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-white/62 transition hover:text-white">YouTube <ArrowUpRight className="h-3.5 w-3.5" /></a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Zqtion. Execution, automated.</p>
          <div className="flex gap-5"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link></div>
        </div>
      </div>
    </footer>
  );
}
