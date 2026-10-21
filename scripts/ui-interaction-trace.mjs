import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/hp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,colorScheme:'dark'});
// Fix the starting theme so this comparative toggle trace is independent of defaults.
await context.addInitScript(()=>localStorage.setItem('zqtion-theme','dark'));const page=await context.newPage();
const requests=[];page.on('request',r=>requests.push(r.url()));await page.goto('http://127.0.0.1:3219/',{waitUntil:'networkidle'});
await context.tracing.start({screenshots:true,snapshots:true,sources:false});
await page.evaluate(()=>{window.__qaEvents=[];new PerformanceObserver(list=>{for(const e of list.getEntries())if(e.interactionId)window.__qaEvents.push({name:e.name,duration:e.duration,interactionId:e.interactionId,inputDelay:e.processingStart-e.startTime});}).observe({type:'event',buffered:true,durationThreshold:16});});
await page.getByRole('button',{name:'Switch to light theme'}).click();await page.getByRole('button',{name:'Open menu'}).click();await page.getByRole('button',{name:'Close menu'}).click();
await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const result=await page.evaluate(()=>({events:window.__qaEvents,heroMode:document.querySelector('.hero-journey').dataset.heroMode,canvasCount:document.querySelectorAll('canvas').length,theme:document.documentElement.dataset.theme}));
result.jsRequests=requests.filter(u=>u.includes('.js'));result.conditions='Unthrottled installed Chrome, synthetic touch phone at 390x844, normal motion. Event entries below 16ms are omitted. This is not field INP.';
await context.tracing.stop({path:'reports/ui-audit/interaction-trace.zip'});await writeFile('reports/ui-audit/interaction-trace.json',JSON.stringify(result,null,2));await browser.close();console.log(JSON.stringify(result));
