import { NextRequest, NextResponse } from "next/server";
import { MOCK_POLITICIANS } from "@/data/mock-politicians";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("query") || "").toLowerCase().trim();
    const state = searchParams.get("state") || "";
    const party = searchParams.get("party") || "";
    const house = searchParams.get("house") || "";
    const scoreBand = searchParams.get("scoreBand") || "";
    const hasCriminalCases = searchParams.get("hasCriminalCases");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

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
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: paginated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: String(error) } },
      { status: 500 }
    );
  }
}
