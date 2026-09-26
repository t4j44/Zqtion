// LOCAL TEST FIXTURE ONLY. Never imported by the app. Real PGlite SQL/RLS, simulated Auth/Storage transport.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
const serviceKey = process.env.COMMUNITY_QA_SERVICE_KEY;
if (!serviceKey || serviceKey.length < 32) throw new Error("Start the local QA runner to generate a test-only service token.");
const db = new PGlite({ extensions: { pg_trgm } });
const users = Object.fromEntries(["alice", "bob", "new", "reviewer"].map((name, i) => [name, { id: `10000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`, email: `${name}@community.test`, aud: "authenticated", role: "authenticated", email_confirmed_at: "2026-09-25T00:00:00Z", created_at: "2026-09-25T00:00:00Z", app_metadata: {}, user_metadata: {} }]));
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create schema storage;
  create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
  create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
  create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security;`);
for (const user of Object.values(users)) await db.query("insert into auth.users values($1,$2,$3)", [user.id, user.email, user.email_confirmed_at]);
for (const file of ["004_community_v1.sql", "005_community_similarity.sql", "006_community_profile_portfolio.sql", "007_community_public_search_hardening.sql"]) await db.exec(await readFile(new URL(`../../supabase/migrations/${file}`, import.meta.url), "utf8"));
async function run(user, query, values = [], admin = false) {
  await db.exec("reset role"); await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user?.id || ""]);
  await db.exec(`set role ${admin ? "service_role" : user ? "authenticated" : "anon"}`);
  try { return await db.query(query, values); } finally { await db.exec("reset role"); }
}
const write = async (name, action, data) => (await run(users[name], "select community_write($1,$2::jsonb) result", [action, JSON.stringify(data)])).rows[0].result;
for (const name of ["alice", "bob", "reviewer"]) await write(name, "profile", { username: name, display_name: `Fixture ${name}`, linkedin_url: `https://www.linkedin.com/in/fixture-${name}`, avatar: "orbit", bio: "Local QA fixture profile. No real person or production contribution.", guidelines: "2026-09-v1" });
await db.query("insert into community_moderators values($1)", [users.reviewer.id]);
const post = { kind: "question", title: "How can I preserve product packaging in Gemini?", body: "LOCAL QA FIXTURE. I am editing a product photo and the label changes when I replace the background. What workflow preserves the original packaging and printed label while making a new scene?", category: "creative", tool: "Gemini", tags: ["packaging", "images"], prompt_text: "", media_ids: [] };
const question = await write("alice", "create", post);
const answer = await write("bob", "create", { ...post, kind: "answer", title: "", parent_id: question.id, body: "LOCAL QA FIXTURE. Mask the product before editing the background. Compare the final packaging against your original photograph before publishing." });
await write("alice", "accept", { id: question.id, answer_id: answer.id });
const prompt = await write("alice", "create", { ...post, kind: "prompt", title: "A studio-background prompt for product photos", body: "LOCAL QA FIXTURE. Use this brief to change a product photograph background. Preserve all printed text and package geometry, then compare the result to the supplied reference before publishing.", prompt_text: "Keep the product and label unchanged. Replace only the background with a plain blue studio backdrop." });

