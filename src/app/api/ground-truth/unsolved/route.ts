import { NextRequest, NextResponse } from "next/server";
import { MOCK_GROUND_TRUTH_ARTICLES } from "@/data/mock-ground-truth";
import rawNewsData from "@/data/ground-truth-news.json";

// In-memory demand counters for citizen escalation
const DEMAND_COUNTERS: Record<string, number> = {
  "gt-1": 1842,
  "gt-2": 2410,
  "gt-3": 920,
  "gt-4": 1950,
  "gt-5": 3120,
  "gt-6": 1680,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let articles: any[] = [];

    if (supabaseUrl && supabaseKey) {
      try {
        let queryUrl = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/ground_truth_articles?select=*&order=days_since_first_reported.desc.nullslast`;
        if (statusFilter && statusFilter !== "ALL") {
          queryUrl += `&unsolved_status=eq.${statusFilter}`;
        }

        const res = await fetch(queryUrl, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          next: { revalidate: 60 },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            articles = data;
          }
        }
      } catch {
        // Fall back to local items
      }
    }

    // Fallback: Combine mock investigative articles + rich local news
    if (articles.length === 0) {
      const formattedMock = MOCK_GROUND_TRUTH_ARTICLES.map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.headline,
        summary: a.summary,
        source_name: a.source_name || a.author.publication || "Ground Truth Desk",
        source_url: a.source_url || `/ground-truth/${a.slug}`,
        category: a.category,
        unsolved_status: a.unsolved_status || "under_investigation",
        days_since_first_reported: a.days_since_first_reported || 30,
        last_checked_at: a.last_checked_at || new Date().toISOString(),
        case_reference: a.case_reference || `FIR-${a.id.toUpperCase()}/2026`,
        demands_count: DEMAND_COUNTERS[a.id] || 420,
        is_interesting: a.is_interesting ?? true,
      }));

      // Enrich from verified news items with unsolved status
      const formattedNews = ((rawNewsData as any[]) || [])
        .filter((n) => n.unsolved_status)
        .map((n, idx) => ({
          id: n.id || `news-unsolved-${idx + 1}`,
          slug: n.id || `news-unsolved-${idx + 1}`,
          title: n.title,
          summary: n.summary,
          source_name: n.source_name || "National Press",
          source_url: n.source_url || n.url,
          category: n.category || "National",
          unsolved_status: n.unsolved_status,
          days_since_first_reported: n.days_since_first_reported || 14,
          last_checked_at: n.last_checked_at || new Date().toISOString(),
          case_reference: n.case_reference || `CASE-${(n.id || idx).toString().toUpperCase()}`,
          demands_count: DEMAND_COUNTERS[n.id] || (120 + (idx * 37) % 500),
          is_interesting: n.is_interesting ?? false,
        }));

      articles = [...formattedMock, ...formattedNews];
    }

    // Apply status filter if provided
    if (statusFilter && statusFilter !== "ALL") {
      articles = articles.filter((a) => a.unsolved_status === statusFilter);
    }

    // Sort descending by days since first reported
    articles.sort((a, b) => (b.days_since_first_reported || 0) - (a.days_since_first_reported || 0));

    // Attach current demand count
    articles = articles.map((a) => ({
      ...a,
      demands_count: DEMAND_COUNTERS[a.id] || a.demands_count || 150,
    }));

    return NextResponse.json(articles, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "UNSOLVED_FETCH_ERROR", message: error.message || "Failed to fetch unsolved cases" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyId } = body;

    if (!storyId || typeof storyId !== "string") {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "storyId is required" } },
        { status: 400 }
      );
    }

    // Increment demand count
    const current = DEMAND_COUNTERS[storyId] || 150;
    DEMAND_COUNTERS[storyId] = current + 1;

    return NextResponse.json({
      success: true,
      storyId,
      newDemandsCount: DEMAND_COUNTERS[storyId],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "DEMAND_UPDATE_ERROR", message: error.message || "Failed to register demand" } },
      { status: 500 }
    );
  }
}
