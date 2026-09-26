import { semanticDuplicateSearch } from "@/lib/community/server";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = (url.searchParams.get("title") || "").slice(0, 180);
  try {
    const result = title.trim().length < 3 ? { entries: [], available: true } : await semanticDuplicateSearch({ q: title, category: url.searchParams.get("category") || "", tool: url.searchParams.get("tool") || "", tags: (url.searchParams.get("tags") || "").split(",").filter(Boolean).slice(0, 5) });
    return Response.json({ available: result.available, entries: result.entries.map(e => ({ id: e.id, kind: e.kind, title: e.title, root_id: e.root_id })) }, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  } catch { return Response.json({ error: "Similar discussions could not be checked. Try again before publishing." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
