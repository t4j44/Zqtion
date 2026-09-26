"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { communityRequest, mutate } from "@/lib/community/browser";
import { entryPath, type Card, type Media } from "@/lib/community/types";
import { ParticipationGate, useCommunity } from "./CommunityProvider";
import Identity from "./Identity";
import EntryActions from "./EntryActions";
import { PrivateImage } from "./UploadPicker";
type Queue = { entries: (Card & { moderation_reason?: string })[]; more: boolean; reports?: { id: string; entry_id: string; reason: string; created_at: string }[]; media?: Media[]; history?: { id: number; action: string; reason: string; created_at: string }[] };
export default function Workspace({ moderation = false, initialTab = "saved" }: { moderation?: boolean; initialTab?: string }) {
  const { profile, moderator } = useCommunity(); const [tab, setTab] = useState(moderation ? "moderation" : initialTab === "mine" ? "mine" : "saved"); const [page, setPage] = useState(1); const [queue, setQueue] = useState<Queue | null>(null); const [error, setError] = useState(""); const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!profile || (moderation && !moderator)) return;
    let alive = true;
    void communityRequest(`workspace?tab=${tab}&page=${page}`).then(data => { if (alive) { setQueue(data); setError(""); } }).catch(error => { if (alive) setError(error.message); });
    return () => { alive = false; };
  }, [profile, moderator, moderation, tab, page, version]);
  const reload = () => setVersion(n => n + 1);
  return <ParticipationGate>{moderation && !moderator ? <p className="cq-notice">Moderator access is required.</p> : <>
    {!moderation && <nav className="cq-filter" aria-label="Your community activity"><button className="cq-button" aria-pressed={tab === "saved"} onClick={() => { setTab("saved"); setPage(1); setQueue(null); }}>Saved</button><button className="cq-button" aria-pressed={tab === "mine"} onClick={() => { setTab("mine"); setPage(1); setQueue(null); }}>My contributions</button></nav>}
    {error && <p className="cq-notice cq-error" role="alert">{error} <button className="cq-button" onClick={reload}>Retry</button></p>}
    {!queue && !error && <p role="status">Loading…</p>}
    {queue && <><div className="cq-stack">{queue.entries.map(entry => <article className="cq-panel" key={entry.id}><Identity profile={entry.author} /><p className="cq-meta">{entry.kind} · {entry.status}</p><h2 className="cq-section-title">{entry.title || `${entry.kind} in a discussion`}</h2><p className="cq-body">{entry.body}</p>{entry.prompt_text && <pre className="cq-prompt">{entry.prompt_text}</pre>}{entry.status === "published" && <Link prefetch={false} className="cq-button" href={entryPath(entry)}>View discussion</Link>}{entry.moderation_reason && <p className="cq-notice">Review reason: {entry.moderation_reason}</p>}{moderation ? <>{queue.reports?.filter(r => r.entry_id === entry.id).map(r => <p className="cq-notice" key={r.id}>Private report: {r.reason}</p>)}<ModerationDecision id={entry.id} authorId={entry.author_id} onDone={reload} /></> : <EntryActions entry={entry} />}</article>)}</div>
      {!queue.entries.length && <p className="cq-empty">{moderation ? "No content in this queue." : tab === "mine" ? "Your contributions will appear here, including items waiting for review." : "No visible saved content yet. Use Save on a discussion or community prompt."}</p>}
      {moderation && <><h2 className="cq-section-title">Images awaiting review</h2><p className="cq-hint">Inspect each image for privacy, exploitation, graphic content and rights concerns before approval. Approve images before approving their contribution.</p><div className="cq-stack">{queue.media?.map(m => <article className="cq-panel" key={m.id}><PrivateImage id={m.id} alt={m.alt} /><p>{m.alt} · {m.purpose}</p>{m.entry_id && <p className="cq-hint">Contribution: {m.entry_id}</p>}<ModerationDecision id={m.id} media onDone={reload} /></article>)}</div><h2 className="cq-section-title">Recent moderation history</h2>{queue.history?.map(h => <p className="cq-notice" key={h.id}>{h.action} — {h.reason} <time dateTime={h.created_at}>{new Date(h.created_at).toLocaleDateString()}</time></p>)}</>}
      {(page > 1 || queue.more) && <nav className="cq-pagination" aria-label="Workspace pages">{page > 1 && <button className="cq-button" onClick={() => { setPage(n => n - 1); setQueue(null); }}>Previous</button>}<span>Page {page}</span>{queue.more && <button className="cq-button" onClick={() => { setPage(n => n + 1); setQueue(null); }}>Next</button>}</nav>}
    </>}
  </>}</ParticipationGate>;
}
function ModerationDecision({ id, media = false, authorId, onDone }: { id: string; media?: boolean; authorId?: string; onDone: () => void }) {
  const [reason, setReason] = useState(""); const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false);
  async function decide(action: string, data: Record<string, unknown>) {
    if (reason.trim().length < 5) { setStatus("Record a reason of at least five characters."); return; }
    setBusy(true); setStatus("");
    try { await mutate(action, { id, reason, ...data }); onDone(); setStatus("Decision recorded."); } catch (error) { setStatus(error instanceof Error ? error.message : "Decision failed."); } finally { setBusy(false); }
  }
  return <div className="cq-form"><label>Moderation reason<input value={reason} onChange={e => setReason(e.target.value)} maxLength={1000} minLength={5} /></label><div className="cq-actions"><button disabled={busy} className="cq-button" onClick={() => void decide(media ? "moderate_media" : "moderate", { status: media ? "approved" : "published" })}>Approve</button><button disabled={busy} className="cq-button" onClick={() => void decide(media ? "moderate_media" : "moderate", { status: media ? "rejected" : "hidden" })}>{media ? "Reject image" : "Hide content"}</button>{authorId && <><button disabled={busy} className="cq-button" onClick={() => void decide("restrict", { user_id: authorId, restricted: true })}>Restrict author</button><button disabled={busy} className="cq-button" onClick={() => void decide("restrict", { user_id: authorId, restricted: false })}>Lift restriction</button></>}</div>{status && <p role="status" className="cq-notice">{status}</p>}</div>;
}
