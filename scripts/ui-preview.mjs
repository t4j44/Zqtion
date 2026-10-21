// Local QA only: override every provider endpoint before Next loads .env.local.
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
const env = { ...process.env, NEXT_PUBLIC_COMMUNITY_ENABLED: 'true',
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:4319',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'local-ui-qa-anon', SUPABASE_SECRET_KEY: randomBytes(32).toString('hex'),
  SUPABASE_SERVICE_ROLE_KEY: '', SUPABASE_URL: 'http://127.0.0.1:4319',
  RESEND_API_KEY: '', NEXT_PUBLIC_TURNSTILE_SITE_KEY: '', TURNSTILE_SECRET_KEY: '',
  NEXT_PUBLIC_ANALYTICS_ENABLED: 'false', LAUNCHPAD_APPLICATIONS_ENABLED: 'false',
  NEXT_PUBLIC_LAUNCHPAD_APPLICATIONS_ENABLED: 'false' };
env.COMMUNITY_QA_SERVICE_KEY = env.SUPABASE_SECRET_KEY;
const children = [];
function start(args) { const child = spawn(process.execPath, args, { env, stdio: 'inherit', windowsHide: true }); children.push(child); return child; }
async function ready(url) { for(let i=0;i<180;i++){try{if((await fetch(url)).ok)return;}catch{} await delay(500);} throw Error('Local preview not ready'); }
for (const port of [3219,4319]) { let occupied=false;try{await fetch(`http://127.0.0.1:${port}`);occupied=true;}catch{} if(occupied)throw Error(`Port ${port} occupied; refusing to replace an existing process`); }
try {
  start(['tests/community/qa-backend.mjs']); await ready('http://127.0.0.1:4319/__fixtures');
  const npmCli=path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
  const buildArgs=existsSync(npmCli)?[npmCli,'run','build']:['node_modules/next/dist/bin/next','build'];
  if (!process.argv.includes('--skip-build')) await new Promise((resolve,reject)=>{const c=start(buildArgs);c.on('exit',code=>code===0?resolve():reject(Error(`Build exit ${code}`)));c.on('error',reject);});
  const preview=start(['node_modules/next/dist/bin/next','start','--port','3219','--hostname','127.0.0.1']);
  await ready('http://127.0.0.1:3219/ai-experiences'); console.log('LOCAL_UI_PREVIEW_READY');
  await new Promise(resolve=>{ preview.on('exit',resolve); process.on('SIGINT',resolve); process.on('SIGTERM',resolve); });
} finally { for(const c of children)if(c.exitCode===null)c.kill(); }
