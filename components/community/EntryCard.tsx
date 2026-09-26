import Link from "next/link";
import { entryPath, type Card } from "@/lib/community/types";
import Identity, { Picture } from "./Identity";
import EntryActions from "./EntryActions";
import ExpandableText from "./ExpandableText";
import CardSurface from "./CardSurface";
export function EntryCard({ entry }: { entry: Card }) {
  return <CardSurface href={entryPath(entry)}><Identity profile={entry.author} /><div className="cq-meta cq-card-label"><span>{entry.kind === "prompt" ? "Community prompt" : entry.kind === "discussion" ? "Tool discussion" : entry.kind}</span>{entry.accepted && <span className="cq-accepted-label">✓ Accepted answer</span>}<time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</time></div>{entry.parent_title && <p className="cq-hint">{entry.kind === "answer" ? "Answer to" : entry.kind === "result" ? "Result from" : "In reply to"}</p>}<h2><Link prefetch={false} href={entryPath(entry)}>{entry.title || entry.parent_title || "Community contribution"}</Link></h2><ExpandableText text={entry.body} />{entry.media?.length ? <Link prefetch={false} href={entryPath(entry)} className="cq-card-image" aria-label={`Open ${entry.title || entry.parent_title || "result"}`}><Picture id={entry.media[0].id} alt={entry.media[0].alt} /></Link> : null}<div className="cq-meta">{entry.tool && <span>{entry.tool}</span>}{entry.tags.slice(0, 3).map(t => <Link prefetch={false} key={t} href={`/ai-experiences?q=${encodeURIComponent(t)}`}>#{t}</Link>)}</div><EntryActions entry={entry} compact /></CardSurface>;
}
