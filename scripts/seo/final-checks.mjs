// Recheck the final test-portability and audit-harness edits after measurement.
import {spawn} from 'node:child_process';import {readFile,writeFile} from 'node:fs/promises';
const results=[];
for(const args of [['--test','tests/*.test.mjs'],['node_modules/eslint/bin/eslint.js','scripts/seo','tests/seo-policy.test.mjs','tests/community/disabled-smoke.mjs']]){
 let log='';const startedAt=new Date().toISOString();const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{windowsHide:true});child.stdout.on('data',data=>{log+=data;});child.stderr.on('data',data=>{log+=data;});child.on('error',reject);child.on('exit',resolve);});
 const name=args[0]==='--test'?'test':'supplemental-lint';await writeFile(`reports/seo/checks/${name}.txt`,log);results.push({command:'node '+args.join(' '),startedAt,finishedAt:new Date().toISOString(),code});await writeFile('reports/seo/checks/supplemental-results.json',JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify({name,code,tail:log.slice(-300)}));
 if(name==='test'&&code===0){const checks=JSON.parse(await readFile('reports/seo/checks/results.json','utf8'));checks[0]={...results[0],command:'npm test (same node --test command, final rerun)'};await writeFile('reports/seo/checks/results.json',JSON.stringify(checks,null,2)+'\n');}
 if(code!==0){process.exitCode=1;break;}
}
