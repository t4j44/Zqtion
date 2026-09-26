import { authenticated, communityClient, storageAdmin } from "@/lib/community/server";
import { isUuid } from "@/lib/community/validation";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return new Response(null, { status: 404 });
  try {
    const db = request.headers.has("authorization") ? (await authenticated(request)).db : communityClient();
    if (!db) return new Response(null, { status: 404 });
    // RLS verifies visibility BEFORE the privileged storage read. Paths never come from callers.
    const visible = await db.from("community_media").select("id").eq("id", id).maybeSingle();
    if (visible.error || !visible.data) return new Response(null, { status: 404 });
    const admin = storageAdmin();
    const { data, error } = await admin.from("community_media").select("path,mime_type").eq("id", visible.data.id).maybeSingle();
    if (error || !data) return new Response(null, { status: 404 });
    const image = await admin.storage.from("community").download(data.path);
    if (image.error) return new Response(null, { status: 404 });
    return new Response(image.data, { headers: { "Content-Type": data.mime_type, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex", "Content-Security-Policy": "default-src 'none'; sandbox" } });
  } catch { return new Response(null, { status: 404 }); }
}
