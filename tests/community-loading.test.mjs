import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("public profile fallback uses the Community layout and bounded portfolio skeleton", async () => {
  const route = await readFile(new URL("../app/u/[username]/loading.tsx", import.meta.url), "utf8");
  const shell = await readFile(new URL("../components/community/CommunityShell.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../components/community/community.css", import.meta.url), "utf8");
  assert.match(route, /<CommunityShell>/);
  assert.match(route, /className="cq-portfolio-loading"/);
  assert.match(route, /role="status"/);
  assert.match(route, /aria-busy="true"/);
  assert.match(shell, /className="cq-community"/);
  assert.match(shell, /className="cq-shell"/);
  assert.match(css, /\.cq-portfolio-loading\{width:100%;max-width:100%/);
  assert.match(css, /\.cq-loading-stats\{display:grid/);
  assert.match(css, /@media\(max-width:768px\)/);
  assert.doesNotMatch(css, /\.cq-skeleton\{[^}]*linear-gradient\(#111820,#0d1218\)/);
});
