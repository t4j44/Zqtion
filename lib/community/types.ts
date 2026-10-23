export const postKinds = ["question", "tip", "experience", "troubleshooting", "showcase", "tutorial", "discussion", "prompt"] as const;
export type PostKind = typeof postKinds[number];
export type EntryKind = PostKind | "answer" | "comment" | "result";
export const categories = ["creative", "build", "automate", "general"] as const;
export const avatars = ["orbit", "spark", "grid", "wave"] as const;
export const GUIDELINES_VERSION = "2026-09-v1";
export const MAX_IMAGE_BYTES = 1_000_000;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export type Profile = { id: string; username: string; display_name: string; linkedin_url: string; avatar: string; photo_id: string | null; bio: string; created_at: string; updated_at: string };
export type Entry = { id: string; author_id: string; kind: EntryKind; title: string; body: string; prompt_text: string; category: string; tool: string; tags: string[]; parent_id: string | null; root_id: string | null; parent_prompt_id: string | null; accepted_answer_id: string | null; reply_depth: number; session_slug: string | null; status: string; moderation_reason: string; created_at: string; updated_at: string };
export type Counts = { id: string; votes: number; rating: number | null; rating_count: number; answers: number; comments?: number; results?: number };
export type Media = { id: string; owner_id: string; entry_id: string | null; purpose: string; alt: string; status: string; created_at: string };
export type PublicEntry = Omit<Entry, "moderation_reason">;
export type PublicIdentity = Pick<Profile, "id" | "username" | "display_name" | "linkedin_url" | "avatar" | "photo_id" | "bio">;
export const PUBLIC_PROFILE_FIELDS = "id,username,display_name,linkedin_url,avatar,photo_id,bio,created_at,updated_at";
export const PUBLIC_ENTRY_FIELDS = "id,author_id,kind,title,body,prompt_text,category,tool,tags,parent_id,root_id,parent_prompt_id,accepted_answer_id,reply_depth,session_slug,status,created_at,updated_at";
export type Card = PublicEntry & { author: Profile; counts: Counts; parent_title?: string; parent_kind?: EntryKind; root_kind?: EntryKind; accepted?: boolean; media?: Media[] };
export function entryPath(e: Pick<Entry, "id" | "kind" | "root_id"> & { root_kind?: EntryKind }) {
  return e.root_id ? `${e.root_kind === "prompt" || e.kind === "result" ? "/prompts/community" : "/ai-experiences"}/${e.root_id}#entry-${e.id}` : e.kind === "prompt" ? `/prompts/community/${e.id}` : `/ai-experiences/${e.id}`;
}
