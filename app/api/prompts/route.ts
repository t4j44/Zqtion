import { searchPrompts } from "@/lib/prompts/service";
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const result = searchPrompts({ q: (p.get("q") || "").slice(0, 200), category: p.get("category") || "", tool: p.get("tool") || "", style: p.get("style") || "", difficulty: p.get("difficulty") || "", page: Number(p.get("page")) || 1, saved: p.get("saved") === "true" ? (p.get("ids") || "").slice(0, 5000).split(",").filter((id) => /^zq-\d+$/.test(id)) : undefined });
  return Response.json(result, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
