// CORS POLICY: This endpoint is same-origin only.
// Cross-origin access is intentionally blocked.
// If external API access is needed in future, add explicit CORS headers.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MOCK_POLITICIANS } from "@/data/mock-politicians";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("query") || searchParams.get("q") || "").toLowerCase().trim();
    const state = searchParams.get("state") || "";
    const party = searchParams.get("party") || "";
    const house = searchParams.get("house") || "";
    const scoreBand = searchParams.get("scoreBand") || "";
    const hasCriminalCases = searchParams.get("hasCriminalCases");
    const sort = searchParams.get("sort") || "name";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "50", 10));
    const offset = (page - 1) * limit;

    // Attempt live Supabase query first
    try {
      let sbQuery = db.from("politicians").select("*", { count: "exact" });

      if (state) sbQuery = sbQuery.ilike("state", `%${state}%`);
      if (party) sbQuery = sbQuery.ilike("current_party", `%${party}%`);
      if (house) sbQuery = sbQuery.ilike("current_house", `%${house}%`);
      if (query) {
        sbQuery = sbQuery.or(
          `name.ilike.%${query}%,constituency.ilike.%${query}%,state.ilike.%${query}%,current_party.ilike.%${query}%`
        );
      }

      const orderMap: Record<string, string> = {
        name: "name",
        score_desc: "verdict_score",
        score_asc: "verdict_score",
        cases: "criminal_case_count",
      };

      const orderCol = orderMap[sort] || "name";
      const ascending = !sort.includes("desc");

      sbQuery = sbQuery.order(orderCol, { ascending }).range(offset, offset + limit - 1);

      const { data: sbData, count: sbCount, error: sbError } = await sbQuery;

      if (!sbError && sbData && sbData.length > 0) {
        return NextResponse.json({
          success: true,
          politicians: sbData,
          data: sbData,
          total: sbCount || sbData.length,
          page,
          limit,
          totalPages: Math.ceil((sbCount || sbData.length) / limit),
        });
      }
    } catch {
      // Fallback to local structured data
    }

    // Fallback to enriched local dataset
    let filtered = MOCK_POLITICIANS;

    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.fullName.toLowerCase().includes(query) ||
          p.currentParty.toLowerCase().includes(query) ||
          p.partyAbbr.toLowerCase().includes(query) ||
          p.currentConstituency.name.toLowerCase().includes(query) ||
          p.currentConstituency.state.toLowerCase().includes(query)
      );
    }

    if (state) {
      filtered = filtered.filter((p) => p.currentConstituency.state.toLowerCase() === state.toLowerCase());
    }

    if (party) {
      filtered = filtered.filter((p) => p.partyAbbr.toLowerCase() === party.toLowerCase() || p.currentParty.toLowerCase() === party.toLowerCase());
    }

    if (house) {
      filtered = filtered.filter((p) => p.house.toLowerCase() === house.toLowerCase());
    }

    if (scoreBand) {
      filtered = filtered.filter((p) => p.scoreBand.toLowerCase() === scoreBand.toLowerCase());
    }

    if (hasCriminalCases === "true") {
      filtered = filtered.filter((p) => (p.criminalCases || []).length > 0);
    } else if (hasCriminalCases === "false") {
      filtered = filtered.filter((p) => (p.criminalCases || []).length === 0);
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      politicians: paginated,
      data: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[API_ERROR] /api/politicians:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error occurred while retrieving politician records." } },
      { status: 500 }
    );
  }
}
