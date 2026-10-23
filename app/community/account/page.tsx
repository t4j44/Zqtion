import Account from "@/components/community/Account";
import { communityMetadata } from "@/lib/community/seo";
export const metadata = communityMetadata("Your community account", "Sign in, verify your email and set up your persistent Zqtion community profile.", "/community/account");
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; recovery?: string; intent?: string; auth?: string }> }) { const query = await searchParams; return <Account next={query.next} intent={query.intent} recovery={query.recovery === "1"} authReturn={query.auth === "1"} />; }
