import {readFile,writeFile} from 'node:fs/promises';
const manifest=JSON.parse(await readFile('.next/prerender-manifest.json','utf8'));
const base='http://127.0.0.1:3219';
const queue=new Set([...Object.keys(manifest.routes).filter(r=>!r.startsWith('/_')&&!r.endsWith('.txt')&&!r.endsWith('.xml')),'/careers','/careers/apply','/contact','/community/account','/ai-experiences','/prompts/community','/u/alice','/community/saved','/community/guidelines','/community/moderation','/share']);
const pages=[],failures=[];
for(const route of queue){
  if(pages.length>350)throw Error('Local link crawl exceeded bound');
  const response=await fetch(base+route);const html=await response.text();
  pages.push({route,status:response.status});if(!response.ok)failures.push({route,status:response.status});
  if(response.ok)for(const match of html.matchAll(/<a\b[^>]*\bhref="(\/[^"#]*)[^\"]*"/g)){
    const link=match[1].replaceAll('&amp;','&');if(link.startsWith('//')||link.startsWith('/api/')||link.includes('_next'))continue;queue.add(link);
  }
}
await writeFile('reports/ui-audit/link-results.json',JSON.stringify({pages,failures},null,2));console.log(JSON.stringify({pages:pages.length,failures}));if(failures.length)process.exitCode=1;
