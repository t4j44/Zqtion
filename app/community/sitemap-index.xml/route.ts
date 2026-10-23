import { communityClient } from "@/lib/community/server";
import { siteConfig } from "@/data/site";
export const dynamic = "force-dynamic";
export async function GET() {
  const db = communityClient();
  let count = 0; let profiles = 0;
  if (db) {
    const [entries, people] = await Promise.all([
      db.from("community_entries").select("id", { count: "exact", head: true }).is("parent_id", null).eq("status", "published"),
      db.from("community_profiles").select("id", { count: "exact", head: true }),
    ]);
    if (entries.error || people.error) return new Response("Sitemap unavailable", { status: 503 });
    count = entries.count || 0; profiles = people.count || 0;
  }
  const items = Array.from({ length: Math.ceil(count / 1000) }, (_, i) => `<sitemap><loc>${siteConfig.url}/community/sitemaps/${i}</loc></sitemap>`).join("")
    + Array.from({ length: Math.ceil(profiles / 100) }, (_, i) => `<sitemap><loc>${siteConfig.url}/community/profile-sitemaps/${i}</loc></sitemap>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`, { headers: { "Content-Type": "application/xml", "Cache-Control": "no-store" } });
}
