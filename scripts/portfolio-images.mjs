import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);const {chromium}=require(process.env.COMMUNITY_PLAYWRIGHT_PATH||'C:/Users/hp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});const failures=[];page.on('requestfailed',r=>failures.push({url:r.url(),error:r.failure()?.errorText}));page.on('response',r=>{if(r.status()>=400)failures.push({url:r.url(),status:r.status()});});
try{
  await page.goto('http://127.0.0.1:3219/work',{waitUntil:'networkidle'});
  for(const image of await page.locator('.work-card img').all()){
    await image.scrollIntoViewIfNeeded();
    try{await image.evaluate(i=>new Promise((resolve,reject)=>{if(i.complete&&i.naturalWidth)return resolve(true);const timer=setTimeout(()=>reject(Error('Image did not load: '+i.getAttribute('src'))),15000);i.addEventListener('load',()=>{clearTimeout(timer);resolve(true);},{once:true});i.addEventListener('error',()=>{clearTimeout(timer);reject(Error('Image failed: '+i.getAttribute('src')));},{once:true});}));}catch(e){console.log(e.message);}
  }
  const images=await page.locator('.work-card img').evaluateAll(images=>images.map(i=>({src:i.currentSrc,attributeSrc:i.getAttribute('src'),loading:i.loading,complete:i.complete,width:i.naturalWidth,height:i.naturalHeight,rect:{width:i.getBoundingClientRect().width,height:i.getBoundingClientRect().height},alt:i.alt})));
  const imageFailures=failures.filter(f=>!f.url.includes('_rsc='));
  await writeFile('reports/portfolio-audit/image-delivery-check.json',JSON.stringify({images,failures:imageFailures,prefetchAborts:failures.filter(f=>f.url.includes('_rsc='))},null,2));console.log(JSON.stringify({images,failures:imageFailures}));if(images.some(i=>!i.complete||!i.width)||imageFailures.length)process.exitCode=1;
}finally{await browser.close();}
