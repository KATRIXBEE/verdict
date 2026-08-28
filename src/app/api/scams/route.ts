// CORS POLICY: This endpoint is same-origin only.
// Cross-origin access is intentionally blocked.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SCAM_CASES_DATA } from "@/data/mock-scams";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const severity = searchParams.get("severity");
    const ministry = searchParams.get("ministry");
    const sort = searchParams.get("sort") || "amount_desc";
    const rawPage = parseInt(searchParams.get("page") || "1", 10);
    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const rawLimit = parseInt(searchParams.get("limit") || "20", 10);
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(50, rawLimit);
    const offset = (page - 1) * limit;

    // 1. Attempt live Supabase query
    try {
      let sbQuery = db.from("scam_cases").select("*", { count: "exact" });

      if (category && category !== "ALL") {
        sbQuery = sbQuery.ilike("category", `%${category}%`);
      }
      if (severity && severity !== "ALL") {
        sbQuery = sbQuery.ilike("severity", `%${severity}%`);
      }
      if (ministry && ministry !== "ALL") {
        sbQuery = sbQuery.ilike("responsible_ministry", `%${ministry}%`);
      }

      if (sort === "corruption_percent") {
        sbQuery = sbQuery.order("corruption_percent", { ascending: false });
      } else if (sort === "newest") {
        sbQuery = sbQuery.order("audit_year", { ascending: false });
      } else {
        sbQuery = sbQuery.order("amount_allocated_crore", { ascending: false });
      }

      sbQuery = sbQuery.range(offset, offset + limit - 1);
      const { data: sbData, count: sbCount, error: sbError } = await sbQuery;

      if (!sbError && sbData && sbData.length > 0) {
        return NextResponse.json({
          success: true,
          count: sbData.length,
          total: sbCount || sbData.length,
          page,
          limit,
          totalPages: Math.ceil((sbCount || sbData.length) / limit),
          data: sbData,
        });
      }
    } catch {
      // Fallback to local mock data
    }

    // 2. Fallback to local data
    let filtered = [...SCAM_CASES_DATA];

    if (category && category !== "ALL") {
      filtered = filtered.filter(
        (c) => c.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (severity && severity !== "ALL") {
      filtered = filtered.filter(
        (c) => c.severity.toLowerCase() === severity.toLowerCase()
      );
    }
    if (ministry && ministry !== "ALL") {
      filtered = filtered.filter(
        (c) => (c.responsible_ministry || "").toLowerCase().includes(ministry.toLowerCase())
      );
    }

    if (sort === "corruption_percent") {
      filtered.sort((a, b) => (b.corruption_percent || 0) - (a.corruption_percent || 0));
    } else if (sort === "newest") {
      filtered.sort((a, b) => (b.audit_year || 0) - (a.audit_year || 0));
    } else {
      // Default: Highest amount
      filtered.sort(
        (a, b) =>
          (b.amount_allocated_crore || b.amount_misused_crore || 0) -
          (a.amount_allocated_crore || a.amount_misused_crore || 0)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      count: paginated.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: paginated,
    });
  } catch (error) {
    console.error("[API_ERROR] /api/scams:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to retrieve scam records." } },
      { status: 500 }
    );
  }
}
