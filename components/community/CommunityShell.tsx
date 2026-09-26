import Link from "next/link";
import Footer from "@/components/Footer";
import JsonLd, { getBreadcrumbSchema } from "@/components/seo/JsonLd";
import { siteConfig } from "@/data/site";
import CommunityProvider, { AccountLink } from "./CommunityProvider";
import "./community.css";
export default function CommunityShell({ children, embedded = false }: { children: React.ReactNode; embedded?: boolean }) {
  const content = <CommunityProvider><div className="cq-shell"><nav className="cq-nav" aria-label="Community navigation"><Link prefetch={false} href="/ai-experiences" className="cq-brand">Z / COMMUNITY</Link><div><Link prefetch={false} href="/ai-experiences">AI Experiences</Link><Link prefetch={false} href="/prompts/community">Community prompts</Link><Link prefetch={false} href="/community/saved">Saved</Link><Link prefetch={false} href="/share">Share ↗</Link><AccountLink /></div></nav>{children}<section className="cq-service"><div><p className="cq-kicker">Put the learning to work</p><h2>Need help implementing this?</h2><p>Explore Zqtion’s creative, product and automation services.</p></div><Link prefetch={false} href="/contact" className="cq-button" data-analytics="service_contact_click" data-analytics-location="community">Work with Zqtion ↗</Link></section><nav className="cq-bottom" aria-label="Community resources"><Link prefetch={false} href="/community/guidelines">Community guidelines</Link><Link prefetch={false} href="/privacy">Privacy</Link><Link prefetch={false} href="/prompts">Zqtion Original prompts</Link><Link prefetch={false} href="/services">Services</Link></nav></div></CommunityProvider>;
  return embedded ? <div className="cq-community cq-embedded">{content}</div> : <><main id="main-content" className="cq-community">{content}</main><Footer /></>;
}
export function CommunityHeader({ title, description, label = "Learn in public. Build with purpose." }: { title: string; description: string; label?: string }) {
  return <header className="cq-hero"><p className="cq-kicker"><span aria-hidden="true">●</span> {label}</p><h1>{title}</h1><p>{description}</p></header>;
}
export function CommunityCollectionSchema({ title, description, path }: { title: string; description: string; path: string }) {
  return <JsonLd schema={[{ "@context": "https://schema.org", "@type": "CollectionPage", name: title, description, url: `${siteConfig.url}${path}`, isPartOf: { "@id": `${siteConfig.url}/#website` } }, getBreadcrumbSchema([{ name: "Home", url: siteConfig.url }, { name: title, url: `${siteConfig.url}${path}` }])]} />;
}
