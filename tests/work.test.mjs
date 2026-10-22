import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {moduleUrl} from './helpers/typescript.mjs';
const {workItems,featuredWork}=await import(await moduleUrl('data/work.ts'));

test('all original case-study URLs and relationship disclosures survive the expanded catalogue',()=>{
  for(const slug of ['spark-dhaka-2050','emotional-telecom-concept','meeting-my-past-self','ai-microfilm-collection','sports-film-the-leap','mojo-product-visual-lab','ai-vfx-creative-lab']){
    const item=workItems.find(i=>i.slug===slug);assert.ok(item,slug);assert.ok(item.disclosure.length>40);assert.match(item.videoUrl,/youtu/);
  }
  assert.equal(new Set(workItems.map(i=>i.slug)).size,workItems.length);
});
test('every portfolio entry has usable media, public destinations and case-study content',async()=>{
  for(const item of workItems){assert.ok(item.poster,item.slug);await access(new URL('../public'+item.poster,import.meta.url));assert.ok(item.challenge&&item.whatThisProved&&item.approach.length&&item.deliverables.length&&item.group,item.slug);for(const link of item.links??[])assert.equal(new URL(link.url).protocol,'https:');if(!item.kind){assert.ok(item.videoId&&item.videoUrl,item.slug);assert.ok(item.videoUrl.includes(item.videoId));}else{assert.equal(item.videoId,undefined);assert.ok(item.links?.length);}}
});
test('homepage features distinct disciplines and keeps supplied motion videos discoverable',()=>{
  assert.deepEqual(featuredWork.map(i=>i.slug),['g-force-tyres-mobile','gruffet','bold-kinetic-type-showreel','spark-dhaka-2050']);
  for(const id of ['EKDWPiF0M6c','osWc8m3qnhI','qIWd8cvsoKk'])assert.ok(workItems.some(i=>i.videoId===id&&i.videoUrl.includes(id)&&i.group==='Motion design & commercials'));
  assert.match(workItems.find(i=>i.slug==='gruffet').disclosure,/early preview/i);
  assert.match(workItems.find(i=>i.slug==='g-force-tyres-mobile').disclosure,/supplied by the owner/);
});
test('legacy URLs describe their actual published media rather than the former mismatched subjects',()=>{
  const mojo=workItems.find(i=>i.slug==='sports-film-the-leap');assert.equal(mojo.sourceTitle,'MOJO VFX 4');assert.equal(mojo.shortTitle,'MOJO VFX');assert.equal(mojo.relationship,'Independent concept');
  const food=workItems.find(i=>i.slug==='mojo-product-visual-lab');assert.equal(food.sourceTitle,'Chiceken tikka reel 3. (Photo to Reel)');assert.equal(food.shortTitle,'Food in motion');assert.equal(food.relationship,'Independent concept');
});
