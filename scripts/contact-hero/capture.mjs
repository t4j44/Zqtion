import {createRequire} from 'node:module';import {mkdir,readFile,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require(process.env.COMMUNITY_PLAYWRIGHT_PATH||'C:/Users/hp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const phase=process.argv[2]||'after',folder=`reports/contact-hero/${phase}`;await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[],errors=[];
try{for(const theme of ['light','dark']){
 const context=await browser.newContext({reducedMotion:'reduce'});await context.addInitScript(t=>localStorage.setItem('zqtion-theme',t),theme);
 await context.route('https://challenges.cloudflare.com/turnstile/v0/api.js?**',route=>route.fulfill({contentType:'application/javascript',body:`window.turnstile={render(host,options){host.innerHTML='<div role="note" style="border:1px solid #718096;border-radius:8px;padding:12px;font-size:12px;max-width:100%">Local verification fixture</div>';window.__turnstileOptions=options;options.callback('local-fixture-token');return 'fixture-widget';},reset(){},remove(){}};`}));
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 for(const [width,height] of [[320,568],[360,800],[390,844],[430,932],[768,1024],[1024,768],[1440,900],[1920,1080]])for(const route of ['/','/contact']){
  await page.setViewportSize({width,height});assert.equal((await page.goto('http://127.0.0.1:3219'+route,{waitUntil:'networkidle'})).status(),200);
  const row=await page.evaluate(()=>{const rect=selector=>{const e=document.querySelector(selector);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};return {scrollWidth:document.documentElement.scrollWidth,stage:rect('.hero-3d-stage'),poster:rect('.hero-poster-frame'),copy:rect('.hero-copy'),heading:rect('.hero-headline'),labels:[...document.querySelectorAll('.hero-3d-label')].map(e=>({text:e.textContent,rect:(()=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};})()})),form:rect('form'),panel:rect('.contact-layout > div'),theme:document.documentElement.dataset.theme};});
  results.push({route,theme,width,height,...row});assert.ok(row.scrollWidth<=width+1,`Overflow ${route} ${theme} ${width}`);
  if(phase==='after'&&row.stage){
    const before=JSON.parse(await readFile('reports/contact-hero/before/capture.json','utf8')).results.find(r=>r.route==='/'&&r.theme===theme&&r.width===width);
    assert.ok(Math.abs(row.poster.width-before.poster.width)<1,'The Z must retain its original layout size');
    assert.ok(row.poster.x>=row.stage.x-1&&row.poster.right<=row.stage.right+1&&row.poster.y>=row.stage.y-1&&row.poster.bottom<=row.stage.bottom+1,'Poster must fit inside the panel');
    for(const label of row.labels)assert.ok(label.rect.x>=row.stage.x-1&&label.rect.right<=row.stage.right+1&&label.rect.y>=row.stage.y-1&&label.rect.bottom<=row.stage.bottom+1,'Indicator clipped: '+label.text);
    if(width<768){assert.ok(row.stage.height>before.stage.height*1.1,'Phone panel must be larger');assert.ok(row.heading.y>=row.stage.bottom+8,'Copy must clear the panel');}
  }
  if([320,390,430,1440].includes(width)){const slug=route==='/'?'hero':'contact';await page.screenshot({path:`${folder}/${slug}-${theme}-${width}.png`});await page.screenshot({path:`${folder}/${slug}-${theme}-${width}-full.png`,fullPage:true});}
 }
 await context.close();
}}finally{await browser.close();await writeFile(`${folder}/capture.json`,JSON.stringify({phase,buildId:(await readFile('.next/BUILD_ID','utf8')).trim(),method:'Local fixture production build; verification script intercepted. No real provider acceptance.',results,errors},null,2)+'\n');}
assert.equal(errors.length,0);console.log(JSON.stringify({phase,responsiveChecks:results.length,errors}));
