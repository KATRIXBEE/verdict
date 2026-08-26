// CORS POLICY: This endpoint is same-origin only.
// Cross-origin access is intentionally blocked.
// If external API access is needed in future, add explicit CORS headers.

import { NextRequest, NextResponse } from "next/server";
import { filterGroundTruthArticles, MOCK_GROUND_TRUTH_ARTICLES } from "@/data/mock-ground-truth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get("state") || undefined;
  const category = searchParams.get("category") || undefined;
  const politicianId = searchParams.get("politician_id") || searchParams.get("politician") || undefined;
  const sortBy = (searchParams.get("sort_by") as any) || "recent";
  const searchQuery = searchParams.get("q") || undefined;

  try {
    const articles = filterGroundTruthArticles({
      state,
      category,
      politicianId,
      sortBy,
      searchQuery,
    });

    return NextResponse.json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    console.error("[API_ERROR] /api/ground-truth:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to query ground truth articles." } },
      { status: 500 }
    );
  }
}
