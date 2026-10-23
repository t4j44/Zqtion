// Credential-isolated loopback preview. Production/provider settings are never read or changed.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const fallback=process.argv.includes('--fallback');
Object.assign(process.env,{NEXT_PUBLIC_INQUIRY_FALLBACK_ENABLED:String(fallback),NEXT_PUBLIC_TURNSTILE_SITE_KEY:'local-contact-qa-site-key',TURNSTILE_SECRET_KEY:'',INQUIRY_FROM_EMAIL:'',INQUIRY_TO_EMAIL:'',RATE_LIMIT_SECRET:''});
await mkdir('reports/contact-hero',{recursive:true});
await writeFile('reports/contact-hero/preview-mode.json',JSON.stringify({fallback,scope:'Loopback fixture providers; fake public site key. Not hosted Turnstile/email acceptance.'},null,2)+'\n');
// Reuse the existing fixture lifecycle, overrides and refusal to replace occupied ports.
await readFile('scripts/ui-preview.mjs','utf8');
// The existing runner blanks the public key; set the QA key only on the child env.
let source=await readFile('scripts/ui-preview.mjs','utf8');
source=source.replace("NEXT_PUBLIC_TURNSTILE_SITE_KEY: ''","NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'local-contact-qa-site-key'");
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
