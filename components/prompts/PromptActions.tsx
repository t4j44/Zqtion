"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Bookmark, Check, Copy } from "lucide-react";
import { copyText, readSaved, subscribeSaved, toggleSaved } from "@/lib/prompts/browser";
import { trackEvent } from "@/components/Analytics";

export function SavePrompt({ id }: { id: string }) {
  const saved = useSyncExternalStore(subscribeSaved, () => readSaved().includes(id), () => false);
  const [message, setMessage] = useState("");
  return <><button type="button" className="pl-action" aria-pressed={saved} onClick={() => { try { const added = toggleSaved(id); setMessage(added ? "Saved on this device" : "Removed from saved prompts"); } catch { setMessage("Storage is unavailable. Saving needs browser storage."); } }}><Bookmark size={16} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save"}</button><span className="pl-feedback" role="status">{message}</span></>;
}
export function CopyPrompt({ slug, text }: { slug: string; text?: string }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function copy() {
    setBusy(true);
    try {
      let value = text;
      if (value === undefined) { const response = await fetch(`/api/prompts/${encodeURIComponent(slug)}`); if (!response.ok) throw new Error("Unavailable"); value = (await response.json()).prompt as string; }
      const ok = await copyText(value);
      setStatus(ok ? "Copied" : "Copy unavailable. Open the prompt and select its text.");
      if (ok) trackEvent("prompt_copy", { slug });
    } catch { setStatus("Could not load the prompt. Try again."); } finally { setBusy(false); }
  }
  return <><button type="button" className="pl-action" onClick={copy} disabled={busy}>{status === "Copied" ? <Check size={16} /> : <Copy size={16} />}{busy ? "Copying…" : status === "Copied" ? "Copied" : "Copy prompt"}</button><span className="pl-feedback" role="status">{status !== "Copied" ? status : "Prompt copied to clipboard"}</span></>;
}
export function PromptView({ slug }: { slug: string }) {
  useEffect(() => { trackEvent("prompt_view", { slug }); }, [slug]);
  return null;
}
