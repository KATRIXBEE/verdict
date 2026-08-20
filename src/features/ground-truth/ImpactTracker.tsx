"use client";

import React from "react";
import { History, ExternalLink, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";
import { ImpactTimelineItem } from "@/types";
import BrutalistCard from "@/components/ui/BrutalistCard";

interface ImpactTrackerProps {
  timeline: ImpactTimelineItem[];
  articleTitle: string;
}

export default function ImpactTracker({ timeline, articleTitle }: ImpactTrackerProps) {
  return (
    <BrutalistCard
      title="GOVERNMENT ACCOUNTABILITY & IMPACT TRACKER"
      badge={`${timeline.length} ACTIONS RECORDED`}
      badgeColor="cyan"
      statusLight="green"
      statusLightLabel="LIVE TRACKING"
    >
      <div className="space-y-4 font-mono text-xs">
        <p className="text-gray-700 leading-relaxed">
          Tracking the chain of official government notifications, departmental inquiries, and citizen actions triggered following the publication of this investigation:
        </p>

        {/* Vertical Timeline Track */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-1 before:bg-ink">
          {timeline.map((item, idx) => (
            <div key={item.id} className="relative">
              {/* Timeline Node */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-3.5 h-3.5 rounded-full bg-brand-green border-2 border-black -translate-x-1/2 z-10 shadow-hard-xs" />

              <div className="bg-surface border-2 border-ink p-3.5 shadow-hard-xs space-y-1.5 hover:bg-surface-muted transition-colors">
                <div className="flex items-center justify-between border-b border-gray-200 pb-1 text-[11px] font-bold">
                  <span className="text-brand-red">
                    {new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  {item.sourceName && (
                    <span className="text-gray-500 uppercase">{item.sourceName}</span>
                  )}
                </div>

                <p className="text-xs text-ink font-medium leading-relaxed">
                  {item.description}
                </p>

                {item.sourceLink && (
                  <div className="pt-1">
                    <a
                      href={item.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-[11px] font-bold text-ink hover:text-brand-red underline decoration-1"
                    >
                      <span>OFFICIAL NOTIFICATION DOCKET</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </BrutalistCard>
  );
}
