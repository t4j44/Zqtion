import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Use the existing compiler and Node's built-in runner; no test dependency needed.
const source = await readFile(new URL("../lib/request-validation.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { readJsonObject, RequestBodyError, safePath, safeReferrer, cleanEventMetadata } =
  await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const request = (body, headers = {}) => new Request("https://zqtion.com/api/inquiries", {
  method: "POST", body, headers,
});

test("JSON object and Unicode content are preserved", async () => {
  assert.deepEqual(await readJsonObject(request('{"name":"ঢাকা","count":2}'), 200), { name: "ঢাকা", count: 2 });
});

test("malformed and non-object JSON are rejected", async () => {
  for (const body of ["null", "[]", '"text"', "123", "{broken", ""]) {
    await assert.rejects(readJsonObject(request(body), 200), (error) => error instanceof RequestBodyError && error.status === 400);
  }
});

test("actual bytes are limited even if Content-Length is missing or false", async () => {
  for (const headers of [{}, { "content-length": "1" }]) {
    await assert.rejects(readJsonObject(request(JSON.stringify({ value: "ঢাকা".repeat(20) }), headers), 50),
      (error) => error.status === 413);
  }
});

test("oversized declared bodies are rejected before reading", async () => {
  await assert.rejects(readJsonObject(request("{}", { "content-length": "500" }), 50), (error) => error.status === 413);
});

test("analytics paths exclude query strings and fragments", () => {
  assert.equal(safePath("/contact?email=private@example.com#private"), "/contact");
  assert.equal(safePath("//external.example/path"), "/");
  assert.equal(safePath("https://external.example/path"), "/");
  assert.equal(safePath(null), "/");
});

test("referrer retains only HTTP(S) origin", () => {
  assert.equal(safeReferrer("https://user:password@example.com/private?token=secret"), "https://example.com");
  assert.equal(safeReferrer("javascript:alert(1)"), "");
  assert.equal(safeReferrer("not a URL"), "");
});

test("event metadata permits only documented non-form fields", () => {
  assert.deepEqual(cleanEventMetadata({ location: "hero", value: 123, email: "private@example.com", details: "private", nested: {} }),
    { location: "hero", value: "123" });
  assert.deepEqual(cleanEventMetadata(null), {});
});
