import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Genuine hosted negative checks only. No token, interception, provider fixture or success claim.
const origin = 'https://zqtion-git-fix-contact-form-and-hero-re-0f1026-t4j-44s-projects.vercel.app';
const folder = 'reports/contact-hero/functional-acceptance';
await mkdir(folder, { recursive: true });
const brief = { name: 'Zqtion controlled staging preflight', email: 'info@zqtion.com', service: 'Web product or MVP', details: 'Controlled staging validation only. No project inquiry should be saved without genuine human verification.' };
const checks = [
  ['invalid-json', '{broken', [400]],
  ['missing-required', {}, [400]],
  ['invalid-email', { ...brief, email: 'invalid' }, [400]],
  ['short-description', { ...brief, details: 'short' }, [400]],
  ['unsafe-url', { ...brief, projectUrl: 'javascript:alert(1)' }, [400]],
  ['oversized-body', { ...brief, details: 'A'.repeat(21000) }, [413]],
  ['honeypot', { ...brief, fax_number: 'controlled-anti-spam-check' }, [200]],
  ['missing-real-token', brief, [400, 503]],
];
const results = [];
for (const [name, body, expected] of checks) {
  const response = await fetch(origin + '/api/inquiries', { method: 'POST', headers: { 'content-type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body), redirect: 'manual', signal: AbortSignal.timeout(30000) });
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    results.push({ name, status: response.status, verdict: 'BLOCKED', reason: 'Non-JSON response: deployment authentication or routing must be resolved first' });
    break;
  }
  const payload = await response.json();
  assert.ok(!JSON.stringify(payload).includes('sb_secret_'));
  if ([401, 403].includes(response.status) && (payload.message === 'Protected by Vercel Authentication' || payload.error?.message === 'Protected deployment')) {
    results.push({ name, status: response.status, body: { message: 'Protected by Vercel Authentication' }, requestId: response.headers.get('x-vercel-id'), verdict: 'BLOCKED', reason: 'Vercel authentication prevented reaching the application; no application assertion was executed' });
    break;
  }
  const pass = expected.includes(response.status);
  results.push({ name, status: response.status, body: payload, requestId: response.headers.get('x-vercel-id'), verdict: pass ? 'PASS' : 'FAIL' });
  console.log(JSON.stringify(results.at(-1)));
}
await writeFile(folder + '/live-http-negative.json', JSON.stringify({ checkedAt: new Date().toISOString(), origin, method: 'Actual HTTPS responses from the approved hosted Preview endpoint; no mocks or credentials; does not establish positive inquiry/mail acceptance', results, providerSuccessVerified: false }, null, 2) + '\n');
assert.ok(!results.some(row => row.verdict === 'FAIL'));
console.log(results.some(row => row.verdict === 'BLOCKED') ? 'VERDICT: BLOCKED -- deployment authentication' : 'VERDICT: PASS -- negative HTTP checks only');
