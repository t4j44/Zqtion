import test from 'node:test';
import assert from 'node:assert/strict';
import {moduleUrl} from './helpers/typescript.mjs';
const types=await moduleUrl('lib/community/types.ts');
const validation=await moduleUrl('lib/community/validation.ts',{'./types':types});
const auth=await import(await moduleUrl('lib/community/auth.ts',{'./validation':validation}));
test('Auth callback retains the exact safe post, query and composer without accepting redirect loops',()=>{
 const destination='/ai-experiences/abc?sort=newest&page=2#compose-comment-123';
 const callback=new URL(auth.authCallback('https://preview.example',destination,'comment'));
 assert.equal(callback.origin,'https://preview.example');assert.equal(callback.pathname,'/community/account');assert.equal(callback.searchParams.get('next'),destination);assert.equal(callback.searchParams.get('intent'),'comment');assert.equal(callback.searchParams.get('auth'),'1');
 for(const path of ['//evil.example','https://evil.example','/community/account','/share/../../community/account','/ai-experiences/%2f%2fevil.example'])assert.equal(new URL(auth.authCallback('https://zqtion.com',path)).searchParams.get('next'),'/ai-experiences');
});
test('Onboarding is required for participation, but public browsing needs no Community profile',()=>{
 for(const path of ['/ai-experiences','/ai-experiences/abc?sort=newest#conversation','/u/alice','/prompts/community'])assert.equal(auth.needsCommunityProfile(path),false);
 for(const path of ['/share','/share?type=prompt','/community/saved'])assert.equal(auth.needsCommunityProfile(path),true);
 for(const intent of auth.participationIntents){assert.equal(auth.safeParticipationIntent(intent),intent);assert.equal(auth.needsCommunityProfile('/ai-experiences/abc',intent),true);}
 assert.equal(auth.safeParticipationIntent('moderator'),undefined);
});
test('Google display-name suggestions require confirmed email and a verified Google identity; no privileges are derived',()=>{
 const user={email_confirmed_at:'2026-10-22',user_metadata:{full_name:'Do not trust this for identity',moderator:true},identities:[{provider:'google',identity_data:{email_verified:true,full_name:' Google\nMember '}}]};
 assert.equal(auth.googleProfileName(user),'GoogleMember');assert.equal(auth.googleProfileName({...user,email_confirmed_at:null}),'');assert.equal(auth.googleProfileName({...user,identities:[]}),'');assert.equal(auth.googleProfileName({...user,identities:[{provider:'google',identity_data:{full_name:'No verification'}}]}),'');
});
test('Cancelled and mismatched OAuth links are detected without displaying provider error payloads',()=>{
 assert.equal(auth.oauthReturnFailed('?error=access_denied',''),true);assert.equal(auth.oauthReturnFailed('','#error_description=cancelled'),true);assert.equal(auth.oauthReturnFailed('?code=unexpected-pkce-code',''),true);assert.equal(auth.oauthReturnFailed('?auth=1&next=%2Fai-experiences','#conversation'),false);
});
