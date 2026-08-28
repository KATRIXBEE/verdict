// CORS POLICY: This endpoint is same-origin only.
// Cross-origin access is intentionally blocked.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getScamBySlug } from "@/data/mock-scams";

function sanitizeSlug(slug: string): string {
  return slug.replace(/[^a-zA-Z0-9\-_]/g, "").substring(0, 100);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const safeSlug = sanitizeSlug(slug || "");

    // 1. Try Supabase query
    try {
      const { data: scam, error } = await db
        .from("scam_cases")
        .select("*")
        .eq("slug", safeSlug)
        .single();

      if (!error && scam) {
        const { data: timeline } = await db
          .from("scam_timeline_events")
          .select("*")
          .eq("scam_id", scam.id)
          .order("event_year", { ascending: true });

        const fullData = {
          ...scam,
          timeline_events: timeline || [],
        };

        return NextResponse.json({
          success: true,
          data: fullData,
          ...fullData,
        });
      }
    } catch {
      // Supabase query error; fall back to local dataset
    }

    // 2. Local fallback
    const scam = getScamBySlug(safeSlug);
    if (!scam) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: `Scam dossier '${safeSlug}' not found.` } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: scam,
      ...scam,
    });
  } catch (error) {
    console.error("[API_ERROR] /api/scams/[slug]:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to retrieve scam dossier." } },
      { status: 500 }
    );
  }
}
