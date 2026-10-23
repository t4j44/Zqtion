import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.COMMUNITY_PLAYWRIGHT_PATH||'C:/Users/hp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const phase=process.argv[2]||'before';
const folder=`reports/portfolio-audit/${phase}`;await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const results=[],errors=[];
for(const theme of ['light','dark']){
  const context=await browser.newContext({reducedMotion:'reduce',colorScheme:theme});
  await context.addInitScript(t=>localStorage.setItem('zqtion-theme',t),theme);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const viewports=process.argv.includes('--selected-only')||process.argv.includes('--cases-only')?[[390,844],[1440,900]]:[[320,640],[360,800],[390,844],[430,932],[768,1024],[1024,768],[1440,900],[1920,1080]];
  for(const [width,height] of viewports){
    await page.setViewportSize({width,height});
    const routes=process.argv.includes('--cases-only')?['/work/g-force-tyres-mobile','/work/gruffet','/work/gruffet-product-explainer','/work/bold-kinetic-type-showreel','/work/sports-film-the-leap','/work/mojo-product-visual-lab']:process.argv.includes('--legacy-only')?['/work/sports-film-the-leap','/work/mojo-product-visual-lab']:process.argv.includes('--work-only')?['/work']:process.argv.includes('--selected-only')?['/']:phase==='before'?['/work','/']:['/work','/','/work/g-force-tyres-mobile','/work/gruffet','/work/gruffet-product-explainer','/work/bold-kinetic-type-showreel','/work/spark-dhaka-2050'];
    for(const route of routes){
      console.log(`${phase} ${theme} ${width} ${route}`);
      const response=await page.goto('http://127.0.0.1:3219'+route,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
      if(route==='/')await page.locator('.work-reel').scrollIntoViewIfNeeded();
      const gallery=route==='/work'?page.locator('.work-category-section').first():route==='/'?page.locator('.work-reel'):page.locator('section[aria-label="Project media"]');
      if(phase==='before'&&route==='/work')await page.locator('main > section').first().screenshot({path:`${folder}/work-${theme}-${width}.png`});
      else await gallery.screenshot({path:`${folder}/${route==='/'?'selected-work':route.slice(1).replaceAll('/','-')}-${theme}-${width}.png`});
      if(phase==='after'&&route==='/work'&&[390,1440].includes(width)){
        // Capture-only stabilization: load every real still before a full-page export.
        // Native lazy loading remains unchanged in production and in navigation profiling.
        await page.locator('.work-card img[loading="lazy"]').evaluateAll(images=>images.forEach(image=>{image.loading='eager';}));
        await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=innerHeight*.75){scrollTo({top:y,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}});
        await page.waitForFunction(()=>[...document.querySelectorAll('.work-card img')].every(image=>image.complete&&image.naturalWidth>0),null,{timeout:20000});
        await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
        await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
        await page.screenshot({path:`${folder}/work-full-${theme}-${width}.png`,fullPage:true});
      }
      results.push({theme,width,height,route,status:response.status(),...await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,workCardCount:document.querySelectorAll('.work-card').length,pinned:document.querySelector('.work-reel')?.getAttribute('data-pinned')}))});
    }
  }
  await context.close();
}
await browser.close();
if(process.argv.includes('--work-only')){const prior=JSON.parse(await readFile(`${folder}/measurements.json`,'utf8'));results.push(...prior.results.filter(row=>row.route!=='/work'));errors.push(...prior.errors);}
await writeFile(`${folder}/measurements.json`,JSON.stringify({results,errors},null,2));
console.log(JSON.stringify({phase,checks:results.length,overflows:results.filter(r=>r.scrollWidth>r.width+1).length,errors}));
