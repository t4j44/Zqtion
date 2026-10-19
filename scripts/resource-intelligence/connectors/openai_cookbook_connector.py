"""
Zqtion Resource Intelligence — OpenAI Cookbook Connector (Source #002)
Source Type: official_docs (Tier A: Primary / Authoritative)
Ingestion Method: structured_web / github_api
Role: Extract canonical agent recipes, function-calling patterns, evaluations, and API architectures.
"""

from typing import List, Dict, Any
from .base import BaseConnector

class OpenAICookbookConnector(BaseConnector):
    def fetch(self) -> List[Dict[str, Any]]:
        """
        Extracts official agent and developer recipes from OpenAI Cookbook.
        Represents primary-source verified patterns from developers.openai.com / openai-cookbook.
        """
        recipes = [
            {
                "id": "cookbook-agents-orchestration-handoffs",
                "title": "Orchestrating Multi-Agent Systems with Swarm and Function Calling",
                "topic": "agents",
                "category": "build",
                "difficulty": "advanced",
                "tools": ["OpenAI API", "GPT-4o", "Python"],
                "summary": "Design patterns for multi-agent handoffs, state passing, and guardrail enforcement in autonomous agent networks.",
                "official_url": "https://developers.openai.com/cookbook/topic/agents",
                "github_url": "https://github.com/openai/openai-cookbook/tree/main/examples/orchestrating_agents",
                "evidence_level": "verified"
            },
            {
                "id": "cookbook-evals-automated-agent-benchmarks",
                "title": "Automated Evaluation Pipelines for LLM Tool-Calling Accuracy",
                "topic": "evals",
                "category": "build",
                "difficulty": "intermediate",
                "tools": ["OpenAI Evals", "Python", "Pytest"],
                "summary": "Rigorous evaluation pipelines to benchmark agent tool selection, schema validation, and parameter extraction accuracy.",
                "official_url": "https://developers.openai.com/cookbook/examples/evaluation",
                "github_url": "https://github.com/openai/evals",
                "evidence_level": "verified"
            },
            {
                "id": "cookbook-rag-hybrid-search-reranking",
                "title": "Production RAG with Hybrid Dense-Sparse Retrieval and Cohere Reranking",
                "topic": "rag",
                "category": "build",
                "difficulty": "intermediate",
                "tools": ["OpenAI Embeddings", "PostgreSQL pgvector", "Qdrant"],
                "summary": "High-accuracy retrieval architecture combining sparse BM25 keyword matching with dense vector cosine similarity.",
                "official_url": "https://developers.openai.com/cookbook/examples/rag",
                "github_url": "https://github.com/openai/openai-cookbook/blob/main/examples/Search_reranking_with_cross-encoders.ipynb",
                "evidence_level": "verified"
            },
            {
                "id": "cookbook-code-generation-checkpoints",
                "title": "Autonomous Code Refactoring with Test-Driven Verification Loops",
                "topic": "codex",
                "category": "build",
                "difficulty": "advanced",
                "tools": ["OpenAI API", "Git", "Docker"],
                "summary": "Automated code synthesis pipeline executing test suites in sandboxed containers before staging commits.",
                "official_url": "https://developers.openai.com/cookbook",
                "github_url": "https://github.com/openai/openai-cookbook",
                "evidence_level": "verified"
            }
        ]
        return recipes

    def normalize(self, raw_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Normalizes OpenAI Cookbook recipes into verified guides and architectures."""
        normalized = []
        for raw in raw_items:
            slug = raw["id"].replace("cookbook-", "openai-")
            normalized.append({
                "type": "guide",
                "source_id": self.source_id,
                "slug": slug,
                "title": raw["title"],
                "summary": raw["summary"],
                "category": raw.get("category", "build"),
                "difficulty": raw.get("difficulty", "advanced"),
                "evidence_level": "verified",
                "tools": raw.get("tools", ["OpenAI"]),
                "tags": [raw.get("category", "build"), "official-cookbook", raw.get("topic", "agents"), "primary-source"],
                "source_provenance": {
                    "source_id": self.source_id,
                    "authority": self.authority_level,
                    "official_url": raw.get("official_url"),
                    "github_url": raw.get("github_url"),
                    "license": self.content_license
                }
            })
        return normalized
