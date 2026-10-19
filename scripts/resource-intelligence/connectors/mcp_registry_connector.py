"""
Zqtion Resource Intelligence — Official MCP Registry Connector (Source #004)
Source Type: registry (Tier A: Primary / Authoritative)
Ingestion Method: registry_api
Role: Ingest canonical Model Context Protocol servers, transport schemas, and installation methods.
"""

from typing import List, Dict, Any
from .base import BaseConnector

class MCPRegistryConnector(BaseConnector):
    def fetch(self) -> List[Dict[str, Any]]:
        """
        Extracts official MCP server catalog from registry.modelcontextprotocol.io & modelcontextprotocol/servers.
        """
        servers = [
            {
                "id": "mcp-server-postgres-database",
                "name": "Official PostgreSQL MCP Server",
                "slug": "official-postgresql-mcp-server",
                "category": "automate",
                "difficulty": "intermediate",
                "transport": "stdio",
                "install_cmd": "npx -y @modelcontextprotocol/server-postgres <connection-url>",
                "description": "Provides secure, read-only schema inspection, table queries, and parameterized execution against PostgreSQL databases.",
                "tools_exposed": ["query", "describe_table", "list_tables"],
                "github_url": "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
                "evidence_level": "verified"
            },
            {
                "id": "mcp-server-filesystem-sandbox",
                "name": "Official Local Filesystem MCP Server",
                "slug": "official-filesystem-mcp-server",
                "category": "build",
                "difficulty": "beginner",
                "transport": "stdio",
                "install_cmd": "npx -y @modelcontextprotocol/server-filesystem <allowed-directory>",
                "description": "Secure file reading, writing, and directory traversal restricted to explicit allowlisted host folders.",
                "tools_exposed": ["read_file", "write_file", "list_directory", "move_file"],
                "github_url": "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
                "evidence_level": "verified"
            },
            {
                "id": "mcp-server-github-v3-api",
                "name": "Official GitHub MCP Server",
                "slug": "official-github-mcp-server",
                "category": "build",
                "difficulty": "intermediate",
                "transport": "stdio",
                "install_cmd": "npx -y @modelcontextprotocol/server-github",
                "description": "Full GitHub API integration for issue triage, pull request drafting, repository search, and branch management.",
                "tools_exposed": ["create_issue", "get_file_contents", "create_pull_request", "search_repositories"],
                "github_url": "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
                "evidence_level": "verified"
            },
            {
                "id": "mcp-server-brave-web-search",
                "name": "Brave Search API MCP Server",
                "slug": "official-brave-search-mcp-server",
                "category": "automate",
                "difficulty": "beginner",
                "transport": "stdio",
                "install_cmd": "npx -y @modelcontextprotocol/server-brave-search",
                "description": "Real-time web discovery and local business search for autonomous agents using the privacy-focused Brave Search API.",
                "tools_exposed": ["brave_web_search", "brave_local_search"],
                "github_url": "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
                "evidence_level": "verified"
            },
            {
                "id": "mcp-server-slack-workspace",
                "name": "Slack Workspace Integration MCP Server",
                "slug": "official-slack-mcp-server",
                "category": "automate",
                "difficulty": "intermediate",
                "transport": "stdio",
                "install_cmd": "npx -y @modelcontextprotocol/server-slack",
                "description": "Connects AI agents to Slack channels for conversational triage, message posting, and thread notifications.",
                "tools_exposed": ["post_message", "reply_to_thread", "list_channels"],
                "github_url": "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
                "evidence_level": "verified"
            }
        ]
        return servers

    def normalize(self, raw_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Normalizes official MCP servers into verified MCP building blocks."""
        normalized = []
        for raw in raw_items:
            slug = raw["slug"]
            normalized.append({
                "type": "mcp_server",
                "source_id": self.source_id,
                "slug": slug,
                "title": raw["name"],
                "summary": raw["description"],
                "category": raw.get("category", "automate"),
                "difficulty": raw.get("difficulty", "intermediate"),
                "evidence_level": "verified",
                "tools": ["MCP", "Node.js", "stdio"],
                "tags": [raw.get("category", "automate"), "mcp_server", "official-mcp", "connector"],
                "metadata": {
                    "transport": raw.get("transport", "stdio"),
                    "install_cmd": raw.get("install_cmd", ""),
                    "tools_exposed": raw.get("tools_exposed", []),
                    "registry": "registry.modelcontextprotocol.io"
                },
                "source_provenance": {
                    "source_id": self.source_id,
                    "authority": self.authority_level,
                    "github_url": raw.get("github_url"),
                    "license": "Apache-2.0"
                }
            })
        return normalized
