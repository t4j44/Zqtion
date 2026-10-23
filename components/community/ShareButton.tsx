"use client";
import { useState } from "react";
import { Share2 } from "lucide-react";
import { siteConfig } from "@/data/site";
export default function ShareButton({ path, title, label = "Share" }: { path: string; title: string; label?: string }) {
  const [status, setStatus] = useState(""); const [fallback, setFallback] = useState(false);
  // Callers supply canonical paths, never the current filter/pagination URL.
  const url = `${siteConfig.url}${path.split("?")[0]}`;
  return <><button type="button" className="cq-button cq-action" onClick={async () => {
    setStatus(""); setFallback(false);
    try {
      if (navigator.share) { await navigator.share({ title, url }); setStatus("Shared"); }
      else { await navigator.clipboard.writeText(url); setStatus("Link copied"); }
    } catch (error) { if (error instanceof Error && error.name === "AbortError") return; setFallback(true); setStatus("Select and copy this link."); }
  }}><Share2 size={15} aria-hidden="true" />{status === "Link copied" ? status : label}</button><span className="sr-only" role="status">{status}</span>{fallback && <label className="cq-share-fallback">Copy link<input readOnly value={url} onFocus={e => e.currentTarget.select()} /></label>}</>;
}
