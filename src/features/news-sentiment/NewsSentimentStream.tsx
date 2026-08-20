"use client";

import React from "react";
import { Newspaper, ExternalLink, ThumbsUp, ThumbsDown, Minus, Sparkles } from "lucide-react";
import { NewsSentimentItem } from "@/types";
import BrutalistCard from "@/components/ui/BrutalistCard";

interface NewsSentimentStreamProps {
  newsItems: NewsSentimentItem[];
  politicianName: string;
}

export default function NewsSentimentStream({
  newsItems,
  politicianName,
}: NewsSentimentStreamProps) {
  const posCount = newsItems.filter((n) => n.sentiment === "positive").length;
  const critCount = newsItems.filter((n) => n.sentiment === "critical").length;
  const neuCount = newsItems.filter((n) => n.sentiment === "neutral").length;

  const netTone =
    posCount > critCount ? "NET POSITIVE" : critCount > posCount ? "NET CRITICAL" : "BALANCED / NEUTRAL";
  const badgeColor =
    posCount > critCount ? "green" : critCount > posCount ? "red" : "yellow";

  return (
    <BrutalistCard
      title="90-DAY AI NEWS SENTIMENT FEED"
      badge={netTone}
      badgeColor={badgeColor}
      statusLight="green"
      statusLightLabel="NLP STREAM"
    >
      <div className="space-y-4 font-mono">
        {/* Metric Sentiment Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-muted border-2 border-ink p-3 text-xs">
          <div className="flex items-center space-x-2">
            <Newspaper className="w-4 h-4 text-brand-red" />
            <span className="font-bold text-ink">
              CROSS-PUBLICATION MEDIA MONITORING (PAST 90 DAYS)
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-bold">
            <span className="bg-brand-green text-black px-1.5 py-0.5 border border-ink">
              +{posCount} POSITIVE
            </span>
            <span className="bg-brand-yellow text-black px-1.5 py-0.5 border border-ink">
              {neuCount} NEUTRAL
            </span>
            <span className="bg-brand-red text-white px-1.5 py-0.5 border border-ink">
              -{critCount} CRITICAL
            </span>
          </div>
        </div>

        {/* Headlines List */}
        <div className="space-y-3">
          {newsItems.length === 0 ? (
            <div className="p-6 bg-canvas border-2 border-ink text-center text-xs text-gray-500">
              No recent national press articles indexed in the last 90 days.
            </div>
          ) : (
            newsItems.map((item) => {
              const sentimentConfig = {
                positive: {
                  label: "POSITIVE COVERAGE",
                  bg: "bg-brand-green text-black border-black",
                  icon: ThumbsUp,
                },
                neutral: {
                  label: "NEUTRAL / FACTUAL",
                  bg: "bg-brand-yellow text-black border-black",
                  icon: Minus,
                },
                critical: {
                  label: "CRITICAL COVERAGE",
                  bg: "bg-brand-red text-white border-black",
                  icon: ThumbsDown,
                },
              }[item.sentiment];

              const Icon = sentimentConfig.icon;

              return (
                <div
                  key={item.id}
                  className="bg-surface border-2 border-ink p-3.5 shadow-hard-xs space-y-2 hover:bg-surface-muted transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-200 pb-2">
                    <div className="flex items-center space-x-2 text-[11px] text-gray-700 font-bold">
                      <span className="text-ink">{item.source}</span>
                      <span>•</span>
                      <span>{new Date(item.date).toLocaleDateString("en-IN")}</span>
                    </div>

                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-black border self-start sm:self-auto ${sentimentConfig.bg}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{sentimentConfig.label}</span>
                    </span>
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-ink leading-snug">
                    {item.headline}
                  </h4>

                  <p className="text-xs text-gray-700 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="pt-1 flex justify-end">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-[11px] font-bold text-ink hover:text-brand-red underline decoration-1"
                    >
                      <span>READ AT {item.source.toUpperCase()}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </BrutalistCard>
  );
}
