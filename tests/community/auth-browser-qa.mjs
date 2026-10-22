// Local Auth transport simulation with the real supabase-js browser session implementation.
// No Google account, hosted Supabase project or external OAuth settings are touched.
import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.COMMUNITY_PLAYWRIGHT_PATH||'C:/Users/hp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base='http://localhost:3219',folder='reports/google-auth-audit';await mkdir(folder,{recursive:true});
const fixture=await(await fetch('http://127.0.0.1:4319/__fixtures')).json();
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const buildId=(await readFile('.next/BUILD_ID','utf8')).trim();const passed=[],failures=[],errors=[],responsive=[];const match=process.argv.find(arg=>arg.startsWith('--match='))?.slice(8);
const go=(page,path)=>page.goto(base+path,{waitUntil:'networkidle'});
const fragment=name=>'#'+new URLSearchParams({access_token:'fixture-'+name,refresh_token:'fixture-refresh',expires_in:'3600',token_type:'bearer'});
async function oauth(page,name,{cancel=false}={}){
 let request;
 await page.route('http://127.0.0.1:4319/auth/v1/authorize?**',async route=>{
  request=new URL(route.request().url());const callback=request.searchParams.get('redirect_to');
  await route.fulfill({status:302,headers:{location:callback+(cancel?'#error=access_denied&error_description=Fixture+cancelled':fragment(name))},body:''});
 });
 return ()=>request;
}
async function check(name,fn){if(match&&!name.toLowerCase().includes(match.toLowerCase()))return;const context=await browser.newContext({bypassCSP:true,viewport:{width:1440,height:900},reducedMotion:'reduce'});const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push({name,message:e.message}));try{await fn(page,context);passed.push(name);console.log('PASS '+name);}catch(error){failures.push({name,error:error.message});console.log('FAIL '+name+': '+error.message);await page.screenshot({path:folder+'/failure-'+failures.length+'.png'}).catch(()=>{});}finally{await context.close();}}
const noAutomaticWrites=page=>{const writes=[];page.on('request',request=>{if(request.url().endsWith('/api/community/actions')&&request.method()==='POST')writes.push(JSON.parse(request.postData()).action);});return writes;};
await check('Public navbar, feed, discussions, search and profiles require no login and expose no private email',async page=>{
 await go(page,'/');const heroCommunity=page.getByRole('link',{name:/Explore community/});assert.equal(await heroCommunity.getAttribute('href'),'/ai-experiences');const community=page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:'Community',exact:true});assert.equal(await community.getAttribute('href'),'/ai-experiences');await community.click();await page.waitForURL(base+'/ai-experiences');
 await go(page,'/ai-experiences?q=packaging');assert.match(await page.locator('main').innerText(),/preserve product packaging/);
 await go(page,'/ai-experiences/'+fixture.question.id);assert.ok(await page.getByText(fixture.answer.body,{exact:true}).count());assert.ok(!(await page.content()).includes('alice@community.test'));
 await go(page,'/u/alice');assert.equal(await page.locator('h1').innerText(),'Fixture alice');assert.ok(!(await page.content()).includes('alice@community.test'));
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Open menu'}).click();assert.equal(await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Community',exact:true}).getAttribute('href'),'/ai-experiences');
});
await check('Google initiation uses basic scopes, implicit callback, accessible keyboard control and persistent returning session',async page=>{
 const capture=await oauth(page,'bob');const writes=noAutomaticWrites(page);await go(page,'/community/account');
 const button=page.getByRole('button',{name:'Continue with Google',exact:true});await button.focus();assert.notEqual(await button.evaluate(e=>getComputedStyle(e).outlineStyle),'none');await page.keyboard.press('Enter');await page.waitForURL(base+'/ai-experiences');
 assert.equal(capture().searchParams.get('provider'),'google');assert.deepEqual(capture().searchParams.get('scopes').split(' ').sort(),['email','openid','profile']);assert.equal(new URL(capture().searchParams.get('redirect_to')).pathname,'/community/account');assert.ok(!capture().searchParams.has('code_challenge'));
 await page.reload({waitUntil:'networkidle'});await page.locator('.cq-nav').getByRole('link',{name:'@bob',exact:true}).waitFor();assert.equal(writes.length,0);assert.ok(!page.url().includes('access_token'));
});
await check('New Google user browses immediately, then completes LinkedIn/guidelines once at participation without a password',async page=>{
 const writes=noAutomaticWrites(page);await oauth(page,'google');await go(page,'/community/account');await page.getByRole('button',{name:'Continue with Google',exact:true}).click();await page.waitForURL(base+'/ai-experiences');assert.equal(writes.length,0);
 const target='/ai-experiences/'+fixture.question.id+'?sort=newest&page=1';await go(page,target);await page.getByRole('button',{name:'Write a comment…',exact:true}).click();await page.getByRole('link',{name:'Continue profile setup',exact:true}).click();
 await page.getByLabel('Display name').waitFor();assert.equal(await page.getByLabel('Display name').inputValue(),'Fixture Google Member');assert.equal(await page.getByLabel('Password',{exact:true}).count(),0);assert.equal(await page.getByLabel('LinkedIn profile URL').getAttribute('required'),'');
 await page.getByLabel('Unique username').fill('qa_google_member');await page.getByLabel('LinkedIn profile URL').fill('https://www.linkedin.com/in/qa-google-member');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Save profile and continue',exact:true}).click();
 await page.waitForURL(base+target+'#compose-comment-'+fixture.question.id);await page.getByLabel('Write a comment…',{exact:true}).waitFor();assert.deepEqual(writes,['profile']);
 await page.getByLabel('Write a comment…',{exact:true}).fill('LOCAL QA draft: deliberately not submitted.');assert.deepEqual(writes,['profile']);
 await go(page,'/community/account');await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByRole('button',{name:'Continue with Google',exact:true}).click();await page.waitForURL(base+'/ai-experiences');await page.locator('.cq-nav').getByRole('link',{name:'@qa_google_member',exact:true}).waitFor();assert.deepEqual(writes,['profile']);
 const rows=await(await fetch('http://127.0.0.1:4319/rest/v1/community_profiles?select=id&id=eq.'+fixture.users.google.id)).json();assert.equal(rows.length,1);
});
await check('Signed-out reply returns to the exact post query and answer composer without automatically posting',async page=>{
 const target='/ai-experiences/'+fixture.question.id+'?sort=newest&page=1';const writes=noAutomaticWrites(page);await oauth(page,'alice');await go(page,target);
 await page.locator('#entry-'+fixture.answer.id).getByRole('button',{name:'Reply',exact:true}).click();const gate=page.locator('#compose-comment-'+fixture.answer.id);await gate.getByRole('link',{name:'Continue with email',exact:true}).click();await page.waitForURL('**/community/account?**');
 const authUrl=new URL(page.url());assert.equal(authUrl.searchParams.get('next'),target+'#compose-comment-'+fixture.answer.id);assert.equal(authUrl.searchParams.get('intent'),'comment');
 await page.getByRole('button',{name:'Continue with Google',exact:true}).click();await page.waitForURL(base+target+'#compose-comment-'+fixture.answer.id);await page.locator('#compose-comment-'+fixture.answer.id).getByLabel('Write a comment…',{exact:true}).waitFor();assert.equal(writes.length,0);
});
for(const intent of ['save','vote'])await check('Signed-out '+intent+' returns to the same post without replaying the action',async page=>{
 const target='/ai-experiences/'+fixture.question.id+'?sort=newest#conversation';const writes=noAutomaticWrites(page);await oauth(page,'bob');await go(page,target);
 const root=page.locator('.cq-root-post');await root.getByRole('link',intent==='save'?{name:'Save',exact:true}:{name:/Sign in to upvote/}).click();await page.waitForURL('**/community/account?**');assert.equal(new URL(page.url()).searchParams.get('intent'),intent);
 await page.getByRole('button',{name:'Continue with Google',exact:true}).click();await page.waitForURL(base+target);await root.getByRole('button',{name:'Save',exact:true}).waitFor();assert.equal(writes.length,0);
});
await check('Cancelled OAuth is announced, cleans error fragments, preserves destination and permits email retry',async page=>{
 await oauth(page,'bob',{cancel:true});const target='/ai-experiences/'+fixture.question.id+'#conversation';await go(page,'/community/account?'+new URLSearchParams({next:target,intent:'save'}));await page.getByRole('button',{name:'Continue with Google',exact:true}).click();await page.getByRole('alert').filter({hasText:'Sign-in was cancelled'}).waitFor();assert.ok(!page.url().includes('error_description'));assert.equal(new URL(page.url()).searchParams.get('next'),target);
 await page.getByLabel('Email (private)').fill('bob@community.test');await page.getByLabel('Password',{exact:true}).fill('fixture-password-123');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL(base+target);
});
await check('Direct email login defaults to the feed; invalid external returns cannot leave the app',async page=>{
 for(const next of ['', '//evil.example/path']){await go(page,'/community/account'+(next?'?next='+encodeURIComponent(next):''));if(await page.getByRole('button',{name:'Sign out',exact:true}).count())await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByLabel('Email (private)').fill('alice@community.test');await page.getByLabel('Password',{exact:true}).fill('fixture-password-123');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL(base+'/ai-experiences');}
});
await check('Password reset remains available and recovery callback stays on the password form',async page=>{
 await go(page,'/community/account');await page.getByRole('button',{name:'Forgot password?',exact:true}).click();await page.getByLabel('Email (private)').fill('alice@community.test');await page.getByRole('button',{name:'Send reset link',exact:true}).click();await page.getByRole('status').filter({hasText:'password-reset link'}).waitFor();
 await go(page,'/community/account?recovery=1&auth=1&next=%2Fai-experiences'+fragment('alice')+'&type=recovery');await page.getByLabel('New password',{exact:true}).waitFor();assert.equal(new URL(page.url()).pathname,'/community/account');await page.getByLabel('New password',{exact:true}).fill('fixture-new-password-123');await page.getByRole('button',{name:'Set new password',exact:true}).click();await page.getByRole('status').filter({hasText:'Password updated.'}).waitFor();
});
await check('Logout clears identity and switching accounts never inherits a moderator UI',async page=>{
 await go(page,'/community/account?auth=1'+fragment('reviewer'));await page.waitForURL(base+'/ai-experiences');await go(page,'/community/account');await page.getByRole('link',{name:'Moderation',exact:true}).waitFor();await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByLabel('Email (private)').fill('bob@community.test');await page.getByLabel('Password',{exact:true}).fill('fixture-password-123');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL(base+'/ai-experiences');await go(page,'/community/account');assert.equal(await page.getByRole('link',{name:'Moderation',exact:true}).count(),0);assert.match(await page.locator('.cq-account').innerText(),/Signed in as @bob/);
});
await check('Email account creation remains secondary and keeps password and privacy requirements',async page=>{
 await go(page,'/community/account');await page.getByRole('button',{name:'Create account',exact:true}).click();const form=page.getByRole('form',{name:'Create email account'});await form.waitFor();assert.equal(await form.getByLabel('Password',{exact:true}).getAttribute('minlength'),'12');assert.equal(await form.getByLabel('Password',{exact:true}).getAttribute('autocomplete'),'new-password');await page.getByRole('button',{name:'Back to sign in',exact:true}).click();await page.getByRole('form',{name:'Email sign in'}).waitFor();
});
await check('Cross-tab account switching clears the prior user draft before the new identity can compose',async(page,context)=>{
 const target='/ai-experiences/'+fixture.question.id+'#compose-comment-'+fixture.question.id;await go(page,'/community/account?auth=1&next='+encodeURIComponent(target)+fragment('alice'));await page.waitForURL(base+target);const input=page.getByLabel('Write a comment…',{exact:true});await input.fill('LOCAL QA private draft belonging only to Alice.');
 const account=await context.newPage();await go(account,'/community/account');await account.getByRole('button',{name:'Sign out',exact:true}).click();await page.locator('#compose-comment-'+fixture.question.id).getByRole('link',{name:'Continue with email',exact:true}).waitFor();await account.getByLabel('Email (private)').fill('bob@community.test');await account.getByLabel('Password',{exact:true}).fill('fixture-password-123');await account.getByRole('button',{name:'Sign in',exact:true}).click();await account.waitForURL(base+'/ai-experiences');await page.locator('.cq-nav').getByRole('link',{name:'@bob',exact:true}).waitFor();await input.waitFor();assert.equal(await input.inputValue(),'');await account.close();
});
await check('Expired fixture session returns to sign-in without exposing stale profile actions',async(page,context)=>{
 await context.addInitScript(user=>localStorage.setItem('zqtion-community-auth',JSON.stringify({access_token:'fixture-expired',refresh_token:'expired',expires_at:1,expires_in:1,token_type:'bearer',user})),fixture.users.bob);await go(page,'/community/account?next=%2Fai-experiences');await page.getByRole('button',{name:'Continue with Google',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Sign out',exact:true}).count(),0);
});
await check('Account layout and controls work in both themes from 320px through desktop',async(page,context)=>{
 for(const theme of ['light','dark']){await context.addInitScript(theme=>localStorage.setItem('zqtion-theme',theme),theme);for(const width of [320,360,390,430,768,1024,1440,1920]){
  await page.setViewportSize({width,height:width>=1024?900:844});await go(page,'/community/account');const google=page.getByRole('button',{name:'Continue with Google',exact:true});await google.waitFor();assert.ok((await google.boundingBox()).height>=44);assert.ok(await page.locator('html').getAttribute('data-theme')===theme);const size=await page.evaluate(()=>document.documentElement.scrollWidth);assert.ok(size<=width+1);responsive.push({theme,width,scrollWidth:size});if([390,1440].includes(width)){await page.screenshot({path:folder+'/account-'+theme+'-'+width+'.png',fullPage:true});await page.locator('.cq-auth-panel').screenshot({path:folder+'/panel-'+theme+'-'+width+'.png'});}
 }}
});
await browser.close();await writeFile(folder+(match?'/auth-targeted-results.json':'/auth-browser-results.json'),JSON.stringify({buildId,scope:'Real browser supabase-js implicit-session handling with local PGlite SQL/RLS and simulated OAuth redirect/Auth transport. CSP bypass only for HTTP fixture; not real Google or hosted acceptance.',passed,failures,errors,responsive},null,2)+'\n');console.log(JSON.stringify({passed:passed.length,failures,errors,responsive:responsive.length}));if(failures.length||errors.length)process.exitCode=1;
