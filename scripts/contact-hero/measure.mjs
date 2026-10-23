// Reuse the serial, cold-profile measurement contract without rewriting prior evidence.
import {readFile,mkdir} from 'node:fs/promises';
await mkdir('reports/contact-hero/iteration-1',{recursive:true});
let source=await readFile('scripts/seo/performance.mjs','utf8');
source=source.replaceAll('reports/seo/','reports/contact-hero/').replace("for(const route of ['/','/resources/guide/ai-lead-research-verification-pipeline'])","for(const route of ['/'])");
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
