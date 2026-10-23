// Run existing suites with their assertions intact and keep this change's evidence separate.
import {readFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const suites={ui:'tests/ui-browser-qa.mjs',layout:'scripts/ui-audit.mjs',axe:'scripts/ui-accessibility.mjs',links:'scripts/ui-links.mjs',webkit:'scripts/ui-webkit.mjs',portfolio:'scripts/portfolio-interactions.mjs'};
const suite=process.argv[2],source=suites[suite];if(!source)throw Error('Choose ui, layout, axe, links or webkit');
await mkdir('reports/google-auth-audit/regression/screenshots/interactions',{recursive:true});
let code=await readFile(source,'utf8');code=code.replaceAll('reports/ui-audit','reports/google-auth-audit/regression').replaceAll('createRequire(import.meta.url)',`createRequire(${JSON.stringify(pathToFileURL(resolve(source)).href)})`);
code=code.replaceAll('reports/portfolio-audit/interaction-results.json','reports/google-auth-audit/portfolio-interaction-results.json');
if(suite==='layout')code=code.replace('if([320,390,768,1440].includes(width)){',"if(['/community/account','/ai-experiences'].includes(route)&&[390,1440].includes(width)){");
if(suite==='webkit')code=code.replace('const page=await context.newPage();',"await context.addInitScript(theme=>localStorage.setItem('zqtion-theme',theme),theme);const page=await context.newPage();");
process.argv=[process.execPath,resolve(source),'after'];await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
