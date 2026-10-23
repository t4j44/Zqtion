import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

test("Resource catalogue preserves existing URLs and required content sections", async () => {
  const cataloguePath = path.join(projectRoot, "content", "resources", "catalogue.json");
  const raw = await readFile(cataloguePath, "utf8");
  const catalogue = JSON.parse(raw);

  assert.equal(Array.isArray(catalogue), true);
  assert.ok(catalogue.length >= 25, `Expected at least 25 items, got ${catalogue.length}`);

  const slugs = new Set();
  for (const item of catalogue) {
    assert.ok(item.id, "Missing ID");
    assert.ok(item.slug, "Missing slug");
    assert.ok(item.title, "Missing title");
    assert.ok(item.summary, "Missing summary");
    assert.ok(item.resource_type, "Missing resource_type");
    assert.ok(item.category, "Missing category");
    assert.ok(item.difficulty, "Missing difficulty");
    assert.ok(item.evidence_level, "Missing evidence_level");
    assert.ok(item.content_markdown, "Missing content_markdown");
    assert.equal(slugs.has(item.slug), false, `Duplicate slug: ${item.slug}`);
    slugs.add(item.slug);

    // Verify Create-Build-Automate categorization
    assert.ok(
      ["create", "build", "automate", "research", "productivity", "agents"].includes(item.category),
      `Invalid category: ${item.category}`
    );

    // Verify Markdown has 15-question framework sections
    assert.ok(item.content_markdown.includes("## What You Will Build"));
    assert.ok(item.content_markdown.includes("## Who This Is For"));
    assert.ok(item.content_markdown.includes("## Architecture & Data Flow"));
    assert.ok(item.content_markdown.includes("## Step-by-Step Implementation"));
    assert.ok(item.content_markdown.includes("## Common Failures"));
  }
});

test("Historical research reports and content backlog remain available without certifying their claims", async () => {
  const crawlSummaryPath = path.join(projectRoot, "reports", "cindy-resource-crawl-summary.md");
  const oppGapPath = path.join(projectRoot, "reports", "zqtion-resource-opportunities.md");
  const queuePath = path.join(projectRoot, "reports", "zqtion-initial-content-queue.json");

  const crawlSummary = await readFile(crawlSummaryPath, "utf8");
  const oppGap = await readFile(oppGapPath, "utf8");
  const queue = JSON.parse(await readFile(queuePath, "utf8"));

  assert.ok(crawlSummary.includes("250"));
  assert.ok(crawlSummary.includes("Crawl4AI"));
  assert.ok(oppGap.includes("User Value × Search/Discovery Opportunity"));
  assert.ok(queue.length >= 25, `Expected at least 25 queue items, got ${queue.length}`);
});
