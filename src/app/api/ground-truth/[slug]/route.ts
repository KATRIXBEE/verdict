import { NextRequest, NextResponse } from "next/server";
import { getGroundTruthArticleBySlug } from "@/data/mock-ground-truth";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  try {
    const article = getGroundTruthArticleBySlug(slug);

    if (!article) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `Ground truth report '${slug}' not found.` } },
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
