import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = 'reports/contact-hero/';
const json = async file => JSON.parse(await readFile(root + file, 'utf8'));
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const protectedPaths = ['app/api/inquiries', 'lib/email', 'supabase/migrations', 'components/Hero3D.tsx', 'components/HeroLoopVideo.tsx', 'components/HeroWebGLScene.tsx', 'lib/hero-mode.ts', 'components/ThemeProvider.tsx', 'public', 'package.json', 'package-lock.json', 'next.config.ts', '.env.example', 'lib/community', 'app/api/community'];
const git = args => execFileSync('git', args, { encoding: 'utf8' }).trim();
assert.equal(git(['branch', '--show-current']), 'fix/contact-form-and-hero-refinement');
assert.equal(git(['diff', '2b0ae84f2dcb2ca58bf8d7c8718b3f3882651bcd', '--name-only', '--', ...protectedPaths]), '', 'Protected source changed');
const sourceProof = await json('checks/build-source-proof.json');
for (const file of sourceProof.files) assert.equal(createHash('sha256').update(await readFile(file.path)).digest('hex'), file.sha256, file.path + ' differs from tested build');
const checks = await json('checks/results.json'), regressions = await json('regression-commands.json');
assert.equal(checks.length, 4); assert.equal(regressions.length, 5);
assert.ok([...checks, ...regressions].every(row => row.code === 0));
const capture = await json('after/capture.json'), baseline = await json('before/capture.json');
assert.equal(capture.results.length, 32); assert.equal(capture.errors.length, 0);
const panels = capture.results.filter(row => row.route === '/' && row.theme === 'light').map(row => {
  const old = baseline.results.find(before => before.route === '/' && before.theme === row.theme && before.width === row.width);
  assert.ok(Math.abs(row.poster.width - old.poster.width) < 1);
  return { width: row.width, viewportHeight: row.height, oldPanelHeight: old.stage.height, newPanelHeight: row.stage.height, panelHeightChangePercent: 100 * (row.stage.height / old.stage.height - 1), originalPosterWidth: old.poster.width, finalPosterWidth: row.poster.width };
});
const performance = {};
for (const phase of ['before', 'after']) {
  const summary = await json(`performance/${phase}/summary.json`);
  performance[phase] = {};
  for (const device of ['mobile', 'desktop']) {
    const rows = summary.results.filter(row => row.device === device);
    const network = [];
    for (let run = 1; run <= 3; run++) {
      const raw = await json(`performance/${phase}/home-${device}-${run}.json`);
      const requests = raw.audits['network-requests'].details.items;
      const posters = requests.filter(row => row.url.includes('/hero/z-poster-'));
      assert.equal(posters.length, 1, 'Poster request duplication');
      assert.ok(!requests.some(row => row.url.includes('/3d/hero.mp4')), 'Decorative video loaded before intent');
      network.push({ scriptBytes: raw.audits['resource-summary'].details.items.find(row => row.resourceType === 'script').transferSize, poster: posters[0].url.replace('http://127.0.0.1:3219', ''), totalBytes: raw.audits['total-byte-weight'].numericValue });
    }
    performance[phase][device] = { scores: rows.map(row => row.scores.performance), medianScore: median(rows.map(row => row.scores.performance)), medianLcpMs: median(rows.map(row => row.lcpMs)), medianTbtMs: median(rows.map(row => row.tbtMs)), cls: rows.map(row => row.cls), network };
  }
}
const journeys = await json('journeys/results.json'), fallback = await json('fallback/results.json'), ui = await json('regression/interaction-results.json'), layout = await json('regression/after-measurements.json'), axe = await json('regression/after-accessibility.json'), community = await json('community/browser-qa.json'), portfolio = await json('portfolio-interactions.json');
for (const [name, result, count] of [['journeys', journeys, 18], ['ui', ui, 22], ['community', community, 15], ['portfolio', portfolio, 14]]) { assert.equal(result.passed.length, count, name); assert.equal(result.failures.length, 0, name); }
assert.equal(fallback.results.length, 16); assert.equal(fallback.status, 'PASS');
assert.equal(layout.results.length, 360); assert.equal(layout.errors.length, 0);
assert.equal(axe.length, 56); assert.ok(axe.every(row => row.violations.length === 0));
assert.equal(journeys.accessibility.length, 4); assert.ok(journeys.accessibility.every(row => row.violations.length === 0));
const candidates = git(['ls-files', '--modified', '--others', '--exclude-standard']).split(/\r?\n/).filter(Boolean);
const allowedProduct = sourceProof.files.map(file => file.path).concat('tests/ui-browser-qa.mjs');
const secretPatterns = [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\b(?:sb_secret_|re_)[A-Za-z0-9_-]{20,}/, /\b(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}/, /\beyJ[A-Za-z0-9_-]{25,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/];
for (const file of candidates) {
  assert.ok(allowedProduct.includes(file) || file.startsWith('scripts/contact-hero/') || file.startsWith(root) || file === 'reports/contact-form-hero-refinement.md', 'Unexpected release file: ' + file);
  assert.ok(!/(^|\/)(?:\.env|node_modules|artifacts|\.vercel)(\/|\.|$)/.test(file), 'Forbidden release file');
  if (!file.endsWith('.png')) {
    const value = await readFile(file, 'utf8');
    for (const pattern of secretPatterns) assert.ok(!pattern.test(value), 'Potential secret found; inspect privately: ' + file);
  }
}
await writeFile(root + 'release-proof.json', JSON.stringify({ status: 'PASS', checkedAt: new Date().toISOString(), base: '2b0ae84f2dcb2ca58bf8d7c8718b3f3882651bcd', buildId: sourceProof.buildId, protectedPaths, sourceHashesMatchBuild: true, candidateFiles: candidates.length, secretScan: 'Known private-key/token patterns and forbidden filenames: no matches. Local labelled fixture tokens are intentionally synthetic.', panels, performance, acceptance: { local: 'PASS', productionActivation: 'BLOCKED: no genuine hosted Turnstile/DB/email acceptance or confirmation mailbox receipt' } }, null, 2) + '\n');
console.log(JSON.stringify({ status: 'PASS', sourceHashesMatchBuild: true, protectedPathsUnchanged: true, candidateFiles: candidates.length, panels, performance }));
