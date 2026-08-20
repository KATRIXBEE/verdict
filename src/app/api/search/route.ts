import { NextRequest, NextResponse } from "next/server";
import { searchPoliticians, MOCK_POLITICIANS } from "@/data/mock-politicians";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const state = searchParams.get("state");
  const party = searchParams.get("party");

  try {
    let results = searchPoliticians(q);

    if (state && state !== "ALL") {
      results = results.filter((p) => p.currentConstituency.state.toLowerCase() === state.toLowerCase());
    }

    if (party && party !== "ALL") {
      results = results.filter((p) => p.partyAbbr.toLowerCase() === party.toLowerCase());
    }

    // Check for name collisions to trigger disambiguation metadata
    const nameCollision = results.length > 1 && q.trim().length > 2;

    return NextResponse.json({
      success: true,
      count: results.length,
      isDisambiguationRequired: nameCollision,
      data: results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "SEARCH_FAILED", message: "Failed to query politician records." } },
      { status: 500 }
    );
  }
}
