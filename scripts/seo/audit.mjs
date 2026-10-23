// Read-only local production-build audit. No provider calls or search submissions.
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/hp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const phase=process.argv[2]||'after',folder='reports/seo';await mkdir(folder,{recursive:true});
const base='http://127.0.0.1:3219',canonical='https://zqtion.com';
const catalogue=JSON.parse(await readFile('content/resources/catalogue.json','utf8'));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
const sitemap=await context.request.get(base+'/sitemap.xml');const xml=await sitemap.text();
const sitemapUrls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const routes=[...new Set([...sitemapUrls.map(u=>new URL(u).pathname),...catalogue.map(x=>`/resources/${x.resource_type}/${x.slug}`),'/community/account','/community/saved','/community/moderation','/share','/careers/apply','/u/alice','/ai-experiences/not-a-real-post','/resources/not-a-type/'+catalogue[0].slug,'/definitely-not-a-page'])];
const pages=[],external=new Set();
for(const route of routes){
 const res=await context.request.get(base+route);const html=await res.text();await page.setContent(html);
 const row=await page.evaluate(()=>({title:document.title,description:document.querySelector('meta[name="description"]')?.content,canonical:document.querySelector('link[rel="canonical"]')?.href,robots:[...document.querySelectorAll('meta[name="robots"]')].map(x=>x.content).join(', '),h1:[...document.querySelectorAll('h1')].map(x=>x.textContent),h2:document.querySelectorAll('main h2').length,h3:document.querySelectorAll('main h3').length,ogTitle:document.querySelector('meta[property="og:title"]')?.content,ogImage:document.querySelector('meta[property="og:image"]')?.content,schemas:[...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(x=>{try{return JSON.parse(x.textContent);}catch{return [{error:'invalid JSON'}];}}),links:[...document.querySelectorAll('main a[href]')].map(x=>x.getAttribute('href')),text:(document.querySelector('main')?.textContent||'').replace(/\s+/g,' ').slice(0,360),paragraphs:document.querySelectorAll('main article p').length,tables:document.querySelectorAll('main article table').length,codeBlocks:document.querySelectorAll('main article pre').length,rawMarkdown:!!document.querySelector('main article .whitespace-pre-wrap')}));
 for(const href of row.links)if(/^https?:/.test(href)&&!href.startsWith(canonical))external.add(href);
 const streamedNotFound=res.status()===200&&html.includes('NEXT_HTTP_ERROR_FALLBACK;404')&&row.robots?.includes('noindex');
 pages.push({route,status:res.status(),streamedNotFound:Boolean(streamedNotFound),...row});
}
const robots=await (await context.request.get(base+'/robots.txt')).text();
const duplicates=Object.entries(Object.groupBy(pages.filter(p=>p.status===200&&!p.robots?.includes('noindex')),p=>p.title)).filter(([,p])=>p.length>1).map(([title,p])=>({title,routes:p.map(x=>x.route)}));
const failures=[];
if(phase==='after')for(const row of pages){
 if(row.status===200&&!row.streamedNotFound){if(row.h1.length!==1)failures.push({route:row.route,issue:'H1 count',value:row.h1.length});if(!row.title||!row.description)failures.push({route:row.route,issue:'missing metadata'});if(row.canonical!==canonical+row.route)failures.push({route:row.route,issue:'canonical',value:row.canonical});if(row.schemas.some(x=>x.error))failures.push({route:row.route,issue:'invalid JSON-LD'});}
 if(row.route.startsWith('/resources/')&&row.status===200){if(row.rawMarkdown||row.paragraphs<2||row.h2<3||!row.codeBlocks)failures.push({route:row.route,issue:'nonsemantic article'});if(!row.robots?.includes('noindex')&&row.schemas.every(x=>x['@type']!=='TechArticle'))failures.push({route:row.route,issue:'missing qualified article schema'});}
 if(['/community/account','/community/saved','/community/moderation','/share','/careers/apply'].includes(row.route)&&!row.robots?.includes('noindex'))failures.push({route:row.route,issue:'private route indexable'});
}
const report={phase,measuredAt:new Date().toISOString(),commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),buildId:(await readFile('.next/BUILD_ID','utf8')).trim(),method:'Chromium request + JavaScript-disabled HTML DOM parsing; loopback fixture production build, not hosted indexing proof',sitemap:{status:sitemap.status(),urls:sitemapUrls,unique:new Set(sitemapUrls).size},robots,duplicates,pages,externalLinks:[...external].sort(),failures};
await writeFile(`${folder}/${phase}-audit.json`,JSON.stringify(report,null,2)+'\n');
await browser.close();console.log(JSON.stringify({phase,pages:pages.length,duplicateTitles:duplicates.length,resourceArticles:pages.filter(x=>x.rawMarkdown).length,failures}));if(failures.length)process.exitCode=1;
