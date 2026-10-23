import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.COMMUNITY_PLAYWRIGHT_PATH||'C:/Users/hp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const phase=process.argv[2]||'after'; const base='http://127.0.0.1:3219';
const folder=`reports/ui-audit/screenshots/${phase}`; await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe"});
const viewports=[[320,640],[360,800],[375,812],[390,844],[412,915],[430,932],[768,1024],[820,1180],[1024,768],[1280,800],[1440,900],[1920,1080],[844,390],[1024,600]];
const routes=['/','/work','/services','/process','/about','/contact','/careers','/careers/apply','/prompts','/prompts/ui/fieldwork-research-dashboard','/ai-experiences','/prompts/community','/u/alice','/community/account','/community/saved','/community/moderation','/community/guidelines','/share','/resources','/insights','/privacy','/terms','/ai-audit'];
if(phase!=='before') routes.push('/work/spark-dhaka-2050','/careers/ai-creative-prompt-engineering','/resources/guide/ai-lead-research-verification-pipeline','/insights/when-to-automate-a-workflow','/prompts/tools','/prompts/methods','/prompts/methodology');
if(process.argv.includes('--home-only'))routes.splice(1);
const results=[],errors=[];
const themes=phase==='before'?['dark']:['dark','light'];
for(const theme of themes){
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce',colorScheme:theme});
  const page=await context.newPage();page.setDefaultTimeout(15000);
  page.on('pageerror',e=>errors.push({route:page.url(),message:e.message}));
  await page.emulateMedia({colorScheme:theme});
  await page.addInitScript(t=>localStorage.setItem('zqtion-theme',t),theme);
  for(const route of routes){
    await page.setViewportSize({width:1440,height:900});
    const response=await page.goto(base+route,{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    // Capture stabilization only: offscreen content-visibility caches otherwise
    // leave empty placeholders in Chromium full-page screenshots. No visual styles change.
    if(route==='/')await page.addStyleTag({content:'.home-deferred,.hero-followup-deferred{content-visibility:visible!important;contain-intrinsic-size:none!important}'});
    for(const [width,height] of viewports){
      // Complete route matrix at 320,390,768,1440; full viewport matrix on major surfaces.
      if(!['/','/prompts','/ai-experiences','/resources','/careers/apply','/contact'].includes(route)&&![320,390,768,1440].includes(width))continue;
      await page.setViewportSize({width,height});
      // content-visibility intentionally defers the homepage story. Visit it before
      // capturing a full-page image, otherwise Chromium can screenshot empty placeholders.
      if(route==='/')await page.evaluate(async()=>{
        for(let y=0;y<document.documentElement.scrollHeight;y+=innerHeight*.8){scrollTo({top:y,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}
        scrollTo({top:0,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      });
      const geometry=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,theme:document.documentElement.dataset.theme||'dark',
        overflow:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+2||r.left< -2)&&getComputedStyle(e).position!=='absolute'&&!e.closest('[aria-hidden="true"],.work-reel-viewport');}).slice(0,8).map(e=>e.className),
        background:getComputedStyle(document.body).backgroundColor}));
      results.push({route,theme,width,height,status:response.status(),...geometry});
      if([320,390,768,1440].includes(width)){
        if(route==='/'&&[390,1440].includes(width))await page.screenshot({path:`${folder}/home-${theme}-${width}-fold.png`});
        await page.screenshot({path:`${folder}/${route==='/'?'home':route.slice(1).replaceAll('/','-')}-${theme}-${width}.png`,fullPage:true});
      }
    }
    console.log(`${phase} ${theme} ${route}`);
  }
  await page.setViewportSize({width:320,height:640});await page.goto(base+'/',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Open menu',exact:true}).click();
  await page.screenshot({path:`${folder}/navigation-${theme}-320.png`});
  await page.keyboard.press('Escape');
  if(phase!=='before')for(const width of [390,1440]){await page.setViewportSize({width,height:900});await page.goto(base+'/contact',{waitUntil:'networkidle'});await page.locator('.site-footer').screenshot({path:`${folder}/footer-${theme}-${width}.png`});}
  await context.close();
}
await writeFile(`reports/ui-audit/${phase}${process.argv.includes('--home-only')?'-home':''}-measurements.json`,JSON.stringify({phase,routes,viewports,results,errors},null,2));
await browser.close();console.log(JSON.stringify({checks:results.length,overflow:results.filter(r=>r.scrollWidth>r.width+1).length,pageErrors:errors.length}));
