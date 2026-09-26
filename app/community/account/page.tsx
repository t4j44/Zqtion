import { CommunityHeader } from "@/components/community/CommunityShell";
import Account from "@/components/community/Account";
import { communityMetadata } from "@/lib/community/seo";
export const metadata = communityMetadata("Your community account", "Sign in, verify your email and set up your persistent Zqtion community profile.", "/community/account");
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; recovery?: string }> }) { const query = await searchParams; return <><CommunityHeader title="One profile. Every conversation." description="Your community identity travels with your contributions. Set it up once, then get back to sharing." /><Account next={query.next} recovery={query.recovery === "1"} /></>; }
