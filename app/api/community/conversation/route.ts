import { childrenOf, CommunityError, entryMedia, getEntry } from "@/lib/community/server";
import { isUuid } from "@/lib/community/validation";
export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  try {
    const q = new URL(request.url).searchParams;
    if (q.has("target")) {
      const entry = await getEntry(q.get("target") || "");
      if (!entry || entry.root_id !== q.get("root")) return Response.json({ error: "Contribution unavailable." }, { status: 404, headers });
      return Response.json({ entry: { ...entry, media: await entryMedia([entry.id]) } }, { headers });
    }
    const id = q.get("parent") || "";
    if (!isUuid(id)) return Response.json({ error: "Invalid conversation." }, { status: 400, headers });
    const parent = await getEntry(id);
    if (!parent) return Response.json({ error: "This conversation is no longer public." }, { status: 404, headers });
    const offset = Number(q.get("offset")) || 0;
    return Response.json(await childrenOf(id, q.get("sort") || "top", offset, parent.accepted_answer_id), { headers });
  } catch (error) { return Response.json({ error: error instanceof CommunityError ? error.message : "The conversation could not be loaded." }, { status: 503, headers }); }
}
