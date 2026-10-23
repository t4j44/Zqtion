import test from "node:test";
import assert from "node:assert/strict";
import { moduleUrl } from "./helpers/typescript.mjs";

const { normalizeWebsiteLink, isPublicWebsiteLink } = await import(await moduleUrl("lib/url-input.ts"));

test("ordinary website, portfolio, project and social links work without www or https", () => {
  for (const [input, expected] of [
    ["zqtion.com", "https://zqtion.com"],
    ["www.zqtion.com", "https://www.zqtion.com"],
    ["github.com/t4j44", "https://github.com/t4j44"],
    ["linkedin.com/in/member", "https://linkedin.com/in/member"],
    ["www.linkedin.com/in/member", "https://www.linkedin.com/in/member"],
    ["example.org/project?a=1#demo", "https://example.org/project?a=1#demo"],
    ["  example.org/page  ", "https://example.org/page"],
    ["https://example.org/page", "https://example.org/page"],
    ["http://example.org/page", "http://example.org/page"],
  ]) {
    assert.equal(normalizeWebsiteLink(input), expected);
    assert.ok(isPublicWebsiteLink(normalizeWebsiteLink(input)), input);
  }
});
test("invalid input is never converted into a seemingly safe URL", () => {
  for (const input of [
    "javascript:alert(1)", "data:text/html,hello", "file:///etc/passwd",
    "//evil.example/test", "http://user:pass@example.org", "example.org@evil.test",
    "fake local", "localhost", "127.0.0.1", "https://127.0.0.1",
    "https://example.org.evil\\example.org", "https://www.example.org\nother", "http://example.org:bad",
  ]) {
    assert.equal(isPublicWebsiteLink(normalizeWebsiteLink(input)), false, input);
  }
});
