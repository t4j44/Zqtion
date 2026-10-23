import Link from "next/link";
import type { PromptCardData } from "@/lib/prompts/types";
import PromptPreview from "./PromptPreview";
import { CopyPrompt, SavePrompt } from "./PromptActions";
const categoryLabels: Record<string, string> = { ui: "UI & Web", image: "Image creation", "vibe-coding": "Vibe coding" };
const toolLabels: Record<string, string> = { "claude-code": "Claude Code", codex: "Codex", cursor: "Cursor", gemini: "Gemini" };
export default function PromptCard({ prompt, related = false }: { prompt: PromptCardData; related?: boolean }) {
  return <article className="pl-card">
    <Link href={`/prompts/${prompt.category}/${prompt.slug}`} tabIndex={-1} aria-hidden="true"><PromptPreview prompt={prompt} /></Link>
    <div className="pl-card-body"><p className="pl-kicker">{categoryLabels[prompt.category]} <span> / {prompt.difficulty}</span></p>
      <h3><Link href={`/prompts/${prompt.category}/${prompt.slug}`} data-analytics={related ? "related_prompt_click" : undefined} data-analytics-slug={prompt.slug}>{prompt.title} <span aria-hidden="true">↗</span></Link></h3>
      <p className="pl-card-description">{prompt.description}</p><div className="pl-tags">{prompt.tags.slice(0, 2).map((tag) => <span key={tag}>{tag.replaceAll("-", " ")}</span>)}</div>
      <p className="pl-card-tools">{prompt.tools.map((t) => toolLabels[t] || t).join(" · ")}</p>
      <div className="pl-card-actions"><CopyPrompt slug={prompt.slug} /><SavePrompt id={prompt.id} /></div>
    </div>
  </article>;
}
