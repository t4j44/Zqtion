import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { moduleUrl } from "./helpers/typescript.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Compile TypeScript modules
const serviceUrl = await moduleUrl("lib/resources/service.ts");
const service = await import(serviceUrl);

const mcpUrl = await moduleUrl("lib/resources/mcp.ts", {
  "./service": serviceUrl
});
const { ZqtionMCPEngine } = await import(mcpUrl);

test("config/sources.yaml contains 30 cataloged sources with the 8 active anchor sources", async () => {
  const yamlPath = path.join(projectRoot, "config", "sources.yaml");
  const raw = await readFile(yamlPath, "utf8");

  // Basic YAML extraction without third-party module
  const idMatches = [...raw.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.equal(idMatches.length, 30, `Expected 30 cataloged sources, found ${idMatches.length}`);

  const activeAnchorSources = [
    "cindy-guides",
    "openai-cookbook",
    "anthropic-skills",
    "mcp-official-registry",
    "huggingface-agents",
    "github-agent-ecosystem",
    "n8n-workflows",
    "prompts-chat"
  ];

  for (const src of activeAnchorSources) {
    assert.ok(idMatches.includes(src), `Missing active anchor source: ${src}`);
  }
});

test("composeGoalSolution returns structured multi-resource stack for lead research & HubSpot goal", async () => {
  const goal = "I need an AI agent that researches companies, crawls their websites, identifies decision-makers and puts qualified leads into HubSpot. Budget $100/month.";
  const solution = await service.composeGoalSolution(goal, 100);

  assert.ok(solution, "Must return composed solution");
  assert.ok(solution.recommendedStack.length >= 4, "Must recommend at least 4 stack layers");

  // Verify stack roles
  const roles = solution.recommendedStack.map((s) => s.role.toLowerCase());
  assert.ok(roles.some((r) => r.includes("crawling")), "Stack must specify crawling layer (Crawl4AI)");
  assert.ok(roles.some((r) => r.includes("crm")), "Stack must specify CRM layer (HubSpot)");
  assert.ok(roles.some((r) => r.includes("orchestration")), "Stack must specify orchestration layer (n8n)");

  // Verify skills, repos, MCP, prompts, and workflow
  assert.ok(solution.skills.length >= 1, "Must include agent skills");
  assert.ok(solution.openSourceRepos.some((r) => r.name.includes("Crawl4AI")));
  assert.ok(solution.mcpServers.length >= 1, "Must include MCP servers");
  assert.ok(solution.prompts.length >= 1, "Must include engineered prompts");
  assert.ok(solution.workflow.length >= 4, "Must include step-by-step pipeline");
});

test("ZqtionMCPEngine.composeSolution tool returns valid MCP response envelope", async () => {
  const engine = new ZqtionMCPEngine();
  const envelope = await engine.composeSolution({
    goal: "Automate code reviews with token saving checkpoints",
    budgetMonthly: 50
  });

  assert.ok(envelope.resources.length > 0);
  const stack = envelope.resources[0];
  assert.ok(stack.goal.length > 0);
  assert.ok(stack.recommendedStack.length > 0);
  assert.ok(envelope.why.includes("Synthesizes tools, skills, open-source repos, MCP connectors"));
  assert.ok(envelope.evidence.length > 0);
});

test("Migration 009 executes on PostgreSQL with RLS and verifies source_registry table", async () => {
  const db = new PGlite();

  // Roles setup
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema if not exists auth;
  `);

  // Execute migration 008 first
  const sql008 = await readFile(path.join(projectRoot, "supabase", "migrations", "008_resource_intelligence.sql"), "utf8");
  await db.exec(sql008);

  // Execute migration 009
  const sql009 = await readFile(path.join(projectRoot, "supabase", "migrations", "009_source_registry_and_knowledge_graph.sql"), "utf8");
  await db.exec(sql009);

  // Verify tables created
  const tableRes = await db.query(`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_name in ('source_registry', 'composite_solution_stacks')
  `);
  assert.equal(tableRes.rows.length, 2);

  // Insert test source as service_role
  await db.exec("set role service_role");
  await db.exec(`
    insert into public.source_registry (
      id, name, domain, source_type, authority_level, ingestion_method, publication_policy
    ) values
    ('openai-cookbook', 'OpenAI Cookbook', 'developers.openai.com', 'official_docs', 'A_PRIMARY', 'structured_web', 'direct_sync');
  `);

  // Test RLS as anon: can read active sources
  await db.exec("set role anon");
  const anonRead = await db.query("select id, name, authority_level from public.source_registry");
  assert.equal(anonRead.rows.length, 1);
  assert.equal(anonRead.rows[0].id, "openai-cookbook");

  await db.exec("reset role");
});
