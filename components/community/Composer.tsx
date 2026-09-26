"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { categories, entryPath, postKinds, type Card, type EntryKind } from "@/lib/community/types";
import { moderateCommunityContent, suggestCommunityTitle, validateContribution } from "@/lib/community/validation";
import { mutate } from "@/lib/community/browser";
import { trackEvent } from "@/components/Analytics";
import { ParticipationGate, useCommunity } from "./CommunityProvider";
import UploadPicker from "./UploadPicker";
import Identity from "./Identity";

const labels: Record<string, string> = { prompt: "Share a Prompt", question: "Ask a Question", tip: "Share an AI Tip", experience: "Share an Experience", showcase: "Show Your Result", troubleshooting: "Troubleshooting", tutorial: "Tutorial", discussion: "Tool discussion", answer: "Answer", comment: "Comment", result: "Share a result" };
type Draft = { kind: EntryKind; title: string; body: string; prompt_text: string; category: string; tool: string; tagsText: string; session_slug: string };
export default function Composer({ initialKind = "question", session = "", source, parent, onPosted }: { initialKind?: EntryKind; session?: string; source?: Card | null; parent?: Card; onPosted?: () => void }) {
  const { profile } = useCommunity();
  const [draft, setDraft] = useState<Draft>({ kind: initialKind, title: "", body: "", prompt_text: source?.prompt_text || "", category: parent?.category || source?.category || "general", tool: parent?.tool || source?.tool || "", tagsText: source?.tags.join(", ") || "", session_slug: session });
  const [images, setImages] = useState<{ id: string; alt: string }[]>([]); const [preview, setPreview] = useState(false); const [similar, setSimilar] = useState<{ id: string; kind: EntryKind; title: string; root_id: string | null }[]>([]); const [checked, setChecked] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [result, setResult] = useState<{ id: string; kind: EntryKind; root_id: string | null; status: string } | null>(null);
  const restored = useRef(false);
  const child = ["answer", "comment", "result"].includes(draft.kind);
  const key = `zqtion-community-draft:${parent?.id || source?.id || session || "share"}:${initialKind}`;
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (restored.current) return; restored.current = true;
      try { const saved = sessionStorage.getItem(key); if (saved) { const value = JSON.parse(saved); if (value && typeof value.title === "string" && typeof value.body === "string") setDraft(current => ({ ...current, ...value })); } } catch { /* Draft storage is optional. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [key]);
  function change<K extends keyof Draft>(field: K, value: Draft[K]) {
    const updated = { ...draft, [field]: value }; setDraft(updated); setPreview(false); setChecked(false); setSimilar([]); setError("");
    try { sessionStorage.setItem(key, JSON.stringify(updated)); } catch { /* Keep the live form functional. */ }
  }
  const tags = draft.tagsText.split(",").map(t => t.trim()).filter(Boolean);
  const data = { ...draft, tags, media_ids: images.map(i => i.id), parent_id: parent?.id || null, parent_prompt_id: source?.id || null };
  const titleCheck = suggestCommunityTitle(draft);
  const moderation = moderateCommunityContent(`${draft.title}\n${draft.body}\n${draft.prompt_text}`);
  async function prepare(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const errors = validateContribution(data);
    if (draft.kind === "result" && images.length === 0) errors.push("Upload at least one result image.");
    if (errors.length) { setError(errors.join(" ")); return; }
    setBusy(true);
    try {
      if (!child) {
        const query = new URLSearchParams({ title: draft.title, category: draft.category, tool: draft.tool, tags: tags.join(",") });
        const response = await fetch(`/api/community/similar?${query}`); const found = await response.json();
        if (!response.ok || !found.available) throw new Error(found.error || "Duplicate search is not available yet. Keep your draft and try again.");
        setSimilar(found.entries || []); setChecked((found.entries || []).length === 0);
      } else setChecked(true);
      setPreview(true);
    } catch (error) { setError(error instanceof Error ? error.message : "Could not prepare preview."); } finally { setBusy(false); }
  }
  async function publish() {
    setBusy(true); setError("");
    try {
      const saved = await mutate("create", data); setResult(saved); setPreview(false);
      try { sessionStorage.removeItem(key); } catch { /* Best effort cleanup. */ }
      trackEvent("community_publish", { category: draft.category, location: draft.kind });
      onPosted?.();
    } catch (error) { setError(error instanceof Error ? error.message : "Publication was not confirmed. Your draft is still here."); } finally { setBusy(false); }
  }
  if (result) return <div className="cq-notice" role="status"><h2>{result.status === "pending" ? "Saved for moderation" : "Published"}</h2><p>{result.status === "pending" ? "Your contribution is saved. A moderator will review it before it appears publicly. You can follow its status in your account." : "Your contribution is now part of the conversation."}</p><Link prefetch={false} className="cq-button" href={result.status === "pending" ? "/community/saved?tab=mine" : parent ? entryPath({ ...result, id: parent.root_id || parent.id, kind: parent.root_id ? "question" : parent.kind, root_id: null }) : entryPath(result)}>{result.status === "pending" ? "My contributions" : "View discussion"}</Link></div>;
  return <div className="cq-stack">
    {profile && <Identity profile={profile} />}
    <form className="cq-form" onSubmit={prepare}>
      {!parent && !source && <fieldset><legend className="cq-hint">What would you like to share?</legend><div className="cq-choices">{postKinds.map(kind => <button type="button" key={kind} aria-pressed={draft.kind === kind} onClick={() => change("kind", kind)}>{labels[kind]}</button>)}</div></fieldset>}
      {source && <p className="cq-notice">Remixing <Link prefetch={false} className="cq-text-link" href={entryPath(source)}>{source.title}</Link>. You are creating a new prompt; the source stays unchanged.</p>}
      {!child && <label>Title<input aria-label="Title" required maxLength={180} value={draft.title} onChange={e => change("title", e.target.value)} aria-describedby="cq-title-help" /><span id="cq-title-help" className="cq-hint">{draft.title.length}/180 · Aim for 20–180 characters. {titleCheck.guidance.join(" ")}</span></label>}
      <label>{draft.kind === "comment" ? "Write a comment…" : draft.kind === "answer" ? "Your answer" : draft.kind === "result" ? "What did you try, and what happened?" : "Context / description"}<textarea aria-label={draft.kind === "comment" ? "Write a comment…" : draft.kind === "answer" ? "Your answer" : draft.kind === "result" ? "What did you try, and what happened?" : "Context / description"} required minLength={child ? 2 : 20} maxLength={20000} value={draft.body} onChange={e => change("body", e.target.value)} rows={child ? 4 : 8} /></label>
      {draft.kind === "prompt" && <label>Prompt text<textarea aria-label="Prompt text" required minLength={10} maxLength={20000} value={draft.prompt_text} onChange={e => change("prompt_text", e.target.value)} rows={8} /></label>}
      {!child && <><div className="cq-form-row"><label>Category<select value={draft.category} onChange={e => change("category", e.target.value)}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></label><label>AI tool<input maxLength={80} placeholder="For example, Gemini or Claude Code" value={draft.tool} onChange={e => change("tool", e.target.value)} /></label></div><details className="cq-optional"><summary>Optional details & images</summary><div className="cq-form"><label>Tags (up to five, separated by commas)<input maxLength={154} value={draft.tagsText} onChange={e => change("tagsText", e.target.value)} /></label><ParticipationGate><UploadPicker value={images} onChange={value => { setImages(value); setPreview(false); }} /></ParticipationGate></div></details>{session && <p className="cq-notice">Session: {session}</p>}</>}
      {draft.kind === "result" && <ParticipationGate><UploadPicker value={images} onChange={value => { setImages(value); setPreview(false); }} /></ParticipationGate>}
      {error && <p className="cq-notice cq-error" role="alert">{error}</p>}
      {!preview && <button className="cq-button cq-button-primary" disabled={busy}>{busy ? "Checking…" : "Review before publishing"}</button>}
    </form>
    {preview && <section className="cq-preview" aria-label="Publication preview"><p className="cq-kicker">This is what you will publish</p>{!child && <h2>{draft.title}</h2>}<p className="cq-body">{draft.body}</p>{draft.kind === "prompt" && <pre className="cq-prompt">{draft.prompt_text}</pre>}<p className="cq-meta">{labels[draft.kind]} · {draft.category}{draft.tool && ` · ${draft.tool}`}{tags.length > 0 && ` · ${tags.join(", ")}`}</p>{images.length > 0 && <p className="cq-hint">{images.length} attached image(s): {images.map(i => i.alt).join("; ")}</p>}{(moderation.decision === "review" || images.length > 0) && <p className="cq-notice">This contribution will be saved for manual review before appearing publicly. {moderation.reasons.join(". ")}</p>}
      {similar.length > 0 && <div className="cq-panel"><h3>Similar discussions</h3>{similar.map(item => <p key={item.id}><Link prefetch={false} className="cq-text-link" href={entryPath(item)} target="_blank">{item.title} — View existing discussion ↗</Link></p>)}<button type="button" className="cq-button" aria-pressed={checked} onClick={() => setChecked(true)}>Continue with my post</button></div>}
      <ParticipationGate><div className="cq-actions"><button type="button" className="cq-button" onClick={() => setPreview(false)}>Back to editing</button><button type="button" className="cq-button cq-button-primary" disabled={busy || !checked} onClick={() => void publish()}>{busy ? "Publishing…" : "Publish"}</button></div></ParticipationGate>
    </section>}
    {!profile && <p className="cq-hint">Your text draft stays in this browser tab during sign-in. Uploaded images are private until reviewed.</p>}
  </div>;
}