const files = new Map(); let chain = Promise.resolve();
// Explicitly local content to exercise overflow, portfolios, nested threads and pagination.
const longBody="LOCAL QA FIXTURE. " + "I tested a repeatable workflow, compared the output with the original reference, recorded the settings, and checked the limitations before sharing. ".repeat(12);
const experience=await write("alice","create",{...post,kind:"experience",title:"What I learned from a repeatable AI image workflow",body:longBody});
const showcase=await write("alice","create",{...post,kind:"showcase",title:"A carefully reviewed product scene experiment",body:"LOCAL QA FIXTURE. A scene experiment showing the difference between preserving package pixels and generating a completely new product. This example describes a process, not a commercial outcome."});
const imageId="60000000-0000-4000-8000-000000000001";
const fixtureImage=await sharp({create:{width:800,height:520,channels:3,background:{r:22,g:49,b:66}}}).webp().toBuffer();
files.set("qa-showcase.webp",fixtureImage);
await db.query("insert into community_media(id,owner_id,entry_id,purpose,path,mime_type,size_bytes,alt,status) values($1,$2,$3,'result','qa-showcase.webp','image/webp',$4,'LOCAL QA: abstract blue studio background','approved')",[imageId,users.alice.id,showcase.id,fixtureImage.length]);
const resultId="60000000-0000-4000-8000-000000000002";
await db.query("insert into community_entries(id,author_id,kind,title,body,category,parent_id,root_id,status) values($1,$2,'result','',$3,'creative',$4,$4,'published')",[resultId,users.alice.id,"LOCAL QA FIXTURE. A blue-background result, reviewed against the reference image. This is a local test illustration, not a real user result.",prompt.id]);
files.set("qa-result.webp",fixtureImage);
await db.query("insert into community_media(id,owner_id,entry_id,purpose,path,mime_type,size_bytes,alt,status) values('60000000-0000-4000-8000-000000000003',$1,$2,'result','qa-result.webp','image/webp',$3,'LOCAL QA: prompt result placeholder','approved')",[users.alice.id,resultId,fixtureImage.length]);
const comment=await write("bob","create",{...post,kind:"comment",title:"",parent_id:question.id,body:"LOCAL QA FIXTURE comment. This workflow still needs a final visual check, especially for tiny lettering on the packaging."});
const reply=await write("alice","create",{...post,kind:"comment",title:"",parent_id:comment.id,body:"LOCAL QA FIXTURE reply. I compare the small lettering against the reference at full size."});
await write("bob","create",{...post,kind:"comment",title:"",parent_id:reply.id,body:"LOCAL QA FIXTURE nested reply. That is useful context for evaluating the output."});
for(let i=0;i<24;i++) {
  await db.query("insert into community_entries(author_id,kind,title,body,category,tool,status,created_at) values($1,'tip',$2,$3,'creative','Gemini','published',now()-($4::int * interval '1 hour'))",[users.alice.id,`Local QA portfolio workflow note ${i+1}`,`LOCAL QA FIXTURE ${i+1}. `+longBody,i+1]);
}
for(let i=0;i<12;i++) await db.query("insert into community_entries(author_id,kind,title,body,category,parent_id,root_id,status,created_at) values($1,'comment','',$2,'creative',$3,$3,'published',now()-($4::int * interval '1 minute'))",[users.bob.id,`LOCAL QA pagination comment ${i+1}. Please verify the complete workflow against the reference.`,question.id,i+1]);
for(const entry of [prompt,experience,showcase]) await run(users.alice,"select community_portfolio_write('feature',$1::jsonb)",[JSON.stringify({id:entry.id})]);

