import type { MetadataRoute } from "next";
import { insights } from "@/data/insights";
import { workItems } from "@/data/work";
import { siteConfig } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date("2026-08-09T00:00:00Z");
  const pages = ["", "/work", "/services", "/process", "/about", "/insights", "/ai-audit", "/contact", "/privacy", "/terms"];
  return [
    ...pages.map((path) => ({ url: `${siteConfig.url}${path}`, lastModified: updated, changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : path === "/contact" ? 0.9 : 0.8 })),
    ...workItems.map((item) => ({ url: `${siteConfig.url}/work/${item.slug}`, lastModified: updated, changeFrequency: "monthly" as const, priority: 0.75 })),
    ...insights.map((article) => ({ url: `${siteConfig.url}/insights/${article.slug}`, lastModified: new Date(`${article.published}T00:00:00Z`), changeFrequency: "yearly" as const, priority: 0.7 })),
  ];
}
