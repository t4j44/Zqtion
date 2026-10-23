import Footer from "@/components/Footer";
import Link from "next/link";
import "./prompts.css";
export default function PromptLayout({ children }: { children: React.ReactNode }) {
  return <><main id="main-content" className="pl-library"><div className="pl-shell"><nav className="pl-subnav" aria-label="Prompt library navigation"><Link href="/prompts">The library <span aria-hidden="true">↗</span></Link><div><Link href="/prompts/methods">Learn the methods</Link><Link href="/prompts/tools">Browse tools</Link><Link href="/prompts/methodology">Our approach</Link></div></nav>{children}</div><section className="pl-bottom-note"><p>A good prompt is a clear brief.<br /><span>Better judgment still belongs to you.</span></p><Link href="/prompts/methodology">How we make this library ↗</Link></section></main><Footer /></>;
}
