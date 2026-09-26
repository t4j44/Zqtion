"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { browserCommunity, communityRequest } from "@/lib/community/browser";
import type { Profile } from "@/lib/community/types";
type Identity = { user: User | null; profile: Profile | null; moderator: boolean; loading: boolean; error: string; refresh: () => Promise<void> };
const Context = createContext<Identity>({ user: null, profile: null, moderator: false, loading: true, error: "", refresh: async () => {} });
export const useCommunity = () => useContext(Context);
export default function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<Omit<Identity, "refresh">>({ user: null, profile: null, moderator: false, loading: true, error: "" });
  const refresh = useCallback(async () => {
    const db = browserCommunity();
    if (!db) { setIdentity({ user: null, profile: null, moderator: false, loading: false, error: "Community participation is not open yet. Public pages remain available." }); return; }
    const { data, error } = await db.auth.getUser();
    if (error || !data.user) { setIdentity({ user: null, profile: null, moderator: false, loading: false, error: "" }); return; }
    if (!data.user.email_confirmed_at) { setIdentity({ user: data.user, profile: null, moderator: false, loading: false, error: "Check your email to verify your account." }); return; }
    try { const me = await communityRequest("me"); setIdentity({ user: data.user, profile: me.profile, moderator: me.moderator, loading: false, error: "" }); }
    catch (error) { setIdentity({ user: data.user, profile: null, moderator: false, loading: false, error: error instanceof Error ? error.message : "Profile unavailable." }); }
  }, []);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => { if (active) void refresh(); }, 0);
    const db = browserCommunity();
    const subscription = db?.auth.onAuthStateChange(() => { window.setTimeout(() => { if (active) void refresh(); }, 0); });
    return () => { active = false; window.clearTimeout(timer); subscription?.data.subscription.unsubscribe(); };
  }, [refresh]);
  return <Context.Provider value={{ ...identity, refresh }}>{children}</Context.Provider>;
}
export function ParticipationGate({ children, returnTo }: { children: React.ReactNode; returnTo?: string }) {
  const { user, profile, loading, error } = useCommunity();
  if (loading) return <p className="cq-notice" role="status">Loading your community profile…</p>;
  if (!user || !user.email_confirmed_at || !profile || error) return <div className="cq-notice"><p>{error || (user ? "Complete your profile once to participate." : "Sign in to join the conversation. Your community identity is saved for next time.")}</p><Link prefetch={false} className="cq-button" href={`/community/account?next=${encodeURIComponent(returnTo || (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/share"))}`}>{user ? "Continue profile setup" : "Sign in / Join"}</Link></div>;
  return <>{children}</>;
}
export function AccountLink() {
  const { profile } = useCommunity();
  return <Link prefetch={false} href={profile ? `/u/${profile.username}` : "/community/account"}>{profile ? `@${profile.username}` : "Sign in / Join"}</Link>;
}
