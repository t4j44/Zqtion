import { getPromptBySlug } from "@/lib/prompts/service";
import { customizePrompt } from "@/lib/prompts/core";
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const p = getPromptBySlug((await params).slug);
  if (!p) return Response.json({ error: "Prompt not found" }, { status: 404 });
  return Response.json({ prompt: customizePrompt(p.prompt, p.variables, {}) }, { headers: { "Cache-Control": "public, max-age=300", "X-Robots-Tag": "noindex" } });
}
