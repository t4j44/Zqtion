import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";

const ids = { alice: "00000000-0000-4000-8000-000000000001", bob: "00000000-0000-4000-8000-000000000002", unverified: "00000000-0000-4000-8000-000000000003", mod: "00000000-0000-4000-8000-000000000004" };
const db = new PGlite({ extensions: { pg_trgm } });
async function as(user, sql, params = []) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [ids[user] || ""]);
  await db.exec(`set role ${user ? "authenticated" : "anon"}`);
  try { return await db.query(sql, params); } finally { await db.exec("reset role"); }
}
async function write(user, action, data) { return (await as(user, "select public.community_write($1,$2::jsonb) as result", [action, JSON.stringify(data)])).rows[0].result; }
const payload = (overrides = {}) => ({ kind: "question", title: "How can I preserve packaging when editing AI images?", body: "I am editing a product photo and the label changes between outputs. I need a repeatable way to preserve the label and the package shape. What settings or workflow have you tested?", category: "creative", tool: "Gemini", tags: ["images"], prompt_text: "", media_ids: [], ...overrides });
const profile = (username) => ({ username, display_name: `Member ${username}`, linkedin_url: `https://www.linkedin.com/in/${username}`, avatar: "orbit", bio: "AI workflows and practical learning.", guidelines: "2026-09-v1" });
let question; let answer; let prompt;
test("Community migrations execute on PostgreSQL with RLS", async () => {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create schema storage;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security; grant usage on schema storage to anon,authenticated;
    grant select,insert,update,delete on storage.objects to anon,authenticated;
    create policy simulated_existing_broad_policy on storage.objects for all using(true) with check(true);`);
  for (const [name, id] of Object.entries(ids)) await db.query("insert into auth.users values($1,$2,$3)", [id, `${name}@private.example`, name === "unverified" ? null : "2026-09-25T00:00:00Z"]);
  for (const file of ["004_community_v1.sql", "005_community_similarity.sql", "006_community_profile_portfolio.sql", "007_community_public_search_hardening.sql"]) await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), "utf8"));
  assert.equal((await db.query("select count(*)::int n from pg_class where relname like 'community_%' and relkind='r' and relrowsecurity")).rows[0].n, 13);
});
test("Unverified and anonymous users cannot create profiles; identity is not caller-controlled", async () => {
  await assert.rejects(write("unverified", "profile", profile("unverified")), /Verify your email/);
  await assert.rejects(write("", "profile", profile("anonymous")), /permission denied/);
  await assert.rejects(write("alice", "upload_slot", { purpose: "result" }), /Complete your community profile/);
  assert.equal((await write("alice", "upload_slot", { purpose: "profile" })).ok, true);
  const p = await write("alice", "profile", { ...profile("alice"), id: ids.bob });
  assert.equal(p.id, ids.alice);
  await write("bob", "profile", profile("bob")); await write("mod", "profile", profile("reviewer"));
  await db.query("insert into public.community_moderators values($1)", [ids.mod]);
  await assert.rejects(write("bob", "profile", profile("alice")), /unique/);
  await assert.rejects(write("bob", "profile", { ...profile("bob"), linkedin_url: "https://linkedin.com.evil.example/in/bob" }), /check constraint/);
  await assert.rejects(write("bob", "profile", { ...profile("bob"), guidelines: null }), /Accept the community guidelines/);
  await assert.rejects(write("bob", "profile", { ...profile("bob"), unused: "x".repeat(180001) }), /payload is invalid or too large/);
});
test("Public profile has no email; public cannot access reports, saves or direct writes", async () => {
  const result = await as("", "select * from community_profiles");
  assert.equal(result.rows.length, 3); assert.ok(!JSON.stringify(result).includes("private.example"));
  for (const table of ["community_saves", "community_reports", "community_moderators", "community_restrictions", "community_rate_limits"]) await assert.rejects(as("", `select * from ${table}`), /permission denied/);
  await assert.rejects(as("bob", "update community_profiles set display_name='Hijacked'"), /permission denied/);
  await assert.rejects(as("bob", "insert into community_moderators values($1)", [ids.bob]), /permission denied/);
  await assert.rejects(as("bob", "insert into storage.objects(bucket_id,name) values('community','bypass.webp')"), /row-level security/);
  await db.exec("insert into storage.objects(bucket_id,name) values('community','private.webp')");
  assert.equal((await as("", "select * from storage.objects")).rows.length, 0);
});
test("Create public content; ownership, votes, saves, accepted-answer scope and private data", async () => {
  question = await write("alice", "create", payload());
  assert.equal(question.status, "published");
  await assert.rejects(write("bob", "edit", { ...payload(), id: question.id }), /cannot edit/);
  await assert.rejects(write("bob", "delete", { id: question.id }), /only delete your own/);
  await assert.rejects(write("alice", "vote", { id: question.id, active: true }), /own contribution/);
  await write("bob", "vote", { id: question.id, active: true }); await write("bob", "vote", { id: question.id, active: true });
  assert.equal((await as("", "select * from community_counts($1)", [[question.id]])).rows[0].votes, 1);
  await write("alice", "save", { id: question.id, active: true });
  assert.equal((await as("bob", "select * from community_saves")).rows.length, 0);
  assert.equal((await as("alice", "select * from community_saves")).rows.length, 1);
  answer = await write("bob", "create", payload({ kind: "answer", title: "", parent_id: question.id, body: "Mask the packaging before editing. Keep an original layer and compare the label at full size." }));
  await assert.rejects(write("bob", "accept", { id: question.id, answer_id: answer.id }), /Only the question author/);
  await write("alice", "accept", { id: question.id, answer_id: answer.id });
  assert.equal((await as("", "select accepted_answer_id from community_entries where id=$1", [question.id])).rows[0].accepted_answer_id, answer.id);
});
test("Comment targets and two levels of replies are enforced", async () => {
  let parent = await write("alice", "create", payload({ kind: "comment", title: "", parent_id: answer.id, body: "Thanks for explaining the masking workflow." }));
  for (let i = 1; i <= 2; i++) parent = await write("bob", "create", payload({ kind: "comment", title: "", parent_id: parent.id, body: `Follow-up detail number ${i}.` }));
  await assert.rejects(write("alice", "create", payload({ kind: "comment", title: "", parent_id: parent.id, body: "This nesting is too deep." })), /two levels/);
  await assert.rejects(write("alice", "create", payload({ kind: "answer", title: "", parent_id: answer.id })), /Answers belong/);
});
test("Duplicate checks block exact reposts but allow different questions sharing a title", async () => {
  await assert.rejects(write("bob", "create", payload()), /exact contribution/);
  const another = await write("bob", "create", payload({ body: "A different packaging experiment with a different objective and different source images." }));
  assert.ok(another.id);
  const results = await as("", "select id from community_search($1,'','','','{}',0,true)", ["preserve packaging"]);
  assert.ok(results.rows.some(r => r.id === question.id));
  assert.equal((await as("", "select * from community_indexable($1)", [[question.id]])).rows.length, 0);
});
test("Prompts, ratings, remix provenance and source preservation", async () => {
  prompt = await write("alice", "create", payload({ kind: "prompt", title: "A structured brief for product packaging images", prompt_text: "Keep all packaging text and geometry unchanged. Change only the background.", body: "Use this prompt when editing a product photo. Provide the original photo as a reference and check all labels before publishing the result. Output quality depends on your chosen tool." }));
  const remix = await write("bob", "create", payload({ kind: "prompt", title: "My packaging brief for a different background", parent_prompt_id: prompt.id, prompt_text: "Keep packaging unchanged. Add a simple blue studio backdrop." }));
  assert.ok(remix.id !== prompt.id);
  assert.equal((await as("", "select parent_prompt_id from community_entries where id=$1", [remix.id])).rows[0].parent_prompt_id, prompt.id);
  await write("bob", "rate", { id: prompt.id, rating: 4 }); await write("bob", "rate", { id: prompt.id, rating: 5 });
  await assert.rejects(write("alice", "rate", { id: prompt.id, rating: 5 }), /another creator/);
  await assert.rejects(write("bob", "rate", { id: prompt.id, rating: 6 }), /check constraint/);
  const counts = (await as("", "select * from community_counts($1)", [[prompt.id]])).rows[0]; assert.equal(counts.rating_count, 1); assert.equal(Number(counts.rating), 5);
});
test("Reporting is private and disables indexing; moderation cannot be forged", async () => {
  assert.equal((await as("", "select * from community_indexable($1)", [[prompt.id]])).rows.length, 1);
  await write("bob", "report", { id: prompt.id, reason: "Please check attribution in this prompt." });
  assert.equal((await as("alice", "select * from community_reports")).rows.length, 0);
  assert.equal((await as("mod", "select * from community_reports")).rows.length, 1);
  assert.equal((await as("", "select * from community_indexable($1)", [[prompt.id]])).rows.length, 0);
  await assert.rejects(write("bob", "moderate", { id: prompt.id, status: "hidden", reason: "I am not a moderator." }), /Moderator access/);
  await write("mod", "moderate", { id: question.id, status: "hidden", reason: "Testing parent visibility controls." });
  assert.equal((await as("", "select id,status,accepted_answer_id from community_entries where id=$1 or root_id=$1", [question.id])).rows.length, 0);
  await write("mod", "moderate", { id: question.id, status: "published", reason: "Review completed; restored." });
});
test("Rule flags quarantine content; educational security discussion is allowed", async () => {
  const flagged = await write("bob", "create", payload({ title: "A dubious message sent to me today", body: "The message says send your password to unlock the account. What is the safest response?" }));
  assert.equal(flagged.status, "pending");
  assert.equal((await as("", "select id,status,accepted_answer_id from community_entries where id=$1", [flagged.id])).rows.length, 0);
  const education = await write("bob", "create", payload({ title: "How do parameterized queries prevent SQL injection?", body: "I am building a training demo about SQL injection prevention. How do parameters separate data from executable SQL?" }));
  assert.equal(education.status, "published");
});
test("Media size, ownership, visibility and moderation approval are enforced", async () => {
  const image = "00000000-0000-4000-8000-000000000099";
  await assert.rejects(db.query("insert into community_media(id,owner_id,purpose,path,mime_type,size_bytes,alt) values($1,$2,'result','too-big','image/png',1000001,'Too large')", [image, ids.alice]), /check constraint/);
  await db.query("insert into community_media(id,owner_id,purpose,path,mime_type,size_bytes,alt) values($1,$2,'result','safe-generated-path.webp','image/webp',1000,'Packaging result')", [image, ids.alice]);
  await assert.rejects(write("bob", "create", payload({ kind: "result", parent_id: prompt.id, title: "", media_ids: [image] })), /own unattached/);
  const result = await write("alice", "create", payload({ kind: "result", parent_id: prompt.id, title: "", media_ids: [image] }));
  assert.equal(result.status, "pending");
  assert.equal((await as("", "select id from community_media where id=$1", [image])).rows.length, 0);
  await assert.rejects(write("mod", "moderate", { id: result.id, status: "published", reason: "Has an unreviewed image." }), /Review every/);
  await write("mod", "moderate_media", { id: image, status: "approved", reason: "Image reviewed and accepted." });
  await write("mod", "moderate", { id: result.id, status: "published", reason: "Result approved after image review." });
  assert.equal((await as("", "select id from community_media where id=$1", [image])).rows.length, 1);
  await write("alice", "delete", { id: result.id });
  assert.equal((await as("", "select id from community_media where id=$1", [image])).rows.length, 0);
});

const portfolio = async (who, action, data) => (await as(who, "select community_portfolio_write($1,$2::jsonb) result", [action, JSON.stringify(data)])).rows[0].result;
const featuredIds = Array.from({length: 7}, (_, i) => `20000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`);
test("Featured work requires verified ownership, public approval, and RPC-only writes", async () => {
  for (let i=0;i<7;i++) await db.query("insert into community_entries(id,author_id,kind,title,body,category,status) values($1,$2,'tip',$3,$4,'general','published')", [featuredIds[i], ids.alice, `Portfolio fixture contribution ${i}`, `Public portfolio fixture ${i}. ` + "Meaningful public context. ".repeat(6)]);
  await assert.rejects(portfolio("", "feature", {id: featuredIds[0]}), /permission denied/);
  await assert.rejects(portfolio("unverified", "feature", {id: featuredIds[0]}), /Verify/);
  await assert.rejects(portfolio("bob", "feature", {id: featuredIds[0], profile_id: ids.alice}), /own approved/);
  await assert.rejects(as("alice", "insert into community_profile_featured values($1,$2,1,now())", [ids.alice,featuredIds[0]]), /permission denied/);
  await db.query("update community_entries set status='pending' where id=$1", [featuredIds[0]]);
  await assert.rejects(portfolio("alice", "feature", {id: featuredIds[0]}), /own approved/);
  await db.query("update community_entries set status='published' where id=$1", [featuredIds[0]]);
  await portfolio("alice", "feature", {id: featuredIds[0], profile_id: ids.bob});
  assert.equal((await as("", "select * from community_profile_featured")).rows[0].profile_id, ids.alice);
});
test("Six featured slots, idempotency, complete reorder and ownership are database enforced", async () => {
  for (const id of featuredIds.slice(0,6)) await portfolio("alice", "feature", {id});
  await portfolio("alice", "feature", {id: featuredIds[0]});
  await assert.rejects(portfolio("alice", "feature", {id: featuredIds[6]}), /up to six/);
  assert.equal((await as("", "select * from community_profile_featured")).rows.length,6);
  const order=featuredIds.slice(0,6).reverse(); await portfolio("alice", "reorder_featured", {ids:order});
  assert.deepEqual((await as("", "select entry_id from community_profile_featured order by position")).rows.map(r=>r.entry_id),order);
  await assert.rejects(portfolio("alice", "reorder_featured", {ids:[order[0],order[0],...order.slice(2)]}), /selection changed/);
  await assert.rejects(portfolio("bob", "reorder_featured", {ids:order}), /selection changed/);
  await portfolio("bob", "unfeature", {id:order[0]});
  assert.equal((await as("", "select * from community_profile_featured")).rows.length,6);
});
test("Featured visibility follows moderation, attachments and ancestor withdrawal immediately", async () => {
  await db.query("update community_entries set status='hidden' where id=$1",[featuredIds[0]]);
  assert.equal((await as("", "select * from community_profile_featured")).rows.length,5);
  await portfolio("alice", "feature", {id:featuredIds[6]});
  assert.equal((await as("", "select * from community_profile_featured")).rows.length,6);
  await portfolio("alice", "unfeature", {id:featuredIds[6]});
  await portfolio("bob", "feature", {id:answer.id});
  await db.query("update community_entries set status='hidden' where id=$1",[question.id]);
  assert.equal((await as("", "select * from community_profile_featured where entry_id=$1",[answer.id])).rows.length,0);
  await db.query("update community_entries set status='published' where id=$1",[question.id]);
  await db.query("update community_entries set moderation_reason='Review required' where id=$1",[featuredIds[1]]);
  assert.equal((await as("", "select * from community_profile_featured where entry_id=$1",[featuredIds[1]])).rows.length,0);
  const photo='30000000-0000-4000-8000-000000000001';
  await db.query("insert into community_media(id,owner_id,entry_id,purpose,path,mime_type,size_bytes,alt) values($1,$2,$3,'result','portfolio-test.webp','image/webp',100,'Fixture')",[photo,ids.alice,featuredIds[2]]);
  assert.equal((await as("", "select * from community_profile_featured where entry_id=$1",[featuredIds[2]])).rows.length,0);
});
test("Conversation queries are bounded, public-only, ordered, and exclude the accepted duplicate", async () => {
  const publicChildren=(await as("", "select * from community_children($1,'top',0,$2)",[question.id,answer.id])).rows;
  assert.ok(!publicChildren.some(e=>e.id===answer.id)); assert.ok(publicChildren.length<=11);
  await db.query("update community_entries set status='hidden' where id=$1",[question.id]);
  assert.equal((await as("", "select * from community_children($1,'newest',0,null)",[question.id])).rows.length,0);
  await db.query("update community_entries set status='published' where id=$1",[question.id]);
  const stats=(await as("", "select community_profile_stats($1) stats",[ids.alice])).rows[0].stats;
  for (const key of ['posts','prompts','answers','accepted_answers','upvotes','experiences','results']) assert.equal(typeof stats[key], 'number');
  assert.ok(!JSON.stringify(stats).includes('private.example'));
});
test("Contributor search is labelled public data, bounded, and respects hidden ancestors", async () => {
  const people=(await as("", "select * from community_search_people('alice')")).rows;
  assert.equal(people.length,1);assert.ok(!Object.hasOwn(people[0],'email'));
  assert.equal((await as("", "select * from community_search_people('a')")).rows.length,0);
  const found=(await as("", "select * from community_search_answers('background')")).rows;
  assert.ok(found.length<=5);assert.ok(found.every(e=>e.kind==='answer'));
  await db.query("update community_entries set status='hidden' where id=$1",[question.id]);
  assert.ok(!(await as("", "select * from community_search_answers('background')")).rows.some(e=>e.id===answer.id));
  await db.query("update community_entries set status='published' where id=$1",[question.id]);
});
test("Public RPC projections never expand when private columns are added", async () => {
  await db.exec("alter table community_profiles add column future_private_note text default 'PRIVATE-PROFILE'; alter table community_entries add column future_private_note text default 'PRIVATE-ENTRY'");
  try {
    const people=(await as("", "select * from community_search_people('alice')")).rows;
    assert.deepEqual(Object.keys(people[0]).sort(), ['id','username','display_name','linkedin_url','avatar','photo_id','bio'].sort());
    for (const [sql,params] of [
      ["select * from community_search()",[]],
      ["select * from community_search_answers('mask')",[]],
      ["select * from community_children($1)",[question.id]],
    ]) {
      const rows=(await as("",sql,params)).rows;
      assert.ok(rows.length > 0);
      for(const row of rows) for(const key of ['future_private_note','moderation_reason','search_vector','email']) assert.ok(!Object.hasOwn(row,key),key);
      assert.ok(!JSON.stringify(rows).includes('PRIVATE-'));
    }
    const functions=(await db.query("select proname,proconfig,prosrc from pg_proc join pg_namespace n on n.oid=pronamespace where n.nspname='public' and proname like 'community_%' and has_function_privilege('anon',pg_proc.oid,'EXECUTE')")).rows;
    for(const fn of functions) {
      assert.ok(fn.proconfig.some(c=>c.startsWith('search_path=')),fn.proname);
      assert.doesNotMatch(fn.prosrc,/select\s+(?:[a-z]+\.)?\*/i,fn.proname);
    }
  } finally { await db.exec("alter table community_profiles drop column future_private_note; alter table community_entries drop column future_private_note"); }
});

test("Direct REST-equivalent reads cannot reveal private columns or storage paths", async () => {
  for(const who of ['', 'alice', 'bob']) {
    await assert.rejects(as(who,"select moderation_reason from community_entries"),/permission denied/);
    await assert.rejects(as(who,"select path from community_media"),/permission denied/);
  }
  await assert.rejects(as("","select * from community_review_reasons($1)",[[featuredIds[1]]]),/permission denied/);
  assert.equal((await as("bob","select * from community_review_reasons($1)",[[featuredIds[1]]])).rows.length,0);
  assert.equal((await as("alice","select * from community_review_reasons($1)",[[featuredIds[1]]])).rows[0].moderation_reason,'Review required');
  assert.equal((await as("mod","select * from community_review_reasons($1)",[[featuredIds[1]]])).rows[0].moderation_reason,'Review required');
});

test("Profile metadata and sitemap gate excludes empty, restricted, unverified and fixture profiles", async () => {
  const eligible=async()=> (await as("", "select * from community_indexable_profiles($1)",[[ids.alice]])).rows;
  assert.equal((await eligible()).length,0);
  await db.query("update auth.users set email='member@portfolio-demo.localdomain' where id=$1",[ids.alice]);
  await db.query("update community_profiles set bio='Practical AI workflows with documented experiments and useful reviewed results.' where id=$1",[ids.alice]);
  assert.equal((await eligible()).length,1);
  assert.deepEqual(Object.keys((await eligible())[0]).sort(),['id','username','updated_at'].sort());
  await db.query("insert into community_restrictions(user_id,reason) values($1,'Local gate test')",[ids.alice]);
  assert.equal((await eligible()).length,0);
  await db.query("delete from community_restrictions where user_id=$1",[ids.alice]);
  await db.query("update auth.users set email_confirmed_at=null where id=$1",[ids.alice]);
  assert.equal((await eligible()).length,0);
  await db.query("update auth.users set email_confirmed_at=now() where id=$1",[ids.alice]);
  await db.query("update community_profiles set bio='LOCAL QA FIXTURE. A deliberately long local testing profile biography.' where id=$1",[ids.alice]);
  assert.equal((await eligible()).length,0);
  await db.query("update community_profiles set bio='Practical AI workflows with documented experiments and useful reviewed results.' where id=$1",[ids.alice]);
  await db.exec("begin");
  try {
    await db.query("update community_entries set status='hidden' where author_id=$1 and parent_id is null",[ids.alice]);
    assert.equal((await eligible()).length,0);
  } finally { await db.exec("rollback"); }
  assert.equal((await eligible()).length,1);
  assert.equal((await as("", "select * from community_indexable_profiles($1)",[Array(101).fill(ids.alice)])).rows.length,1);
});

test("Account restrictions are enforced; prompt soft deletion is valid", async () => {
  await write("mod", "restrict", { user_id: ids.bob, restricted: true, reason: "Repeated abuse reported and reviewed." });
  await assert.rejects(write("bob", "save", { id: prompt.id, active: true }), /cannot participate/);
  await assert.rejects(portfolio("bob", "feature", { id: answer.id }), /cannot participate/);
  await write("alice", "delete", { id: prompt.id });
  assert.equal((await as("", "select id,status,accepted_answer_id from community_entries where id=$1", [prompt.id])).rows.length, 0);
});
test("Fixed database rate limits cannot be inflated by caller-supplied limits", async () => {
  // One profile-photo slot was already consumed during onboarding.
  for (let i = 0; i < 11; i++) assert.equal((await write("alice", "upload_slot", { purpose: "result", max: 999999 })).ok, true);
  assert.equal((await write("alice", "upload_slot", { purpose: "result", max: 999999 })).code, 429);
  let limited = false;
  for (let i = 0; i < 21; i++) { const result = await write("alice", "create", payload({ title: `Rate-limit verification question number ${i}` })); if (result.code === 429) { limited = true; break; } }
  assert.equal(limited, true);
});
test.after(async () => { await db.close(); });
