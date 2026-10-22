// Run only against scripts/ui-preview.mjs (loopback fixture, no live providers).
import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/hp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const context=await browser.newContext({viewport:{width:390,height:844},colorScheme:'light',reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();page.setDefaultTimeout(12000);const passed=[],failures=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:3219';const go=async path=>{const r=await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(r.status(),200);};
const check=async(name,fn)=>{try{await fn();passed.push(name);console.log('PASS '+name);}catch(e){failures.push({name,error:e.message});console.log('FAIL '+name+': '+e.message);}};
await mkdir('reports/ui-audit/screenshots/interactions',{recursive:true});
await check('Mobile first visit starts light',async()=>{await go('/');assert.equal(await page.locator('html').getAttribute('data-theme'),'light');});
await check('44px theme control toggles without a reload',async()=>{
  const button=page.getByRole('button',{name:'Switch to dark theme'});const box=await button.boundingBox();assert.ok(box.width>=44&&box.height>=44);
  await button.click();await page.getByRole('button',{name:'Switch to light theme'}).waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('zqtion-theme')),'dark');
});
await check('Explicit theme survives reload and direct nested-route navigation',async()=>{await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await go('/prompts/ui/fieldwork-research-dashboard');assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');});
await check('Theme remains selected during client-side navigation',async()=>{await page.locator('header a[aria-label="Zqtion home"]').click();await page.waitForURL(base+'/');assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');});
await check('Storage events synchronize another tab',async()=>{const second=await context.newPage();await second.goto(base,{waitUntil:'networkidle'});await page.getByRole('button',{name:'Switch to light theme'}).click();await second.waitForFunction(()=>document.documentElement.dataset.theme==='light');await second.close();});
await check('Fresh phone and desktop defaults ignore OS changes and follow the 1024px breakpoint',async()=>{
  const ctx=await browser.newContext({viewport:{width:390,height:844},colorScheme:'dark',reducedMotion:'reduce'});const p=await ctx.newPage();await p.goto(base,{waitUntil:'networkidle'});
  assert.equal(await p.locator('html').getAttribute('data-theme'),'light');
  for(const width of [1023,1024,1440,390]){await p.setViewportSize({width,height:844});await p.waitForFunction(expected=>document.documentElement.dataset.theme===expected,width<1024?'light':'dark');}
  await p.setViewportSize({width:1440,height:900});await p.emulateMedia({colorScheme:'light'});assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');
  await p.reload({waitUntil:'networkidle'});assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');await p.screenshot({path:'reports/ui-audit/screenshots/interactions/desktop-default-dark.png'});
  await p.getByRole('button',{name:'Switch to light theme'}).click();await p.setViewportSize({width:390,height:844});await p.setViewportSize({width:1440,height:900});assert.equal(await p.locator('html').getAttribute('data-theme'),'light');await p.reload({waitUntil:'networkidle'});assert.equal(await p.locator('html').getAttribute('data-theme'),'light');await ctx.close();
});
await check('Storage-disabled first paint and toggle remain functional',async()=>{
  const ctx=await browser.newContext({viewport:{width:390,height:844},colorScheme:'dark'});await ctx.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});
  const p=await ctx.newPage();await p.goto(base,{waitUntil:'networkidle'});assert.equal(await p.locator('html').getAttribute('data-theme'),'light');await p.getByRole('button',{name:'Switch to dark theme'}).click();assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');await p.setViewportSize({width:1440,height:900});await p.setViewportSize({width:390,height:844});assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');await ctx.close();
});
await check('Theme bootstrap works with application JavaScript blocked',async()=>{
  const ctx=await browser.newContext({colorScheme:'light'});await ctx.addInitScript(()=>localStorage.setItem('zqtion-theme','dark'));await ctx.route('**/_next/static/**/*.js',r=>r.abort());const p=await ctx.newPage();await p.goto(base,{waitUntil:'domcontentloaded'});assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');assert.equal(await p.locator('meta[name="theme-color"]').getAttribute('content'),'#050608');await ctx.close();
});
await check('Mobile menu traps focus, makes background inert and restores focus on Escape',async()=>{
  await go('/');await page.getByRole('button',{name:'Open menu'}).click();assert.equal(await page.locator('main').evaluate(e=>e.inert),true);
  for(let i=0;i<26;i++){await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>!!document.activeElement.closest('[role="dialog"][aria-label="Navigation menu"]')));}
  await page.screenshot({path:'reports/ui-audit/screenshots/interactions/mobile-menu-light.png'});await page.keyboard.press('Escape');assert.equal(await page.locator('main').evaluate(e=>e.inert),false);assert.equal(await page.getByRole('button',{name:'Open menu'}).evaluate(e=>e===document.activeElement),true);assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
});
await check('Menu scrolls on a short landscape viewport and cleanup survives resize',async()=>{
  await page.setViewportSize({width:844,height:390});await page.getByRole('button',{name:'Open menu'}).click();assert.ok(await page.locator('#mobile-menu').evaluate(e=>e.scrollHeight>e.clientHeight));await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Explore community posts'}).scrollIntoViewIfNeeded();await page.screenshot({path:'reports/ui-audit/screenshots/interactions/menu-landscape.png'});await page.setViewportSize({width:1440,height:900});await page.getByRole('dialog',{name:'Navigation menu'}).waitFor({state:'detached'});assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
});
await check('Desktop disclosure supports keyboard, Escape and active routes',async()=>{
  const discover=page.getByRole('button',{name:'Discover',exact:true});await discover.focus();await page.keyboard.press('Enter');await page.locator('#nav-Discover').waitFor();await page.keyboard.press('Escape');assert.equal(await discover.evaluate(e=>e===document.activeElement),true);
  await discover.click();await page.locator('#nav-Discover').getByRole('link',{name:'Resources',exact:true}).click();await page.waitForURL('**/resources');await discover.click();assert.equal(await page.locator('#nav-Discover a[href="/resources"]').getAttribute('aria-current'),'page');await page.screenshot({path:'reports/ui-audit/screenshots/interactions/desktop-discover-light.png'});await page.keyboard.press('Escape');
});
await check('Resource search, pressed filter state, empty results and reset work',async()=>{
  await page.getByRole('searchbox',{name:'Search resources'}).fill('zzzz-no-match-qa');await page.getByText('No building blocks found',{exact:true}).waitFor();await page.getByRole('button',{name:'Reset all filters'}).click();await page.getByRole('button',{name:'Create',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Create',exact:true}).getAttribute('aria-pressed'),'true');await page.getByRole('button',{name:'Reset all filters'}).click();
});
await check('Translucent surface utilities resolve to actual theme colors',async()=>{
  const surface=await page.getByRole('button',{name:'Create',exact:true}).evaluate(e=>getComputedStyle(e).backgroundColor);
  assert.equal(surface,'rgba(24, 34, 49, 0.05)');
});
await check('Resource assistant provides immediate feedback and a visible error',async()=>{
  await page.route('**/api/resources/mcp',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Local QA unavailable'})}));await page.getByLabel('Describe what you want to build or automate').fill('Local QA example');await page.getByRole('button',{name:'Ask Zqtion',exact:true}).click();await page.locator('main').getByRole('alert').waitFor();await page.screenshot({path:'reports/ui-audit/screenshots/interactions/resource-error-light.png'});await page.unroute('**/api/resources/mcp');
});
await check('Prompt search, reset, customization, copy and save survive theme changes',async()=>{
  await go('/prompts');await page.getByLabel('Search prompts, tools, styles').fill('zzzz-no-match');await page.getByRole('heading',{name:'No prompts found.'}).waitFor();await page.getByRole('button',{name:'Reset filters'}).click();
  await go('/prompts/ui/fieldwork-research-dashboard');await page.locator('.pl-variable-grid input').first().fill('Theme QA project');await page.getByRole('button',{name:/Customize prompt/}).click();assert.match(await page.locator('.pl-prompt-text').innerText(),/Theme QA project/);await page.locator('.pl-prompt-workbench').getByRole('button',{name:'Copy prompt',exact:true}).click();await page.locator('.pl-prompt-workbench').getByRole('button',{name:'Copied',exact:true}).waitFor();
  await page.locator('.pl-detail-aside').getByRole('button',{name:'Save',exact:true}).click();await page.getByRole('button',{name:'Switch to dark theme'}).click();await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('.pl-detail-aside').getByRole('button',{name:'Saved',exact:true}).getAttribute('aria-pressed'),'true');
});
await check('Community filter dialog supports Escape and returns focus',async()=>{
  await page.setViewportSize({width:390,height:844});await go('/ai-experiences');await page.getByRole('button',{name:'Filters',exact:true}).click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Filters',exact:true}).evaluate(e=>e===document.activeElement),true);
});
await check('Contact validation and error preserve the entered brief',async()=>{
  await go('/contact');await page.getByRole('button',{name:'Send project brief'}).click();assert.equal(await page.locator('input[name="name"]').evaluate(e=>e.validity.valueMissing),true);
  await page.locator('input[name="name"]').fill('Local QA');await page.locator('input[name="email"]').fill('local@example.test');await page.locator('select[name="service"]').selectOption({label:'Web product or MVP'});await page.locator('textarea[name="details"]').fill('LOCAL QA only. A long enough synthetic project brief to exercise the form failure state.');
  await page.route('**/api/inquiries',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Local QA delivery unavailable.'})}));await page.getByRole('button',{name:'Send project brief'}).click();await page.getByText('Local QA delivery unavailable.',{exact:true}).waitFor();assert.equal(await page.locator('input[name="name"]').inputValue(),'Local QA');await page.screenshot({path:'reports/ui-audit/screenshots/interactions/contact-error-dark.png'});await page.unroute('**/api/inquiries');
});
await check('Contact success announces confirmed receipt without a real submission',async()=>{
  await page.route('**/api/inquiries',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,confirmation:'accepted'})}));await page.getByRole('button',{name:'Send project brief'}).click();await page.getByText(/Brief received\./).waitFor();await page.screenshot({path:'reports/ui-audit/screenshots/interactions/contact-success-dark.png'});await page.unroute('**/api/inquiries');
});
await check('Launchpad remains a closed preview and invalid steps explain errors',async()=>{
  await go('/careers/apply');assert.match(await page.locator('main').innerText(),/Preview|closed/i);await page.getByRole('button',{name:'Continue',exact:true}).click();assert.equal(await page.locator('input[name="fullName"]').evaluate(e=>e.validity.valueMissing),true);assert.equal(await page.locator('fieldset:not([hidden])').count(),1);await page.screenshot({path:'reports/ui-audit/screenshots/interactions/careers-validation-dark.png'});
});
await check('All three Launchpad steps retain edits and CV link; preview sends nothing',async()=>{
  let submissions=0;page.on('request',request=>{if(request.url().endsWith('/api/applications')&&request.method()==='POST')submissions++;});
  for(const [name,value] of Object.entries({fullName:'Local QA Example',email:'local@example.test',phone:'+15550100100',location:'Local test city'}))await page.locator(`[name="${name}"]`).fill(value);
  await page.locator('[name="studyLevel"]').selectOption({label:'Self-taught learner'});await page.locator('[name="ageConfirmed"]').check();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.locator('[name="primaryTrack"]').selectOption('ai-creative-prompt-engineering');
  await page.locator('[name="resumeUrl"]').fill('https://drive.google.com/file/d/LOCAL_QA_SYNTHETIC/view');
  for(const name of ['whyZqtion','learningGoals','priorExperiment','strongestSkill','improveSkill','toolsUsed','startAvailability','roleAnswer'])await page.locator(`[name="${name}"]`).fill('LOCAL QA synthetic answer about learning and building small evidence-based projects.');
  await page.locator('[name="weeklyAvailability"]').selectOption({label:'8–12 hours'});await page.locator('[name="laptopAccess"]').selectOption({label:'Yes, reliable access'});
  await page.getByRole('button',{name:'Back',exact:true}).click();assert.equal(await page.locator('[name="fullName"]').inputValue(),'Local QA Example');await page.getByRole('button',{name:'Continue',exact:true}).click();assert.match(await page.locator('[name="resumeUrl"]').inputValue(),/LOCAL_QA_SYNTHETIC/);
  await page.screenshot({path:'reports/ui-audit/screenshots/interactions/careers-step-2-dark.png',fullPage:true});await page.getByRole('button',{name:'Continue',exact:true}).click();await page.locator('[name="acknowledgement"]').check();await page.locator('[name="privacyConsent"]').check();await page.getByRole('button',{name:'Check application preview'}).click();await page.getByText('Your application preview passes the form checks. Nothing was sent or saved. Applications are not open yet.',{exact:true}).waitFor();assert.equal(submissions,0);await page.screenshot({path:'reports/ui-audit/screenshots/interactions/careers-step-3-dark.png',fullPage:true});
});
await check('Reduced-motion phone does not load WebGL and reflows at 400% equivalent',async()=>{
  await page.setViewportSize({width:320,height:640});await go('/');assert.equal(await page.locator('.hero-journey').getAttribute('data-hero-mode'),'static');assert.equal(await page.locator('canvas').count(),0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
});
await check('Application errors and hydration mismatches are absent',async()=>assert.deepEqual(errors,[]));
await writeFile('reports/ui-audit/interaction-results.json',JSON.stringify({passed,failures,errors},null,2));await browser.close();if(failures.length)process.exitCode=1;
