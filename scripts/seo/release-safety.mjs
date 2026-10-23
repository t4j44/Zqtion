// Known-pattern scan of this release only. Never print matching contents.
import {readFile,writeFile,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
assert.equal(git('branch','--show-current'),'feature/zqtion-community');
assert.equal(git('remote','get-url','origin'),'https://github.com/t4j44/Zqtion.git');
const changed=[...new Set([...git('diff','--name-only').split('\n'),...git('ls-files','--others','--exclude-standard').split('\n')])].filter(Boolean).sort();
const exact=new Set(['app/api/resources/mcp/route.ts','app/layout.tsx','app/not-found.tsx','app/resources/[type]/[slug]/page.tsx','app/resources/page.tsx','app/robots.ts','app/sitemap.ts','app/work/[slug]/page.tsx','components/community/Account.tsx','components/community/CommunityProvider.tsx','components/resources/ArticleMarkdown.tsx','components/resources/article.css','components/resources/AskZqtionAssistant.tsx','components/resources/PromptCopyBlock.tsx','components/resources/ResourceCard.tsx','components/resources/ResourceSearchFilter.tsx','components/seo/JsonLd.tsx','content/resources/catalogue.json','content/resources/editorial-reviews.json','data/site.ts','docs/RESOURCE_PUBLICATION_POLICY.md','lib/community/seo.ts','lib/resources/evidence.ts','lib/resources/markdown.ts','lib/resources/publication.ts','lib/resources/mcp.ts','lib/resources/service.ts','next.config.js','public/ai.txt','public/llms.txt','scripts/portfolio-interactions.mjs','scripts/resource-intelligence/export.py','scripts/resource-intelligence/synthesize.py','tests/acceptance-scenarios.test.mjs','tests/community-seo.test.mjs','tests/community/auth-browser-qa.mjs','tests/community/disabled-smoke.mjs','tests/community/qa-backend.mjs','tests/resources.test.mjs','tests/seo-policy.test.mjs','tests/seo-resources.test.mjs','tests/test_resource_publication.py']);
const allowed=file=>exact.has(file)||file.startsWith('scripts/seo/')||file.startsWith('reports/seo/');
const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/,/\bgh[pousr]_[A-Za-z0-9]{30,}\b/,/\bgithub_pat_[A-Za-z0-9_]{40,}\b/,/\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/,/\bre_[A-Za-z0-9]{24,}\b/,/\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{24,}\b/,/google-site-verification=[A-Za-z0-9_-]{20,}/];
const findings=[],files=[];
for(const file of changed){
 assert.ok(allowed(file),'Unexpected release path: '+file);
 assert.ok(!/(?:^|\/)\.env|\.(?:pem|p12|pfx|key|mp4|mov|zip)$/i.test(file),'Forbidden release asset: '+file);
 const size=(await stat(file)).size;assert.ok(size<10_000_000,'Oversized release blob: '+file);files.push({path:file,bytes:size});
 if(!file.endsWith('.png')){const body=await readFile(file,'utf8');if(patterns.some(pattern=>pattern.test(body)))findings.push({path:file,issue:'Known credential pattern; contents intentionally withheld'});}
}
assert.equal(findings.length,0,JSON.stringify(findings));
const result={status:'PASS',scope:'Only changed/untracked allowlisted release files; known credential/verification-token patterns and forbidden file types. Not exhaustive secret detection.',files:files.length,bytes:files.reduce((n,x)=>n+x.bytes,0),largest:files.sort((a,b)=>b.bytes-a.bytes).slice(0,5),findings,protected:'No .env, original media, dependency tree, local build snapshot, hosted settings or migration is staged.'};
await writeFile('reports/seo/release-safety.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
