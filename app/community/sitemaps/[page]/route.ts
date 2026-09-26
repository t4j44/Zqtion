import { communityClient, indexableIds } from "@/lib/community/server";
import { siteConfig } from "@/data/site";
import { entryPath } from "@/lib/community/types";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ page: string }> }) {
  const raw = (await params).page; if (!/^\d{1,5}$/.test(raw)) return new Response(null, { status: 404 });
  const page = Number(raw); const db = communityClient(); let urls = "";
  if (db) {
    const { data, error } = await db.from("community_entries").select("id,kind,root_id,updated_at").is("parent_id", null).eq("status", "published").order("created_at").order("id").range(page * 1000, page * 1000 + 999);
    if (error) return new Response("Sitemap unavailable", { status: 503 });
    const allowed = await indexableIds(data.map(e => e.id));
    urls = data.filter(e => allowed.includes(e.id)).map(e => `<url><loc>${siteConfig.url}${entryPath(e)}</loc><lastmod>${new Date(e.updated_at).toISOString()}</lastmod></url>`).join("");
  }
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { "Content-Type": "application/xml", "Cache-Control": "no-store" } });
}
