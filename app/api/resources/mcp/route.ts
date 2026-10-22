import { NextRequest, NextResponse } from "next/server";
import { mcpEngine } from "@/lib/resources/mcp";

export const dynamic = "force-dynamic";

const MCP_TOOLS_MANIFEST = [
  {
    name: "search_resources",
    description: "Search the Zqtion Resource Intelligence knowledge base for tools, prompts, skills, repos, and workflows.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query or task description" },
        types: { type: "array", items: { type: "string" }, description: "Optional filter by resource type" },
        category: { type: "string", description: "Category filter (create, build, automate, research, productivity, agents)" },
        limit: { type: "number", default: 10 }
      },
      required: ["query"]
    }
  },
  {
    name: "find_prompt",
    description: "Find catalogue prompt proposals for a task; review the evidence and suitability.",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "Specific task to accomplish" },
        model: { type: "string", description: "Target model identifier; check current provider documentation" }
      },
      required: ["task"]
    }
  },
  {
    name: "find_skill",
    description: "Find applicable agent skills (SKILL.md definitions) for autonomous agents.",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "Agent capability required" },
        agent: { type: "string", description: "Agent framework (Claude Code, Antigravity, Cursor)" }
      },
      required: ["task"]
    }
  },
  {
    name: "find_repo",
    description: "Find repository references; records disclose their unverified evidence status.",
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string", description: "Technical capability (e.g. web scraping, MCP server)" },
        language: { type: "string", description: "Programming language (Python, TypeScript)" }
      },
      required: ["topic"]
    }
  },
  {
    name: "find_mcp",
    description: "Find Model Context Protocol servers connecting specific services or databases.",
    inputSchema: {
      type: "object",
      properties: {
        service: { type: "string", description: "Service or target (e.g. PostgreSQL, Notion, Google Drive, Filesystem)" }
      },
      required: ["service"]
    }
  },
  {
    name: "find_tool",
    description: "Find modern AI tools for a specific operational or creative use case.",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "Use case description" },
        maxCostMonthly: { type: "number", description: "Optional maximum monthly budget" }
      },
      required: ["task"]
    }
  },
  {
    name: "recommend_stack",
    description: "Propose an illustrative AI stack with tradeoffs and guide links; cost and budget fit are not validated.",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "Business or operational goal" },
        budgetMonthly: { type: "number", description: "Monthly budget ceiling in USD" },
        experienceLevel: { type: "string", description: "User skill level (beginner, intermediate, advanced)" }
      },
      required: ["task"]
    }
  },
  {
    name: "build_workflow",
    description: "Propose an unverified multi-step AI workflow with failure modes and candidate tools.",
    inputSchema: {
      type: "object",
      properties: {
        goal: { type: "string", description: "Outcome to achieve" },
        constraints: { type: "array", items: { type: "string" }, description: "Optional constraints (e.g. local-only, require human approval)" }
      },
      required: ["goal"]
    }
  },
  {
    name: "compare_resources",
    description: "Compare two catalogue records; current pricing and suitability require independent review.",
    inputSchema: {
      type: "object",
      properties: {
        slugA: { type: "string", description: "Slug of first resource" },
        slugB: { type: "string", description: "Slug of second resource" }
      },
      required: ["slugA", "slugB"]
    }
  },
  {
    name: "get_resource",
    description: "Retrieve a canonical resource by its unique slug with full metadata.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Resource slug" }
      },
      required: ["slug"]
    }
  },
  {
    name: "related_resources",
    description: "Traverse the relationship graph to find linked building blocks for a resource.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Resource slug" }
      },
      required: ["slug"]
    }
  },
  {
    name: "verify_resource",
    description: "Read a resource’s disclosed evidence status; this lookup does not run verification.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Resource slug" }
      },
      required: ["slug"]
    }
  },
  {
    name: "compose_solution",
    description: "Propose an illustrative composite resource stack for a goal; validate compatibility, costs and permissions before use.",
    inputSchema: {
      type: "object",
      properties: {
        goal: { type: "string", description: "Specific business or engineering outcome (e.g. AI lead research, automated code audit)" },
        budgetMonthly: { type: "number", description: "Optional monthly budget ceiling in USD" }
      },
      required: ["goal"]
    }
  }
];

export async function GET() {
  return NextResponse.json({
    name: "Zqtion Resource Intelligence MCP Server",
    version: "1.0.0",
    protocolVersion: "2024-11-05",
    tools: MCP_TOOLS_MANIFEST
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support JSON-RPC 2.0 format or flat { tool, args }
    const toolName = body.params?.name || body.tool || body.name;
    const toolArgs = body.params?.arguments || body.args || body.arguments || {};
    const rpcId = body.id !== undefined ? body.id : null;

    if (!toolName) {
      if (body.method === "tools/list") {
        return NextResponse.json({
          jsonrpc: "2.0",
          id: rpcId,
          result: { tools: MCP_TOOLS_MANIFEST }
        });
      }
      return NextResponse.json(
        { jsonrpc: "2.0", id: rpcId, error: { code: -32600, message: "Missing tool name" } },
        { status: 400 }
      );
    }

    let result;
    switch (toolName) {
      case "search_resources":
        result = await mcpEngine.searchResources(toolArgs);
        break;
      case "find_prompt":
        result = await mcpEngine.findPrompt(toolArgs);
        break;
      case "find_skill":
        result = await mcpEngine.findSkill(toolArgs);
        break;
      case "find_repo":
        result = await mcpEngine.findRepo(toolArgs);
        break;
      case "find_mcp":
        result = await mcpEngine.findMcp(toolArgs);
        break;
      case "find_tool":
        result = await mcpEngine.findTool(toolArgs);
        break;
      case "recommend_stack":
        result = await mcpEngine.recommendStack(toolArgs);
        break;
      case "build_workflow":
        result = await mcpEngine.buildWorkflow(toolArgs);
        break;
      case "compare_resources":
        result = await mcpEngine.compareResources(toolArgs);
        break;
      case "get_resource":
        result = await mcpEngine.getResource(toolArgs);
        break;
      case "related_resources":
        result = await mcpEngine.relatedResources(toolArgs);
        break;
      case "verify_resource":
        result = await mcpEngine.verifyResource(toolArgs);
        break;
      case "compose_solution":
        result = await mcpEngine.composeSolution(toolArgs);
        break;
      default:
        return NextResponse.json(
          { jsonrpc: "2.0", id: rpcId, error: { code: -32601, message: `Method '${toolName}' not found` } },
          { status: 404 }
        );
    }

    return NextResponse.json({
      jsonrpc: "2.0",
      id: rpcId,
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ],
        structured: result
      }
    });
  } catch (error: unknown) {
    console.error("[API /resources/mcp] Execution error:", error);
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32603, message }
      },
      { status: 500 }
    );
  }
}
