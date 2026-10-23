import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/hp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {default:AxeBuilder}=require('../artifacts/ui-tools/node_modules/@axe-core/playwright');
const phase=process.argv[2]||'after';const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const results=[];
const homeOnly=process.argv.includes('--home-only');
for(const theme of phase==='before'?['dark']:['dark','light']){
  const context=await browser.newContext({reducedMotion:'reduce',colorScheme:theme});const page=await context.newPage();
  await page.addInitScript(t=>localStorage.setItem('zqtion-theme',t),theme);await page.emulateMedia({colorScheme:theme});
  for(const width of [390,1440])for(const route of ['/','/work','/services','/about','/contact','/careers','/careers/apply','/prompts','/prompts/ui/fieldwork-research-dashboard','/ai-experiences','/u/alice','/community/account','/resources','/resources/guide/ai-lead-research-verification-pipeline']){
    if(homeOnly&&route!=='/')continue;
    await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:3219'+route,{waitUntil:'networkidle'});
    if(route==='/')await page.addStyleTag({content:'.home-deferred,.hero-followup-deferred{content-visibility:visible!important;contain-intrinsic-size:none!important}'});
    if(route==='/')await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=innerHeight*.8){scrollTo({top:y,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}scrollTo({top:0,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
    const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    results.push({route,theme,width,passes:scan.passes.length,incomplete:scan.incomplete.map(v=>({id:v.id,nodes:v.nodes.length})),violations:scan.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary,html:n.html}))}))});
    console.log(`${phase} ${theme} ${width} ${route}: ${scan.violations.length} rules`);
  }
  await context.close();
}
await writeFile(`reports/ui-audit/${phase}${homeOnly?'-home':''}-accessibility.json`,JSON.stringify(results,null,2));await browser.close();
