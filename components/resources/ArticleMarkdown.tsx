import { Fragment } from "react";
import { parseArticle, safeArticleHref } from "@/lib/resources/markdown";
import { PromptCopyBlock } from "./PromptCopyBlock";

function Inline({ text }: { text: string }) {
  const tokens = text.split(/(`[^`]+`|\[[^\]]+\]\([^\s)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return <>{tokens.map((token, i) => {
    if (token.startsWith("`") && token.endsWith("`")) return <code key={i}>{token.slice(1, -1)}</code>;
    if (token.startsWith("**") && token.endsWith("**")) return <strong key={i}>{token.slice(2, -2)}</strong>;
    if (token.startsWith("*") && token.endsWith("*")) return <em key={i}>{token.slice(1, -1)}</em>;
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) { const href = safeArticleHref(link[2]); return href ? <a key={i} href={href} rel={/^https?:/.test(href) ? "noopener noreferrer" : undefined}>{link[1]}</a> : <Fragment key={i}>{link[1]} ({link[2]})</Fragment>; }
    return <Fragment key={i}>{token}</Fragment>;
  })}</>;
}

export default function ArticleMarkdown({ markdown }: { markdown: string }) {
  const blocks = parseArticle(markdown), headings = blocks.filter(block => block.kind === "heading");
  return <><nav className="resource-toc" aria-label="On this page"><p>On this page</p><ul>{headings.filter(h => h.level === 2).map(h => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}</ul></nav><article className="resource-article">{blocks.map((block, i) => {
    if (block.kind === "heading") { const Tag = block.level === 2 ? "h2" : "h3"; return <Tag id={block.id} key={i}><Inline text={block.text} /></Tag>; }
    if (block.kind === "code") return <PromptCopyBlock key={i} label={block.language === "text" ? "Example / diagram" : `${block.language} example`} code={block.text} language={block.language} />;
    if (block.kind === "list") { const Tag = block.ordered ? "ol" : "ul"; return <Tag key={i}>{block.items.map((item, index) => <li key={index}><Inline text={item} /></li>)}</Tag>; }
    if (block.kind === "table") return <div className="resource-table" role="region" aria-label="Article comparison table" tabIndex={0} key={i}><table><thead><tr>{block.headers.map((cell, index) => <th scope="col" key={index}><Inline text={cell} /></th>)}</tr></thead><tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((cell, column) => <td key={column}><Inline text={cell} /></td>)}</tr>)}</tbody></table></div>;
    if (block.kind === "quote") return <blockquote key={i}><Inline text={block.text} /></blockquote>;
    return <p key={i}><Inline text={block.text} /></p>;
  })}</article></>;
}
