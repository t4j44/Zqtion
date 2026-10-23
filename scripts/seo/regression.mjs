import {readFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const suites={ui:'tests/ui-browser-qa.mjs',layout:'scripts/ui-audit.mjs',axe:'scripts/ui-accessibility.mjs',links:'scripts/ui-links.mjs',portfolio:'scripts/portfolio-interactions.mjs',auth:'tests/community/auth-browser-qa.mjs',community:'tests/community/browser-qa.mjs',profiles:'tests/community/portfolio-browser-qa.mjs'};
const source=suites[process.argv[2]];if(!source)throw Error('Unknown suite');
await mkdir('reports/seo/regression/screenshots/interactions',{recursive:true});
await mkdir('reports/seo/community',{recursive:true});
await mkdir('reports/seo/auth',{recursive:true});
let code=await readFile(source,'utf8');code=code.replaceAll('reports/ui-audit','reports/seo/regression').replaceAll('reports/google-auth-audit','reports/seo/auth').replaceAll('reports/portfolio-audit/interaction-results.json','reports/seo/portfolio-interactions.json').replaceAll('artifacts/community','reports/seo/community').replaceAll('createRequire(import.meta.url)',`createRequire(${JSON.stringify(pathToFileURL(resolve(source)).href)})`);
// The shared machine showed a 12s network-idle timeout while the profile was
// already visibly rendered. Preserve control assertions; allow 30s navigation.
if(process.argv[2]==='profiles')code=code.replace('page.setDefaultTimeout(12000);','page.setDefaultTimeout(12000);page.setDefaultNavigationTimeout(30000);');
// Keep all geometry assertions; constrain screenshots to changed surfaces.
if(process.argv[2]==='layout')code=code.replace('if([320,390,768,1440].includes(width)){',"if(['/resources','/resources/guide/ai-lead-research-verification-pipeline','/ai-experiences','/community/account'].includes(route)&&[390,1440].includes(width)){");
process.argv=[process.execPath,resolve(source),'after'];await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
