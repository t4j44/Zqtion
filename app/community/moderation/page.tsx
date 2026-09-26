import { CommunityHeader } from "@/components/community/CommunityShell";
import Workspace from "@/components/community/Workspace";
import { communityMetadata } from "@/lib/community/seo";
export const metadata = communityMetadata("Community moderation", "Private moderation queue for authorized Zqtion reviewers.", "/community/moderation");
export default function Page() { return <><CommunityHeader title="Review with context." description="Private reports, queued contributions and uploaded images. Every moderation decision requires a reason and is recorded." /><Workspace moderation /></>; }
