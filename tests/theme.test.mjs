import test from 'node:test';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {moduleUrl} from './helpers/typescript.mjs';
const {themeInitScript}=await import(await moduleUrl('lib/theme.ts'));

function boot({stored=null,width=390,dark=false,blocked=false}={}) {
  const html={dataset:{},style:{}};const meta={content:''};
  runInNewContext(themeInitScript,{document:{documentElement:html,querySelector:()=>meta},localStorage:{getItem(){if(blocked)throw Error('Storage disabled');return stored;}},matchMedia:query=>({matches:query==='(min-width: 1024px)'?width>=1024:dark})});
  return {html,meta};
}
test('first visit uses light below 1024px and dark from 1024px regardless of OS theme',()=>{
  for(const width of [320,390,768,1023,1024,1440,1920])for(const dark of [false,true]){
    assert.equal(boot({width,dark}).html.dataset.theme,width<1024?'light':'dark',`${width}px, OS dark=${dark}`);
  }
});
test('an explicit theme takes priority over the viewport default',()=>{
  assert.equal(boot({stored:'light',width:1440}).html.dataset.theme,'light');assert.equal(boot({stored:'dark',width:390}).html.dataset.theme,'dark');
});
test('invalid and inaccessible storage fall back safely to the viewport default',()=>{
  for(const width of [390,1440])for(const options of [{stored:'invalid'},{blocked:true}]){
    assert.equal(boot({width,...options}).html.dataset.theme,width<1024?'light':'dark');
  }
});
test('native controls and browser chrome match the selected theme',()=>{
  const {html,meta}=boot({stored:'light',dark:true});assert.equal(html.style.colorScheme,'light');assert.equal(meta.content,'#f7f8fa');
});
