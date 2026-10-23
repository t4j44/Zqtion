import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";
import { PUBLIC_ENTRY_FIELDS, PUBLIC_PROFILE_FIELDS, type Card, type Counts, type PublicEntry, type PublicIdentity, type Media, type Profile } from "./types";
import { isUuid } from "./validation";

export const communityEnabled = () => process.env.NEXT_PUBLIC_COMMUNITY_ENABLED === "true" && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export function communityClient(token?: string) {
  if (!communityEnabled()) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}), fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(10000) }) },
  });
}
export function storageAdmin() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!communityEnabled() || !key) throw new CommunityError("Image storage is not configured yet.", 503);
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(10000) }) } });
}
export class CommunityError extends Error { constructor(message: string, public status = 400) { super(message); } }
export async function authenticated(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token || token.length > 8192) throw new CommunityError("Sign in to participate.", 401);
  const db = communityClient(token);
  if (!db) throw new CommunityError("Community participation is not open yet.", 503);
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw new CommunityError("Your session expired. Sign in again.", 401);
  if (!data.user.email_confirmed_at) throw new CommunityError("Verify your email before participating.", 403);
  return { db, user: data.user };
}
export async function writeCommunity(db: SupabaseClient, action: string, data: Record<string, unknown>) {
  const result = await db.rpc(["feature", "unfeature", "reorder_featured"].includes(action) ? "community_portfolio_write" : "community_write", { p_action: action, p_data: data });
  if (result.error) {
    const code = result.error.code;
    if (code === "23505") throw new CommunityError(action === "profile" ? "That username is already taken." : "This exact contribution already exists.", 409);
    if (code === "23514" || code === "22P02" || code === "23502") throw new CommunityError("Review the required fields and limits.");
    if (code === "42501" || code === "P0001") throw new CommunityError(result.error.message, code === "42501" ? 403 : 400);
    throw new CommunityError("Community storage is temporarily unavailable. Your action has not been confirmed.", 503);
  }
  if (result.data?.error) throw new CommunityError(result.data.error, result.data.code || 400);
  return result.data;
}
export async function cards(db: SupabaseClient, entries: PublicEntry[]): Promise<Card[]> {
  if (!entries.length) return [];
  const parentIds = [...new Set(entries.flatMap(e => [e.parent_id, e.root_id]).filter((id): id is string => Boolean(id)))];
  const [people, totals, replies, parents] = await Promise.all([
    db.from("community_profiles").select(PUBLIC_PROFILE_FIELDS).in("id", [...new Set(entries.map(e => e.author_id))]),
    db.rpc("community_counts", { p_ids: entries.map(e => e.id) }),
    db.rpc("community_reply_counts", { p_ids: entries.map(e => e.id) }),
    parentIds.length ? db.from("community_entries").select("id,title,kind,accepted_answer_id").in("id", parentIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (people.error || totals.error || replies.error || parents.error) throw new CommunityError("Community information could not be loaded.", 503);
  return entries.map(e => {
    const parent = parents.data?.find(p => p.id === e.parent_id); const root = parents.data?.find(p => p.id === e.root_id);
    return { ...e, parent_title: parent?.title || root?.title, parent_kind: parent?.kind, root_kind: root?.kind, accepted: parent?.accepted_answer_id === e.id,
      author: (people.data as Profile[]).find(p => p.id === e.author_id)!, counts: { ...((totals.data as Counts[]).find(c => c.id === e.id) || { id: e.id, votes: 0, rating: null, rating_count: 0, answers: 0 }), ...replies.data?.find((c: {id: string}) => c.id === e.id) } };
  }).filter(e => e.author);
}
export async function childrenOf(id: string, sort = "top", offset = 0, exclude?: string | null) {
  const db = communityClient();
  if (!db) return { entries: [] as Card[], more: false };
  const { data, error } = await db.rpc("community_children", { p_parent: id, p_sort: sort === "newest" ? "newest" : "top", p_offset: Math.min(Math.max(Math.floor(offset), 0), 10000), p_exclude: exclude || null });
  if (error) throw new CommunityError("The conversation could not be loaded. Try again.", 503);
  const entries = await cards(db, (data as PublicEntry[]).slice(0, 10));
  const media = await entryMedia(entries.map(e => e.id));
  return { entries: entries.map(e => ({ ...e, media: media.filter(m => m.entry_id === e.id) })), more: data.length > 10 };
}
export type SearchInput = { q?: string; kind?: string; category?: string; tool?: string; tags?: string[]; page?: number; similar?: boolean };
export async function searchCommunity(input: SearchInput = {}) {
  const db = communityClient();
  if (!db) return { entries: [] as Card[], more: false, available: false };
  const { data, error } = await db.rpc("community_search", { p_query: (input.q || "").slice(0, 180), p_kind: input.kind || "", p_category: input.category || "", p_tool: (input.tool || "").slice(0, 80), p_tags: (input.tags || []).slice(0, 5), p_offset: Math.min(Math.max((input.page || 1) - 1, 0), 500) * 20, p_similar: Boolean(input.similar) });
  if (error) throw new CommunityError("Discussions are temporarily unavailable. Please try again.", 503);
  return { entries: await cards(db, (data as PublicEntry[]).slice(0, input.similar ? 5 : 20)), more: data.length > 20, available: true };
}
export const semanticDuplicateSearch = (input: SearchInput) => searchCommunity({ ...input, similar: true });
export async function searchContributors(query: string) {
  const db = communityClient();
  if (!db || query.trim().length < 2) return { people: [] as PublicIdentity[], answers: [] as Card[] };
  const [people, answers] = await Promise.all([db.rpc("community_search_people", { p_query: query.slice(0, 180) }), db.rpc("community_search_answers", { p_query: query.slice(0, 180) })]);
  if (people.error || answers.error) throw new CommunityError("Contributor search is temporarily unavailable.", 503);
  return { people: people.data as PublicIdentity[], answers: await cards(db, answers.data as PublicEntry[]) };
}
export const getEntry = cache(async (id: string) => {
  if (!isUuid(id)) return null;
  const db = communityClient();
  if (!db) return null;
  const result = await db.from("community_entries").select(PUBLIC_ENTRY_FIELDS).eq("id", id).eq("status", "published").maybeSingle();
  if (result.error) throw new CommunityError("This discussion could not be loaded.", 503);
  if (!result.data) return null;
  const [card] = await cards(db, [result.data as PublicEntry]);
  return card;
});
export async function threadEntries(id: string, page = 1) {
  const db = communityClient();
  if (!db) return { entries: [] as Card[], more: false };
  const start = Math.min(Math.max(page - 1, 0), 500) * 50;
  const { data, error } = await db.from("community_entries").select(PUBLIC_ENTRY_FIELDS).eq("root_id", id).eq("status", "published").order("created_at").order("id").range(start, start + 50);
  if (error) throw new CommunityError("Replies could not be loaded.", 503);
  return { entries: await cards(db, data.slice(0, 50) as PublicEntry[]), more: data.length > 50 };
}
export async function entryMedia(ids: string[]) {
  const db = communityClient();
  if (!db || !ids.length) return [] as Media[];
  const { data, error } = await db.from("community_media").select("id,owner_id,entry_id,purpose,alt,status,created_at").in("entry_id", ids).eq("status", "approved").limit(204);
  if (error) throw new CommunityError("Images could not be loaded.", 503);
  return data as Media[];
}
export const getProfile = cache(async (username: string) => {
  const db = communityClient();
  if (!db || !/^[a-z][a-z0-9_]{2,29}$/.test(username)) return null;
  const { data, error } = await db.from("community_profiles").select(PUBLIC_PROFILE_FIELDS).eq("username", username).maybeSingle();
  if (error) throw new CommunityError("This profile could not be loaded.", 503);
  return data as Profile | null;
});
export async function indexableIds(ids: string[]) {
  const db = communityClient();
  if (!db || !ids.length) return [] as string[];
  const { data, error } = await db.rpc("community_indexable", { p_ids: ids.slice(0, 1000) });
  if (error) return [];
  return (data as { id: string }[]).map(e => e.id);
}
export async function indexableProfiles(ids: string[]) {
  const db = communityClient();
  if (!db || !ids.length) return [] as { id: string; username: string; updated_at: string }[];
  const { data, error } = await db.rpc("community_indexable_profiles", { p_ids: ids.slice(0, 100) });
  if (error) throw new CommunityError("Portfolio indexing information is unavailable.", 503);
  return data as { id: string; username: string; updated_at: string }[];
}
export const profileIsIndexable = cache(async (profile: Profile) => {
  try { return (await indexableProfiles([profile.id])).some(p => p.id === profile.id); }
  catch { return false; }
});
