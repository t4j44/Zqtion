import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
const phase=process.argv[2]||'after',folder=`reports/seo/performance/${phase}`;await mkdir(folder,{recursive:true});
const buildId=(await readFile('.next/BUILD_ID','utf8')).trim();
const retained=process.argv.includes('--resume')?JSON.parse(await readFile(`${folder}/summary.json`,'utf8')):undefined;
if(retained&&retained.buildId!==buildId)throw Error('Cannot combine measurements from different builds');
const results=retained?.results||[];
for(const device of ['mobile','desktop'])for(const route of ['/','/resources/guide/ai-lead-research-verification-pipeline'])for(let run=1;run<=3;run++){
 if(results.some(row=>row.device===device&&row.route===route&&row.run===run))continue;
 const slug=route==='/'?'home':'resource',output=`${folder}/${slug}-${device}-${run}.json`;
 const args=['artifacts/ui-tools/node_modules/lighthouse/cli/index.js','http://127.0.0.1:3219'+route,'--only-categories=performance,accessibility,seo,best-practices','--output=json','--output-path='+output,'--chrome-path=C:/Program Files/Google/Chrome/Application/chrome.exe','--chrome-flags=--headless=new --no-first-run --no-default-browser-check','--quiet'];
 if(device==='desktop')args.push('--preset=desktop');
 for(let attempt=1;attempt<=2;attempt++){
  const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{stdio:'inherit',windowsHide:true});child.on('error',reject);child.on('exit',resolve);});
  if(code===0)break;
  const failed=JSON.parse(await readFile(output,'utf8'));await copyFile(output,`reports/seo/iteration-1/lighthouse-${phase}-${slug}-${device}-${run}-attempt-${attempt}.json`);
  // Retain all valid scores. Only a trace recorder failure gets one retry.
  if(attempt===2||failed.runtimeError?.code!=='NO_NAVSTART')throw Error('Lighthouse failed: '+(failed.runtimeError?.code||code));
 }
 const report=JSON.parse(await readFile(output,'utf8'));const row={route,device,run,scores:Object.fromEntries(Object.entries(report.categories).map(([k,v])=>[k,Math.round(v.score*100)])),lcpMs:report.audits['largest-contentful-paint'].numericValue,cls:report.audits['cumulative-layout-shift'].numericValue,tbtMs:report.audits['total-blocking-time'].numericValue,benchmark:report.environment.benchmarkIndex,browser:report.environment.hostUserAgent};results.push(row);console.log(JSON.stringify({phase,...row}));
 await writeFile(`${folder}/summary.json`,JSON.stringify({phase,buildId:(await readFile('.next/BUILD_ID','utf8')).trim(),method:'Three serial cold-profile Lighthouse runs per route/device, simulated throttling; lab data, no field INP or CWV pass claim',results},null,2));
}
