import { NextRequest, NextResponse } from "next/server";
import { getPoliticianBySlug } from "@/data/mock-politicians";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const politician = getPoliticianBySlug(slug);

    if (!politician) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: `Politician '${slug}' not found` } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: politician,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: String(error) } },
      { status: 500 }
    );
  }
}
