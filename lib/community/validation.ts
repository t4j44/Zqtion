import { avatars, categories, GUIDELINES_VERSION, IMAGE_TYPES, MAX_IMAGE_BYTES, postKinds } from "./types";

export function codePoints(text: string) { return Array.from(text).length; }
export function normalizeTitle(text: string) { return text.trim().replace(/\s+/gu, " ").toLowerCase(); }
export function suggestCommunityTitle(input: { title: string; tool?: string; category?: string }) {
  const { title } = input;
  const guidance: string[] = [];
  const errors: string[] = [];
  const length = codePoints(title);
  if (!title.trim()) errors.push("Add a title.");
  if (length > 180) errors.push("Keep the title within 180 characters.");
  if (title.trim() && length < 20) guidance.push("Make your title more specific. Mention the AI tool and what you’re trying to solve.");
  const letters = title.match(/\p{L}/gu) || [];
  if (letters.length >= 5 && title === title.toUpperCase() && title !== title.toLowerCase()) guidance.push("Sentence case is easier to read than all capitals.");
  if (title.trim() && !/[\p{L}\p{N}]/u.test(title)) errors.push("Use a readable title with words.");
  else if (length > 0 && (title.match(/[\p{L}\p{N}\p{M}\s]/gu) || []).length / length < 0.5) guidance.push("Use more words and fewer symbols to describe your contribution.");
  if (/^(help( pls| please)?|question|test|hi|issue|problem|website prompt)[!? .]*$/i.test(title.trim())) guidance.push("Explain what happened or what you want to know.");
  // Deliberately no speculative paraphrase. This interface can gain opt-in providers later.
  return { title, errors, guidance, suggestion: null as string | null, acceptable: errors.length === 0 };
}
export function suggestCommunityTags(input: { tags?: string[] }) { return [...new Set(input.tags || [])].slice(0, 5); }
export function moderateCommunityContent(text: string) {
  const reasons: string[] = [];
  if (/(javascript:|data:text\/html|https?:\/\/\S+\.(exe|scr|bat|cmd|ps1|msi)([\s?#]|$)|https?:\/\/[^ /]+@)/i.test(text)) reasons.push("Potentially unsafe link");
  if (/(guaranteed.{0,20}(profit|return)|send.{0,20}(password|seed phrase)|buy.{0,12}(followers|accounts)|kill yourself|i will kill you|child.{0,12}(porn|sexual)|doxx?ing|home address is|social security number is|gore video|download.{0,20}(ransomware|stealer))/i.test(text)) reasons.push("Safety review required");
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) reasons.push("Possible private contact information");
  if (/(-----BEGIN.{0,20}PRIVATE KEY-----|\bsk-[A-Za-z0-9_-]{20,}|(phone|credit card|ssn)\s*(number)?\s*[:=]\s*[+\d][\d -]{7,})/i.test(text)) reasons.push("Possible private credentials or personal information");
  if ((text.match(/https:\/\//gi) || []).length > 8) reasons.push("Excessive promotion links");
  return { decision: reasons.length ? "review" as const : "allow" as const, reasons };
}
export function validLinkedIn(value: string) { return value.length <= 300 && /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_%.-]+\/?$/.test(value); }
export function safeReturnPath(value: string | null | undefined) {
  if (!value || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return "/share";
  try {
    const url = new URL(value, "https://zqtion.com");
    return url.origin === "https://zqtion.com" && /^\/(share|ai-experiences|prompts\/community|community\/saved)(\/|\?|$)/.test(value) ? `${url.pathname}${url.search}${url.hash}` : "/share";
  } catch { return "/share"; }
}
export function imageError(file: { size: number; type: string }) {
  if (file.size < 1 || file.size > MAX_IMAGE_BYTES) return "Each image must be 1 MB (1,000,000 bytes) or smaller.";
  if (!IMAGE_TYPES.includes(file.type)) return "Use JPG, JPEG, PNG or WEBP images.";
  return null;
}
export function validateProfile(data: Record<string, unknown>) {
  const errors: string[] = [];
  if (typeof data.display_name !== "string" || codePoints(data.display_name.trim()) < 2 || codePoints(data.display_name) > 80) errors.push("Enter a display name of 2–80 characters.");
  if (typeof data.username !== "string" || !/^[a-z][a-z0-9_]{2,29}$/.test(data.username) || ["admin", "administrator", "moderator", "support", "zqtion", "system"].includes(data.username)) errors.push("Choose a unique username: 3–30 lowercase letters, numbers or underscores; start with a letter.");
  if (typeof data.linkedin_url !== "string" || !validLinkedIn(data.linkedin_url)) errors.push("Enter your https://www.linkedin.com/in/ profile URL.");
  if (![...avatars, "photo"].includes(String(data.avatar)) || (data.avatar === "photo" && !isUuid(data.photo_id))) errors.push("Choose a Zqtion avatar or upload your profile photo.");
  if (typeof data.bio !== "string" || codePoints(data.bio) > 500) errors.push("Keep your bio within 500 characters.");
  if (data.guidelines !== GUIDELINES_VERSION) errors.push("Accept the community guidelines.");
  return errors;
}
export function isUuid(value: unknown): value is string { return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value); }
export function validateContribution(data: Record<string, unknown>) {
  const errors: string[] = [];
  const child = ["answer", "comment", "result"].includes(String(data.kind));
  if (![...postKinds, "answer", "comment", "result"].includes(String(data.kind))) errors.push("Choose a contribution type.");
  if (typeof data.title !== "string" || (!child && suggestCommunityTitle({ title: data.title }).errors.length)) errors.push("Add a readable title within 180 characters.");
  if (typeof data.body !== "string" || codePoints(data.body.trim()) < (child ? 2 : 20) || codePoints(data.body) > 20000) errors.push(`Add ${child ? 2 : 20}–20,000 characters of context.`);
  if (!categories.includes(data.category as typeof categories[number])) errors.push("Choose a category.");
  if (typeof data.tool !== "string" || codePoints(data.tool) > 80) errors.push("Keep the tool name within 80 characters.");
  if (!Array.isArray(data.tags) || data.tags.length > 5 || data.tags.some(t => typeof t !== "string" || !t.trim() || codePoints(t) > 30)) errors.push("Use up to five tags, each 1–30 characters.");
  if (typeof data.prompt_text !== "string" || codePoints(data.prompt_text) > 20000 || (data.kind === "prompt" && codePoints(data.prompt_text.trim()) < 10)) errors.push("Prompts need 10–20,000 characters of prompt text.");
  if (data.session_slug && (typeof data.session_slug !== "string" || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(data.session_slug))) errors.push("Use a session slug with lowercase letters, numbers and hyphens.");
  if (child && !isUuid(data.parent_id)) errors.push("Choose a published discussion.");
  if (data.parent_prompt_id && !isUuid(data.parent_prompt_id)) errors.push("Choose a valid source prompt.");
  if (!Array.isArray(data.media_ids) || data.media_ids.length > 4 || data.media_ids.some(id => !isUuid(id))) errors.push("Attach up to four uploaded images.");
  return errors;
}
