"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Card } from "@/lib/community/types";
import Identity, { Picture } from "./Identity";
import EntryActions from "./EntryActions";
import ExpandableText from "./ExpandableText";
import InlineComposer from "./InlineComposer";
type Page = { entries: Card[]; more: boolean };
async function load(parent: string, sort: string, offset: number): Promise<Page> {
  const response = await fetch(`/api/community/conversation?${new URLSearchParams({ parent, sort, offset: String(offset) })}`);
  const result = await response.json(); if (!response.ok) throw new Error(result.error || "Could not load replies."); return result;
}
function Contribution({ entry, question }: { entry: Card; question: Card }) {
  const [replying, setReplying] = useState(false); const [expanded, setExpanded] = useState(false); const [replies, setReplies] = useState<Card[]>([]); const [loaded, setLoaded] = useState(false); const [more, setMore] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function fetchReplies(append = false) {
    if (busy) return; setBusy(true); setError("");
    try { const page = await load(entry.id, "newest", append ? replies.length : 0); setReplies(current => append ? [...current, ...page.entries.filter(e => !current.some(c => c.id === e.id))] : page.entries); setMore(page.more); setLoaded(true); setExpanded(true); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load replies."); } finally { setBusy(false); }
  }
  const replyCount = Math.max(Number(entry.counts.comments || 0), replies.length);
  return <article id={`entry-${entry.id}`} className={`cq-reply ${question.accepted_answer_id === entry.id ? "cq-accepted" : ""}`} data-kind={entry.kind}>
    <div className="cq-meta"><span className={question.accepted_answer_id === entry.id ? "cq-accepted-label" : "cq-reply-kind"}>{question.accepted_answer_id === entry.id ? "✓ Accepted Answer" : entry.kind}</span><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleDateString("en-GB", { timeZone: "UTC" })}</time></div>
    <Identity profile={entry.author} /><ExpandableText text={entry.body} lines={entry.kind === "answer" ? 8 : 5} />
    {entry.media?.length ? <div className="cq-media-grid">{entry.media.map(m => <figure key={m.id}><Picture id={m.id} alt={m.alt} /><figcaption>{m.alt}</figcaption></figure>)}</div> : null}
    <EntryActions entry={entry} question={question.kind === "question" ? question : undefined} compact onReply={entry.kind !== "comment" || entry.reply_depth < 2 ? () => setReplying(true) : undefined} />
    {replying && <InlineComposer parent={entry} opened onCancel={() => setReplying(false)} onPosted={reply => { setReplies(current => [reply, ...current]); setExpanded(true); setReplying(false); }} />}
    {replyCount > 0 && <button type="button" className="cq-text-button" aria-expanded={expanded} aria-controls={`replies-${entry.id}`} disabled={busy} onClick={() => { if (expanded) setExpanded(false); else if (loaded) setExpanded(true); else void fetchReplies(); }}>{busy ? "Loading replies…" : expanded ? "Hide replies" : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}</button>}
    {expanded && <div id={`replies-${entry.id}`} className="cq-nested-replies">{replies.map(reply => <Contribution key={reply.id} entry={reply} question={question} />)}{more && <button className="cq-button" disabled={busy} onClick={() => void fetchReplies(true)}>View more replies</button>}</div>}
    {error && <p className="cq-notice" role="alert">{error} <button type="button" className="cq-text-button" onClick={() => void fetchReplies()}>Try again</button></p>}
  </article>;
}
export default function Conversation({ root, initial, accepted, sort, page }: { root: Card; initial: Page; accepted: Card | null; sort: string; page: number }) {
  const [extra, setExtra] = useState<Card[]>([]); const [posted, setPosted] = useState<Card[]>([]); const [more, setMore] = useState(initial.more); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [linked, setLinked] = useState<Card | null>(null);
  const entries = [...posted, ...initial.entries, ...extra].filter((e, i, all) => e.id !== accepted?.id && all.findIndex(a => a.id === e.id) === i);
  useEffect(() => {
    async function reveal() {
      const target = window.location.hash.match(/^#entry-([a-f0-9-]{36})$/)?.[1];
      if (!target || document.getElementById(`entry-${target}`)) return;
      try { const res = await fetch(`/api/community/conversation?target=${target}&root=${root.id}`); if (res.ok) { const result = await res.json(); setLinked(result.entry); window.setTimeout(() => document.getElementById(`entry-${target}`)?.scrollIntoView({ block: "start" }), 80); } } catch { /* The normal conversation remains available. */ }
    }
    void reveal(); window.addEventListener("hashchange", reveal); return () => window.removeEventListener("hashchange", reveal);
  }, [root.id]);
  const add = (entry: Card) => setPosted(current => [entry, ...current]);
  return <section id="conversation" className="cq-conversation" aria-labelledby="conversation-title"><div className="cq-heading-row"><h2 id="conversation-title" className="cq-section-title">{root.kind === "question" ? `${root.counts.answers} Answers` : "Conversation"}</h2><nav className="cq-sort" aria-label="Conversation sorting"><Link prefetch={false} href="?sort=top#conversation" aria-current={sort === "top" ? "page" : undefined}>Top</Link><Link prefetch={false} href="?sort=newest#conversation" aria-current={sort === "newest" ? "page" : undefined}>Newest</Link></nav></div>
    {root.kind === "question" && <InlineComposer parent={root} kind="answer" onPosted={add} />}
    {accepted && <Contribution entry={accepted} question={root} />}
    {linked && !entries.some(e => e.id === linked.id) && linked.id !== accepted?.id && <div className="cq-linked-contribution"><p className="cq-hint">Linked contribution · {linked.parent_title}</p><Contribution entry={linked} question={root} /></div>}
    {!entries.length && !accepted && <p className="cq-empty">{root.kind === "question" ? "No answers yet. Know what worked? Share your answer." : "No comments yet. Start the discussion."}</p>}
    <div className="cq-thread-list">{entries.map(entry => <Contribution key={entry.id} entry={entry} question={root} />)}</div>
    {more && <button className="cq-button" disabled={busy} onClick={async () => { if (busy) return; setBusy(true); setError(""); try { const next = await load(root.id, sort, (page - 1) * 10 + initial.entries.length + extra.length); setExtra(current => [...current, ...next.entries]); setMore(next.more); } catch (e) { setError(e instanceof Error ? e.message : "Could not load more comments."); } finally { setBusy(false); } }}>{busy ? "Loading…" : "View more comments"}</button>}
    {error && <p role="alert" className="cq-notice">{error}</p>}
    <h3 className="cq-section-title">Add a comment</h3><InlineComposer parent={root} onPosted={add} />
  </section>;
}
