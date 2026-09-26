import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { navigation, siteConfig } from "@/data/site";

export default function Footer() {
  return (
    <footer className="site-footer border-t border-white/10 bg-[#050608]">
      <div className="section-shell py-10 sm:py-20">
        <div className="grid gap-8 sm:gap-14 lg:grid-cols-[1.35fr_0.65fr_0.65fr]">
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
            <p className="mt-5 text-sm text-white/60">Remote collaboration for teams worldwide.</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Explore</p>
            <nav className="footer-explore mt-3 grid grid-cols-2 gap-x-5 gap-y-0 sm:mt-5 sm:flex sm:flex-col sm:items-start sm:gap-3" aria-label="Footer navigation">
              {navigation.map((item) => <Link key={item.href} href={item.href} className="text-sm text-white/62 transition hover:text-white">{item.label}</Link>)}
              <Link href="/prompts/methods" className="text-sm text-white/62 transition hover:text-white">Prompting methods</Link>
              <Link href="/prompts/methodology" className="text-sm text-white/62 transition hover:text-white">Prompt methodology</Link>
              <Link href="/contact" className="text-sm text-white/62 transition hover:text-white" data-analytics="service_contact_click" data-analytics-location="footer">Contact</Link>
            </nav>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Connect</p>
            <div className="footer-connect mt-3 grid grid-cols-2 gap-x-5 gap-y-0 sm:mt-5 sm:flex sm:flex-col sm:items-start sm:gap-3">
              <a href={`mailto:${siteConfig.email}`} aria-label={`Email ${siteConfig.email}`} className="inline-flex min-h-11 items-center text-sm text-white/62 transition hover:text-white" data-analytics="email_click" data-analytics-location="footer"><span className="sm:hidden">Email</span><span className="hidden sm:inline">{siteConfig.email}</span></a>
              <a href={siteConfig.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-white/62 transition hover:text-white">LinkedIn <ArrowUpRight className="h-3.5 w-3.5" /></a>
              <a href={siteConfig.youtube} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-white/62 transition hover:text-white">YouTube <ArrowUpRight className="h-3.5 w-3.5" /></a>
            </div>
          </div>
        </div>

        <div className="footer-legal mt-8 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-white/60 sm:mt-16 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p>© {new Date().getFullYear()} Zqtion. Execution, automated.</p>
          <div className="flex gap-5"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link></div>
        </div>
      </div>
    </footer>
  );
}
