import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/site";

const columns = [
  {
    title: "Studio",
    links: [
      { href: "/work", label: "Work" },
      { href: "/services", label: "Services" },
      { href: "/process", label: "Process" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/insights", label: "Insights" },
      { href: "/prompts", label: "Prompts" },
      { href: "/prompts/methods", label: "Prompting methods" },
      { href: "/prompts/methodology", label: "Prompt methodology" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/ai-experiences", label: "Community" },
      { href: "/community/account?next=%2Fai-experiences", label: "Join the community", analytics: "community_join_click" },
      { href: "/careers", label: "Careers" },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="site-footer relative overflow-hidden border-t border-white/10 bg-[#050608]">
      <div className="footer-wordmark" aria-hidden="true">ZQTION</div>
      <div className="section-shell relative z-10 pb-8 pt-10 sm:pt-14">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="inline-flex min-h-11 items-center gap-3" aria-label="Zqtion home">
              <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-black">
                <Image src="/logo.png" alt="" fill sizes="40px" className="object-cover" />
              </span>
              <span className="font-extrabold tracking-[0.18em]">ZQTION</span>
            </Link>
            <p className="mt-5 max-w-sm text-lg font-medium leading-snug tracking-[-0.02em] text-white/80">
              Founder-led execution for creative, digital products, and practical automation.
            </p>
            <p className="mt-3 text-sm text-white/60">Remote collaboration for teams worldwide.</p>
            <div className="footer-connect mt-6 flex flex-wrap items-center gap-2">
              <a href={`mailto:${siteConfig.email}`} className="footer-pill" data-analytics="email_click" data-analytics-location="footer">{siteConfig.email}</a>
              <a href={siteConfig.linkedin} target="_blank" rel="noreferrer" className="footer-pill">LinkedIn <ArrowUpRight className="h-3.5 w-3.5" /></a>
              <a href={siteConfig.youtube} target="_blank" rel="noreferrer" className="footer-pill">YouTube <ArrowUpRight className="h-3.5 w-3.5" /></a>
            </div>
          </div>

          <nav className="footer-columns" aria-label="Footer navigation">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="footer-heading">{column.title}</p>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="footer-link" {...(link.href === "/contact" ? { "data-analytics": "service_contact_click", "data-analytics-location": "footer" } : "analytics" in link ? { "data-analytics": link.analytics, "data-analytics-location": "footer" } : {})}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="footer-legal mt-10 flex flex-col gap-1 border-t border-white/10 pt-4 text-xs text-white/60 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Zqtion. Execution, automated.</p>
          <div className="flex gap-2"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link></div>
        </div>
      </div>
    </footer>
  );
}
