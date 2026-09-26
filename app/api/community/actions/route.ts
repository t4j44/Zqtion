import { authenticated, CommunityError, writeCommunity } from "@/lib/community/server";
import { validateContribution, validateProfile } from "@/lib/community/validation";
import { readJsonObject, RequestBodyError } from "@/lib/request-validation";
const actions = new Set(["profile", "create", "edit", "delete", "vote", "save", "rate", "accept", "report", "moderate", "moderate_media", "restrict", "feature", "unfeature", "reorder_featured"]);
export async function POST(request: Request) {
  try {
    const { db } = await authenticated(request);
    const body = await readJsonObject(request, 180_000);
    if (typeof body.action !== "string" || !actions.has(body.action) || !body.data || typeof body.data !== "object" || Array.isArray(body.data)) throw new CommunityError("Invalid community action.");
    const data = body.data as Record<string, unknown>;
    const errors = body.action === "profile" ? validateProfile(data) : body.action === "create" ? validateContribution(data) : [];
    if (errors.length) throw new CommunityError(errors.join(" "));
    return Response.json(await writeCommunity(db, body.action, data), { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  } catch (error) {
    return Response.json({ error: error instanceof CommunityError || error instanceof RequestBodyError ? error.message : "Community is temporarily unavailable. Your action has not been confirmed." }, { status: error instanceof CommunityError || error instanceof RequestBodyError ? error.status : 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  }
}
