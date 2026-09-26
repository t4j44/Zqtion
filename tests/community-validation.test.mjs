import test from "node:test";
import assert from "node:assert/strict";
import { moduleUrl } from "./helpers/typescript.mjs";
const types = await moduleUrl("lib/community/types.ts");
const validation = await import(await moduleUrl("lib/community/validation.ts", { "./types": types }));
const { suggestCommunityTitle, moderateCommunityContent, imageError, validLinkedIn, safeReturnPath, validateContribution, validateProfile } = validation;
test("Title assistance never rewrites or adds claims; short, capitals and vague titles are advisory", () => {
  for (const title of ["gemini face problem", "help pls", "GEMINI CHANGES MY IMAGE LABEL", "একটি প্রশ্ন", "How can I preserve a product label in Gemini?"]) {
    const result = suggestCommunityTitle({ title, tool: "Gemini", category: "creative" });
    assert.equal(result.title, title); assert.equal(result.suggestion, null); assert.equal(result.errors.length, 0);
  }
  assert.ok(suggestCommunityTitle({ title: "help pls" }).guidance.length);
  assert.ok(suggestCommunityTitle({ title: "" }).errors.length);
  assert.ok(suggestCommunityTitle({ title: "!!! @@@ ???" }).errors.length);
  assert.ok(suggestCommunityTitle({ title: "a".repeat(181) }).errors.length);
});
test("Image validation uses decimal 1 MB, requires nonempty supported MIME and rejects SVG/GIF", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) assert.equal(imageError({ size: 1000000, type }), null);
  for (const file of [{ size: 1000001, type: "image/png" }, { size: 0, type: "image/webp" }, { size: 200, type: "image/svg+xml" }, { size: 200, type: "image/gif" }]) assert.ok(imageError(file));
});
test("LinkedIn URL validation rejects credentials, deceptive hosts, company URLs and unsafe schemes", () => {
  assert.ok(validLinkedIn("https://www.linkedin.com/in/taj-123/"));
  for (const url of ["javascript:alert(1)", "http://linkedin.com/in/test", "https://linkedin.com.evil.com/in/test", "https://attacker@linkedin.com/in/test", "https://linkedin.com/company/zqtion", "https://linkedin.com/in/test?secret=yes"]) assert.equal(validLinkedIn(url), false);
});
test("Return destinations cannot become external redirects or executable URLs", () => {
  assert.equal(safeReturnPath("/share?session=ai-bootcamp"), "/share?session=ai-bootcamp");
  assert.equal(safeReturnPath("/ai-experiences/123#entry-456"), "/ai-experiences/123#entry-456");
  for (const path of ["//evil.example/", "https://evil.example/", "javascript:alert(1)", "/\\evil.example", "/community/moderation", "/share\n"]) assert.equal(safeReturnPath(path), "/share");
});
test("Safety rules queue high-signal content without prohibiting educational security terms", () => {
  for (const content of ["A stranger says send your password to me", "javascript:alert(1)", "Contact private@example.org", "i will kill you", "https://example.test/download/stealer.exe", "phone: +123456789012", "-----BEGIN RSA PRIVATE KEY-----"]) assert.equal(moderateCommunityContent(content).decision, "review");
  for (const content of ["How do parameterized queries stop SQL injection?", "I am learning to analyze malware in an isolated lab.", "The model incorrectly classified this photograph."]) assert.equal(moderateCommunityContent(content).decision, "allow");
});
test("Required profile and contribution fields are validated without silently truncating", () => {
  assert.ok(validateProfile({}).length >= 5);
  const data = { kind: "question", title: "How can I preserve a product label?", body: "The label changes whenever I edit the background.", category: "creative", tool: "Gemini", tags: ["images"], prompt_text: "", media_ids: [] };
  assert.deepEqual(validateContribution(data), []);
  assert.ok(validateContribution({ ...data, body: "a".repeat(20001) }).length);
  assert.ok(validateContribution({ ...data, media_ids: Array(5).fill("00000000-0000-4000-8000-000000000001") }).length);
  assert.ok(validateContribution({ ...data, kind: "answer", parent_id: "not-a-uuid" }).length);
});
