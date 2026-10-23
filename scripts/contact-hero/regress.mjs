// Preserve existing assertions while relocating evidence and isolating the verification script.
import {readFile} from 'node:fs/promises';
let source=await readFile('scripts/seo/regression.mjs','utf8');
source=source.replaceAll('reports/seo/','reports/contact-hero/');
const hook=`
code=code.replaceAll('browser.newContext(', 'newQaContext(');
code=\`const newQaContext=async options=>{const context=await browser.newContext(options);await context.route('https://challenges.cloudflare.com/turnstile/v0/api.js?**',r=>r.fulfill({contentType:'application/javascript',body:"window.turnstile={render(host,options){options.callback('local-fixture-token');return 'fixture';},reset(){},remove(){}};"}));return context;};\\n\`+code;
`;
source=source.replace('process.argv=[process.execPath',hook+'\nprocess.argv=[process.execPath');
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
