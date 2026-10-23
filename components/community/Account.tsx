"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { browserCommunity, mutate } from "@/lib/community/browser";
import { avatars, GUIDELINES_VERSION, type Profile } from "@/lib/community/types";
import { safeReturnPath, validateProfile } from "@/lib/community/validation";
import { authCallback, googleProfileName, needsCommunityProfile, oauthReturnFailed, safeParticipationIntent } from "@/lib/community/auth";
import { useCommunity } from "./CommunityProvider";
import UploadPicker from "./UploadPicker";
import { Avatar } from "./Identity";

function GoogleMark() {
  return <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5h6.6c3.9-3.6 6.1-8.9 6.1-14.9Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20.4 20.4 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.6 27.6a12.2 12.2 0 0 1 0-7.2v-5.2H5.8a20 20 0 0 0 0 17.6l6.8-5.2Z"/><path fill="#EA4335" d="M24 12c3 0 5.6 1 7.7 3l5.8-5.8A19.4 19.4 0 0 0 24 4 20.4 20.4 0 0 0 5.8 15.2l6.8 5.2C14.2 15.6 18.7 12 24 12Z"/></svg>;
}
export default function Account({ next, intent: requestedIntent, recovery = false, authReturn = false }: { next?: string; intent?: string; recovery?: boolean; authReturn?: boolean }) {
  const { user, profile, loading, error, moderator, refresh } = useCommunity();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [status, setStatus] = useState(""); const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<"email" | "google" | "logout" | null>(null);
  const [completed, setCompleted] = useState(false); const [callbackFailed, setCallbackFailed] = useState(false);
  const redirected = useRef(false); const rejectedCallback = useRef(false);
  const returnTo = safeReturnPath(next), intent = safeParticipationIntent(requestedIntent);
  const requiresProfile = needsCommunityProfile(returnTo, intent);
  const shouldReturn = (completed || authReturn) && !recovery;
  useEffect(() => {
    const db = browserCommunity();
    const hasError = oauthReturnFailed(window.location.search, window.location.hash); rejectedCallback.current = hasError;
    const timer = window.setTimeout(() => {
      if (hasError) { setCallbackFailed(true); setFailed(true); setStatus("Sign-in was cancelled or the link could not be used. Try Google again or continue with email."); }
    }, 0);
    // Let supabase-js consume the implicit session before removing any callback fragment.
    if (hasError) void db?.auth.getSession().then(() => {
      const url = new URL(window.location.href); url.hash = "";
      ["error", "error_code", "error_description", "code"].forEach(key => url.searchParams.delete(key));
      window.history.replaceState(window.history.state, "", url.pathname + url.search);
    });
    const returned = (event: PageTransitionEvent) => { if (event.persisted) { setBusy(null); setStatus("Sign-in was not completed. You can try again."); } };
    window.addEventListener("pageshow", returned);
    return () => { window.clearTimeout(timer); window.removeEventListener("pageshow", returned); };
  }, []);
  useEffect(() => {
    if (shouldReturn && !callbackFailed && !rejectedCallback.current && !oauthReturnFailed(window.location.search, window.location.hash) && !redirected.current && !loading && user?.email_confirmed_at && !error && (profile || !requiresProfile)) {
      redirected.current = true;
      window.location.replace(returnTo);
    }
  }, [shouldReturn, callbackFailed, loading, user, profile, error, requiresProfile, returnTo]);
  async function google() {
    const db = browserCommunity(); if (!db || busy) return;
    setBusy("google"); setFailed(false); setCallbackFailed(false); rejectedCallback.current = false; setStatus("Opening Google sign-in…");
    try {
      const result = await db.auth.signInWithOAuth({ provider: "google", options: { redirectTo: authCallback(window.location.origin, returnTo, intent), scopes: "openid email profile" } });
      if (result.error) throw result.error;
    } catch { setBusy(null); setFailed(true); setStatus("Google sign-in could not start. Try again or continue with email."); }
  }
  async function authenticate(e: React.FormEvent) {
    e.preventDefault(); if (busy) return; setBusy("email"); setStatus(""); setFailed(false); setCallbackFailed(false); rejectedCallback.current = false;
    const db = browserCommunity(); if (!db) { setStatus("Community sign-in is not open yet."); setBusy(null); return; }
    try {
      const callback = authCallback(window.location.origin, returnTo, intent);
      const result = mode === "signup" ? await db.auth.signUp({ email, password, options: { emailRedirectTo: callback } }) : mode === "reset" ? await db.auth.resetPasswordForEmail(email, { redirectTo: `${callback}&recovery=1` }) : await db.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      setPassword("");
      setStatus(mode === "signup" ? "Check your email for the verification link." : mode === "reset" ? "If this email has an account, a password-reset link has been sent." : "Signed in. Returning to the community…");
      if (mode === "login") setCompleted(true);
      await refresh();
    } catch (error) { setFailed(true); setStatus(error instanceof Error ? error.message : "Sign-in could not be completed."); } finally { setBusy(null); }
  }
  async function signOut() {
    setBusy("logout"); setCompleted(false); setStatus("");
    try {
      const result = await browserCommunity()?.auth.signOut(); if (result?.error) throw result.error;
      try { Object.keys(sessionStorage).filter(key => key.startsWith("zqtion-community-draft:")).forEach(key => sessionStorage.removeItem(key)); } catch { /* Optional storage. */ }
      await refresh();
    } catch { setFailed(true); setStatus("Sign-out could not be completed. Please try again."); } finally { setBusy(null); }
  }
  return <div className={`cq-account ${user ? "cq-account-signed-in" : ""}`}>
    <header className="cq-auth-heading"><p className="cq-kicker">Zqtion Community</p><h1>{user ? "Your Community account" : requiresProfile ? "Sign in to participate" : "Join the Zqtion Community"}</h1><p>{user ? "Browse freely. Complete your saved profile when you want to participate." : "Share useful AI experiences and learn from other builders."}</p></header>
    {error && <p role="status" className="cq-notice">{error}</p>}
    {loading ? <p role="status">Loading account…</p> : !user ? <div className="cq-auth-panel">
      <button type="button" className="cq-button cq-google" disabled={Boolean(busy) || !browserCommunity()} onClick={() => void google()}><GoogleMark />{busy === "google" ? "Opening Google…" : "Continue with Google"}</button>
      <div className="cq-auth-divider"><span>or continue with email</span></div>
      <form id="email-sign-in" className="cq-form cq-auth-form" onSubmit={authenticate} aria-label={mode === "signup" ? "Create email account" : mode === "reset" ? "Reset password" : "Email sign in"}>
        {mode !== "login" && <h2>{mode === "signup" ? "Create your account" : "Reset your password"}</h2>}
        <label>Email (private)<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} maxLength={254} /></label>
        {mode !== "reset" && <label>Password<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 12 : 1} required value={password} onChange={e => setPassword(e.target.value)} /></label>}
        <button disabled={Boolean(busy) || !browserCommunity()} className="cq-button cq-button-primary">{busy === "email" ? "Please wait…" : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}</button>
      </form>
      <div className="cq-auth-text-actions">{mode === "login" ? <><button type="button" className="cq-text-button" disabled={Boolean(busy)} onClick={() => { setMode("signup"); setStatus(""); }}>Create account</button><button type="button" className="cq-text-button" disabled={Boolean(busy)} onClick={() => { setMode("reset"); setStatus(""); }}>Forgot password?</button></> : <button type="button" className="cq-text-button" onClick={() => { setMode("login"); setStatus(""); }}>Back to sign in</button>}</div>
      <p className="cq-hint">Your email stays private. Email accounts require verification.</p>
    </div> : <div className="cq-stack">
      <div className="cq-panel"><p>Signed in{profile ? ` as @${profile.username}` : ""}.</p><div className="cq-actions"><button className="cq-button" disabled={Boolean(busy)} onClick={() => void signOut()}>{busy === "logout" ? "Signing out…" : "Sign out"}</button>{(profile || !requiresProfile) && <Link prefetch={false} className="cq-button cq-button-primary" href={returnTo}>Continue your action ↗</Link>}{profile && <Link prefetch={false} className="cq-button" href={`/u/${profile.username}`}>Public profile</Link>}{moderator && <Link prefetch={false} className="cq-button" href="/community/moderation">Moderation</Link>}</div></div>
      {!user.email_confirmed_at && <button className="cq-button" onClick={async () => { const result = await browserCommunity()?.auth.resend({ type: "signup", email: user.email || email }); setStatus(result?.error ? "Verification could not be requested. Try again." : "Verification email requested. Check your inbox."); }}>Resend verification email</button>}
      {recovery && <form className="cq-form cq-panel" onSubmit={async e => { e.preventDefault(); const result = await browserCommunity()?.auth.updateUser({ password }); setStatus(result?.error ? "Password could not be updated. Try again." : "Password updated."); setPassword(""); }}><label>New password<input type="password" minLength={12} autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} /></label><button className="cq-button">Set new password</button></form>}
      {user.email_confirmed_at && !error && (profile || requiresProfile) && <ProfileForm key={`${user.id}:${profile?.updated_at || "new"}`} profile={profile} returnTo={returnTo} initialName={googleProfileName(user)} />}
      {user.email_confirmed_at && !profile && !requiresProfile && <p className="cq-hint">You can browse now. Your Community profile is only required when posting or interacting.</p>}
    </div>}
    {status && <p role={failed ? "alert" : "status"} className={`cq-notice cq-status ${failed ? "cq-error" : ""}`}>{status}</p>}
    <Link prefetch={false} className="cq-auth-browse cq-text-link" href="/ai-experiences">Browse Community posts without signing in</Link>
  </div>;
}
function ProfileForm({ profile, returnTo, initialName }: { profile: Profile | null; returnTo: string; initialName: string }) {
  const { refresh } = useCommunity();
  const [name, setName] = useState(profile?.display_name || initialName); const [username, setUsername] = useState(profile?.username || ""); const [linkedin, setLinkedin] = useState(profile?.linkedin_url || ""); const [bio, setBio] = useState(profile?.bio || ""); const [avatar, setAvatar] = useState(profile?.avatar || "orbit");
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
