import { notFound } from "next/navigation";
import Discussion from "@/components/community/Discussion";
import { getEntry, indexableIds } from "@/lib/community/server";
import { communityMetadata } from "@/lib/community/seo";
import { entryPath } from "@/lib/community/types";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { const e = await getEntry((await params).id); if (!e) notFound(); return communityMetadata(e.title, e.body.replace(/\s+/g, " ").slice(0, 160), entryPath(e), (await indexableIds([e.id])).includes(e.id)); }
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string; sort?: string }> }) { return <Discussion id={(await params).id} prompts sort={(await searchParams).sort} page={Math.max(1, Math.min(1000, Math.floor(Number((await searchParams).page)) || 1))} />; }
