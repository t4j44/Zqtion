import Link from "next/link";
import type { Profile, PublicIdentity } from "@/lib/community/types";
import ProfilePhoto from "./ProfilePhoto";
export function Avatar({ profile }: { profile: Pick<Profile, "avatar" | "photo_id" | "display_name"> }) {
  const symbols: Record<string, string> = { orbit: "◎", spark: "✦", grid: "▦", wave: "≈", photo: "Z" };
  return <span className="cq-avatar" aria-hidden="true">{profile.avatar === "photo" && profile.photo_id ? <ProfilePhoto id={profile.photo_id} /> : symbols[profile.avatar] || "Z"}</span>;
}
export function Picture({ id, alt }: { id: string; alt: string }) {
  // Same-origin media proxy enforces RLS and avoids unbounded image transformation cache.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/api/community/media/${id}`} alt={alt} loading="lazy" decoding="async" />;
}
export default function Identity({ profile }: { profile: PublicIdentity }) {
  return <div className="cq-person"><Link prefetch={false} className="cq-identity-link" href={`/u/${profile.username}`} aria-label={`${profile.display_name} (@${profile.username}) — AI portfolio`}><Avatar profile={profile} /><span><strong>{profile.display_name}</strong><span className="cq-muted">@{profile.username}</span></span></Link><a className="cq-linkedin" aria-label={`${profile.display_name} on LinkedIn (opens a new tab)`} title="LinkedIn" href={profile.linkedin_url} target="_blank" rel="nofollow ugc noopener noreferrer"><span className="cq-linkedin-icon" aria-hidden="true">in</span></a></div>;
}
