import type { MetadataRoute } from "next";
import { insights } from "@/data/insights";
import { workItems } from "@/data/work";
import { siteConfig } from "@/data/site";
import { careerTracks } from "@/data/careers";
import { getLibraryRoutes, getAllPrompts } from "@/lib/prompts/service";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/work", "/services", "/process", "/about", "/insights", "/ai-audit", "/contact", "/privacy", "/terms", "/careers", "/ai-experiences", "/prompts/community", "/community/guidelines"];
  return [
    ...getLibraryRoutes().map((path) => { const prompt = getAllPrompts().find((p) => p.seo.canonicalPath === path); return { url: `${siteConfig.url}${path}`, ...(prompt ? { lastModified: new Date(`${prompt.updatedAt}T00:00:00Z`) } : {}), changeFrequency: "monthly" as const, priority: path === "/prompts" ? 0.8 : 0.65 }; }),
    ...pages.map((path) => ({ url: `${siteConfig.url}${path}`, changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : path === "/contact" ? 0.9 : 0.8 })),
    ...workItems.map((item) => ({ url: `${siteConfig.url}/work/${item.slug}`, changeFrequency: "monthly" as const, priority: 0.75 })),
    ...careerTracks.map((track) => ({ url: `${siteConfig.url}/careers/${track.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...insights.map((article) => ({ url: `${siteConfig.url}/insights/${article.slug}`, lastModified: new Date(`${article.published}T00:00:00Z`), changeFrequency: "yearly" as const, priority: 0.7 })),
  ];
}
