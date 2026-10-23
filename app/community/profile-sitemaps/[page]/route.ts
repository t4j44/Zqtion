import { communityClient, indexableProfiles } from "@/lib/community/server";
import { siteConfig } from "@/data/site";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ page: string }> }) {
  const raw = (await params).page;
  if (!/^\d{1,5}$/.test(raw)) return new Response(null, { status: 404 });
  const db = communityClient(); let urls = "";
  if (db) {
    const offset = Number(raw) * 100;
    const { data, error } = await db.from("community_profiles").select("id").order("id").range(offset, offset + 99);
    if (error) return new Response("Sitemap unavailable", { status: 503 });
    try {
      const profiles = await indexableProfiles(data.map(p => p.id));
      urls = profiles.map(p => `<url><loc>${siteConfig.url}/u/${p.username}</loc><lastmod>${new Date(p.updated_at).toISOString()}</lastmod></url>`).join("");
    } catch { return new Response("Sitemap unavailable", { status: 503 }); }
  }
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { "Content-Type": "application/xml", "Cache-Control": "no-store" } });
}
