import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getControversiesByPoliticianId } from "@/data/mock-controversies";

function sanitizeSlug(slug: string): string {
  return (slug || "").replace(/[^a-zA-Z0-9\-_]/g, "").substring(0, 100);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await context.params;
    const slug = sanitizeSlug(rawSlug);

    if (!slug) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SLUG", message: "Invalid or malformed politician identifier." } },
        { status: 400 }
      );
    }

    // Try Supabase first
    try {
      const { data: sbData, error: sbError } = await db
        .from("controversies")
        .select("*")
        .or(`politician_slug.eq.${slug},politician_id.eq.${slug}`)
        .order("date_reported", { ascending: false });

      if (!sbError && sbData && sbData.length > 0) {
        return NextResponse.json({
          success: true,
          politician_slug: slug,
          total: sbData.length,
          controversies: sbData,
        });
      }
    } catch {
      // Fallback to local structured data
    }

    const localControversies = getControversiesByPoliticianId(slug);

    return NextResponse.json({
      success: true,
      politician_slug: slug,
      total: localControversies.length,
      controversies: localControversies.map((c) => ({
        id: c.id,
        politician_slug: slug,
        title: c.title,
        summary: c.summary,
        date_reported: c.date || (c as any).date_reported || "2024-01-01",
        source_url: c.sources?.[0]?.url || "https://www.thehindu.com",
        source_name: c.sources?.[0]?.sourceName || "The Hindu",
        category: c.categories?.[0] || "General",
        categories: c.categories || ["General"],
        severity: c.severity || "Moderate",
        status: c.status || "Ongoing",
        official_response: c.officialResponse || "",
        resolution: c.resolution || null,
        sources: c.sources || [],
      })),
    });
  } catch (error) {
    console.error("[API_ERROR] /api/politicians/[slug]/controversies:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to retrieve controversies for the specified politician." } },
      { status: 500 }
    );
  }
}
