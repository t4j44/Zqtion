// Deliberately small Markdown subset: raw HTML, embeds and executable diagrams
// are text. React escapes every token; URLs are checked independently.
export type ArticleBlock =
  | { kind: "heading"; level: 2 | 3; text: string; id: string }
  | { kind: "paragraph" | "quote"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "code"; language: string; text: string }
  | { kind: "table"; headers: string[]; rows: string[][] };

export function safeArticleHref(value: string): string | undefined {
  if (/[\u0000-\u0020\u007f\\]|%(?:0[0-9a-f]|1[0-9a-f]|7f|5c)/i.test(value) || value.startsWith("//")) return;
  if (/^#[a-z0-9_~%-]+$/i.test(value) || /^\/(?!\/)/.test(value)) return value;
  try { const url = new URL(value); if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password) return url.href; } catch { /* Plain text remains visible. */ }
}

export function parseArticle(markdown: string): ArticleBlock[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n"), blocks: ArticleBlock[] = [], ids = new Map<string, number>();
  const cells = (line: string) => line.trim().replace(/^\||\|$/g, "").split("|").map(cell => cell.trim());
  const boundary = (line: string) => /^(?:#{1,6}\s|```|~~~|[-*+]\s|\d+\.\s|>\s|---+$)/.test(line);
  for (let i = 0; i < lines.length;) {
    const line = lines[i].trim(); if (!line || /^---+$/.test(line)) { i++; continue; }
    const fence = line.match(/^(`{3,}|~{3,})([a-z0-9_-]*)/i);
    if (fence) { const body: string[] = []; i++; while (i < lines.length && !lines[i].trim().startsWith(fence[1])) body.push(lines[i++]); if (i < lines.length) i++; blocks.push({ kind: "code", language: fence[2] || "text", text: body.join("\n") }); continue; }
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) { const text = heading[2], base = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section", count = (ids.get(base) || 0) + 1; ids.set(base, count); blocks.push({ kind: "heading", level: heading[1].length <= 2 ? 2 : 3, text, id: count === 1 ? base : `${base}-${count}` }); i++; continue; }
    if (line.includes("|") && lines[i + 1] && /^\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?$/.test(lines[i + 1].trim())) { const headers = cells(line), rows: string[][] = []; i += 2; while (i < lines.length && lines[i].includes("|") && lines[i].trim()) { const row = cells(lines[i++]); rows.push(headers.map((_, index) => row[index] || "")); } blocks.push({ kind: "table", headers, rows }); continue; }
    const list = line.match(/^([-*+]|\d+\.)\s+(.+)/);
    if (list) { const ordered = /\d/.test(list[1]), items: string[] = []; while (i < lines.length) { const match = lines[i].trim().match(/^([-*+]|\d+\.)\s+(.+)/); if (!match || /\d/.test(match[1]) !== ordered) break; items.push(match[2]); i++; } blocks.push({ kind: "list", ordered, items }); continue; }
    const paragraph = [line.replace(/^>\s?/, "")]; const quote = line.startsWith(">"); i++;
    while (i < lines.length && lines[i].trim() && !boundary(lines[i].trim()) && !(lines[i].includes("|") && lines[i + 1]?.includes("---"))) paragraph.push(lines[i++].trim());
    blocks.push({ kind: quote ? "quote" : "paragraph", text: paragraph.join(" ") });
  }
  return blocks;
}
