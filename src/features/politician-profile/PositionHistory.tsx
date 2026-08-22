"use client";

import React from "react";
import { Briefcase, Building2, Calendar, CheckCircle2, Award } from "lucide-react";
import { PortfolioEntry } from "@/types";
import BrutalistCard from "@/components/ui/BrutalistCard";

interface PositionHistoryProps {
  portfolioHistory?: PortfolioEntry[];
  politicianName: string;
}

export default function PositionHistory({ portfolioHistory, politicianName }: PositionHistoryProps) {
  if (!portfolioHistory || portfolioHistory.length === 0) {
    return null;
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Present";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <BrutalistCard
      title="POSITION & MINISTERIAL PORTFOLIO HISTORY"
      badge={`${portfolioHistory.length} ROLES RECORDED`}
      badgeColor="yellow"
      statusLight="green"
      statusLightLabel="CONSTITUTIONAL RECORD"
    >
      <div className="space-y-4 font-mono text-xs">
        <p className="text-gray-700 leading-relaxed">
          Official executive, cabinet, and constitutional portfolios held across consecutive Union and State government tenures:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolioHistory.map((item, idx) => {
            const isCurrent = !item.to_date || item.to_date.toLowerCase() === "null" || item.to_date.toLowerCase() === "present";

            return (
              <div
                key={idx}
                className={`border-2.5 border-ink p-4 shadow-hard-xs flex flex-col justify-between space-y-3 transition-all ${
                  isCurrent
                    ? "bg-brand-green/15 border-brand-green border-2.5 shadow-hard-sm"
                    : "bg-surface hover:bg-surface-muted"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-gray-300 pb-2">
                    <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 border border-ink bg-canvas shadow-hard-xs">
                      {item.government}
                    </span>
                    {isCurrent ? (
                      <span className="bg-brand-green text-black font-extrabold text-[10px] px-2 py-0.5 border border-black animate-pulse uppercase">
                        ● CURRENT ROLE
                      </span>
                    ) : (
                      <span className="bg-gray-200 text-gray-700 font-bold text-[10px] px-2 py-0.5 border border-ink uppercase">
                        PAST TENURE
                      </span>
                    )}
                  </div>

                  <h4 className="font-display font-black text-base uppercase text-ink leading-snug">
                    {item.role}
                  </h4>

                  {item.ministry && (
                    <div className="flex items-center space-x-1.5 text-gray-700 font-bold text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                      <span>{item.ministry}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {formatDate(item.from_date)} &ndash;{" "}
                      {isCurrent ? (
                        <span className="text-green-700 font-black">Present</span>
                      ) : (
                        formatDate(item.to_date)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BrutalistCard>
  );
}
