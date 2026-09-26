"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bookmark, MoreHorizontal, MessageSquare } from "lucide-react";
import { getEntryActivity, mutate } from "@/lib/community/browser";
import { entryPath, type Card } from "@/lib/community/types";
import { useCommunity, ParticipationGate } from "./CommunityProvider";
import ShareButton from "./ShareButton";

export default function EntryActions({ entry, question, compact = false, onReply }: { entry: Card; question?: Card; compact?: boolean; onReply?: () => void }) {
  const { profile } = useCommunity(); const router = useRouter(); const menu = useRef<HTMLDetailsElement>(null); const lock = useRef(false);
  const [activity, setActivity] = useState({ voted: false, saved: false, rating: 0, featured: false });
  const [ready, setReady] = useState(false); const [activityError, setActivityError] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [report, setReport] = useState(""); const [reporting, setReporting] = useState(false);
  const [editing, setEditing] = useState(false); const [title, setTitle] = useState(entry.title); const [body, setBody] = useState(entry.body); const [prompt, setPrompt] = useState(entry.prompt_text); const [confirmDelete, setConfirmDelete] = useState(false); const [voteEstimate, setVoteEstimate] = useState<{ base: number; value: number } | null>(null);
  useEffect(() => {
    let alive = true;
    if (!profile) return;
    const refresh = () => { void getEntryActivity(entry.id, profile.id).then(value => { if (alive) { setActivity(value); setReady(!value.error); setActivityError(value.error || ""); } }); };
    const changed = (event: Event) => { if ((event as CustomEvent).detail.id === entry.id) refresh(); };
    refresh(); window.addEventListener("zqtion-community-activity", changed);
    return () => { alive = false; window.removeEventListener("zqtion-community-activity", changed); };
  }, [entry.id, profile]);
  async function action(name: string, data: Record<string, unknown>, success?: () => void, optimistic?: () => void, rollback?: () => void) {
    if (lock.current) return; lock.current = true; setBusy(true); setError(""); optimistic?.();
    try { await mutate(name, { id: entry.id, ...data }); success?.(); router.refresh(); }
    catch (error) { rollback?.(); setError(error instanceof Error ? error.message : "Action failed. Please try again."); }
    finally { lock.current = false; setBusy(false); }
  }
  const closeMenu = () => { if (menu.current) { menu.current.open = false; menu.current.querySelector("summary")?.focus(); } };
  const signIn = `/community/account?next=${encodeURIComponent(entryPath(entry))}`;
  const owner = profile?.id === entry.author_id;
  const count = Math.max(0, voteEstimate?.base === Number(entry.counts.votes) ? voteEstimate.value : Number(entry.counts.votes));
  return <><div className="cq-actions" aria-label="Contribution actions">
    {profile ? <><button type="button" className="cq-button cq-action" aria-label={`${activity.voted ? "Remove upvote" : "Upvote"} (${count})`} aria-pressed={activity.voted} disabled={busy || !ready || owner} title={owner ? "You cannot upvote your own contribution" : undefined} onClick={() => { const previous = activity; void action("vote", { active: !activity.voted }, undefined, () => { setActivity({ ...activity, voted: !activity.voted }); setVoteEstimate({ base: Number(entry.counts.votes), value: count + (activity.voted ? -1 : 1) }); }, () => { setActivity(previous); setVoteEstimate(null); }); }}>▲ {count}</button></> : <Link prefetch={false} className="cq-button cq-action" href={signIn} aria-label={`Sign in to upvote (${count})`}>▲ {count}</Link>}
    {onReply ? <button className="cq-button cq-action" onClick={onReply}>Reply</button> : <Link prefetch={false} className="cq-button cq-action" href={`${entryPath(entry).split("#")[0]}#conversation`}><MessageSquare size={15} aria-hidden="true" />{entry.kind === "question" ? `${entry.counts.answers} Answers` : `${entry.counts.comments || 0} Comments`}</Link>}
    {entry.kind !== "comment" && (profile ? <button type="button" className="cq-button cq-action" aria-pressed={activity.saved} disabled={busy || !ready} onClick={() => { const previous = activity; void action("save", { active: !activity.saved }, undefined, () => setActivity({ ...activity, saved: !activity.saved }), () => setActivity(previous)); }}><Bookmark size={15} aria-hidden="true" />{activity.saved ? "Saved ✓" : "Save"}</button> : <Link prefetch={false} className="cq-button cq-action" href={signIn}>Save</Link>)}
    {entry.kind !== "comment" && <ShareButton path={entryPath(entry)} title={entry.title || entry.parent_title || "Zqtion contribution"} />}
    <details ref={menu} className="cq-more" onKeyDown={e => { if (e.key === "Escape") { e.preventDefault(); closeMenu(); } }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) e.currentTarget.open = false; }}><summary aria-label="More actions" title="More actions"><MoreHorizontal size={20} /></summary><div className="cq-more-panel">
      {owner && <><button type="button" onClick={() => { setEditing(!editing); closeMenu(); }}>Edit</button><button type="button" onClick={() => { setConfirmDelete(!confirmDelete); closeMenu(); }}>Delete</button>{entry.kind !== "comment" && entry.status === "published" && <button type="button" disabled={busy || !ready} onClick={() => { void action(activity.featured ? "unfeature" : "feature", {}, () => setActivity({ ...activity, featured: !activity.featured })); closeMenu(); }}>{activity.featured ? "Unfeature" : "Feature on portfolio"}</button>}</>}
      <button type="button" onClick={() => { setReporting(!reporting); closeMenu(); }}>Report</button>
    </div></details>
    {question && profile?.id === question.author_id && entry.kind === "answer" && <button type="button" className="cq-button cq-action" disabled={busy} onClick={() => void action("accept", { id: question.id, answer_id: question.accepted_answer_id === entry.id ? null : entry.id })}>{question.accepted_answer_id === entry.id ? "Unaccept answer" : "Accept answer"}</button>}
  </div>
    {confirmDelete && <div className="cq-notice"><p>Delete your contribution? Its conversation and images will also stop appearing publicly.</p><button className="cq-button" disabled={busy} onClick={() => void action("delete", {}, () => { router.push("/community/saved?tab=mine"); })}>Confirm deletion</button><button className="cq-button" onClick={() => setConfirmDelete(false)}>Cancel</button></div>}
    {entry.kind === "prompt" && <div className="cq-actions"><span className="cq-muted">{entry.counts.rating_count ? `${entry.counts.rating}/5 · ${entry.counts.rating_count} rating(s)` : "No ratings yet"} · {entry.counts.results || 0} results</span>{!compact && <><Link prefetch={false} className="cq-button" href={`/share?type=prompt&remix=${entry.id}`}>Remix ↗</Link>{profile && !owner && <label>Your rating<select value={activity.rating} disabled={busy || !ready} onChange={e => { const value = Number(e.target.value); void action("rate", { rating: value }, () => setActivity({ ...activity, rating: value })); }}><option value={0} disabled>Choose</option>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} / 5</option>)}</select></label>}</>}</div>}
    {editing && <form className="cq-form cq-panel" onSubmit={e => { e.preventDefault(); void action("edit", { title, body, prompt_text: prompt, media_ids: [] }, () => { setEditing(false); router.push("/community/saved?tab=mine"); }); }}><p className="cq-hint">Saving publishes this exact text or queues it for review when required.</p>{!entry.parent_id && <label>Title<input required maxLength={180} value={title} onChange={e => setTitle(e.target.value)} /></label>}<label>Content<textarea required maxLength={20000} value={body} onChange={e => setBody(e.target.value)} /></label>{entry.kind === "prompt" && <label>Prompt<textarea required minLength={10} maxLength={20000} value={prompt} onChange={e => setPrompt(e.target.value)} /></label>}<div className="cq-actions"><button disabled={busy} className="cq-button">Save these changes</button><button type="button" className="cq-button" onClick={() => setEditing(false)}>Cancel</button></div></form>}
    {reporting && <ParticipationGate><form className="cq-form cq-notice" onSubmit={e => { e.preventDefault(); void action("report", { reason: report }, () => { setReporting(false); setReport(""); setError("Report submitted privately to the moderation team."); }); }}><label>What should a moderator review?<textarea required minLength={5} maxLength={1000} value={report} onChange={e => setReport(e.target.value)} /></label><div className="cq-actions"><button disabled={busy} className="cq-button">Submit report</button><button type="button" className="cq-button" onClick={() => setReporting(false)}>Cancel</button></div></form></ParticipationGate>}
    {activityError && <p role="status" className="cq-notice">{activityError} <button type="button" className="cq-text-button" onClick={async () => { if (!profile) return; const value = await getEntryActivity(entry.id, profile.id); setActivity(value); setReady(!value.error); setActivityError(value.error || ""); }}>Retry actions</button></p>}
    {error && <p role="status" className="cq-notice">{error}</p>}
  </>;
}
export function CopyPrompt({ text }: { text: string }) {
  const [status, setStatus] = useState("");
  return <div className="cq-actions"><button className="cq-button" onClick={async () => { try { await navigator.clipboard.writeText(text); setStatus("Copied"); } catch { setStatus("Copy unavailable. Select the prompt text and copy it manually."); } }}>Copy prompt</button><span role="status" className="cq-hint">{status}</span></div>;
}
