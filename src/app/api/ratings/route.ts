// CORS POLICY: This endpoint is same-origin only.
// Cross-origin access is intentionally blocked.
// If external API access is needed in future, add explicit CORS headers.

// CSRF NOTE: With JSON Content-Type and no session cookies (pre-auth),
// browsers send CORS preflight for cross-origin requests.
// This provides partial CSRF protection. Full CSRF tokens are enforced
// via NextAuth session cookies with SameSite=Lax.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

function getClientIp(request: NextRequest): string {
  const vercelIp = request.headers.get("x-real-ip");
  if (vercelIp) return vercelIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    return ips[ips.length - 1];
  }

  return "127.0.0.1";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RatingSchema.parse(body);
    const clientIp = getClientIp(request);

    // Derive verification strictly from server session, never from client body
    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch {
      // Session parsing fallback
    }

    // Default to unverified until DigiLocker OAuth integration is configured in production
    const isSessionVerified = Boolean(session?.user && (session.user as any).digilockerVerified);
    const digilockerVerified = isSessionVerified;
    const isLocalVoter = Boolean(isSessionVerified && (session?.user as any).isLocalVoter);

    if (!isSessionVerified) {
      console.info("[RATINGS] Unauthenticated or unverified submission. Storing with unverified status.");
    }

    // 1. Save to atomic persistent storage
    const savedRating = await addCitizenRating({
      ...validatedData,
      isLocalVoter,
      digilockerVerified,
      clientIp,
    });

    // 2. Mirror to Supabase PostgreSQL table if connected
    try {
      const { db } = await import("@/lib/db");
      await db.from("citizen_ratings").insert({
        politician_slug: validatedData.politicianId,
        rating: validatedData.rating,
        user_name: validatedData.userName || "Citizen Voter",
        user_constituency: validatedData.userConstituency || null,
        comment: validatedData.comment || null,
        digilocker_verified: digilockerVerified,
        is_local_voter: isLocalVoter,
        client_ip: clientIp,
      });
    } catch {
      // Non-blocking background sync fallback
    }

    return NextResponse.json({
      success: true,
      message: "Citizen rating logged successfully.",
      data: savedRating,
    });
  } catch (err: any) {
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

    if (err?.message && err.message.includes("already submitted a rating")) {
      return NextResponse.json(
        {
          error: {
            code: "DUPLICATE_RATING",
            message: err.message,
          },
        },
        { status: 429 }
      );
    }

    console.error("[API_ERROR] /api/ratings:", err);
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: err?.message || "Internal server error occurred while processing citizen rating.",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Only POST submissions are supported on /api/ratings.",
      },
    },
    { status: 405 }
  );
}