const fixtureState={users,resultId};
for(const [key,receipt] of Object.entries({question,prompt,answer,experience,showcase,comment,reply})) fixtureState[key]=(await db.query("select * from community_entries where id=$1",[receipt.id])).rows[0];
const json = (response, data, status = 200) => { response.statusCode = status; response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify(data)); };
const sqlName = s => { if (!/^[a-z_][a-z_0-9]*$/.test(s)) throw new Error("Invalid identifier"); return `"${s}"`; };
const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3219"); res.setHeader("Access-Control-Allow-Headers", "authorization,apikey,content-type,x-client-info,prefer,accept,x-supabase-api-version,accept-profile,content-profile,x-retry-count"); res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,POST,PATCH,DELETE,OPTIONS"); res.setHeader("Access-Control-Expose-Headers", "Content-Range");
  if (req.method === "OPTIONS") { res.end(); return; }
  const url = new URL(req.url, "http://127.0.0.1:4319"); const chunks = []; for await (const part of req) chunks.push(part); const bytes = Buffer.concat(chunks);
  const token = (req.headers.authorization || "").replace(/^Bearer /, ""); const name = token.replace(/^fixture-/, ""); const user = users[name]; const admin = token === serviceKey;
  const session = u => ({ access_token: `fixture-${Object.keys(users).find(k => users[k].id === u.id)}`, refresh_token: "fixture-refresh", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: u });
  try {
    if (url.pathname === "/__fixtures") return json(res, fixtureState);
    if (url.pathname.startsWith("/auth/v1/")) {
      const body = bytes.length ? JSON.parse(bytes.toString()) : {};
      if (url.pathname.endsWith("/token")) { const u = Object.values(users).find(u => u.email === body.email); return u ? json(res, session(u)) : json(res, { msg: "Invalid fixture login" }, 400); }
      if (url.pathname.endsWith("/user")) return user ? json(res, user) : json(res, { msg: "No test session" }, 401);
      return json(res, {});
    }
    if (url.pathname.startsWith("/storage/v1/object/")) {
      if (!admin) return json(res, { error: "No storage permission" }, 403);
      const path = decodeURIComponent(url.pathname.replace(/^\/storage\/v1\/object\/(authenticated\/)?community\/?/, ""));
      if (req.method === "POST") { files.set(path, bytes); return json(res, { Key: `community/${path}` }); }
      if (req.method === "DELETE") { for (const p of JSON.parse(bytes.toString()).prefixes || []) files.delete(p); return json(res, []); }
      if (!files.has(path)) return json(res, { error: "Not found" }, 404);
      res.setHeader("Content-Type", "image/webp"); res.end(files.get(path)); return;
    }
    const job = async () => {
      if (url.pathname.startsWith("/rest/v1/rpc/")) {
        const fn = url.pathname.split("/").pop(); if (!/^community_[a-z_]+$/.test(fn)) throw new Error("Unsupported RPC");
        const body = bytes.length ? JSON.parse(bytes.toString()) : {}; const keys = Object.keys(body); const vals = Object.values(body).map(v => v && typeof v === "object" && !Array.isArray(v) ? JSON.stringify(v) : v);
        const args = keys.map((k, i) => `${sqlName(k)} => $${i + 1}`).join(",");
        const scalar = ["community_write", "community_portfolio_write", "community_is_moderator", "community_profile_stats"].includes(fn);
        const result = await run(user, scalar ? `select public.${sqlName(fn)}(${args}) result` : `select * from public.${sqlName(fn)}(${args})`, vals, admin);
        return { rows: scalar ? result.rows[0].result : result.rows };
      }
      const table = url.pathname.split("/").pop(); if (!/^community_[a-z_]+$/.test(table)) throw new Error("Unsupported table");
      if (req.method === "POST") {
        const body = JSON.parse(bytes.toString()); const keys = Object.keys(body); await run(user, `insert into public.${sqlName(table)}(${keys.map(sqlName)}) values(${keys.map((_, i) => `$${i + 1}`).join(",")})`, Object.values(body), admin); return { rows: null };
      }
      const vals = []; const filters = [];
      for (const [key, value] of url.searchParams) {
        if (["select", "order", "offset", "limit"].includes(key)) continue;
        const column = sqlName(key);
        if (value === "is.null") { filters.push(`${column} is null`); continue; }
        if (value.startsWith("in.(")) { const list = value.slice(4, -1).split(",").map(x => x.replace(/^"|"$/g, "")); filters.push(`${column} in (${list.map(v => { vals.push(v); return `$${vals.length}`; }).join(",")})`); continue; }
        const dot = value.indexOf("."); const op = { eq: "=", neq: "<>", gt: ">", gte: ">=" }[value.slice(0, dot)]; if (!op) throw new Error("Unsupported filter"); vals.push(value.slice(dot + 1)); filters.push(`${column}${op}$${vals.length}`);
      }
      const where = filters.length ? ` where ${filters.join(" and ")}` : "";
      const fields = url.searchParams.get("select") || "*"; const selected = fields === "*" ? "*" : fields.split(",").map(sqlName).join(",");
      const count = (await run(user, `select count(*)::int n from public.${sqlName(table)}${where}`, vals, admin)).rows[0].n;
      const order = url.searchParams.get("order")?.split(",").map(v => { const [col, dir] = v.split("."); return `${sqlName(col)} ${dir === "desc" ? "desc" : "asc"}`; }).join(",");
      const limit = Math.min(Number(url.searchParams.get("limit") || 1000), 1000); const offset = Number(url.searchParams.get("offset") || 0);
      const result = await run(user, `select ${selected} from public.${sqlName(table)}${where}${order ? ` order by ${order}` : ""} limit ${limit} offset ${offset}`, vals, admin);
      return { rows: result.rows, count, offset };
    };
    const pending = chain.then(job); chain = pending.catch(() => {}); const result = await pending;
    if (result.count !== undefined) res.setHeader("Content-Range", `${result.offset}-${result.offset + Math.max(result.rows.length - 1, 0)}/${result.count}`);
    if (req.method === "HEAD") { res.end(); return; }
    return json(res, result.rows);
  } catch (error) { return json(res, { code: error.code || "FIXTURE_ERROR", message: error.message, details: null, hint: null }, 400); }
});
server.listen(4319, "127.0.0.1", () => console.log("Local SQL/RLS QA fixture backend: http://127.0.0.1:4319 (simulated Auth and Storage; no hosted writes)"));
process.on("SIGINT", async () => { server.close(); await db.close(); process.exit(0); });
