import {spawn} from 'node:child_process';import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('reports/contact-hero',{recursive:true});const results=[];
for(const suite of ['ui','layout','axe','community','portfolio']){
 const startedAt=new Date().toISOString();let log='';const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,['scripts/contact-hero/regress.mjs',suite],{windowsHide:true});child.stdout.on('data',d=>{log+=d;process.stdout.write(d);});child.stderr.on('data',d=>{log+=d;process.stderr.write(d);});child.on('error',reject);child.on('exit',resolve);});
 await writeFile(`reports/contact-hero/${suite}-log.txt`,log.replace(/[\t ]+$/gm,'').trimEnd()+'\n');results.push({suite,startedAt,finishedAt:new Date().toISOString(),code});await writeFile('reports/contact-hero/regression-commands.json',JSON.stringify(results,null,2)+'\n');if(code!==0){process.exitCode=1;break;}
}
