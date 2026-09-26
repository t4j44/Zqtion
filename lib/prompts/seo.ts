import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
export function promptMetadata(title: string, description: string, path: string): Metadata {
  return { title, description, alternates: { canonical: path }, openGraph: { title, description, url: path, type: "website", images: ["/og-image.png"] }, twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] } };
}
export function librarySchema(title: string, description: string, path: string, type: "Article" | "CollectionPage" = "CollectionPage", updated?: string) {
  return { "@context": "https://schema.org", "@type": type, name: title, ...(type === "Article" ? { headline: title } : {}), description, url: `${siteConfig.url}${path}`, mainEntityOfPage: `${siteConfig.url}${path}`, inLanguage: "en", author: { "@type": "Organization", name: "Zqtion", url: siteConfig.url }, ...(updated ? { dateModified: updated } : {}) };
}
