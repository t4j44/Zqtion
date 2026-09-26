"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
let client: SupabaseClient | null = null;
export function browserCommunity() {
  if (process.env.NEXT_PUBLIC_COMMUNITY_ENABLED !== "true" || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  return client ||= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "zqtion-community-auth" } });
}
export async function communityRequest(path: string, init: RequestInit = {}) {
  const db = browserCommunity();
  const { data } = db ? await db.auth.getSession() : { data: { session: null } };
  if (!data.session) throw new Error("Sign in to participate.");
  const response = await fetch(`/api/community/${path}`, { ...init, headers: { ...(init.body instanceof Blob ? {} : { "Content-Type": "application/json" }), ...init.headers, Authorization: `Bearer ${data.session.access_token}` }, cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Your action could not be completed.");
  return result;
}
export async function mutate(action: string, data: Record<string, unknown>) {
  const result = await communityRequest("actions", { method: "POST", body: JSON.stringify({ action, data }) });
  if (["vote", "save", "rate", "feature", "unfeature"].includes(action)) window.dispatchEvent(new CustomEvent("zqtion-community-activity", { detail: { id: data.id } }));
  return result;
}

type Activity = { voted: boolean; saved: boolean; rating: number; featured: boolean; error?: string };
let activityQueue: { id: string; userId: string; resolve: (value: Activity) => void }[] = [];
let activityTimer: ReturnType<typeof setTimeout> | null = null;
// Four batched reads per rendered group, instead of four requests per contribution.
export function getEntryActivity(id: string, userId: string): Promise<Activity> {
  return new Promise(resolve => {
    activityQueue.push({ id, userId, resolve });
    if (activityTimer) return;
    activityTimer = setTimeout(async () => {
      const queued = activityQueue; activityQueue = []; activityTimer = null;
      const db = browserCommunity();
      for (const uid of [...new Set(queued.map(q => q.userId))]) {
        const group = queued.filter(q => q.userId === uid); const ids = [...new Set(group.map(q => q.id))].slice(0, 100);
        if (!db) { group.forEach(q => q.resolve({ voted: false, saved: false, rating: 0, featured: false })); continue; }
        const [votes, saves, ratings, featured] = await Promise.all([db.from("community_votes").select("entry_id").eq("user_id", uid).in("entry_id", ids), db.from("community_saves").select("entry_id").eq("user_id", uid).in("entry_id", ids), db.from("community_ratings").select("entry_id,rating").eq("user_id", uid).in("entry_id", ids), db.from("community_profile_featured").select("entry_id").eq("profile_id", uid).in("entry_id", ids)]);
        const failed = votes.error || saves.error || ratings.error || featured.error;
        group.forEach(q => q.resolve({ voted: Boolean(votes.data?.some(v => v.entry_id === q.id)), saved: Boolean(saves.data?.some(s => s.entry_id === q.id)), rating: ratings.data?.find(r => r.entry_id === q.id)?.rating || 0, featured: Boolean(featured.data?.some(f => f.entry_id === q.id)), ...(failed ? { error: "Your saved actions could not be loaded. Please retry." } : {}) }));
      }
    }, 30);
  });
}
