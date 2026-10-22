import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {moduleUrl} from './helpers/typescript.mjs';
const markdown=await import(await moduleUrl('lib/resources/markdown.ts'));
const source=await readFile('lib/resources/publication.ts','utf8');const ts=await import('typescript');
const compiled=ts.default.transpileModule(source.replace('import reviews from "@/content/resources/editorial-reviews.json";','const reviews = {};'),{compilerOptions:{module:ts.default.ModuleKind.ESNext,target:ts.default.ScriptTarget.ES2022}}).outputText;
const publication=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
test('Markdown handles semantic blocks, repeated anchors and inert HTML',()=>{
 const blocks=markdown.parseArticle('## Task\n\nText <script>alert(1)</script>\n\n### Detail\n\n- one\n- two\n\n1. first\n2. second\n\n| Tool | Cost |\n| --- | --- |\n| local | unknown |\n\n```mermaid\ngraph LR; A-->B\n```\n\n## Task');
 assert.deepEqual(blocks.filter(b=>b.kind==='heading').map(b=>b.id),['task','detail','task-2']);assert.equal(blocks.find(b=>b.kind==='table').rows[0][1],'unknown');assert.equal(blocks.filter(b=>b.kind==='list').length,2);assert.equal(blocks.find(b=>b.kind==='code').language,'mermaid');assert.ok(blocks.find(b=>b.kind==='paragraph').text.includes('<script>'));
});
test('Article URLs reject executable protocols, control characters and encoded backslashes',()=>{
 for(const value of ['javascript:alert(1)','data:text/html,abc','//attacker.test','https://good.test/\nfoo','https://u:p@test.test','/%5c%5cattacker','https://good.test/%0a'])assert.equal(markdown.safeArticleHref(value),undefined,value);
 for(const value of ['/prompts','#verification','https://example.com/docs?q=a'])assert.ok(markdown.safeArticleHref(value),value);
});
test('Every existing resource discloses missing evidence and retains a distinct URL',async()=>{
 const items=JSON.parse(await readFile('content/resources/catalogue.json','utf8'));assert.equal(items.length,28);assert.equal(new Set(items.map(x=>x.slug)).size,28);
 for(const x of items){assert.equal(x.evidence_level,'unverified');assert.equal(x.verified_at,null);assert.ok(x.sources.length);assert.ok(!/Tested and verified by Zqtion|Free to \$20\/month|60-80%|10x API bills|5 tasks per month|zero external data leakage/.test(x.content_markdown+x.summary));assert.ok(markdown.parseArticle(x.content_markdown).some(b=>b.kind==='code'));}
});
test('Human review gate invalidates when title, summary or body changes and rejects missing evidence',()=>{
 const r={slug:'example',title:'Example',summary:'An honest summary',contentMarkdown:'## Steps\nRun a documented test.',status:'published',sources:[{isPrimary:true,sourceUrl:'https://example.com/docs'}]};
 const review={decision:'approved',reviewer:'Human editor',reviewedAt:'2026-01-01',contentHash:publication.resourceContentHash(r),methodUrl:'https://example.com/method',evidenceUrl:'https://example.com/results'};
 assert.equal(publication.resourceIndexable(r),false);assert.equal(publication.resourceIndexable(r,review),true);
 for(const field of ['title','summary','contentMarkdown'])assert.equal(publication.resourceIndexable({...r,[field]:r[field]+' changed'},review),false);
 assert.equal(publication.resourceIndexable({...r,sources:[]},review),false);assert.equal(publication.resourceIndexable(r,{...review,reviewer:''}),false);assert.equal(publication.resourceIndexable(r,{...review,reviewedAt:'2099-01-01'}),false);
});
test('Resource MCP retains its envelope while refusing invented verification and costs',async()=>{
 const serviceUrl=await moduleUrl('lib/resources/service.ts');const {ZqtionMCPEngine}=await import(await moduleUrl('lib/resources/mcp.ts',{'./service':serviceUrl}));const engine=new ZqtionMCPEngine();
 const status=await engine.verifyResource({slug:'crawl4ai-web-crawler-framework'});assert.equal(status.resources[0].isTested,false);assert.equal(status.resources[0].verifiedAt,'');assert.equal(status.resources[0].freshness,'unverified');assert.equal(status.verifiedAt,'');
 const stack=await engine.recommendStack({task:'Evaluate crawling',budgetMonthly:0});assert.ok(stack.resources[0].recommendedStack.every(x=>x.estimatedCost==='Not estimated'));assert.ok(!JSON.stringify(stack).includes('unlimited conversational'));
});
