import { createHash } from "node:crypto";
import reviews from "@/content/resources/editorial-reviews.json";
import type { ResourceItem } from "./types";
export type EditorialReview = { decision: "approved"; reviewer: string; reviewedAt: string; contentHash: string; methodUrl: string; evidenceUrl: string };
export function resourceContentHash(resource: Pick<ResourceItem, "title" | "summary" | "contentMarkdown">) {
  return createHash("sha256").update([resource.title, resource.summary, resource.contentMarkdown].join("\n")).digest("hex");
}
const httpUrl = (value: string) => { try { return new URL(value).protocol === "https:"; } catch { return false; } };
export function resourceIndexable(resource: ResourceItem, review: EditorialReview | undefined = (reviews as Record<string, EditorialReview>)[resource.slug]) {
  return resource.status === "published" && Boolean(review && review.decision === "approved" && review.reviewer.trim() && /^\d{4}-\d{2}-\d{2}/.test(review.reviewedAt) && Number.isFinite(Date.parse(review.reviewedAt)) && Date.parse(review.reviewedAt) <= Date.now() && review.contentHash === resourceContentHash(resource) && httpUrl(review.methodUrl) && httpUrl(review.evidenceUrl) && resource.sources?.some(source => source.isPrimary && httpUrl(source.sourceUrl)));
}
