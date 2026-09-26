// Local-only runner. Tokens are random process variables, never environment files.
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
const key = randomBytes(32).toString("hex");
const env = { ...process.env, COMMUNITY_QA_SERVICE_KEY: key, SUPABASE_SECRET_KEY: key,
  NEXT_PUBLIC_COMMUNITY_ENABLED: "true", NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:4319",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: randomBytes(32).toString("hex") };
const children = [];
const start = (args, childEnv = env) => {
  const child = spawn(process.execPath, args, { env: childEnv, stdio: "inherit", windowsHide: true });
  children.push(child); return child;
};
const run = args => new Promise((resolve, reject) => {
  const child = start(args);
  child.once("error", reject);
  child.once("exit", code => code === 0 ? resolve() : reject(new Error(`${args[0]} exited ${code}`)));
});
const ready = async (url, child) => {
  for (let i = 0; i < 120; i++) {
    if (child.exitCode !== null) throw new Error(`Local server exited ${child.exitCode}`);
    try { if ((await fetch(url)).ok) return; } catch { /* Wait for this local child. */ }
    await delay(500);
  }
  throw new Error(`Local server readiness timed out: ${url}`);
};
// Refuse occupied ports; never terminate a user's existing preview.
for (const url of ["http://localhost:3219", "http://127.0.0.1:4319/__fixtures"]) {
  let occupied = false;
  try { await fetch(url); occupied = true; } catch { /* Available. */ }
  if (occupied) throw new Error(`Stop your existing local preview before running QA: ${url}`);
}
try {
  const backend = start(["tests/community/qa-backend.mjs"]);
  await ready("http://127.0.0.1:4319/__fixtures", backend);
  await run(["node_modules/next/dist/bin/next", "build"]);
  const preview = start(["node_modules/next/dist/bin/next", "start", "--port", "3219"]);
  await ready("http://localhost:3219/ai-experiences", preview);
  await run(["tests/community/portfolio-browser-qa.mjs"]);
  await run(["tests/community/browser-qa.mjs"]);
} finally {
  for (const child of children) if (child.exitCode === null) child.kill();
  await Promise.all(children.filter(c => c.exitCode === null).map(c => new Promise(resolve => c.once("exit", resolve))));
}
