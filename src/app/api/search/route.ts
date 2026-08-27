// CORS POLICY: This endpoint is same-origin only.
// Cross-origin access is intentionally blocked.
// If external API access is needed in future, add explicit CORS headers.

import { NextRequest, NextResponse } from "next/server";
import { searchPoliticians, MOCK_POLITICIANS } from "@/data/mock-politicians";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const state = searchParams.get("state");
  const party = searchParams.get("party");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "20", 10)), 50);
  const offset = (page - 1) * limit;

  try {
    // Require minimum 2 characters to prevent unrestricted full-dataset bulk scraping
    if (q.trim().length < 2) {
      return NextResponse.json(
        {
          success: true,
          count: 0,
          total: 0,
          page: 1,
          limit,
          totalPages: 0,
          isDisambiguationRequired: false,
          message: "Enter at least 2 characters to search.",
          data: [],
          results: [],
        },
        { status: 200 }
      );
    }

    const searchTerm = q.trim();

    // 1. Try querying Supabase
    try {
      let sbQuery = db
        .from("politicians")
        .select("*", { count: "exact" })
        .or(
          `name.ilike.%${searchTerm}%,` +
          `constituency.ilike.%${searchTerm}%,` +
          `state.ilike.%${searchTerm}%,` +
          `current_party.ilike.%${searchTerm}%`
        )
        .order("verdict_score", { ascending: false })
        .range(offset, offset + limit - 1);

      if (state && state !== "ALL") {
        sbQuery = sbQuery.ilike("state", `%${state}%`);
      }
      if (party && party !== "ALL") {
        sbQuery = sbQuery.ilike("current_party", `%${party}%`);
      }

      const { data: sbData, count: sbCount, error: sbError } = await sbQuery;

      if (!sbError && sbData && sbData.length > 0) {
        return NextResponse.json({
          success: true,
          count: sbData.length,
          total: sbCount || sbData.length,
          page,
          limit,
          totalPages: Math.ceil((sbCount || sbData.length) / limit),
          isDisambiguationRequired: (sbCount || sbData.length) > 1,
          data: sbData,
          results: sbData,
          query: searchTerm,
        });
      }
    } catch {
      // Fallback to local dataset
    }

    // 2. Fallback to local search
    let results = searchPoliticians(q);

    if (state && state !== "ALL") {
      results = results.filter((p) => p.currentConstituency.state.toLowerCase() === state.toLowerCase());
    }

    if (party && party !== "ALL") {
      results = results.filter((p) => p.partyAbbr.toLowerCase() === party.toLowerCase());
    }

    const totalMatches = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    const normalizedLocal = paginatedResults.map((p: any) => ({
      ...p,
      name: p.fullName || p.name,
      fullName: p.fullName || p.name,
      current_party: p.currentParty || p.current_party,
      currentParty: p.currentParty || p.current_party,
      constituency: p.currentConstituency?.name || p.constituency,
      state: p.currentConstituency?.state || p.state,
      verdict_score: p.calculatedVerdictScore ?? p.verdictScore ?? p.verdict_score ?? 5.0,
      verdictScore: p.calculatedVerdictScore ?? p.verdictScore ?? p.verdict_score ?? 5.0,
    }));

    // Check for name collisions to trigger disambiguation metadata
    const nameCollision = results.length > 1 && q.trim().length > 2;

    return NextResponse.json({
      success: true,
      count: normalizedLocal.length,
      total: totalMatches,
      page,
      limit,
      totalPages: Math.ceil(totalMatches / limit),
      isDisambiguationRequired: nameCollision,
      data: normalizedLocal,
      results: normalizedLocal,
    });
  } catch (error) {
    console.error("[API_ERROR] /api/search:", error);
    return NextResponse.json(
      { error: { code: "SEARCH_FAILED", message: "Failed to query politician records." } },
      { status: 500 }
    );
  }
}
