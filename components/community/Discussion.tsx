import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import JsonLd, { getBreadcrumbSchema } from "@/components/seo/JsonLd";
import { siteConfig } from "@/data/site";
import { childrenOf, entryMedia, getEntry, searchCommunity } from "@/lib/community/server";
import { discussionSchema } from "@/lib/community/seo";
import { entryPath } from "@/lib/community/types";
import Identity, { Picture } from "./Identity";
import EntryActions, { CopyPrompt } from "./EntryActions";
import Composer from "./Composer";
import Conversation from "./Conversation";
import { ParticipationGate } from "./CommunityProvider";
export default async function Discussion({ id, prompts = false, page = 1, sort = "top" }: { id: string; prompts?: boolean; page?: number; sort?: string }) {
  const entry = await getEntry(id); if (!entry) notFound();
  if (entry.root_id) redirect(entryPath(entry));
  if ((entry.kind === "prompt") !== prompts) redirect(entryPath(entry));
  const order = sort === "newest" ? "newest" : "top";
  const [thread, source, acceptedEntry, related, relevantPrompts] = await Promise.all([
    childrenOf(id, order, (page - 1) * 10, entry.accepted_answer_id), entry.parent_prompt_id ? getEntry(entry.parent_prompt_id) : Promise.resolve(null),
    entry.accepted_answer_id ? getEntry(entry.accepted_answer_id) : Promise.resolve(null),
    searchCommunity({ kind: "experiences", category: entry.category, tool: entry.tool }).catch(() => null),
    searchCommunity({ kind: "prompt", category: entry.category, tool: entry.tool }).catch(() => null),
  ]);
  const media = await entryMedia([id, ...(acceptedEntry ? [acceptedEntry.id] : [])]);
  const accepted = acceptedEntry ? { ...acceptedEntry, media: media.filter(m => m.entry_id === acceptedEntry.id) } : null;
  const path = entryPath(entry); const indexPath = prompts ? "/prompts/community" : "/ai-experiences"; const indexName = prompts ? "Community prompts" : "AI Experiences";
  const relatedItems = related?.entries.filter(e => e.id !== id).slice(0, 3) || []; const promptItems = relevantPrompts?.entries.filter(e => e.id !== id).slice(0, 3) || [];
  return <div className="cq-discussion">
    <nav className="cq-breadcrumb" aria-label="Breadcrumb"><Link prefetch={false} href="/">Home</Link><span>/</span><Link prefetch={false} href={indexPath}>{indexName}</Link><span>/</span><span aria-current="page">{entry.kind}</span></nav>
    <JsonLd schema={[getBreadcrumbSchema([{ name: "Home", url: siteConfig.url }, { name: indexName, url: `${siteConfig.url}${indexPath}` }, { name: entry.title, url: `${siteConfig.url}${path}` }]), discussionSchema(entry, [...(accepted ? [accepted] : []), ...thread.entries])]} />
    <header className="cq-hero"><p className="cq-kicker">{entry.kind === "prompt" ? "Community prompt" : entry.kind} · {entry.category}</p><h1>{entry.title}</h1><Identity profile={entry.author} /><p className="cq-meta"><time dateTime={entry.created_at}>Published {new Date(entry.created_at).toLocaleDateString("en-GB", { timeZone: "UTC" })}</time>{entry.updated_at !== entry.created_at && <time dateTime={entry.updated_at}>Updated {new Date(entry.updated_at).toLocaleDateString("en-GB", { timeZone: "UTC" })}</time>}{entry.tool && <span>{entry.tool}</span>}{entry.session_slug && <span>Session: {entry.session_slug}</span>}</p></header>
    <article className="cq-panel cq-root-post"><p className="cq-body">{entry.body}</p>{entry.kind === "prompt" && <><h2 className="cq-section-title">The prompt</h2><pre className="cq-prompt">{entry.prompt_text}</pre><CopyPrompt text={entry.prompt_text} /></>}{source && <p className="cq-hint">Remixed from <Link prefetch={false} className="cq-text-link" href={entryPath(source)}>{source.title}</Link> by <Link prefetch={false} className="cq-text-link" href={`/u/${source.author.username}`}>@{source.author.username}</Link>.</p>}{entry.parent_prompt_id && !source && <p className="cq-hint">Remixed from a prompt that is no longer public.</p>}<div className="cq-media-grid">{media.filter(m => m.entry_id === entry.id).map(m => <figure key={m.id}><Picture id={m.id} alt={m.alt} /><figcaption>{m.alt}</figcaption></figure>)}</div><div className="cq-meta">{entry.tags.map(t => <Link prefetch={false} key={t} href={`${indexPath}?q=${encodeURIComponent(t)}`}>#{t}</Link>)}</div><EntryActions entry={entry} /></article>
    {entry.kind === "prompt" && <details><summary className="cq-section-title">Share a result from this prompt</summary><ParticipationGate><Composer initialKind="result" parent={entry} /></ParticipationGate></details>}
    <Conversation key={`${id}:${order}:${page}`} root={entry} initial={thread} accepted={accepted} sort={order} page={page} />
    {(page > 1 || thread.more) && <nav aria-label="Conversation pages" className="cq-pagination">{page > 1 && <Link prefetch={false} className="cq-button" href={`${path}?sort=${order}&page=${page - 1}#conversation`}>Previous page</Link>}{thread.more && <Link prefetch={false} className="cq-text-link" href={`${path}?sort=${order}&page=${page + 1}#conversation`}>Next conversation page</Link>}</nav>}
    <section className="cq-related" aria-label="Explore related work">{relatedItems.length > 0 && <><h2 className="cq-section-title">Related discussions</h2>{relatedItems.map(e => <p key={e.id}><Link prefetch={false} className="cq-text-link" href={entryPath(e)}>{e.title}</Link></p>)}</>}<h2 className="cq-section-title">Relevant prompts</h2>{promptItems.map(e => <p key={e.id}><Link prefetch={false} className="cq-text-link" href={entryPath(e)}>{e.title}</Link></p>)}<Link prefetch={false} className="cq-button" href={`/prompts${entry.category === "creative" ? "/image" : entry.category === "build" ? "/vibe-coding" : ""}`}>Explore Zqtion Original prompts ↗</Link></section>
  </div>;
}
