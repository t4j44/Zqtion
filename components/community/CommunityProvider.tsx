"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { browserCommunity, communityRequest } from "@/lib/community/browser";
import type { Profile } from "@/lib/community/types";
import { accountPath, currentCommunityPath, type ParticipationIntent } from "@/lib/community/auth";
type Identity = { user: User | null; profile: Profile | null; moderator: boolean; loading: boolean; error: string; refresh: () => Promise<void> };
const Context = createContext<Identity>({ user: null, profile: null, moderator: false, loading: true, error: "", refresh: async () => {} });
export const useCommunity = () => useContext(Context);
export default function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<Omit<Identity, "refresh">>({ user: null, profile: null, moderator: false, loading: true, error: "" });
  const generation = useRef(0);
  const invalidate = useCallback(() => { generation.current += 1; }, []);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    const commit = (value: Omit<Identity, "refresh">) => { if (request === generation.current) setIdentity(value); };
    const db = browserCommunity();
    if (!db) { commit({ user: null, profile: null, moderator: false, loading: false, error: "Community participation is not open yet. Public pages remain available." }); return; }
    const { data, error } = await db.auth.getUser();
    if (error || !data.user) { commit({ user: null, profile: null, moderator: false, loading: false, error: "" }); return; }
    if (!data.user.email_confirmed_at) { commit({ user: data.user, profile: null, moderator: false, loading: false, error: "Check your email to verify your account." }); return; }
    try { const me = await communityRequest("me"); commit({ user: data.user, profile: me.profile, moderator: me.moderator, loading: false, error: "" }); }
    catch (error) { commit({ user: data.user, profile: null, moderator: false, loading: false, error: error instanceof Error ? error.message : "Profile unavailable." }); }
  }, []);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => { if (active) void refresh(); }, 0);
    const db = browserCommunity();
    const subscription = db?.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "SIGNED_OUT") { invalidate(); setIdentity({ user: null, profile: null, moderator: false, loading: false, error: "" }); }
      else if (event === "SIGNED_IN") { invalidate(); setIdentity(previous => previous.user?.id === session?.user.id ? previous : { user: null, profile: null, moderator: false, loading: true, error: "" }); }
      window.setTimeout(() => { if (active) void refresh(); }, 0);
    });
    return () => { active = false; invalidate(); window.clearTimeout(timer); subscription?.data.subscription.unsubscribe(); };
  }, [refresh, invalidate]);
  return <Context.Provider value={{ ...identity, refresh }}>{children}</Context.Provider>;
}
export function ParticipationGate({ children, returnTo, intent, hash }: { children: React.ReactNode; returnTo?: string; intent?: ParticipationIntent; hash?: string }) {
  const { user, profile, loading, error } = useCommunity();
  if (loading) return <p className="cq-notice" role="status">Loading your community profile…</p>;
  if (!user || !user.email_confirmed_at || !profile || error) return <div className="cq-notice"><p>{error || (user ? "Complete your profile once to participate." : "Sign in to join the conversation. Your community identity is saved for next time.")}</p><Link prefetch={false} className="cq-button" href={accountPath(returnTo || currentCommunityPath("/share", hash), intent || "create")}>{user ? "Continue profile setup" : "Sign in / Join"}</Link></div>;
  return <>{children}</>;
}
export function AccountLink() {
  const { profile } = useCommunity();
  return <Link prefetch={false} href={profile ? `/u/${profile.username}` : "/community/account"}>{profile ? `@${profile.username}` : "Sign in / Join"}</Link>;
}
