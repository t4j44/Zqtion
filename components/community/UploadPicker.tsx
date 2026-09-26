"use client";
import { useEffect, useState } from "react";
import { browserCommunity, communityRequest } from "@/lib/community/browser";
import { imageError } from "@/lib/community/validation";
type Uploaded = { id: string; alt: string };
export default function UploadPicker({ purpose = "result", value, onChange }: { purpose?: "result" | "profile"; value: Uploaded[]; onChange: (images: Uploaded[]) => void }) {
  const [alt, setAlt] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const max = purpose === "profile" ? 1 : 4;
  async function upload(file: File | undefined) {
    if (!file) return;
    const invalid = imageError(file);
    if (invalid) { setError(invalid); return; }
    if (alt.trim().length < 2 || alt.length > 200) { setError("Describe the image before uploading."); return; }
    if (value.length >= max) { setError(`Use at most ${max} image${max === 1 ? "" : "s"}.`); return; }
    setBusy(true); setError("");
    try {
      const result = await communityRequest(`upload?purpose=${purpose}`, { method: "POST", body: file, headers: { "Content-Type": file.type, "X-Image-Alt": encodeURIComponent(alt) } });
      onChange([...value, { id: result.id, alt }]); setAlt("");
    } catch (error) { setError(error instanceof Error ? error.message : "Upload failed."); }
    finally { setBusy(false); }
  }
  return <fieldset className="cq-panel"><legend>{purpose === "profile" ? "Profile photo" : "Results / examples (optional)"}</legend><p className="cq-hint">JPG, PNG or WEBP. Maximum 1 MB per image. Up to {max}. Uploaded images are reviewed before appearing publicly.</p><label>Image description<input value={alt} onChange={e => setAlt(e.target.value)} maxLength={200} /></label><label className="cq-hint">Choose image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || value.length >= max} onChange={e => { void upload(e.target.files?.[0]); e.target.value = ""; }} /></label>{busy && <p role="status">Uploading…</p>}{error && <p className="cq-notice cq-error" role="alert">{error}</p>}<div className="cq-media-grid">{value.map(item => <figure key={item.id}><PrivateImage id={item.id} alt={item.alt} /><figcaption>{item.alt}</figcaption><button type="button" className="cq-button" onClick={() => onChange(value.filter(v => v.id !== item.id))}>Remove image</button></figure>)}</div></fieldset>;
}
export function PrivateImage({ id, alt }: { id: string; alt: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let active = true; let objectUrl = "";
    void (async () => { try {
      const db = browserCommunity(); if (!db) return;
      const { data } = await db.auth.getSession(); if (!data.session) return;
      const response = await fetch(`/api/community/media/${id}`, { headers: { Authorization: `Bearer ${data.session.access_token}` } });
      if (!response.ok || !active) return;
      const blob = await response.blob(); if (!active) return;
      objectUrl = URL.createObjectURL(blob); setSrc(objectUrl);
    } catch { /* Broken preview does not disclose private storage paths. */ } })();
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id]);
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img className="cq-private-media" src={src} alt={alt} /> : <span className="cq-hint">Image preview loading…</span>;
}
