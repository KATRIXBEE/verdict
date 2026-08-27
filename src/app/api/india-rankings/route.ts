import { NextResponse } from "next/server";
import { INDIA_RANKINGS_DATA, getAllIndiaRankings } from "@/data/india-rankings";

export async function GET() {
  const allIndices = getAllIndiaRankings();
  const dataSources = Array.from(
    new Set(allIndices.map((idx) => `${idx.publisher} (${idx.source_url})`))
  );

  return NextResponse.json({
    title: "India Global Rankings Board",
    last_updated: "August 2026",
    total_categories: Object.keys(INDIA_RANKINGS_DATA).length,
    total_indices: allIndices.length,
    data_sources: dataSources,
    categories: INDIA_RANKINGS_DATA,
  });
}
