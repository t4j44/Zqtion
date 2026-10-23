import { notFound } from "next/navigation";
import Link from "next/link";
import CommunityShell from "@/components/community/CommunityShell";
import { Avatar } from "@/components/community/Identity";
import { EntryCard } from "@/components/community/EntryCard";
import ShareButton from "@/components/community/ShareButton";
import PortfolioControls from "@/components/community/PortfolioControls";
import JsonLd from "@/components/seo/JsonLd";
import { cards, communityClient, entryMedia, getProfile, profileIsIndexable } from "@/lib/community/server";
import { communityMetadata } from "@/lib/community/seo";
import { PUBLIC_ENTRY_FIELDS, type PublicEntry } from "@/lib/community/types";
import { siteConfig } from "@/data/site";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) { const p = await getProfile((await params).username); if (!p) notFound(); return communityMetadata(`${p.display_name} (@${p.username}) — AI Portfolio | Zqtion`, p.bio || `Explore public AI prompts, answers, experiments and results from ${p.display_name}.`, `/u/${p.username}`, await profileIsIndexable(p)); }
const tabs: Record<string, { label: string; kinds: string[] }> = {
  all: { label: "All", kinds: ["question", "tip", "experience", "troubleshooting", "showcase", "tutorial", "discussion", "prompt", "answer", "result"] },
  posts: { label: "Posts", kinds: ["question", "tip", "experience", "troubleshooting", "showcase", "tutorial", "discussion"] },
  prompts: { label: "Prompts", kinds: ["prompt"] }, answers: { label: "Answers", kinds: ["answer"] },
  experiences: { label: "Tips & Experiences", kinds: ["tip", "experience", "troubleshooting", "tutorial", "discussion"] }, results: { label: "Showcases & Results", kinds: ["showcase", "result"] },
};
export default async function Page({ params, searchParams }: { params: Promise<{ username: string }>; searchParams: Promise<{ page?: string; tab?: string }> }) {
  const profile = await getProfile((await params).username); if (!profile) notFound(); const db = communityClient()!;
  const query = await searchParams; const tab = query.tab && Object.hasOwn(tabs, query.tab) ? query.tab : "all";
  const page = Math.max(1, Math.min(500, Math.floor(Number(query.page)) || 1));
  const [entries, stats, featured] = await Promise.all([
    db.from("community_entries").select(PUBLIC_ENTRY_FIELDS).eq("author_id", profile.id).eq("status", "published").in("kind", tabs[tab].kinds).order("created_at", { ascending: false }).order("id").range((page - 1) * 20, page * 20),
    db.rpc("community_profile_stats", { p_id: profile.id }),
    db.from("community_profile_featured").select("entry_id,position").eq("profile_id", profile.id).order("position").limit(6),
  ]);
  if (entries.error || stats.error || featured.error) throw new Error("Profile contributions are temporarily unavailable.");
  const featureRows = featured.data.length ? await db.from("community_entries").select(PUBLIC_ENTRY_FIELDS).in("id", featured.data.map(f => f.entry_id)) : { data: [], error: null };
  if (featureRows.error) throw new Error("Featured work is temporarily unavailable.");
  const all = await cards(db, [...entries.data.slice(0, 20), ...featureRows.data] as PublicEntry[]);
  const media = await entryMedia(all.map(e => e.id)); const enriched = all.map(e => ({ ...e, media: media.filter(m => m.entry_id === e.id) }));
  const items = enriched.slice(0, Math.min(entries.data.length, 20)); const pins = featured.data.flatMap(f => { const e = enriched.find(e => e.id === f.entry_id); return e ? [e] : []; }); const totals = stats.data || {};
  const path = `/u/${profile.username}`; const pageUrl = (p: number) => `${path}?${new URLSearchParams({ tab, page: String(p) })}`;
  return <CommunityShell><header className="cq-portfolio-hero"><p className="cq-kicker">Public AI Portfolio</p><div className="cq-portfolio-identity"><Avatar profile={profile} /><div><h1>{profile.display_name}</h1><p className="cq-muted">@{profile.username}</p></div></div><p className="cq-portfolio-bio">{profile.bio || "Learning, experimenting and sharing with the Zqtion community."}</p><div className="cq-actions"><a className="cq-button" href={profile.linkedin_url} target="_blank" rel="nofollow ugc noopener noreferrer">LinkedIn ↗</a><ShareButton path={path} title={`${profile.display_name} — AI Portfolio`} label="Share Profile" /><span className="cq-hint">Joined <time dateTime={profile.created_at}>{new Date(profile.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })}</time></span></div><p className="cq-hint">LinkedIn is member-supplied, not an identity-verification badge.</p><PortfolioControls owner={profile.id} featured={pins.map(e => ({ id: e.id, title: e.title || e.parent_title || e.kind }))} /></header>
    <dl className="cq-stat-row">{[["prompts", "Prompts"], ["posts", "Posts"], ["answers", "Answers"], ["accepted_answers", "Accepted Answers"], ["upvotes", "Upvotes Received"], ["results", "Results Shared"]].map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{totals[key] || 0}</dd></div>)}</dl>
    <JsonLd schema={{ "@context": "https://schema.org", "@type": "ProfilePage", dateCreated: profile.created_at, dateModified: profile.updated_at, url: `${siteConfig.url}${path}`, mainEntity: { "@type": "Person", name: profile.display_name, alternateName: `@${profile.username}`, description: profile.bio, url: `${siteConfig.url}${path}`, sameAs: [profile.linkedin_url] } }} />
    {pins.length > 0 && <section aria-labelledby="featured-work"><div className="cq-heading-row"><h2 id="featured-work" className="cq-section-title">Featured Work</h2><span className="cq-muted">Selected by {profile.display_name}</span></div><div className="cq-featured-grid">{pins.map(e => <EntryCard key={e.id} entry={e} />)}</div></section>}
    <section aria-labelledby="public-work"><h2 className="cq-section-title" id="public-work">Public work</h2><nav className="cq-portfolio-tabs" aria-label="Portfolio contributions">{Object.entries(tabs).filter(([key]) => key === "all" || key === tab || Number(totals[key]) > 0).map(([key, value]) => <Link prefetch={false} key={key} href={key === "all" ? path : `${path}?tab=${key}`} aria-current={tab === key ? "page" : undefined}>{value.label}</Link>)}</nav><div className={tab === "results" ? "cq-results-grid" : "cq-stack"}>{items.map(e => <EntryCard key={e.id} entry={e} />)}</div>{!items.length && <p className="cq-empty">{tab === "results" ? "No public AI results yet." : tab === "all" ? "No public contributions yet." : `No public ${tab} yet.`}</p>}<nav className="cq-pagination" aria-label="Creator contribution pages">{page > 1 && <Link prefetch={false} className="cq-button" href={pageUrl(page - 1)}>Previous</Link>}{(page > 1 || entries.data.length > 20) && <span>Page {page}</span>}{entries.data.length > 20 && <Link prefetch={false} className="cq-button" href={pageUrl(page + 1)}>Next</Link>}</nav></section>
  </CommunityShell>;
}
