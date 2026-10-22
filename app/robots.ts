import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: [
      // Let search crawlers fetch page assets and observe private-page noindex.
      // robots.txt is not an access-control mechanism; Auth and RLS protect data.
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      { userAgent: ["Googlebot", "Bingbot", "OAI-SearchBot", "PerplexityBot", "Claude-SearchBot", "ChatGPT-User", "Claude-User"], allow: "/", disallow: ["/api/"] },
      // No training opt-in has been approved. Search access is independent.
      { userAgent: ["GPTBot", "ClaudeBot", "Google-Extended"], disallow: "/" },
    ],
    sitemap: [`${siteConfig.url}/sitemap.xml`, `${siteConfig.url}/community/sitemap-index.xml`],
    host: siteConfig.url,
  };
}
