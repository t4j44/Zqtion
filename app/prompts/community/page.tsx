import { CommunityHeader, CommunityCollectionSchema } from "@/components/community/CommunityShell";
import Feed from "@/components/community/Feed";
import { communityMetadata } from "@/lib/community/seo";
export const dynamic = "force-dynamic";
export const metadata = communityMetadata("Community AI Prompts — experiment, share & remix", "Prompts shared by the Zqtion community. Explore the context, discuss results and create a credited remix.", "/prompts/community", true);
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <><CommunityCollectionSchema title="Community prompts" description="Shared AI briefs, credited remixes and practical results." path="/prompts/community" /><CommunityHeader title="A prompt is just the beginning." description="Explore community briefs, see what people tried and build on their work. The original Zqtion library remains one click away." label="Prompt Library / Community" /><Feed query={await searchParams} path="/prompts/community" prompts /></>; }
