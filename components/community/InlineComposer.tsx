"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "@/lib/community/browser";
import type { Card } from "@/lib/community/types";
import { ParticipationGate, useCommunity } from "./CommunityProvider";
import { Avatar } from "./Identity";
export default function InlineComposer({ parent, kind = "comment", opened = false, onPosted, onCancel }: { parent: Card; kind?: "comment" | "answer"; opened?: boolean; onPosted?: (entry: Card) => void; onCancel?: () => void }) {
  const { profile } = useCommunity(); const router = useRouter(); const [open, setOpen] = useState(opened); const [body, setBody] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const lock = useRef(false); const textarea = useRef<HTMLTextAreaElement>(null); const trigger = useRef<HTMLButtonElement>(null); const id = useId();
  const key = `zqtion-community-draft:inline:${profile?.id || "guest"}:${parent.id}:${kind}`;
  const [postedId, setPostedId] = useState("");
  useEffect(() => { const timer = window.setTimeout(() => { try { setBody(sessionStorage.getItem(key) || ""); } catch { /* Optional draft recovery. */ } }, 0); return () => window.clearTimeout(timer); }, [key]);
  useEffect(() => { if (open) textarea.current?.focus(); }, [open]);
  const cancel = () => { setOpen(false); onCancel?.(); trigger.current?.focus(); };
  return <div className="cq-inline-composer">{!open ? <><button ref={trigger} type="button" className="cq-composer-trigger" onClick={() => { setPostedId(""); setOpen(true); }}>{profile && <Avatar profile={profile} />}<span>{kind === "answer" ? "Write an answer" : "Write a comment…"}</span></button>{postedId && <p role="status" className="cq-hint">{kind === "answer" ? "Answer posted." : "Comment posted."} <a className="cq-text-link cq-text-button" href={`#entry-${postedId}`}>View your {kind}</a></p>}</> : <ParticipationGate><form className="cq-form" onSubmit={async e => {
    e.preventDefault(); if (lock.current || !profile) return; lock.current = true; setBusy(true); setError(""); let stored = false;
    try {
      const saved = await mutate("create", { kind, parent_id: parent.id, title: "", body, category: parent.category, tool: parent.tool, tags: [], prompt_text: "", media_ids: [] });
      stored = true;
      try { sessionStorage.removeItem(key); } catch { /* Optional storage. */ }
      setBody("");
      if (saved.status === "published") {
        // The write RPC returns a receipt, not the full contribution. Read the
        // published record so the immediate thread uses real text and dates.
        const response = await fetch(`/api/community/conversation?target=${saved.id}&root=${parent.root_id || parent.id}`);
        if (response.ok) { const result = await response.json(); onPosted?.(result.entry); setPostedId(saved.id); setOpen(false); }
        else setError("Posted successfully. Refresh the discussion to load your contribution.");
        router.refresh();
      }
      else setError("Saved for moderation. Your contribution will appear after review.");
    } catch (error) { setError(stored ? "Your contribution was saved. Refresh the discussion to load it." : `We couldn't post your ${kind}. Your text is still here. ${error instanceof Error ? error.message : "Try again."}`); }
    finally { lock.current = false; setBusy(false); }
  }}>{parent.parent_id && <p className="cq-hint">Replying to <a className="cq-text-link" href={`/u/${parent.author.username}`}>@{parent.author.username}</a></p>}<label htmlFor={id}>{kind === "answer" ? "Your answer" : "Write a comment…"}</label><textarea id={id} ref={textarea} required minLength={2} maxLength={20000} rows={3} value={body} onChange={e => { setBody(e.target.value); e.currentTarget.style.height = "auto"; e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 360)}px`; try { sessionStorage.setItem(key, e.target.value); } catch { /* Optional storage. */ } }} /><div className="cq-actions"><button type="button" className="cq-button" disabled={busy} onClick={cancel}>Cancel</button><button className="cq-button cq-button-primary" disabled={busy || body.trim().length < 2}>{busy ? "Posting…" : kind === "answer" ? "Post Answer" : "Post Comment"}</button></div>{error && <p className="cq-notice" role="status">{error}</p>}</form></ParticipationGate>}</div>;
}
