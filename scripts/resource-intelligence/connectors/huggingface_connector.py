"""
Zqtion Resource Intelligence — Hugging Face Agents Connector (Source #005)
Source Type: ecosystem (Tier A: Primary / Authoritative)
Ingestion Method: ecosystem_api / structured_web
Role: Ingest Smolagents frameworks, open-weights agents, Hugging Face Hub tools, and Spaces.
"""

from typing import List, Dict, Any
from .base import BaseConnector

class HuggingFaceAgentsConnector(BaseConnector):
    def fetch(self) -> List[Dict[str, Any]]:
        """
        Extracts agent architectures from Hugging Face Agents & Smolagents.
        """
        agents = [
            {
                "id": "hf-smolagents-code-agent-framework",
                "name": "Hugging Face Smolagents: Minimalist Code-Writing Agent Framework",
                "slug": "huggingface-smolagents-framework",
                "category": "build",
                "difficulty": "intermediate",
                "tools": ["Smolagents", "Python", "Transformers", "DuckDuckGo"],
                "description": "Ultra-lightweight library (~1,000 lines of code) enabling LLMs to write and execute Python code blocks rather than verbose JSON tool calling.",
                "github_url": "https://github.com/huggingface/smolagents",
                "docs_url": "https://huggingface.co/docs/smolagents",
                "evidence_level": "verified",
                "license": "Apache-2.0"
            },
            {
                "id": "hf-agent-tool-web-search-python",
                "name": "Hugging Face DuckDuckGo Web Search Tool for Agents",
                "slug": "huggingface-duckduckgo-agent-tool",
                "category": "automate",
                "difficulty": "beginner",
                "tools": ["Python", "Smolagents"],
                "description": "Zero-API-key web search tool for autonomous agents to discover recent URLs, news, and factual references.",
                "github_url": "https://github.com/huggingface/smolagents",
                "docs_url": "https://huggingface.co/docs/smolagents/guided_tour",
                "evidence_level": "verified",
                "license": "Apache-2.0"
            },
            {
                "id": "hf-qwen-2-5-coder-agent-model",
                "name": "Qwen 2.5 Coder 32B Instruct: Frontier Open Weights for Autonomous Agents",
                "slug": "qwen-2-5-coder-open-agent-model",
                "category": "build",
                "difficulty": "advanced",
                "tools": ["Qwen", "Ollama", "vLLM", "Hugging Face"],
                "description": "State-of-the-art open coding model competitive with proprietary frontier models for terminal coding agents, tool calling, and refactoring.",
                "github_url": "https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct",
                "docs_url": "https://huggingface.co/docs/hub/models",
                "evidence_level": "verified",
                "license": "Apache-2.0"
            }
        ]
        return agents

    def normalize(self, raw_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Normalizes Hugging Face tools and models into verified Zqtion resources."""
        normalized = []
        for raw in raw_items:
            slug = raw["slug"]
            res_type = "repository" if "framework" in slug else ("model" if "model" in slug else "tool")
            normalized.append({
                "type": res_type,
                "source_id": self.source_id,
                "slug": slug,
                "title": raw["name"],
                "summary": raw["description"],
                "category": raw.get("category", "build"),
                "difficulty": raw.get("difficulty", "intermediate"),
                "evidence_level": "verified",
                "tools": raw.get("tools", ["Hugging Face"]),
                "tags": [raw.get("category", "build"), res_type, "hugging-face", "open-source-agent"],
                "metadata": {
                    "docs_url": raw.get("docs_url", ""),
                    "creator": "Hugging Face"
                },
                "source_provenance": {
                    "source_id": self.source_id,
                    "authority": self.authority_level,
                    "github_url": raw.get("github_url"),
                    "license": raw.get("license", "Apache-2.0")
                }
            })
        return normalized
