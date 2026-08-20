import { NextRequest, NextResponse } from "next/server";
import { getControversiesByPoliticianId } from "@/data/mock-controversies";
import { getPoliticianById, getPoliticianBySlug } from "@/data/mock-politicians";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    // Try matching either by ID (e.g. neta-1) or by slug (e.g. dr-arvind-shrivastava)
    const pol = getPoliticianById(id) || getPoliticianBySlug(id);
    const targetId = pol ? pol.id : id;

    const controversies = getControversiesByPoliticianId(targetId);

    return NextResponse.json({
      success: true,
      politicianId: targetId,
      count: controversies.length,
      data: controversies,
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to retrieve politician controversies." } },
      { status: 500 }
    );
  }
}
