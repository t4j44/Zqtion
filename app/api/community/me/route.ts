import { PUBLIC_PROFILE_FIELDS } from "@/lib/community/types";
import { authenticated, CommunityError } from "@/lib/community/server";
export async function GET(request: Request) {
  try {
    const { db, user } = await authenticated(request);
    const [profile, moderator] = await Promise.all([db.from("community_profiles").select(PUBLIC_PROFILE_FIELDS).eq("id", user.id).maybeSingle(), db.rpc("community_is_moderator")]);
    if (profile.error || moderator.error) throw new CommunityError("Community profile storage is unavailable.", 503);
    return Response.json({ profile: profile.data, moderator: moderator.data === true }, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  } catch (error) { return Response.json({ error: error instanceof CommunityError ? error.message : "Profile unavailable." }, { status: error instanceof CommunityError ? error.status : 503, headers: { "Cache-Control": "no-store" } }); }
}
