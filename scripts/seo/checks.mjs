import {spawn} from 'node:child_process';import {readFile,writeFile,mkdir} from 'node:fs/promises';import {existsSync} from 'node:fs';import path from 'node:path';
const npm=path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');if(!existsSync(npm))throw Error('Expected existing npm runtime, do not install automatically');await mkdir('reports/seo/checks',{recursive:true});const results=[];
for(const script of ['test','lint','typecheck','prompts:seo']){
 const args=script==='test'?['test']:['run',script];let log='';const startedAt=new Date().toISOString();
 const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[npm,...args],{env:{...process.env,PROMPT_QA_ORIGIN:'http://127.0.0.1:3219'},windowsHide:true});child.stdout.on('data',data=>{log+=data;});child.stderr.on('data',data=>{log+=data;});child.on('error',reject);child.on('exit',resolve);});
 await writeFile(`reports/seo/checks/${script.replaceAll(':','-')}.txt`,log);results.push({command:'npm '+args.join(' '),startedAt,finishedAt:new Date().toISOString(),code});await writeFile('reports/seo/checks/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({script,code,tail:log.slice(-500)}));if(code!==0){process.exitCode=1;break;}
}
await readFile('.next/BUILD_ID','utf8');
