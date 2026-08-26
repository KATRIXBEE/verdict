// CORS POLICY: This endpoint is same-origin only.
// Cross-origin access is intentionally blocked.
// If external API access is needed in future, add explicit CORS headers.

import { NextRequest, NextResponse } from "next/server";
import { getPoliticianBySlug } from "@/data/mock-politicians";
import { db } from "@/lib/db";

function sanitizeSlug(slug: string): string {
  // Strip special characters and cap length to prevent reflection exploits
  return slug.replace(/[^a-zA-Z0-9\-_]/g, "").substring(0, 100);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const safeSlug = sanitizeSlug(slug || "");

    // 1. Try querying Supabase
    try {
      const { data: politician, error } = await db
        .from("politicians")
        .select("*")
        .eq("slug", safeSlug)
        .single();

      if (!error && politician) {
        const [
          { data: cases },
          { data: assetHistory },
          { data: electionHistory },
          { data: partyHistory },
          { data: performance },
          { data: ratings },
        ] = await Promise.all([
          db.from("criminal_cases").select("*").eq("politician_id", politician.id).order("date_filed", { ascending: false }),
          db.from("assets").select("*").eq("politician_id", politician.id).order("election_year", { ascending: true }),
          db.from("election_history").select("*").eq("politician_id", politician.id).order("election_year", { ascending: false }),
          db.from("party_history").select("*").eq("politician_id", politician.id).order("joined_date", { ascending: true }),
          db.from("parliamentary_performance").select("*").eq("politician_id", politician.id).order("term_year_start", { ascending: false }),
          db.from("citizen_ratings").select("id,rating,user_name,user_constituency,comment,digilocker_verified,is_local_voter,created_at").eq("politician_slug", safeSlug).order("created_at", { ascending: false }).limit(50),
        ]);

        const fullProfile = {
          ...politician,
          criminal_cases: cases || [],
          asset_history: assetHistory || [],
          election_history: electionHistory || [],
          party_history: partyHistory || [],
          parliamentary_performance: performance?.[0] || null,
          citizen_ratings: ratings || [],
        };

        return NextResponse.json({
          success: true,
          data: fullProfile,
          ...fullProfile,
        });
      }
    } catch {
      // Supabase query error; fall back to local data
    }

    // 2. Fallback to local store
    const politician = getPoliticianBySlug(safeSlug);

    if (!politician) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: `Record '${safeSlug}' not found.` } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: politician,
      ...politician,
    });
  } catch (error) {
    console.error("[API_ERROR] /api/politicians/[slug]:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error occurred while retrieving politician dossier." } },
      { status: 500 }
    );
  }
}
