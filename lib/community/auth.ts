import type { User } from "@supabase/supabase-js";
import { safeReturnPath } from "./validation";

export const participationIntents = ["comment", "answer", "reply", "vote", "save", "rate", "create", "report"] as const;
export type ParticipationIntent = typeof participationIntents[number];
export function safeParticipationIntent(value: unknown): ParticipationIntent | undefined {
  return participationIntents.find(intent => intent === value);
}
export function needsCommunityProfile(path: string, intent?: ParticipationIntent) {
  return Boolean(intent) || /^\/(share|community\/saved)(\?|#|\/|$)/.test(safeReturnPath(path));
}
export function accountPath(path?: string, intent?: ParticipationIntent) {
  const query = new URLSearchParams({ next: safeReturnPath(path) });
  if (intent) query.set("intent", intent);
  return `/community/account?${query}`;
}
export function authCallback(origin: string, path: string, intent?: ParticipationIntent) {
  return `${origin}${accountPath(path, intent)}&auth=1`;
}
export function currentCommunityPath(fallback = "/ai-experiences", hash?: string) {
  const value = typeof window === "undefined" ? fallback : window.location.pathname + window.location.search + window.location.hash;
  const url = new URL(safeReturnPath(value), "https://zqtion.com");
  if (hash) url.hash = hash;
  return safeReturnPath(url.pathname + url.search + url.hash);
}
export function entryReturnPath(path: string) {
  if (typeof window !== "undefined" && window.location.pathname === path.split("#")[0]) return currentCommunityPath(path);
  return safeReturnPath(path);
}
export function oauthReturnFailed(search: string, hash: string) {
  const query = new URLSearchParams(search), fragment = new URLSearchParams(hash.replace(/^#/, ""));
  return [query, fragment].some(params => ["error", "error_description", "error_code", "code"].some(key => params.has(key)));
}
export function googleProfileName(user: User | null) {
  // This is a display-only suggestion, never authorization or LinkedIn verification.
  if (!user?.email_confirmed_at) return "";
  const identity = user.identities?.find(identity => identity.provider === "google" && identity.identity_data?.email_verified === true);
  const value: unknown = identity?.identity_data?.full_name ?? identity?.identity_data?.name;
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 80) : "";
}
