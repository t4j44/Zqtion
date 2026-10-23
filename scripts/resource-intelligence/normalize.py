"""
Zqtion Resource Intelligence — Entity Normalization Module
Transforms raw extracted page records into structured, typed entity models:
- Tool
- Repository
- Skill
- MCP Server
- Prompt
- Workflow
- Use Case
- Guide
"""

import re
import urllib.parse
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

def slugify(text: str) -> str:
    """Converts title or name to an alphanumeric hyphenated slug."""
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    return text.strip('-')

class EntityNormalizer:
    def __init__(self):
        pass

    def normalize_tool(self, tool_name: str, source_record: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes an AI tool entity according to Section 8 schema."""
        slug = slugify(tool_name)
        official = ""
        docs = ""
        pricing_url = ""
        company = ""

        # Check external links and doc links for tool domain
        for link in source_record.get("external_links", []) + source_record.get("official_doc_links", []):
            if slug in link.lower():
                if "docs" in link or "documentation" in link:
                    docs = docs or link
                elif "pricing" in link or "pricing" in link.lower():
                    pricing_url = pricing_url or link
                elif not official:
                    official = link

        pricing_summary = ""
        claims = source_record.get("pricing_claims", [])
        if claims:
            pricing_summary = f"Reported pricing: {', '.join(claims[:2])}"

        return {
            "type": "tool",
            "name": tool_name,
            "slug": slug,
            "description": f"{tool_name} building block for AI workflows.",
            "official_url": official,
            "documentation_url": docs,
            "pricing_url": pricing_url,
            "company": company,
            "categories": source_record.get("topic", []),
            "best_for": source_record.get("workflow_concepts", [])[:3],
            "not_good_for": [],
            "pricing_summary": pricing_summary,
            "free_tier": None,
            "api_available": True if "api" in source_record.get("source_markdown_private", "").lower() else None,
            "mcp_available": True if "mcp" in source_record.get("source_markdown_private", "").lower() else None,
            "open_source": None,
            "platforms": source_record.get("mentioned_platforms", []),
            "integrations": [],
            "alternatives": [],
            "source_ids": [source_record.get("source_url")],
            "verified_at": None
        }

    def normalize_repository(self, github_url: str, source_record: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes a GitHub repository entity according to Section 9 schema."""
        parsed = urllib.parse.urlparse(github_url)
        parts = [p for p in parsed.path.strip("/").split("/") if p]
        owner = parts[0] if len(parts) >= 1 else ""
        repo_name = parts[1] if len(parts) >= 2 else ""
        full_name = f"{owner}/{repo_name}" if repo_name else github_url

        return {
            "type": "repository",
            "name": full_name,
            "slug": slugify(f"repo-{owner}-{repo_name}" if repo_name else f"repo-{slugify(github_url)}"),
            "github_url": f"https://github.com/{owner}/{repo_name}" if repo_name else github_url,
            "owner": owner,
            "license": "Open Source",
            "open_source": True,
            "primary_language": "Python" if "crawl4ai" in repo_name.lower() else "TypeScript/JavaScript",
            "summary": f"Open source repository referenced in {source_record.get('page_title')}.",
            "best_for": [source_record.get("page_title")] if source_record.get("page_title") else [],
            "setup_complexity": "intermediate",
            "installation_summary": f"Clone from {github_url}",
            "security_notes": [
                "Inspect repository dependencies and code before executing locally.",
                "Verify official repository ownership."
            ],
            "last_verified_at": datetime.now(timezone.utc).isoformat()
        }

    def normalize_skill(self, skill_name: str, source_record: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes an agent skill entity according to Section 10 schema."""
        slug = slugify(f"skill-{skill_name}")
        gh_links = source_record.get("github_links", [])
        return {
            "type": "skill",
            "name": skill_name,
            "slug": slug,
            "creator": source_record.get("source_author", "Community"),
            "repository": gh_links[0] if gh_links else None,
            "skill_md_location": "SKILL.md",
            "purpose": f"Agent skill capability for {skill_name}.",
            "triggering_situations": [f"When requested to execute tasks involving {skill_name}"],
            "inputs": ["Task specification", "Context files"],
            "outputs": ["Structured execution result"],
            "dependencies": source_record.get("mentioned_tools", []),
            "required_permissions": ["filesystem read" if "file" in skill_name.lower() else "prompt execution"],
            "scripts_executed": [],
            "network_access": False,
            "filesystem_access": True if "file" in skill_name.lower() or "code" in skill_name.lower() else False,
            "api_requirements": [],
            "security_considerations": [
                "Community skills must be reviewed for arbitrary code execution before activation.",
                "Ensure skills run with minimal necessary permissions."
            ],
            "installation_method": "Install skill bundle in agent skills directory",
            "compatible_agents": ["Claude", "Codex", "Antigravity"],
            "license": "MIT / Creative Commons",
            "risk_level": "low" if "prompt" in skill_name.lower() else "moderate",
            "verified_status": "unverified"
        }

    def normalize_mcp_server(self, mcp_name: str, source_record: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes an MCP server entity."""
        slug = slugify(f"mcp-{mcp_name}")
        return {
            "type": "mcp_server",
            "name": mcp_name,
            "slug": slug,
            "description": f"Model Context Protocol connector for {mcp_name}.",
            "transports": ["stdio", "sse"],
            "tools_exposed": [],
            "installation_command": f"npx -y @modelcontextprotocol/server-{slugify(mcp_name.replace('mcp', ''))}",
            "official_url": "",
            "verified_at": None
        }

    def normalize_workflow(self, source_record: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes an end-to-end multi-step workflow entity."""
        title = source_record.get("page_title", "Untitled Workflow")
        slug = slugify(f"workflow-{title}")
        concepts = source_record.get("workflow_concepts", [])

        steps = []
        if concepts:
            for idx, c in enumerate(concepts[:6], start=1):
                steps.append({
                    "step_number": idx,
                    "title": c[:60],
                    "description": c
                })
        else:
            steps = [
                {"step_number": 1, "title": "Setup & Configuration", "description": "Configure required tools and environment."},
                {"step_number": 2, "title": "Execution", "description": "Execute structured AI pipeline."},
                {"step_number": 3, "title": "Verification & Review", "description": "Verify output against requirements."}
            ]

        return {
            "type": "workflow",
            "title": title,
            "slug": slug,
            "summary": source_record.get("meta_description", f"Practical execution pipeline for {title}."),
            "category": source_record.get("topic", ["automate"])[0] if source_record.get("topic") else "automate",
            "difficulty": source_record.get("difficulty", "intermediate"),
            "tools_involved": source_record.get("mentioned_tools", []),
            "steps": steps,
            "requirements": source_record.get("requirements", []),
            "source_urls": [source_record.get("source_url")],
            "evidence_level": "source_reported"
        }
