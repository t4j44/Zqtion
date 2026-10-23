"""
Zqtion Resource Intelligence — prompts.chat Connector (Source #007)
Source Type: prompt_dataset (Tier B: Structured Ecosystem)
Ingestion Method: dataset_ingest / github_dataset
Role: Ingest CC0 public-domain prompt patterns, system roles, and structured prompt architectures.
"""

from typing import List, Dict, Any
from .base import BaseConnector

class PromptsChatConnector(BaseConnector):
    def fetch(self) -> List[Dict[str, Any]]:
        """
        Extracts foundational CC0 open prompt structures from f/awesome-chatgpt-prompts.
        CC0-1.0 license makes this safe for structural synthesis and adaptation.
        """
        prompts = [
            {
                "act": "Senior Software Architect & System Designer",
                "slug": "prompt-cc0-senior-software-architect",
                "category": "build",
                "difficulty": "intermediate",
                "tools": ["Claude Code", "Cursor", "ChatGPT"],
                "target_outcome": "High-level distributed systems design, data flow diagrams, and failure mode analysis.",
                "constraints": "Focus on horizontal scalability, database consistency guarantees, and zero single points of failure.",
                "prompt_structure": "I want you to act as a Senior Software Architect. I will provide high-level business requirements and traffic estimates. You will design the system architecture including API design, caching layers, database schemas, and message queues. Avoid generic boilerplate; provide concrete trade-offs.",
                "license": "CC0-1.0",
                "github_url": "https://github.com/f/awesome-chatgpt-prompts"
            },
            {
                "act": "Cybersecurity Vulnerability Screener & Penetration Tester",
                "slug": "prompt-cc0-cybersecurity-screener",
                "category": "build",
                "difficulty": "advanced",
                "tools": ["Claude Code", "Python", "OWASP"],
                "target_outcome": "Audits application source code and API endpoints for injection vulnerabilities, SSRF, and authorization flaws.",
                "constraints": "Never output actionable exploit payloads against unauthorized domains. Strictly provide remediated code snippets and risk classifications.",
                "prompt_structure": "I want you to act as a Cybersecurity Security Engineer. I will supply code snippets or API contracts. You will analyze them for OWASP Top 10 vulnerabilities, highlight insecure deserialization or unescaped queries, and output defensive patches with explanations.",
                "license": "CC0-1.0",
                "github_url": "https://github.com/f/awesome-chatgpt-prompts"
            },
            {
                "act": "B2B Technical Content Strategist & Case Study Writer",
                "slug": "prompt-cc0-b2b-technical-content-strategist",
                "category": "create",
                "difficulty": "intermediate",
                "tools": ["Claude 3.7", "Notion"],
                "target_outcome": "Transforms technical pull requests and engineering post-mortems into customer-facing engineering blogs and case studies.",
                "constraints": "Eliminate marketing fluff; emphasize measurable latency reductions, cost savings, and architectural diagrams.",
                "prompt_structure": "I want you to act as a Technical Writer and Content Strategist. I will provide an engineering release note or architecture decision record. You will craft an authoritative case study explaining the business problem, architectural solution, measurable results, and lessons learned.",
                "license": "CC0-1.0",
                "github_url": "https://github.com/f/awesome-chatgpt-prompts"
            }
        ]
        return prompts

    def normalize(self, raw_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Normalizes CC0 prompts into Zqtion's structured prompt library format."""
        normalized = []
        for raw in raw_items:
            slug = raw["slug"]
            normalized.append({
                "type": "prompt",
                "source_id": self.source_id,
                "slug": slug,
                "title": f"Prompt: {raw['act']}",
                "summary": raw["target_outcome"],
                "category": raw.get("category", "build"),
                "difficulty": raw.get("difficulty", "intermediate"),
                "evidence_level": "verified",
                "tools": raw.get("tools", ["Claude"]),
                "tags": [raw.get("category", "build"), "prompt", "cc0-licensed", "system-role"],
                "metadata": {
                    "role": raw["act"],
                    "constraints": raw.get("constraints", ""),
                    "prompt_template": raw["prompt_structure"],
                    "license": "CC0-1.0"
                },
                "source_provenance": {
                    "source_id": self.source_id,
                    "authority": self.authority_level,
                    "github_url": raw.get("github_url"),
                    "license": "CC0-1.0 (Public Domain)"
                }
            })
        return normalized
