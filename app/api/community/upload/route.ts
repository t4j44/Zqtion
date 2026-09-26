import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { authenticated, CommunityError, storageAdmin, writeCommunity } from "@/lib/community/server";
import { imageError } from "@/lib/community/validation";
import { MAX_IMAGE_BYTES } from "@/lib/community/types";
export const runtime = "nodejs";
export async function POST(request: Request) {
  let storedPath: string | null = null;
  try {
    const { db, user } = await authenticated(request);
    const purpose = new URL(request.url).searchParams.get("purpose");
    const alt = request.headers.get("x-image-alt") ? decodeURIComponent(request.headers.get("x-image-alt")!) : "";
    if (!["profile", "result"].includes(purpose || "") || alt.trim().length < 2 || alt.length > 200) throw new CommunityError("Choose an image purpose and a description of 2–200 characters.");
    const mime = request.headers.get("content-type") || "";
    const length = Number(request.headers.get("content-length") || 1);
    const invalid = imageError({ type: mime, size: length });
    if (invalid) throw new CommunityError(invalid, length > MAX_IMAGE_BYTES ? 413 : 415);
    await writeCommunity(db, "upload_slot", { purpose });
    const reader = request.body?.getReader();
    if (!reader) throw new CommunityError("Choose an image.");
    const parts: Uint8Array[] = []; let size = 0;
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > MAX_IMAGE_BYTES) { await reader.cancel(); throw new CommunityError("Each image must be 1 MB or smaller.", 413); }
      parts.push(value);
    }
    if (!size) throw new CommunityError("The image is empty.");
    let bytes: Buffer;
    try {
      const decoder = sharp(Buffer.concat(parts), { limitInputPixels: 20_000_000, animated: false });
      const meta = await decoder.metadata();
      const formats: Record<string, string> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
      const formatMime = formats[meta.format || ""];
      if (formatMime !== mime || (meta.pages || 1) > 1) throw new Error("Invalid format");
      bytes = await decoder.rotate().resize({ width: purpose === "profile" ? 512 : 1600, height: purpose === "profile" ? 512 : 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    } catch { throw new CommunityError("The file must be a valid, non-animated JPG, PNG or WEBP image.", 415); }
    if (bytes.byteLength > MAX_IMAGE_BYTES) throw new CommunityError("The processed image exceeds 1 MB. Use a smaller image.", 413);
    const id = randomUUID(); const path = `${user.id}/${id}.webp`; const admin = storageAdmin();
    const upload = await admin.storage.from("community").upload(path, bytes, { contentType: "image/webp", upsert: false });
    if (upload.error) throw new CommunityError("Image upload failed. Try again.", 503);
    storedPath = path;
    const record = await admin.from("community_media").insert({ id, owner_id: user.id, purpose, path, mime_type: "image/webp", size_bytes: bytes.byteLength, alt });
    if (record.error) throw new CommunityError("Image registration failed. Try again.", 503);
    return Response.json({ id, status: "pending", alt }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (storedPath) { try { await storageAdmin().storage.from("community").remove([storedPath]); } catch { /* Orphan sweep is documented in the runbook. */ } }
    return Response.json({ error: error instanceof CommunityError ? error.message : "Image upload is temporarily unavailable." }, { status: error instanceof CommunityError ? error.status : 503, headers: { "Cache-Control": "no-store" } });
  }
}
