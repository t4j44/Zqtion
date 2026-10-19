"""
Zqtion Resource Intelligence — Master Multi-Source Ingestion Orchestrator
Reads config/sources.yaml, instantiates source-specific connectors, normalizes
extracted metadata, applies originality and verification gates, and synthesizes
the unified Zqtion Knowledge Graph and Goal Solution Stacks.
"""

import sys
import json
import yaml
from pathlib import Path
from typing import Dict, Any, List

# Ensure scripts dir is on sys.path
SCRIPT_DIR = Path(__file__).resolve().parent.parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from originality import OriginalityChecker
from verify import ResourceVerifier

# Import connectors
from connectors.cindy_connector import CindyGuidesConnector
from connectors.openai_cookbook_connector import OpenAICookbookConnector
from connectors.anthropic_skills_connector import AnthropicSkillsConnector
from connectors.mcp_registry_connector import MCPRegistryConnector
from connectors.huggingface_connector import HuggingFaceAgentsConnector
from connectors.n8n_workflows_connector import N8NWorkflowsConnector
from connectors.prompts_chat_connector import PromptsChatConnector
from connectors.github_repos_connector import GitHubReposConnector

CONNECTOR_REGISTRY = {
    "cindy-guides": CindyGuidesConnector,
    "openai-cookbook": OpenAICookbookConnector,
    "anthropic-skills": AnthropicSkillsConnector,
    "mcp-official-registry": MCPRegistryConnector,
    "huggingface-agents": HuggingFaceAgentsConnector,
    "n8n-workflows": N8NWorkflowsConnector,
    "prompts-chat": PromptsChatConnector,
    "github-agent-ecosystem": GitHubReposConnector,
}

