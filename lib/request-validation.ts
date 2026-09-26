export class RequestBodyError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

/** Enforce the actual streamed size, not just a caller-supplied Content-Length. */
export async function readJsonObject(request: Request, maximumBytes: number): Promise<Record<string, unknown>> {
  if (Number(request.headers.get("content-length") || 0) > maximumBytes) {
    throw new RequestBodyError("Request is too large.", 413);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError("A JSON object is required.", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maximumBytes) {
      await reader.cancel();
      throw new RequestBodyError("Request is too large.", 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new RequestBodyError("A valid JSON object is required.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new RequestBodyError("A JSON object is required.", 400);
  }
  return body as Record<string, unknown>;
}

export function safePath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    return new URL(value, "https://zqtion.com").pathname.slice(0, 500);
  } catch {
    return "/";
  }
}

export function safeReferrer(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.origin.slice(0, 500) : "";
  } catch {
    return "";
  }
}

export function cleanEventMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const allowed = new Set(["location", "work", "video", "name", "value", "rating", "slug", "category", "tool", "count"]);
  return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .filter(([key, entry]) => allowed.has(key) && ["string", "number", "boolean"].includes(typeof entry))
    .map(([key, entry]) => [key, String(entry).slice(0, 200)]));
}
