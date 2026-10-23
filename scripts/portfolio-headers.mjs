import {writeFile} from 'node:fs/promises';
const results=[];
for(const url of ['http://127.0.0.1:3219/','http://127.0.0.1:3219/work','http://127.0.0.1:3219/api/prompts','http://127.0.0.1:3219/api/resources','https://zqtion.com/','https://www.gforcetyres-mobile.co.uk/']){
  try{const local=new URL(url).hostname==='127.0.0.1';const response=await fetch(url,{method:local?'GET':'HEAD',signal:AbortSignal.timeout(20000)});const headers=Object.fromEntries(['content-type','cache-control','vary','age','x-vercel-cache','x-cache'].map(k=>[k,response.headers.get(k)]));results.push({url,method:local?'GET':'HEAD',status:response.status,headers,...(local?{responseBytes:(await response.arrayBuffer()).byteLength}:{})});}catch(e){results.push({url,error:e.message});}
}
await writeFile('reports/portfolio-audit/header-observations.json',JSON.stringify({scope:'Read-only local API bounds/header observations and public site headers. No hosted database, provider configuration or CDN changes.',results},null,2));console.log(JSON.stringify(results));
