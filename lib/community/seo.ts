import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { entryPath, type Card } from "./types";
export function communityMetadata(title: string, description: string, path: string, index = false): Metadata {
  return { title, description, alternates: { canonical: path }, robots: { index, follow: true, googleBot: { index, follow: true } }, openGraph: { title, description, url: path, type: "website", images: ["/og-image.png"] }, twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] } };
}
export function discussionSchema(entry: Card, answers: Card[]) {
  const url = `${siteConfig.url}${entryPath(entry)}`;
  const author = { "@type": "Person", name: entry.author.display_name, url: `${siteConfig.url}/u/${entry.author.username}` };
  const answerSchema = (answer: Card) => ({ "@type": "Answer", text: answer.body, dateCreated: answer.created_at, dateModified: answer.updated_at, upvoteCount: answer.counts.votes, url: `${url}#entry-${answer.id}`, author: { "@type": "Person", name: answer.author.display_name, url: `${siteConfig.url}/u/${answer.author.username}` } });
  const valid = answers.filter(a => a.kind === "answer" && a.parent_id === entry.id && a.status === "published");
  if (entry.kind === "question" && valid.length) {
    const accepted = valid.find(a => a.id === entry.accepted_answer_id);
    return { "@context": "https://schema.org", "@type": "QAPage", "@id": url, mainEntity: { "@type": "Question", name: entry.title, text: entry.body, dateCreated: entry.created_at, dateModified: entry.updated_at, author, answerCount: entry.counts.answers, upvoteCount: entry.counts.votes, ...(accepted ? { acceptedAnswer: answerSchema(accepted) } : {}), suggestedAnswer: valid.filter(a => a.id !== accepted?.id).map(answerSchema) } };
  }
  return { "@context": "https://schema.org", "@type": "DiscussionForumPosting", "@id": url, headline: entry.title, text: entry.body, datePublished: entry.created_at, dateModified: entry.updated_at, author, url, mainEntityOfPage: url };
}
