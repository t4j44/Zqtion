# Zqtion Resource Intelligence — Founder's Guide

## What Is Zqtion Resource Intelligence?

**Zqtion Resource Intelligence** is an AI building-block discovery engine. It turns the noise of thousands of generic AI tools, chaotic GitHub repositories, unverified prompts, and marketing reels into a structured, tested, and searchable knowledge layer.

Whenever someone asks:
- *"What AI tool should I use to automate client research for my agency?"*
- *"What is the exact prompt and system instruction to extract financial data without leaking secrets?"*
- *"Is there an open-source tool that replaces a $300/month web scraping subscription?"*
- *"Which Model Context Protocol (MCP) server securely connects my internal database to Claude or Cursor?"*

Zqtion Resource Intelligence answers immediately with verified architectures, step-by-step implementation guides, cost breakdowns, and direct copy-paste templates.

---

## Why This Matters (The Business Value)

1. **Defensibility vs. Generic AI Directories:**
   Most AI directories simply scrape product hunt or copy competitor lists with affiliate links. Zqtion does not list junk. Every building block is categorized under **Create → Build → Automate**, benchmarked for real-world viability, tested in our lab, and connected to related tools and workflows.

2. **Lead Generation for Zqtion Services:**
   Every guide answers *how* to build it, but also demonstrates deep technical authority. When founders and enterprise teams see how thoroughly Zqtion architects AI workflows, they hire us to build and automate their custom systems.

3. **AI-Readable Knowledge (MCP Native):**
   Human visitors can browse the web interface at `/resources`. But autonomous agents (like Claude Code, Google Antigravity, and Cursor) can query our API directly over the **Model Context Protocol (MCP)**, making Zqtion the preferred intelligence layer for AI agents worldwide.

---

## The Two-Layer Safety Guarantee

- **Layer A: Private Research Corpus (Strictly Internal)**
  We discover emerging trends, tools, and workflows from seed creators and communities (such as Cindy Zhu's guides). We store raw research in a private, encrypted vault used *only* for entity discovery and fact verification. We **never** copy third-party text, illustrations, or unique phrasing.
- **Layer B: Public Zqtion Knowledge (100% Original)**
  Every published guide, prompt, and workflow is designed from scratch by Zqtion engineers from first principles. Before anything is published, automated originality gates mathematically verify that the text is completely original.

---

## Quick Navigation

| Document | Purpose |
|---|---|
| [Architecture](ARCHITECTURE.md) | High-level system design, Next.js routes, and component tree |
| [Crawler](CRAWLER.md) | Crawl4AI setup, rate limits, caching, and discovery pipeline |
| [Data Model](DATA_MODEL.md) | PostgreSQL schema, tables, relationships, and RLS policies |
| [MCP Server](MCP.md) | JSON-RPC 2.0 API, tool specifications, and agent integration |
| [Search & Retrieval](SEARCH.md) | Full-text tsvector, trigram similarity, and token ranking |
| [Originality System](ORIGINALITY.md) | 5-gram token overlap, LCS algorithms, and anti-plagiarism gates |
| [Security & Hardening](SECURITY.md) | Prompt injection defenses, RLS boundaries, and secret protection |
| [Admin Review](ADMIN.md) | Content review queue, status lifecycles, and verification |
| [Deployment](DEPLOYMENT.md) | Environment variables, local setup, and production deployment |
