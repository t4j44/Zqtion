import { CommunityHeader } from "@/components/community/CommunityShell";
import Workspace from "@/components/community/Workspace";
import { communityMetadata } from "@/lib/community/seo";
export const metadata = communityMetadata("Your saved community content", "Private saves and your community contributions, including items awaiting moderation.", "/community/saved");
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) { return <><CommunityHeader title="Keep the useful things close." description="Your community saves are private and follow your account. Zqtion Original local saves remain in the existing Prompt Library." /><Workspace initialTab={(await searchParams).tab} /></>; }
