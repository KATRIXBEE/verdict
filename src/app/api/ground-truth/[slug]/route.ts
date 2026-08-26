// CORS POLICY: This endpoint is same-origin only.
// Cross-origin access is intentionally blocked.
// If external API access is needed in future, add explicit CORS headers.

import { NextRequest, NextResponse } from "next/server";
import { getGroundTruthArticleBySlug } from "@/data/mock-ground-truth";

function sanitizeSlug(slug: string): string {
  // Strip special characters and cap length to prevent reflection exploits
  return slug.replace(/[^a-zA-Z0-9\-_]/g, "").substring(0, 100);
}

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const safeSlug = sanitizeSlug(slug || "");

  try {
    const article = getGroundTruthArticleBySlug(safeSlug);

    if (!article) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `Record '${safeSlug}' not found.` } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error("[API_ERROR] /api/ground-truth/[slug]:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to retrieve article details." } },
      { status: 500 }
    );
  }
}
