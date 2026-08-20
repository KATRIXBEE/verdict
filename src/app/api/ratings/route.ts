import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addCitizenRating } from "@/lib/supabase";

const RatingSchema = z.object({
  politicianId: z.string().min(1, "Politician ID is required"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  userName: z.string().optional().default("Verified Citizen"),
  userConstituency: z.string().optional(),
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
  isLocalVoter: z.boolean().default(false),
  digilockerVerified: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RatingSchema.parse(body);

    const savedRating = await addCitizenRating(validatedData);

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
