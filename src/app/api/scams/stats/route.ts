// CORS POLICY: This endpoint is same-origin only.
// Cross-origin access is intentionally blocked.

import { NextResponse } from "next/server";
import { getMoneyTrailStats } from "@/data/mock-scams";

export async function GET() {
  try {
    const stats = getMoneyTrailStats();
    return NextResponse.json({
      success: true,
      ...stats,
      data: stats,
    });
  } catch (error) {
    console.error("[API_ERROR] /api/scams/stats:", error);
    return NextResponse.json(
      { error: { code: "STATS_FAILED", message: "Failed to aggregate money trail statistics." } },
      { status: 500 }
    );
  }
}