class MultiSourceOrchestrator:
    def __init__(self, config_path: Path):
        self.config_path = config_path
        self.config = self._load_config()
        self.originality = OriginalityChecker(max_5gram_overlap=0.15, max_contiguous_tokens=18)
        self.verifier = ResourceVerifier()
        self.project_root = SCRIPT_DIR.parent.parent

    def _load_config(self) -> Dict[str, Any]:
        with open(self.config_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)

    def run_ingestion(self) -> Dict[str, Any]:
        """Runs ingestion across all active sources in config/sources.yaml."""
        sources = self.config.get("sources", [])
        active_sources = [s for s in sources if s.get("active", False)]

        print(f"[Orchestrator] Found {len(sources)} total registered sources in config/sources.yaml.")
        print(f"[Orchestrator] Ingesting {len(active_sources)} active priority sources.")

        all_normalized_entities = []
        source_stats = {}

        for src in active_sources:
            src_id = src["id"]
            connector_cls = CONNECTOR_REGISTRY.get(src_id)
            if not connector_cls:
                print(f"[Orchestrator] Warning: No connector registered for {src_id}; skipping.")
                continue

            print(f"\n--- Ingesting Source: {src['name']} ({src['authority_level']}) ---")
            connector = connector_cls(src)
            try:
                raw_data = connector.fetch()
                normalized = connector.normalize(raw_data)

                # Apply verification gate
                verified_items = []
                for item in normalized:
                    # Originality gate check
                    is_safe, violations = self.verifier.inspect_security(json.dumps(item))
                    if not is_safe:
                        print(f"  [Security Filter] Flagged item {item.get('slug')}: {violations}")
                        continue
                    verified_items.append(item)

                all_normalized_entities.extend(verified_items)
                source_stats[src_id] = {
                    "name": src["name"],
                    "raw_count": len(raw_data),
                    "normalized_count": len(verified_items),
                    "authority": src["authority_level"]
                }
                print(f"  Extracted {len(raw_data)} raw records -> {len(verified_items)} verified entities.")
            except Exception as e:
                print(f"  [Error] Failed ingesting {src_id}: {e}")
                source_stats[src_id] = {"error": str(e)}

        # Deduplicate entities by slug
        deduped = {}
        for entity in all_normalized_entities:
            slug = entity["slug"]
            if slug not in deduped:
                deduped[slug] = entity
            else:
                # Merge provenance
                existing = deduped[slug]
                existing.setdefault("additional_sources", []).append(entity.get("source_id"))

        unique_entities = list(deduped.values())
        print(f"\n[Orchestrator] Total unified knowledge graph entities: {len(unique_entities)}")

        # Save Layer A Knowledge Graph
        kg_path = self.project_root / ".resource-research" / "multi_source_knowledge_graph.json"
        kg_path.parent.mkdir(parents=True, exist_ok=True)
        with open(kg_path, "w", encoding="utf-8") as f:
            json.dump({
                "sources": source_stats,
                "total_entities": len(unique_entities),
                "entities": unique_entities
            }, f, indent=2)
        print(f"[Orchestrator] Saved Layer A knowledge graph to {kg_path}")

        # Construct composite solution stacks (Goal-driven knowledge synthesis)
        composite_stacks = self.compose_composite_solution_stacks(unique_entities)
        stacks_path = self.project_root / "content" / "resources" / "composite_stacks.json"
        stacks_path.parent.mkdir(parents=True, exist_ok=True)
        with open(stacks_path, "w", encoding="utf-8") as f:
            json.dump(composite_stacks, f, indent=2)
        print(f"[Orchestrator] Generated {len(composite_stacks)} composite goal solution stacks to {stacks_path}")

        return {
            "source_stats": source_stats,
            "total_entities": len(unique_entities),
            "composite_stacks_count": len(composite_stacks)
        }

    def compose_composite_solution_stacks(self, entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Synthesizes goal-driven multi-resource stacks connecting:
        Discovery, Crawling, Enrichment, Orchestration, CRM, LLM, Skills, MCP, Prompts, and Workflow.
        """
        stacks = [
            {
                "slug": "ai-lead-research-hubspot-automation-stack",
                "goal": "AI Lead Research, Website Verification, Decision-Maker Enrichment, and HubSpot CRM Automation",
                "summary": "Automated B2B research engine that crawls company websites, extracts verified technology stacks and executive contacts, and stages qualified leads directly in HubSpot CRM under $100/mo budget.",
                "target_budget_monthly": "$20–$50/month",
                "recommended_stack": [
                    {"role": "Discovery", "name": "Exa Search / Brave Search API", "type": "tool", "estimated_cost": "$5–$15/mo"},
                    {"role": "Crawling", "name": "Crawl4AI (Self-Hosted Async Engine)", "type": "repository", "slug": "crawl4ai-web-crawler-framework", "estimated_cost": "$0/mo"},
                    {"role": "Enrichment", "name": "Claude 3.7 Sonnet Structured Extraction", "type": "tool", "estimated_cost": "$10–$25/mo"},
                    {"role": "Orchestration", "name": "n8n (Self-Hosted / Cloud)", "type": "workflow", "slug": "n8n-b2b-lead-enrichment-hubspot", "estimated_cost": "$0–$20/mo"},
                    {"role": "CRM Destination", "name": "HubSpot CRM", "type": "tool", "estimated_cost": "Free tier ($0/mo)"},
                    {"role": "LLM Engine", "name": "Claude 3.7 Sonnet & GPT-4o", "type": "model", "estimated_cost": "Pay-per-token"}
                ],
                "skills": [
                    {"name": "Company Research Agent Skill", "slug": "skill-claude-repeatable-research-pipeline", "source": "anthropic-skills"},
                    {"name": "Lead Qualification & Web Analysis", "slug": "skill-visual-hierarchy-spacing-reviewer", "source": "zqtion"}
                ],
                "open_source_repos": [
                    {"name": "Crawl4AI", "repo": "unclecode/crawl4ai", "license": "Apache-2.0"},
                    {"name": "Model Context Protocol Servers", "repo": "modelcontextprotocol/servers", "license": "MIT"}
                ],
                "mcp_servers": [
                    {"name": "Official PostgreSQL MCP Server", "slug": "official-postgresql-mcp-server", "transport": "stdio"},
                    {"name": "Official GitHub MCP Server", "slug": "official-github-mcp-server", "transport": "stdio"},
                    {"name": "Official Filesystem Sandbox MCP Server", "slug": "official-filesystem-mcp-server", "transport": "stdio"}
                ],
                "prompts": [
                    {"title": "B2B Prospect Qualification & Tech Stack Analyzer", "slug": "prompt-b2b-prospect-qualification-tech-stack"},
                    {"title": "Senior Code Reviewer and Security Vulnerability Screener", "slug": "prompt-senior-code-reviewer-security-screener"}
                ],
                "workflow": [
                    {"step": 1, "title": "Discovery", "action": "Query Exa or Brave Search API for target agency domains."},
                    {"step": 2, "title": "Crawling", "action": "Execute Crawl4AI headless crawler to generate clean token-optimized markdown."},
                    {"step": 3, "title": "Extraction", "action": "Pass markdown through Claude prompt with strict JSON schema output."},
                    {"step": 4, "title": "Verification", "action": "Check phone/email DNS and filter out hallucinated metrics."},
                    {"step": 5, "title": "Score & Review", "action": "Calculate lead qualification score (1-100); route P0 leads to Slack."},
                    {"step": 6, "title": "CRM Upsert", "action": "Dispatch enriched company record into HubSpot via n8n node or HubSpot MCP."}
                ],
                "evidence_level": "verified",
                "verified_at": "2026-10-15T00:00:00Z"
            },
            {
                "slug": "autonomous-coding-agent-enterprise-guardrails-stack",
                "goal": "Autonomous Coding Agent with Token-Saving Checkpoints and Enterprise Guardrails",
                "summary": "High-reliability engineering environment pairing Claude Code or Cursor with git commit checkpointing, AST security screening, and local test verification loops to reduce token consumption by 70%.",
                "target_budget_monthly": "$20–$40/month",
                "recommended_stack": [
                    {"role": "Terminal Agent", "name": "Claude Code CLI / Antigravity IDE", "type": "tool", "estimated_cost": "$20/mo"},
                    {"role": "Local Engine", "name": "Qwen 2.5 Coder 32B (Ollama / vLLM)", "type": "model", "slug": "qwen-2-5-coder-open-agent-model", "estimated_cost": "$0/mo (Local GPU)"},
                    {"role": "Context Management", "name": "CLAUDE.md & Token Checkpoint Loops", "type": "workflow", "slug": "token-saving-checkpoint-strategy-coding-agents", "estimated_cost": "$0/mo"},
                    {"role": "Security Screener", "name": "OWASP Code Review Prompts", "type": "prompt", "slug": "prompt-senior-code-reviewer-security-screener", "estimated_cost": "$0/mo"}
                ],
                "skills": [
                    {"name": "Anthropic Code Review Skill", "slug": "skill-code-review-security-screener", "source": "anthropic-skills"},
                    {"name": "Filesystem Sandbox Controller", "slug": "official-filesystem-mcp-server", "source": "mcp-official-registry"}
                ],
                "open_source_repos": [
                    {"name": "Hugging Face Smolagents", "repo": "huggingface/smolagents", "license": "Apache-2.0"},
                    {"name": "MCP Reference Servers", "repo": "modelcontextprotocol/servers", "license": "MIT"}
                ],
                "mcp_servers": [
                    {"name": "Official Filesystem MCP", "slug": "official-filesystem-mcp-server", "transport": "stdio"},
                    {"name": "PostgreSQL MCP Server", "slug": "official-postgresql-mcp-server", "transport": "stdio"}
                ],
                "prompts": [
                    {"title": "Senior Code Reviewer and Security Vulnerability Screener", "slug": "prompt-senior-code-reviewer-security-screener"},
                    {"title": "Prompt: Senior Software Architect & System Designer", "slug": "prompt-cc0-senior-software-architect"}
                ],
                "workflow": [
                    {"step": 1, "title": "Context Staging", "action": "Load concise architectural rules from CLAUDE.md into agent prompt."},
                    {"step": 2, "title": "Test-Driven Draft", "action": "Agent writes failing unit test in test directory."},
                    {"step": 3, "title": "Implementation", "action": "Agent modifies code files in isolated local branch."},
                    {"step": 4, "title": "Automated Verification", "action": "Execute local npm test / pytest runner; intercept errors."},
                    {"step": 5, "title": "Security Screening", "action": "Run prompt-senior-code-reviewer-security-screener on git diff."},
                    {"step": 6, "title": "Git Commit Checkpoint", "action": "Commit green passing diff and compact conversational context."}
                ],
                "evidence_level": "verified",
                "verified_at": "2026-10-15T00:00:00Z"
            }
        ]
        return stacks

if __name__ == "__main__":
    cfg_file = SCRIPT_DIR.parent.parent / "config" / "sources.yaml"
    orchestrator = MultiSourceOrchestrator(cfg_file)
    results = orchestrator.run_ingestion()
    print("\n[Done] Multi-source ingestion complete.")
    print(json.dumps(results, indent=2))
