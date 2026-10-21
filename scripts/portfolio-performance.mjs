import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const phase=process.argv[2]||'before';
const folder=`reports/portfolio-audit/performance/${phase}`;await mkdir(folder,{recursive:true});
const buildId=(await readFile('.next/BUILD_ID','utf8')).trim();
const lighthouse='artifacts/ui-tools/node_modules/lighthouse/cli/index.js';
const results=[];
for(const condition of ['mobile','desktop']){
  const mobile=condition==='mobile';
  const config={extends:'lighthouse:default',settings:{onlyCategories:['performance'],formFactor:condition,screenEmulation:{mobile,width:mobile?390:1440,height:mobile?844:900,deviceScaleFactor:mobile?1.75:1,disabled:false},throttlingMethod:'simulate',throttling:mobile?{rttMs:150,throughputKbps:1638.4,cpuSlowdownMultiplier:4}:{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1},disableStorageReset:false}};
  const configPath=`${folder}/${condition}-config.json`;await writeFile(configPath,JSON.stringify(config,null,2));
  for(let run=1;run<=5;run++){
    const output=`${folder}/${condition}-${run}.json`;
    await new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,[lighthouse,'http://127.0.0.1:3219/','--config-path='+configPath,'--output=json','--output-path='+output,'--save-assets','--chrome-path=C:/Program Files/Google/Chrome/Application/chrome.exe','--chrome-flags=--headless=new --no-first-run --no-default-browser-check','--quiet'],{stdio:'inherit',windowsHide:true});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(`Lighthouse ${condition} ${run} exit ${code}`)));
    });
    const r=JSON.parse(await readFile(output,'utf8'));const audits=r.audits;
    const row={condition,run,score:Math.round(r.categories.performance.score*100),lcpMs:audits['largest-contentful-paint'].numericValue,cls:audits['cumulative-layout-shift'].numericValue,tbtMs:audits['total-blocking-time'].numericValue,fcpMs:audits['first-contentful-paint'].numericValue,benchmark:r.environment.benchmarkIndex,lcp:audits['lcp-breakdown-insight']?.details,mainThread:audits['mainthread-work-breakdown']?.details,js:audits['network-requests'].details.items.filter(i=>i.resourceType==='Script').reduce((a,i)=>a+i.transferSize,0),browser:r.environment.hostUserAgent,settings:r.configSettings};results.push(row);
    await writeFile(`${folder}/results.json`,JSON.stringify({phase,buildId,scenario:'fresh Chrome profile per run; cold browser cache; server warmed by preceding screenshot QA; mobile light and desktop dark defaults; serial runs without heavy QA',results},null,2));
    console.log(JSON.stringify({phase,condition,run,score:row.score,lcpMs:Math.round(row.lcpMs),tbtMs:Math.round(row.tbtMs),benchmark:row.benchmark}));
  }
}
