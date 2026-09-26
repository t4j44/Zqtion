import test from "node:test";
import assert from "node:assert/strict";
import { moduleUrl } from "./helpers/typescript.mjs";
const types = await moduleUrl("lib/community/types.ts");
const site = await moduleUrl("data/site.ts");
const { discussionSchema, communityMetadata } = await import(await moduleUrl("lib/community/seo.ts", { "./types": types, "@/data/site": site }));
const question = { id: "question-id", title: "How can I preserve a product label?", kind: "question", body: "A genuine question with context.", root_id: null, accepted_answer_id: "answer-id", author: { display_name: "Creator", username: "creator" }, created_at: "2026-09-25T10:00:00Z", updated_at: "2026-09-25T10:00:00Z", counts: { answers: 1, votes: 3 } };
const answer = { ...question, id: "answer-id", kind: "answer", parent_id: question.id, root_id: question.id, body: "Keep a reference layer and mask the product.", status: "published", counts: { votes: 2 } };
test("QAPage is emitted only with real visible answers to this question", () => {
  assert.equal(discussionSchema(question, [])["@type"], "DiscussionForumPosting");
  assert.equal(discussionSchema(question, [{ ...answer, status: "hidden" }])["@type"], "DiscussionForumPosting");
  assert.equal(discussionSchema(question, [{ ...answer, parent_id: "different-question" }])["@type"], "DiscussionForumPosting");
  const qa = discussionSchema(question, [answer]); assert.equal(qa["@type"], "QAPage"); assert.equal(qa.mainEntity.acceptedAnswer.text, answer.body); assert.equal(qa.mainEntity.suggestedAnswer.length, 0);
  const notAccepted = discussionSchema({ ...question, accepted_answer_id: null }, [answer]); assert.ok(!notAccepted.mainEntity.acceptedAnswer); assert.equal(notAccepted.mainEntity.suggestedAnswer.length, 1);
});
test("Community metadata defaults to noindex and uses explicit canonical URLs", () => {
  const metadata = communityMetadata("A post", "A description", "/ai-experiences/id"); assert.equal(metadata.robots.index, false); assert.equal(metadata.alternates.canonical, "/ai-experiences/id");
  assert.equal(communityMetadata("Useful post", "Context", "/ai-experiences/id", true).robots.googleBot.index, true);
});
