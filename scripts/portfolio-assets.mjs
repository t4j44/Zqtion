import {mkdir,writeFile,readFile} from 'node:fs/promises';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
const sources='reports/portfolio-audit/sources';await mkdir('public/work',{recursive:true});
const records=[];
await sharp('public/work/gruffet-mark.svg').resize(1280,720,{fit:'contain',background:'#e6eee7'}).webp({quality:90}).toFile('public/work/gruffet-social.webp');
for(const [source,name] of [['gforce-home-desktop.png','gforce-desktop'],['gforce-home-mobile.png','gforce-mobile'],['gforce-how-it-works-mobile.png','gforce-guidance']]){
  const bytes=await readFile(`${sources}/${source}`);const out=await sharp(bytes).resize({width:name==='gforce-desktop'?1440:390,withoutEnlargement:true}).webp({quality:88}).toBuffer();await writeFile(`public/work/${name}.webp`,out);records.push({source:`${sources}/${source}`,output:`public/work/${name}.webp`,bytes:out.length,...await sharp(out).metadata()});
}
for(const [id,name] of [['EKDWPiF0M6c','gruffet-explainer'],['osWc8m3qnhI','kinetic-type'],['myz4yRXFE2M','spark'],['8UU5R8v3XMk','the-call'],['q_4me0VwaZo','past-self'],['RtBa4fjEjbc','microfilms'],['tlUPzwuj7ck','the-leap'],['GkyqartrbWo','product-lab'],['d9apZlb22gE','creative-lab']]){
  let url=`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;let response=await fetch(url);let bytes=Buffer.from(await response.arrayBuffer());let meta=response.ok?await sharp(bytes).metadata():{};
  if(!response.ok||meta.width<480){url=`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;response=await fetch(url);if(!response.ok)throw Error(`No verified still for ${id}`);bytes=Buffer.from(await response.arrayBuffer());meta=await sharp(bytes).metadata();}
  await writeFile(`${sources}/${name}-original.jpg`,bytes);
  const out=await sharp(bytes).resize({width:1280,withoutEnlargement:true}).webp({quality:87}).toBuffer();await writeFile(`public/work/${name}.webp`,out);
  records.push({source:url,output:`public/work/${name}.webp`,width:meta.width,height:meta.height,sourceBytes:bytes.length,bytes:out.length,sourceSha256:createHash('sha256').update(bytes).digest('hex')});
}
await writeFile('reports/portfolio-audit/media-manifest.json',JSON.stringify(records,null,2));console.log(JSON.stringify(records.map(({output,width,height,sourceBytes,bytes})=>({output,width,height,sourceBytes,bytes})),null,2));
