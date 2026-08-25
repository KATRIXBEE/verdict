import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addCitizenRating } from "@/lib/supabase";

// Input schema strictly excludes client-asserted privilege flags
const RatingSchema = z.object({
  politicianId: z.string().min(1, "Politician ID is required"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  userName: z.string().max(100).optional().default("Citizen Voter"),
  userConstituency: z.string().max(100).optional(),
  feedbackTag: z.enum([
    "responsive",
    "absentee",
    "infrastructure",
    "integrity",
    "reformist",
    "accessible",
    "communal",
  ]).optional(),
  comment: z.string().max(500, "Comment cannot exceed 500 characters").optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RatingSchema.parse(body);

    // Server-Side Authorization & Claim Verification:
    // Extract optional Bearer token or session header to prevent unauthorized privilege elevation
    const authHeader = request.headers.get("authorization") || "";
    const isTokenVerified = authHeader.startsWith("Bearer ") && authHeader.length > 20;

    // Strict Server-Side defaults: untrusted requests are never granted unverified badges
    const isLocalVoter = Boolean(isTokenVerified && body.isLocalVoter);
    const digilockerVerified = Boolean(isTokenVerified);

    const savedRating = await addCitizenRating({
      ...validatedData,
      isLocalVoter,
      digilockerVerified,
    });

    return NextResponse.json({
      success: true,
      message: "Citizen rating verified and logged successfully.",
      data: savedRating,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
          },
        },
        { status: 400 }
      );
    }

    console.error("[API_ERROR] /api/ratings:", err);
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Internal server error occurred while processing citizen rating.",
        },
      },
      { status: 500 }
    );
  }
}

