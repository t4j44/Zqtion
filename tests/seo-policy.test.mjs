import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {readFile} from 'node:fs/promises';import {runInNewContext} from 'node:vm';import {moduleUrl} from './helpers/typescript.mjs';
const site=await moduleUrl('data/site.ts');const {default:robots}=await import(await moduleUrl('app/robots.ts',{'@/data/site':site}));
test('Robots declarations separate search from training and permit rendering assets',()=>{
 const groups=robots().rules;
 const groupFor=agent=>groups.find(group=>[group.userAgent].flat().includes(agent));
 assert.deepEqual(groupFor('*'),{userAgent:'*',allow:'/',disallow:['/api/']});
 for(const agent of ['Googlebot','Bingbot','OAI-SearchBot','PerplexityBot','Claude-SearchBot','ChatGPT-User','Claude-User']){const group=groupFor(agent);assert.ok(group,agent);assert.equal(group.allow,'/');assert.deepEqual(group.disallow,['/api/']);}
 for(const agent of ['GPTBot','ClaudeBot','Google-Extended']){assert.equal(groupFor(agent).disallow,'/');assert.equal(groupFor(agent).allow,undefined);}
});

test('Preview is closed to crawling, and API responses carry noindex independently of robots',async()=>{
 const previous=process.env.VERCEL_ENV;process.env.VERCEL_ENV='preview';
 try{assert.deepEqual(robots().rules,{userAgent:'*',disallow:'/'});const require=createRequire(import.meta.url);delete require.cache[require.resolve('../next.config.js')];const config=require('../next.config.js');const headers=await config.headers();assert.ok(headers.find(row=>row.source==='/:path*'&&row.headers.some(h=>h.key==='X-Robots-Tag'&&h.value==='noindex, nofollow')));assert.ok(headers.find(row=>row.source==='/api/:path*'&&row.headers.some(h=>h.key==='X-Robots-Tag')));}finally{if(previous===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=previous;}
});
test('www redirect is guarded until the opposing hosted redirect is removed',async()=>{
 const previous=process.env.ZQTION_CANONICAL_APEX_REDIRECT_ENABLED;const require=createRequire(import.meta.url);const config=require('../next.config.js');
 try{delete process.env.ZQTION_CANONICAL_APEX_REDIRECT_ENABLED;assert.ok(!(await config.redirects()).some(row=>row.has?.some(x=>x.value==='www.zqtion.com')));process.env.ZQTION_CANONICAL_APEX_REDIRECT_ENABLED='true';const rule=(await config.redirects()).find(row=>row.has);assert.equal(rule.destination,'https://zqtion.com/:path*');assert.equal(rule.permanent,true);}finally{if(previous===undefined)delete process.env.ZQTION_CANONICAL_APEX_REDIRECT_ENABLED;else process.env.ZQTION_CANONICAL_APEX_REDIRECT_ENABLED=previous;}
});
test('Working research-queue example runs without approving records or inventing missing URLs',async()=>{
 const catalogue=JSON.parse(await readFile('content/resources/catalogue.json','utf8'));const code=catalogue[0].content_markdown.match(/```javascript\n([\s\S]*?)\n```/)[1];let output;runInNewContext(code,{URL,console:{log(value){output=JSON.parse(value);}}},{timeout:1000});assert.equal(output.length,2);assert.equal(output[1].source,null);assert.ok(output.every(row=>row.status==='needs_review'&&row.approved===false));
});
