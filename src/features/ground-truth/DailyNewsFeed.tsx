"use client";

import React, { useState } from "react";
import { Newspaper, ExternalLink, Clock, Sparkles } from "lucide-react";
import rawNewsData from "@/data/ground-truth-news.json";

interface RawNewsItem {
  id?: string;
  source?: string;
  source_name?: string;
  title?: string;
  summary?: string;
  url?: string;
  source_url?: string;
  published_at?: string;
  category?: string;
  badge_color?: string;
}

interface NormalizedNewsItem {
  id: string;
  source: string;
  title: string;
  summary: string;
  url: string;
  published_at: string;
  category: string;
  badge_color: string;
}

const newsData: NormalizedNewsItem[] = ((rawNewsData as RawNewsItem[]) || []).map((item, idx) => ({
  id: item.id || `news-${idx + 1}`,
  source: item.source_name || item.source || "National Press",
  title: item.title || "Civic Investigation Update",
  summary: item.summary || "Investigative report on public policy and administrative oversight.",
  url: item.source_url || item.url || "https://www.thehindu.com",
  published_at: item.published_at || new Date().toISOString(),
  category: item.category || "National",
  badge_color: item.badge_color || "#111111",
}));

export default function DailyNewsFeed() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  // Collect unique categories
  const categories = ["ALL", ...Array.from(new Set(newsData.map((item) => item.category)))];

  const getSourceBadge = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("reporter")) {
      return { bg: "bg-brand-red text-white", label: "REPORTERS' COLLECTIVE" };
    }
    if (s.includes("express")) {
      return { bg: "bg-[#003580] text-white", label: "INDIAN EXPRESS" };
    }
    if (s.includes("hindu")) {
      return { bg: "bg-[#1a1a6e] text-white", label: "THE HINDU" };
    }
    if (s.includes("wire")) {
      return { bg: "bg-[#8B0000] text-white", label: "THE WIRE" };
    }
    if (s.includes("scroll")) {
      return { bg: "bg-[#333333] text-white", label: "SCROLL.IN" };
    }
    if (s.includes("ndtv")) {
      return { bg: "bg-[#E50914] text-white", label: "NDTV INDIA" };
    }
    return { bg: "bg-ink text-white", label: source.toUpperCase() };
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const pub = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - pub.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffHrs < 1) return "Just now";
      if (diffHrs === 1) return "1 hr ago";
      if (diffHrs < 24) return `${diffHrs} hrs ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return pub.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  const filteredNews = activeCategory === "ALL"
    ? newsData
    : newsData.filter((item) => item.category === activeCategory);

  return (
    <section className="bg-surface border-3 border-ink p-5 sm:p-8 shadow-hard-xl space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-3 border-ink pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-yellow p-2 border-2 border-ink shadow-hard-xs">
            <Newspaper className="w-5 h-5 text-ink stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-ink">
                DAILY INVESTIGATIVE NEWS DESK
              </h2>
              <span className="bg-brand-green text-black font-extrabold text-[10px] px-2 py-0.5 border border-black shadow-hard-xs uppercase hidden sm:inline-block">
                VERIFIED RSS STREAM
              </span>
            </div>
            <p className="text-xs text-gray-600 font-bold mt-0.5">
              Live investigative reports aggregated from India&apos;s leading non-partisan news organizations.
            </p>
          </div>
        </div>

        <span className="text-xs font-black text-gray-800 bg-brand-cyan border-2 border-ink px-3 py-1.5 shadow-hard-xs self-start sm:self-auto">
          {filteredNews.length} STORIES AVAILABLE
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-bold px-2.5 py-1 border-2 border-ink shadow-hard-xs transition-all cursor-pointer ${
                isActive
                  ? "bg-brand-red text-white -translate-y-0.5"
                  : "bg-surface hover:bg-brand-yellow text-ink"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* News Cards Grid */}
      {filteredNews.length === 0 ? (
        <div className="bg-canvas border-2 border-ink p-8 text-center text-gray-500">
          <p className="font-bold">No investigative stories found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredNews.slice(0, 24).map((article) => {
            const badge = getSourceBadge(article.source);

            return (
              <article
                key={article.id}
                className="bg-canvas border-2.5 border-ink p-4 shadow-hard-xs flex flex-col justify-between space-y-3 hover:-translate-y-1 hover:shadow-hard-md transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-gray-300 pb-2">
                    <span className={`text-[9px] font-black px-2 py-0.5 border border-black shadow-hard-xs uppercase ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <div className="flex items-center space-x-1 text-[10px] text-gray-500 font-bold">
                      <Clock className="w-3 h-3" />
                      <span>{getRelativeTime(article.published_at)}</span>
                    </div>
                  </div>

                  <span className="inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 bg-gray-200 text-gray-800 border border-gray-400">
                    #{article.category}
                  </span>

                  <h3 className="font-display font-black text-sm uppercase text-ink leading-snug group-hover:text-brand-red transition-colors line-clamp-3">
                    {article.title}
                  </h3>

                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between w-full bg-ink text-white px-3 py-1.5 text-xs font-bold border border-ink hover:bg-brand-red transition-colors shadow-hard-xs group-hover:bg-brand-red"
                  >
                    <span>READ FULL INVESTIGATION</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
