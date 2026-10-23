// Reuse existing assertions, add new work routes, and keep this release's artifacts separate.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const sources={ui:'tests/ui-browser-qa.mjs',layout:'scripts/ui-audit.mjs',axe:'scripts/ui-accessibility.mjs',links:'scripts/ui-links.mjs',webkit:'scripts/ui-webkit.mjs'};
const suite=process.argv[2];const source=sources[suite];if(!source)throw Error('Choose ui, layout, axe or links');
const workOnly=process.argv.includes('--work-only');const portfolioOnly=process.argv.includes('--portfolio-only');
const priorAxe=(workOnly||portfolioOnly)&&suite==='axe'?JSON.parse(await readFile('reports/portfolio-audit/regression/after-accessibility.json','utf8')):null;
await mkdir('reports/portfolio-audit/regression/screenshots/interactions',{recursive:true});
let code=await readFile(source,'utf8');
code=code.replaceAll('reports/ui-audit','reports/portfolio-audit/regression').replaceAll('createRequire(import.meta.url)',`createRequire(${JSON.stringify(pathToFileURL(resolve(source)).href)})`);
if(suite==='axe'||suite==='layout')code=code.replace("'/work','/services'","'/work','/work/g-force-tyres-mobile','/work/gruffet','/work/gruffet-product-explainer','/work/bold-kinetic-type-showreel','/services'");
if(suite==='layout')code=code.replace('if([320,390,768,1440].includes(width)){',"if(route.startsWith('/work')&&[320,390,768,1440].includes(width)){");
if(suite==='webkit')code=code.replace('const page=await context.newPage();',"await context.addInitScript(t=>localStorage.setItem('zqtion-theme',t),theme);const page=await context.newPage();");
if(workOnly&&suite==='axe')code=code.replace("if(homeOnly&&route!=='/')continue;","if(route!=='/work')continue;");
if(portfolioOnly&&suite==='axe')code=code.replace("'/work','/work/g-force-tyres-mobile'","'/work','/work/sports-film-the-leap','/work/mojo-product-visual-lab','/work/g-force-tyres-mobile'").replace("if(homeOnly&&route!=='/')continue;","if(!route.startsWith('/work'))continue;");
process.argv=[process.execPath,resolve(source),'after'];
await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
if(priorAxe){const current=JSON.parse(await readFile('reports/portfolio-audit/regression/after-accessibility.json','utf8'));await writeFile('reports/portfolio-audit/regression/after-accessibility.json',JSON.stringify([...priorAxe.filter(row=>portfolioOnly?!row.route.startsWith('/work'):row.route!=='/work'),...current],null,2));}
