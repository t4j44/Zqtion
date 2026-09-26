"use client";
import { useState } from "react";
import Link from "next/link";
import { browserCommunity, mutate } from "@/lib/community/browser";
import { avatars, GUIDELINES_VERSION, type Profile } from "@/lib/community/types";
import { safeReturnPath, validateProfile } from "@/lib/community/validation";
import { useCommunity } from "./CommunityProvider";
import UploadPicker from "./UploadPicker";
import { Avatar } from "./Identity";

export default function Account({ next, recovery = false }: { next?: string; recovery?: boolean }) {
  const { user, profile, loading, error, moderator, refresh } = useCommunity();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false);
  const returnTo = safeReturnPath(next);
  async function authenticate(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setStatus("");
    const db = browserCommunity(); if (!db) { setStatus("Community sign-in is not open yet."); setBusy(false); return; }
    try {
      const callback = `${window.location.origin}/community/account?next=${encodeURIComponent(returnTo)}`;
      const result = mode === "signup" ? await db.auth.signUp({ email, password, options: { emailRedirectTo: callback } }) : mode === "reset" ? await db.auth.resetPasswordForEmail(email, { redirectTo: `${callback}&recovery=1` }) : await db.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      setPassword(""); setStatus(mode === "signup" ? "Check your email for the verification link, then return here to complete your profile." : mode === "reset" ? "If this email has an account, a password-reset link has been sent." : "Signed in. Continue below."); await refresh();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Sign-in could not be completed."); } finally { setBusy(false); }
  }
  if (loading) return <p role="status">Loading account…</p>;
  return <div className="cq-stack" style={{ maxWidth: 780 }}>
    {error && <p role="status" className="cq-notice">{error}</p>}
    {!user ? <><div className="cq-filter">{(["login", "signup", "reset"] as const).map(m => <button className="cq-button" key={m} onClick={() => { setMode(m); setStatus(""); }} aria-pressed={mode === m}>{m === "login" ? "Sign in" : m === "signup" ? "Create account" : "Reset password"}</button>)}</div><form className="cq-form cq-panel" onSubmit={authenticate}><label>Email (private)<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} maxLength={254} /></label>{mode !== "reset" && <label>Password<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={12} required value={password} onChange={e => setPassword(e.target.value)} /></label>}<p className="cq-hint">Email verification is required. Your email never appears on your public community profile.</p><button disabled={busy || !browserCommunity()} className="cq-button cq-button-primary">{busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}</button></form></> : <>
      <div className="cq-panel"><p>Signed in{profile ? ` as @${profile.username}` : ""}.</p><div className="cq-actions"><button className="cq-button" onClick={async () => { await browserCommunity()?.auth.signOut(); try { Object.keys(sessionStorage).filter(k => k.startsWith("zqtion-community-draft:")).forEach(k => sessionStorage.removeItem(k)); } catch { /* Storage may be disabled. */ } await refresh(); }}>Sign out</button>{profile && <><Link prefetch={false} className="cq-button cq-button-primary" href={returnTo}>Continue your action ↗</Link><Link prefetch={false} className="cq-button" href={`/u/${profile.username}`}>Public profile</Link></>}{moderator && <Link prefetch={false} className="cq-button" href="/community/moderation">Moderation</Link>}</div></div>
      {!user.email_confirmed_at && <button className="cq-button" onClick={async () => { const result = await browserCommunity()?.auth.resend({ type: "signup", email: user.email || email }); setStatus(result?.error ? result.error.message : "Verification email requested. Check your inbox."); }}>Resend verification email</button>}
      {recovery && <form className="cq-form cq-panel" onSubmit={async e => { e.preventDefault(); const result = await browserCommunity()?.auth.updateUser({ password }); setStatus(result?.error ? result.error.message : "Password updated."); setPassword(""); }}><label>New password<input type="password" minLength={12} autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} /></label><button className="cq-button">Set new password</button></form>}
      {user.email_confirmed_at && !error && <ProfileForm key={profile?.updated_at || "new"} profile={profile} returnTo={returnTo} />}
    </>}
    {status && <p role="status" className="cq-notice cq-status">{status}</p>}
  </div>;
}
function ProfileForm({ profile, returnTo }: { profile: Profile | null; returnTo: string }) {
  const { refresh } = useCommunity();
  const [name, setName] = useState(profile?.display_name || ""); const [username, setUsername] = useState(profile?.username || ""); const [linkedin, setLinkedin] = useState(profile?.linkedin_url || ""); const [bio, setBio] = useState(profile?.bio || ""); const [avatar, setAvatar] = useState(profile?.avatar || "orbit");
  const [images, setImages] = useState(profile?.photo_id ? [{ id: profile.photo_id, alt: "Profile photo" }] : []);
  const [accepted, setAccepted] = useState(Boolean(profile)); const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const data = { display_name: name, username, linkedin_url: linkedin, bio, avatar, photo_id: images[0]?.id || null, guidelines: accepted ? GUIDELINES_VERSION : "" };
    const errors = validateProfile(data); if (errors.length) { setStatus(errors.join(" ")); return; }
    setBusy(true); setStatus("");
    try { await mutate("profile", data); await refresh(); window.location.assign(returnTo); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Profile could not be saved."); } finally { setBusy(false); }
  }
  return <form className="cq-form cq-panel" onSubmit={save}><h2 className="cq-section-title">{profile ? "Edit your saved profile" : "Set up your community identity once"}</h2><p className="cq-hint">These fields are public. Next time you post, answer or comment, we’ll use this saved profile.</p><div className="cq-form-row"><label>Display name<input required minLength={2} maxLength={80} value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></label><label>Unique username<input required pattern="[a-z][a-z0-9_]{2,29}" minLength={3} maxLength={30} value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" /></label></div><label>LinkedIn profile URL<input required type="url" placeholder="https://www.linkedin.com/in/your-name" value={linkedin} onChange={e => setLinkedin(e.target.value)} maxLength={300} /></label><p className="cq-hint">We link to the profile you provide. We do not scrape LinkedIn or claim to verify your professional identity.</p><fieldset><legend>Choose your avatar</legend><div className="cq-avatar-options">{[...avatars, "photo"].map(v => <label key={v}><input type="radio" name="avatar" checked={avatar === v} onChange={() => setAvatar(v)} /><Avatar profile={{ display_name: "", avatar: v, photo_id: null }} />{v === "photo" ? "Upload photo" : v}</label>)}</div></fieldset>{avatar === "photo" && <UploadPicker purpose="profile" value={images} onChange={setImages} />}<label>Bio (optional)<textarea maxLength={500} value={bio} onChange={e => setBio(e.target.value)} /></label><label className="cq-checkbox"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} required /><span>I accept the <Link prefetch={false} className="cq-text-link" href="/community/guidelines" target="_blank">community guidelines</Link> and understand which profile fields are public.</span></label>{status && <p className="cq-notice cq-error" role="alert">{status}</p>}<button disabled={busy} className="cq-button cq-button-primary">{busy ? "Saving…" : "Save profile and continue"}</button></form>;
}
