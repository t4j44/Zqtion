import { NextRequest, NextResponse } from "next/server";
import { searchResources } from "@/lib/resources/service";
import type { ResourceType, ResourceCategory, ResourceDifficulty, EvidenceLevel } from "@/lib/resources/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || searchParams.get("q") || "";
    const type = (searchParams.get("type") || "") as ResourceType | "";
    const category = (searchParams.get("category") || "") as ResourceCategory | "";
    const difficulty = (searchParams.get("difficulty") || "") as ResourceDifficulty | "";
    const evidenceLevel = (searchParams.get("evidence") || "") as EvidenceLevel | "";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = await searchResources({
      query,
      type,
      category,
      difficulty,
      evidenceLevel,
      limit,
      offset
    });

    return NextResponse.json({
      ok: true,
      data: result.items,
      total: result.total,
      facets: result.facets,
      page: Math.floor(offset / limit) + 1,
      limit
    });
  } catch (error: unknown) {
    console.error("[API /resources] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
