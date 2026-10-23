import Link from "next/link";
import type { Profile, PublicIdentity } from "@/lib/community/types";
import ProfilePhoto from "./ProfilePhoto";
import AvatarArtwork from "./AvatarArtwork";
export function Avatar({ profile }: { profile: Pick<Profile, "avatar" | "photo_id" | "display_name"> }) {
  return <span className="cq-avatar" aria-hidden="true">
    {profile.avatar === "photo"
      ? profile.photo_id ? <ProfilePhoto id={profile.photo_id} /> : <svg className="cq-avatar-art cq-avatar-upload-art" viewBox="0 0 120 120" focusable="false" aria-hidden="true"><circle cx="60" cy="60" r="60" fill="#E6F3F4" /><rect x="34" y="45" width="52" height="36" rx="9" fill="none" stroke="#377C84" strokeWidth="5" /><circle cx="60" cy="63" r="10" fill="none" stroke="#377C84" strokeWidth="5" /><path d="M46 45l5-8h18l5 8" fill="none" stroke="#377C84" strokeWidth="5" strokeLinejoin="round" /></svg>
      : ["orbit", "spark", "grid", "wave"].includes(profile.avatar) ? <AvatarArtwork variant={profile.avatar} /> : "Z"}
  </span>;
}
export function Picture({ id, alt }: { id: string; alt: string }) {
  // Same-origin media proxy enforces RLS and avoids unbounded image transformation cache.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/api/community/media/${id}`} alt={alt} loading="lazy" decoding="async" />;
}
export default function Identity({ profile }: { profile: PublicIdentity }) {
  return <div className="cq-person"><Link prefetch={false} className="cq-identity-link" href={`/u/${profile.username}`} aria-label={`${profile.display_name} (@${profile.username}) — AI portfolio`}><Avatar profile={profile} /><span><strong>{profile.display_name}</strong><span className="cq-muted">@{profile.username}</span></span></Link><a className="cq-linkedin" aria-label={`${profile.display_name} on LinkedIn (opens a new tab)`} title="LinkedIn" href={profile.linkedin_url} target="_blank" rel="nofollow ugc noopener noreferrer"><span className="cq-linkedin-icon" aria-hidden="true">in</span></a></div>;
}
