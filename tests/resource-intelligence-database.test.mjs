import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("Resource Intelligence migration 008 executes on PostgreSQL with RLS", async () => {
  const db = new PGlite();

  // Set up Supabase roles and schemas
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema if not exists auth;
  `);

  // Execute migration 008
  const migrationSql = await readFile(
    new URL("../supabase/migrations/008_resource_intelligence.sql", import.meta.url),
    "utf8"
  );
  await db.exec(migrationSql);

  // 1. Verify tables created
  const tableCheck = await db.query(`
    select table_name from information_schema.tables
    where table_schema in ('public', 'resource_private')
      and table_name in ('resource_items', 'resource_relationships', 'resource_sources', 'crawl_pages')
  `);
  assert.equal(tableCheck.rows.length, 4);

  // 2. Insert test data as service_role
  await db.exec("set role service_role");

  const insertRes = await db.query(`
    insert into public.resource_items (
      slug, title, summary, resource_type, category, difficulty, evidence_level, status, tags, tools
    ) values
    ('crawl4ai-framework', 'Crawl4AI Web Scraping Framework', 'Open-source LLM-friendly web crawler and data extraction engine.', 'repository', 'automate', 'intermediate', 'verified', 'published', array['scraping', 'crawler'], array['Crawl4AI']),
    ('draft-unverified-prompt', 'Draft Lead Gen Prompt', 'Internal draft prompt for prospecting.', 'prompt', 'automate', 'beginner', 'unverified', 'draft', array['lead-gen'], array['Claude'])
    returning id, slug, status
  `);
  assert.equal(insertRes.rows.length, 2);

  // 3. Test RLS as anon: only published items should be visible
  await db.exec("set role anon");
  const anonRead = await db.query("select slug, title, status from public.resource_items");
  assert.equal(anonRead.rows.length, 1);
  assert.equal(anonRead.rows[0].slug, "crawl4ai-framework");

  // Anon cannot read from private schema
  await assert.rejects(
    db.query("select * from resource_private.crawl_pages"),
    /permission denied/
  );

  // 4. Test public search RPC
  const searchRes = await db.query(
    "select * from public.resource_search($1, $2, $3, $4, $5, $6)",
    ["crawler", "", "", "", 10, 0]
  );
  assert.equal(searchRes.rows.length, 1);
  assert.equal(searchRes.rows[0].slug, "crawl4ai-framework");

  // Search for draft term should return 0 rows for anon
  const draftSearch = await db.query(
    "select * from public.resource_search($1, $2, $3, $4, $5, $6)",
    ["Draft Lead Gen", "", "", "", 10, 0]
  );
  assert.equal(draftSearch.rows.length, 0);

  await db.exec("reset role");
});
