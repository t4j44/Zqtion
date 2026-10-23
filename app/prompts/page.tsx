import Link from "next/link";
import { promptMetadata } from "@/lib/prompts/seo";
import { getAllPrompts, getCategories, getPromptMethods, getTools } from "@/lib/prompts/service";
import { LibraryHeader, LibrarySeo } from "@/components/prompts/LibraryShell";
import Collection, { type SearchParams } from "@/components/prompts/Collection";
export const metadata = promptMetadata("AI Prompt Library — Create, design & build", "Explore original Zqtion prompts for UI design, image creation and coding. Customize practical briefs and learn the structures behind them.", "/prompts");
export default async function PromptsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <>
    <LibrarySeo title="Zqtion Prompt Library" description="Original AI prompts, practical frameworks and editable briefs for better work." path="/prompts" />
    <LibraryHeader title="Start with a better brief." description="Explore practical AI prompts for creating, designing and building. Understand the structure. Make it your own. Put it to work."><div className="pl-hero-meta"><span>{getAllPrompts().length} original prompts</span><span>{getCategories().length} creative disciplines</span><span>Free to explore</span></div></LibraryHeader>
    <nav className="pl-category-tabs" aria-label="Prompt categories"><span aria-current="page">All prompts</span>{getCategories().map((c) => <Link key={c.slug} href={`/prompts/${c.slug}`}>{c.title} <span aria-hidden="true">↗</span></Link>)}</nav>
    <nav className="pl-category-tabs" aria-label="Prompt source"><span aria-current="page">Zqtion Original</span><Link href="/prompts/community">Community ↗</Link></nav>
    <Collection query={await searchParams} />
    <section className="pl-learning-section"><div><p className="pl-kicker">Beyond copy and paste</p><h2>Learn what makes<br /><em>a prompt work.</em></h2><p>Give an AI tool a clear purpose, useful context and something you can actually check.</p><Link href="/prompts/methods" className="pl-action">Explore all methods ↗</Link></div><div className="pl-method-list">{getPromptMethods().filter((m) => ["structured-prompting", "image-prompt-formula", "vibe-coding-framework"].includes(m.slug)).map((m, i) => <Link key={m.slug} href={`/prompts/methods/${m.slug}`}><span>0{i + 1}</span><div><h3>{m.title}</h3><p>{m.description}</p></div><span aria-hidden="true">↗</span></Link>)}</div></section>
    <section className="pl-tool-section"><p className="pl-kicker">Bring your own tool</p><h2>A brief you can take with you.</h2><div className="pl-tool-links">{getTools().map((t) => <Link key={t.slug} href={`/prompts/tools/${t.slug}`}>{t.title}<span aria-hidden="true">↗</span></Link>)}</div><p className="pl-muted pl-small">Tool labels describe intended workflows. Results vary; these prompts are not model-certified.</p></section>
  </>;
}
