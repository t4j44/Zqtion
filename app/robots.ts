import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/_next/"] },
      { userAgent: ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-User", "PerplexityBot"], allow: ["/", "/work/", "/services", "/process", "/about", "/insights/", "/careers/", "/ai-audit", "/llms.txt", "/ai.txt"], disallow: ["/api/", "/_next/"] },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
