import { spawn } from 'node:child_process';
import { cp, symlink, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd(), folder = 'reports/contact-hero/functional-acceptance';
await mkdir(folder, { recursive: true });
const npm = path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
const results = [];
async function run(name, args, cwd, env) {
  let log = '';
  const startedAt = new Date().toISOString();
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd, env, windowsHide: true });
    child.stdout.on('data', data => { log += data; });
    child.stderr.on('data', data => { log += data; });
    child.on('error', reject); child.on('exit', resolve);
  });
  await writeFile(`${folder}/${name}.txt`, log.replace(/[\t ]+$/gm, '').trimEnd() + '\n');
  results.push({ name, startedAt, finishedAt: new Date().toISOString(), code });
  await writeFile(`${folder}/checks.json`, JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify({ name, code, tail: log.slice(-250) }));
  assert.equal(code, 0, `${name} failed`);
}
for (const [name, args] of [['typecheck', ['run', 'typecheck']], ['lint', ['run', 'lint']], ['test', ['test']]]) {
  await run(name, [npm, ...args], root, process.env);
}
// Isolate compilation from local/provider credentials and the running local preview.
const snapshot = path.join(root, 'artifacts', 'inquiry-acceptance-build-' + Date.now());
await mkdir(snapshot, { recursive: true });
for (const name of ['app', 'components', 'lib', 'data', 'content', 'config', 'package.json', 'package-lock.json', 'tsconfig.json', 'next-env.d.ts', 'next.config.js', 'postcss.config.js', 'tailwind.config.ts']) {
  await cp(name, path.join(snapshot, name), { recursive: true });
}
for (const name of ['node_modules', 'public']) await symlink(path.join(root, name), path.join(snapshot, name), 'junction');
const env = { ...process.env, NEXT_PUBLIC_INQUIRY_FALLBACK_ENABLED: 'true', NEXT_PUBLIC_COMMUNITY_ENABLED: 'false', NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_ANON_KEY: '', SUPABASE_URL: '', SUPABASE_SECRET_KEY: '', SUPABASE_SERVICE_ROLE_KEY: '', RESEND_API_KEY: '', INQUIRY_FROM_EMAIL: '', INQUIRY_TO_EMAIL: '', TURNSTILE_SECRET_KEY: '', NEXT_PUBLIC_TURNSTILE_SITE_KEY: '', NEXT_PUBLIC_ANALYTICS_ENABLED: 'false', LAUNCHPAD_APPLICATIONS_ENABLED: 'false', NEXT_PUBLIC_LAUNCHPAD_APPLICATIONS_ENABLED: 'false', VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'fix/contact-form-and-hero-refinement', INQUIRY_PREVIEW_HOSTNAME: 'zqtion-git-fix-contact-form-and-hero-re-0f1026-t4j-44s-projects.vercel.app' };
await run('build', [npm, 'run', 'build'], snapshot, env);
const previous = JSON.parse(await readFile('reports/contact-hero/checks/build-source-proof.json', 'utf8'));
for (const file of previous.files) assert.equal(createHash('sha256').update(await readFile(file.path)).digest('hex'), file.sha256, 'Previously reviewed UI changed: ' + file.path);
const files = [];
for (const file of ['app/api/inquiries/route.ts', ...previous.files.map(file => file.path)]) {
  files.push({ path: file, sha256: createHash('sha256').update(await readFile(file)).digest('hex') });
  assert.deepEqual(await readFile(path.join(snapshot, file)), await readFile(file));
}
await writeFile(`${folder}/build-source-proof.json`, JSON.stringify({ buildId: (await readFile(path.join(snapshot, '.next/BUILD_ID'), 'utf8')).trim(), method: 'npm run build in credential-isolated source snapshot; no .env files copied; no provider acceptance claim', reviewedUiHashesUnchanged: true, files }, null, 2) + '\n');
console.log('VERDICT: PASS');
