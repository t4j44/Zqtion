import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/hp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const folder='reports/ui-audit/screenshots/references';await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe"});const page=await browser.newPage();
const results=[];
for(const [name,url] of [['resend-home','https://resend.com/'],['resend-pricing','https://resend.com/pricing'],['resend-blog','https://resend.com/blog'],['resend-docs','https://resend.com/docs/introduction'],['zqtion-live','https://zqtion.com']]){
  for(const [width,height] of [[1440,900],[768,1024],[390,844]]){
    try{await page.setViewportSize({width,height});await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await page.locator('h1').first().waitFor({timeout:12000});
    const styles=await page.evaluate(()=>({title:document.title,headings:[...document.querySelectorAll('h1,h2')].slice(0,10).map(e=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();return {text:e.textContent.trim(),font:c.fontFamily,size:c.fontSize,lineHeight:c.lineHeight,letterSpacing:c.letterSpacing,width:r.width,x:r.x};}),navigation:[...document.querySelectorAll('header a,nav a')].slice(0,25).map(e=>e.textContent.trim()),bodyBackground:getComputedStyle(document.body).backgroundColor}));
    await page.screenshot({path:`${folder}/${name}-${width}.png`,fullPage:true,timeout:45000});results.push({name,url,width,height,styles});console.log(`${name} ${width}`);
    }catch(e){results.push({name,url,width,height,error:e.message});console.log(`Unavailable ${name} ${width}: ${e.message.slice(0,80)}`);}
  }
}
await writeFile('reports/ui-audit/reference-measurements.json',JSON.stringify(results,null,2));await browser.close();
