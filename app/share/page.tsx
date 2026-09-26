import CommunityShell, { CommunityHeader } from "@/components/community/CommunityShell";
import Composer from "@/components/community/Composer";
import { getEntry } from "@/lib/community/server";
import { communityMetadata } from "@/lib/community/seo";
import { postKinds, type PostKind } from "@/lib/community/types";
export const metadata = communityMetadata("Share with the Zqtion community", "Share a prompt, ask a question, explain an experiment or show your result from a Zqtion AI session.", "/share");
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<{ type?: string; session?: string; remix?: string }> }) {
  const query = await searchParams; const source = query.remix ? await getEntry(query.remix) : null;
  const validSource = source?.kind === "prompt" ? source : null;
  const kind = validSource ? "prompt" : postKinds.includes(query.type as PostKind) ? query.type as PostKind : "question";
  const session = query.session && /^[a-z0-9][a-z0-9-]{0,79}$/.test(query.session) ? query.session : "";
  return <CommunityShell><CommunityHeader title="Bring something useful." description="A question, a prompt, a lesson or a result. Add context, review your words and share when you’re ready." label={session ? `Zqtion AI session / ${session}` : "Share with the community"} />{query.remix && !validSource ? <p className="cq-notice">This source prompt is no longer available. You can create an independent contribution below.</p> : null}{query.session && !session ? <p className="cq-notice">The session tag was not valid. This contribution will not be assigned to a session.</p> : null}<div style={{ maxWidth: 860 }}><Composer initialKind={kind} session={session} source={validSource} /></div></CommunityShell>;
}
