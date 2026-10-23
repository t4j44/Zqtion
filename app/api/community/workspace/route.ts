import { authenticated, cards, CommunityError } from "@/lib/community/server";
import { PUBLIC_ENTRY_FIELDS, type PublicEntry } from "@/lib/community/types";
export async function GET(request: Request) {
  try {
    const { db, user } = await authenticated(request);
    const reviewCards = async (entries: PublicEntry[]) => {
      if (!entries.length) return [];
      const [items, reasons] = await Promise.all([cards(db, entries), db.rpc("community_review_reasons", { p_ids: entries.map(e => e.id) })]);
      if (reasons.error) throw new CommunityError("Review information could not be loaded.", 503);
      return items.map(e => ({ ...e, moderation_reason: reasons.data?.find((r: { id: string; moderation_reason: string }) => r.id === e.id)?.moderation_reason || "" }));
    };
    const url = new URL(request.url); const tab = url.searchParams.get("tab") || "saved"; const page = Math.max(1, Math.min(500, Number(url.searchParams.get("page")) || 1)); const start = (page - 1) * 20;
    if (tab === "moderation") {
      const moderator = await db.rpc("community_is_moderator");
      if (moderator.error || moderator.data !== true) throw new CommunityError("Moderator access required.", 403);
      const [pending, reports, media, history] = await Promise.all([
        db.from("community_entries").select(PUBLIC_ENTRY_FIELDS).in("status", ["pending", "hidden"]).order("created_at").range(start, start + 20),
        db.from("community_reports").select("id,entry_id,reason,state,created_at").eq("state", "open").order("created_at").range(start, start + 20),
        db.from("community_media").select("id,owner_id,entry_id,purpose,alt,status,created_at").eq("status", "pending").order("created_at").range(start, start + 20),
        db.from("community_moderation_actions").select("id,action,reason,entry_id,media_id,created_at").order("created_at", { ascending: false }).range(start, start + 19),
      ]);
      if ([pending, reports, media, history].some(r => r.error)) throw new CommunityError("The moderation queue could not be loaded.", 503);
      const reportIds = [...new Set((reports.data || []).slice(0, 20).map(r => r.entry_id))];
      const reported = reportIds.length ? await db.from("community_entries").select(PUBLIC_ENTRY_FIELDS).in("id", reportIds) : { data: [], error: null };
      if (reported.error) throw new CommunityError("Reported content could not be loaded.", 503);
      const entries = [...new Map([...(pending.data || []).slice(0, 20), ...(reported.data || [])].map(e => [e.id, e])).values()];
      return Response.json({ entries: await reviewCards(entries as PublicEntry[]), reports: reports.data?.slice(0, 20), media: media.data?.slice(0, 20), history: history.data, more: [pending, reports, media].some(r => (r.data?.length || 0) > 20) }, { headers: { "Cache-Control": "no-store" } });
    }
    if (tab === "mine") {
      const result = await db.from("community_entries").select(PUBLIC_ENTRY_FIELDS).eq("author_id", user.id).neq("status", "deleted").order("created_at", { ascending: false }).range(start, start + 20);
      if (result.error) throw new CommunityError("Your contributions could not be loaded.", 503);
      return Response.json({ entries: await reviewCards(result.data.slice(0, 20) as PublicEntry[]), more: result.data.length > 20 }, { headers: { "Cache-Control": "no-store" } });
    }
    const saved = await db.from("community_saves").select("entry_id").eq("user_id", user.id).order("created_at", { ascending: false }).range(start, start + 20);
    if (saved.error) throw new CommunityError("Your saves could not be loaded.", 503);
    const ids = saved.data.slice(0, 20).map(s => s.entry_id);
    const result = ids.length ? await db.from("community_entries").select(PUBLIC_ENTRY_FIELDS).in("id", ids) : { data: [], error: null };
    if (result.error) throw new CommunityError("Saved contributions could not be loaded.", 503);
    return Response.json({ entries: await cards(db, (result.data || []).sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)) as PublicEntry[]), more: saved.data.length > 20 }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return Response.json({ error: error instanceof CommunityError ? error.message : "Community workspace is unavailable." }, { status: error instanceof CommunityError ? error.status : 503, headers: { "Cache-Control": "no-store" } }); }
}
