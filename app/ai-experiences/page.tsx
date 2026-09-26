import { CommunityHeader, CommunityCollectionSchema } from "@/components/community/CommunityShell";
import Feed from "@/components/community/Feed";
import { communityMetadata } from "@/lib/community/seo";
export const dynamic = "force-dynamic";
export const metadata = communityMetadata("AI Experiences — practical questions & shared learning", "Discuss AI tools, ask clear questions and share experiments, tips and results with the Zqtion community.", "/ai-experiences", true);
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <><CommunityCollectionSchema title="AI Experiences" description="Practical AI questions, experiments and community learning." path="/ai-experiences" /><CommunityHeader title="AI Experiences" description="Ask a question, share what worked, and learn from people putting AI to work." /><Feed query={await searchParams} path="/ai-experiences" /></>; }
