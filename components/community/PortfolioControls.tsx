"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mutate } from "@/lib/community/browser";
import { useCommunity } from "./CommunityProvider";
export default function PortfolioControls({ owner, featured }: { owner: string; featured: { id: string; title: string }[] }) {
  const { profile } = useCommunity(); const router = useRouter(); const [busy, setBusy] = useState(false); const [status, setStatus] = useState("");
  if (profile?.id !== owner) return null;
  async function update(action: string, data: Record<string, unknown>) {
    if (busy) return; setBusy(true); setStatus("");
    try { await mutate(action, data); router.refresh(); setStatus("Featured work updated."); }
    catch (e) { setStatus(e instanceof Error ? e.message : "Could not update featured work."); } finally { setBusy(false); }
  }
  function move(index: number, delta: number) { const ids = featured.map(e => e.id); [ids[index], ids[index + delta]] = [ids[index + delta], ids[index]]; void update("reorder_featured", { ids }); }
  return <div className="cq-owner-controls"><div className="cq-actions"><Link prefetch={false} className="cq-button" href="/community/account">Edit Profile</Link><Link prefetch={false} className="cq-button" href="/community/saved">Private Saved Items</Link><Link prefetch={false} className="cq-button" href="/community/account">Settings</Link></div><details><summary>Manage Featured Work · {featured.length}/6</summary><p className="cq-hint">Use a contribution’s More actions menu to feature your public work. Choose up to six.</p><ol className="cq-feature-order">{featured.map((e, i) => <li key={e.id}><span>{i + 1}. {e.title}</span><div className="cq-actions"><button className="cq-button" disabled={busy || i === 0} aria-label={`Move ${e.title} up`} onClick={() => move(i, -1)}>↑</button><button className="cq-button" disabled={busy || i === featured.length - 1} aria-label={`Move ${e.title} down`} onClick={() => move(i, 1)}>↓</button><button className="cq-button" disabled={busy} onClick={() => void update("unfeature", { id: e.id })}>Unfeature</button></div></li>)}</ol><p role="status" className="cq-hint">{status}</p></details></div>;
}
