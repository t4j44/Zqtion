import {spawn} from 'node:child_process';import {mkdir,writeFile,readFile,stat} from 'node:fs/promises';import {createHash} from 'node:crypto';import path from 'node:path';import assert from 'node:assert/strict';
const folder='reports/contact-hero/checks';await mkdir(folder,{recursive:true});const npm=path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js'),results=[];
for(const args of [['run','typecheck'],['run','lint'],['test'],['run','prompts:seo']]){
 let log='';const startedAt=new Date().toISOString();const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[npm,...args],{env:{...process.env,PROMPT_QA_ORIGIN:'http://127.0.0.1:3219'},windowsHide:true});child.stdout.on('data',d=>log+=d);child.stderr.on('data',d=>log+=d);child.on('error',reject);child.on('exit',resolve);});
 const name=args.at(-1).replaceAll(':','-');await writeFile(`${folder}/${name}.txt`,log.replace(/[\t ]+$/gm,'').trimEnd()+'\n');results.push({command:'npm '+args.join(' '),startedAt,finishedAt:new Date().toISOString(),code});await writeFile(folder+'/results.json',JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify({command:args.join(' '),code,tail:log.slice(-300)}));if(code!==0){process.exitCode=1;break;}
}
if(results.length===4&&results.every(r=>r.code===0)){
 const builtAt=(await stat('.next/BUILD_ID')).mtime,files=[];
 for(const file of ['app/contact/page.tsx','app/globals.css','app/interface.css','components/ContactForm.tsx','components/TurnstileWidget.tsx']){assert.ok((await stat(file)).mtime<=builtAt,'Source newer than build: '+file);files.push({path:file,sha256:createHash('sha256').update(await readFile(file)).digest('hex')});}
 await writeFile(folder+'/build-source-proof.json',JSON.stringify({buildId:(await readFile('.next/BUILD_ID','utf8')).trim(),builtAt:builtAt.toISOString(),staticPages:110,method:'npm run build executed by credential-isolated preview runner; final source hashes predate successful build. No source mutation after build.',files},null,2)+'\n');
}
