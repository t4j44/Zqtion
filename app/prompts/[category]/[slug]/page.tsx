import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPrompts, getCategories, getPromptBySlug, getPromptMethods, getRelatedPrompts, getTools } from "@/lib/prompts/service";
import { toCard } from "@/lib/prompts/core";
import { promptMetadata } from "@/lib/prompts/seo";
import { LibraryBreadcrumbs, LibraryHeader, LibrarySeo } from "@/components/prompts/LibraryShell";
import Collection, { type SearchParams } from "@/components/prompts/Collection";
import PromptPreview from "@/components/prompts/PromptPreview";
import PromptBlock from "@/components/prompts/PromptBlock";
import PromptCard from "@/components/prompts/PromptCard";
import { PromptView, SavePrompt } from "@/components/prompts/PromptActions";

type Props = { params: Promise<{ category: string; slug: string }>; searchParams: Promise<SearchParams> };
export function generateStaticParams() { return [...getAllPrompts().map((p) => ({ category: p.category, slug: p.slug })), ...getPromptMethods().map((m) => ({ category: "methods", slug: m.slug })), ...getTools().map((t) => ({ category: "tools", slug: t.slug }))]; }
export async function generateMetadata({ params }: Props) {
  const { category, slug } = await params;
  const p = category === "methods" ? getPromptMethods().find((m) => m.slug === slug) : category === "tools" ? getTools().find((t) => t.slug === slug) : getPromptBySlug(slug);
  if (!p || ("category" in p && p.category !== category)) return {};
  return promptMetadata("seo" in p ? p.seo.title : category === "tools" ? `${p.title} prompts & workflow guide` : p.title, p.description, `/prompts/${category}/${slug}`);
}
export default async function DetailPage({ params, searchParams }: Props) {
  const { category, slug } = await params; const path = `/prompts/${category}/${slug}`;
  if (category === "methods") {
    const m = getPromptMethods().find((m) => m.slug === slug); if (!m) notFound();
    const related = getAllPrompts().filter((p) => p.learning.methodIds.includes(slug));
    return <><LibraryBreadcrumbs items={[{ name: "Prompts", path: "/prompts" }, { name: "Methods", path: "/prompts/methods" }, { name: m.title, path }]} /><LibrarySeo title={m.title} description={m.description} path={path} article /><LibraryHeader title={m.title} description={m.definition} eyebrow="The method / Zqtion" /><div className="pl-formula">{m.formula.map((s, i) => <span key={s}><small>{String(i + 1).padStart(2, "0")}</small>{s}</span>)}</div><div className="pl-prose"><section><h2>How to use it</h2><ol>{m.steps.map((s) => <li key={s}>{s}</li>)}</ol></section><section><h2>From vague to useful</h2><div className="pl-before-after"><div><p className="pl-kicker">Before</p><p>{m.before}</p></div><div><p className="pl-kicker">After</p><p>{m.after}</p></div></div></section><section><h2>When to use it</h2><p>{m.when}</p></section><section><h2>Common mistakes</h2><ul>{m.mistakes.map((s) => <li key={s}>{s}</li>)}</ul></section><section><h2>Questions worth asking</h2>{m.faq.map((f) => <details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</section><section><h2>Continue learning</h2><div className="pl-button-row">{m.related.map((id) => <Link className="pl-action" key={id} href={`/prompts/methods/${id}`}>{getPromptMethods().find((x) => x.slug === id)?.title} ↗</Link>)}</div></section></div><section className="pl-related"><h2>See the method in practice</h2><div className="pl-card-grid">{related.slice(0, 3).map((p) => <PromptCard key={p.id} prompt={toCard(p)} related />)}</div></section></>;
  }
  if (category === "tools") {
    const t = getTools().find((t) => t.slug === slug); if (!t) notFound();
    return <><LibraryBreadcrumbs items={[{ name: "Prompts", path: "/prompts" }, { name: "Tools", path: "/prompts/tools" }, { name: t.title, path }]} /><LibrarySeo title={`${t.title} prompts`} description={t.description} path={path} /><LibraryHeader title={`Prompts for ${t.title}.`} description={t.description} /><section className="pl-category-intro"><div><h2>Start with the right context</h2><p>{t.about}</p><a className="pl-action" href={t.reference} target="_blank" rel="noreferrer">Official {t.title} documentation ↗</a></div><div><h2>Make the brief useful</h2><ul>{t.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul><p className="pl-small">{t.limitation}</p><Link className="pl-action" href={`/prompts/methods/${slug === "gemini" ? "image-prompt-formula" : "vibe-coding-framework"}`}>Learn the relevant framework ↗</Link></div></section><Collection query={await searchParams} tool={slug} /></>;
  }
  const p = getPromptBySlug(slug); const c = getCategories().find((c) => c.slug === category); if (!p || p.category !== category || !c) notFound();
  return <><PromptView slug={slug} /><LibraryBreadcrumbs items={[{ name: "Prompts", path: "/prompts" }, { name: c.title, path: `/prompts/${category}` }, { name: p.title, path }]} /><LibrarySeo title={p.title} description={p.description} path={path} article updated={p.updatedAt} />
    <LibraryHeader title={p.title} description={p.answerFirstSummary} eyebrow={`${c.title} / ${p.difficulty}`} />
    <div className="pl-detail-grid"><div className="pl-detail-main"><PromptPreview prompt={toCard(p)} large /><p className="pl-preview-disclosure">{p.preview.label}</p><PromptBlock slug={slug} template={p.prompt} variables={p.variables} />
      <section className="pl-detail-section"><p className="pl-kicker">Understand the brief</p><h2>Why this works</h2><p>{p.learning.whyItWorks}</p><div className="pl-anatomy">{p.learning.anatomy.map((a, i) => <div key={a.label}><span>0{i + 1}</span><h3>{a.label}</h3><p>{a.explanation}</p></div>)}</div></section>
      <section className="pl-detail-section"><h2>{category === "ui" ? "Design specification" : category === "image" ? "Visual direction" : "Implementation brief"}</h2><dl className="pl-specification">{Object.entries(p.specification).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></section>
      <section className="pl-detail-section"><h2>A practical example</h2><p className="pl-kicker">Example input</p><p>{p.example.input}</p><p className="pl-kicker">What to look for</p><p>{p.example.expected}</p><p className="pl-muted pl-small">Illustrative expected behaviour, not a recorded model result.</p></section>
      <div className="pl-category-intro"><section><h2>Common mistakes</h2><ul>{p.learning.mistakes.map((s) => <li key={s}>{s}</li>)}</ul></section><section><h2>Try this next</h2><ul>{p.learning.tips.map((s) => <li key={s}>{s}</li>)}</ul></section></div>
    </div><aside className="pl-detail-aside"><div className="pl-aside-panel"><p className="pl-kicker">The field notes</p><h2>Made for</h2><p>{p.audiences.join(", ")}</p><h3>Best for</h3><ul>{p.useCases.map((u) => <li key={u}>{u}</li>)}</ul><h3>Use with</h3><div className="pl-aside-links">{p.tools.map((t) => <Link key={t} href={`/prompts/tools/${t}`}>{getTools().find((x) => x.slug === t)?.title} ↗</Link>)}</div><p className="pl-small pl-muted">Intended workflow; model output not independently benchmarked.</p><h3>Learn the structure</h3><div className="pl-aside-links">{p.learning.methodIds.map((m) => <Link key={m} href={`/prompts/methods/${m}`}>{getPromptMethods().find((x) => x.slug === m)?.title} ↗</Link>)}</div><div className="pl-tags">{p.tags.map((t) => <span key={t}>{t.replaceAll("-", " ")}</span>)}</div><p className="pl-small">Written by {p.author}<br />Updated <time dateTime={p.updatedAt}>{p.updatedAt}</time></p><div className="pl-button-row"><a href="#prompt-heading" className="pl-action">Customize & copy ↓</a><SavePrompt id={p.id} /></div></div></aside></div>
    <section className="pl-related"><div className="pl-section-heading"><h2>Keep exploring</h2><Link className="pl-action" href={`/prompts/${category}`}>All {c.title.toLowerCase()} prompts ↗</Link></div><div className="pl-card-grid">{getRelatedPrompts(p).map((r) => <PromptCard key={r.id} prompt={toCard(r)} related />)}</div></section>
  </>;
}
