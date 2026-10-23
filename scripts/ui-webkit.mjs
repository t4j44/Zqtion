import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {webkit}=require('C:/Users/hp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
let browser;const results=[],errors=[];
try{
  browser=await webkit.launch({headless:true});
  for(const theme of ['dark','light']){
    const context=await browser.newContext({colorScheme:theme,reducedMotion:'reduce'});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    for(const width of [320,390])for(const route of ['/','/contact','/prompts','/ai-experiences']){
      await page.setViewportSize({width,height:844});const response=await page.goto('http://127.0.0.1:3219'+route,{waitUntil:'networkidle'});
      const state=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
      results.push({route,width,theme,status:response.status(),...state,pass:response.ok()&&state.theme===theme&&state.scrollWidth<=width+1});
    }
    await page.getByRole('button',{name:'Open menu'}).click();await page.keyboard.press('Escape');
    results.push({theme,check:'menu Escape',pass:await page.getByRole('button',{name:'Open menu'}).getAttribute('aria-expanded')==='false'});
    await context.close();
  }
}catch(e){errors.push(e.message);}finally{if(browser)await browser.close();}
await writeFile('reports/ui-audit/webkit-results.json',JSON.stringify({results,errors,scope:'Playwright WebKit on Windows; not physical iOS Safari'},null,2));console.log(JSON.stringify({checks:results.length,failures:results.filter(r=>!r.pass),errors}));if(errors.length||results.some(r=>!r.pass))process.exitCode=1;
