"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Scale, 
  Newspaper, 
  Video, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  MessageSquare,
  ShieldAlert
} from "lucide-react";
import { Controversy, ControversySeverity, ControversyStatus, SourceLinkType } from "@/types";
import { cn } from "@/lib/utils";
import BrutalistButton from "@/components/ui/BrutalistButton";

interface ControversyCardProps {
  controversy: Controversy;
  layoutMode?: "timeline" | "grid";
}

export default function ControversyCard({
  controversy,
  layoutMode = "timeline",
}: ControversyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Severity color system:
  // Minor = yellow, Moderate = orange, Serious = red, Severe = darkred/black with red border
  const getSeverityStyle = (sev: ControversySeverity) => {
    switch (sev) {
      case "Minor":
        return {
          badge: "bg-brand-yellow text-black border-black",
          accent: "border-brand-yellow",
        };
      case "Moderate":
        return {
          badge: "bg-brand-orange text-white border-black",
          accent: "border-brand-orange",
        };
      case "Serious":
        return {
          badge: "bg-brand-red text-white border-black",
          accent: "border-brand-red",
        };
      case "Severe":
        return {
          badge: "bg-ink text-brand-red border-2 border-brand-red font-black shadow-hard-red",
          accent: "border-brand-red bg-[#1a0505]/10",
        };
    }
  };

  // Status color system:
  const getStatusStyle = (status: ControversyStatus) => {
    switch (status) {
      case "Ongoing":
        return "bg-brand-red text-white border-black";
      case "Under Investigation":
        return "bg-brand-orange text-white border-black";
      case "Unverified":
        return "bg-brand-yellow text-black border-black";
      case "Resolved":
        return "bg-brand-green text-black border-black";
    }
  };

  // Source icon helper:
  const getSourceIcon = (type: SourceLinkType) => {
    switch (type) {
      case "News":
        return <Newspaper className="w-3.5 h-3.5 text-brand-cyan shrink-0" />;
      case "Court":
        return <Scale className="w-3.5 h-3.5 text-brand-yellow shrink-0" />;
      case "CAG":
        return <FileSpreadsheet className="w-3.5 h-3.5 text-brand-green shrink-0" />;
      case "Video":
        return <Video className="w-3.5 h-3.5 text-brand-red shrink-0" />;
    }
  };

  const sevStyle = getSeverityStyle(controversy.severity);
  const statusClass = getStatusStyle(controversy.status);

  return (
    <div
      className={cn(
        "bg-surface border-2.5 border-ink shadow-hard-md hover:shadow-hard-lg transition-all font-mono text-xs flex flex-col justify-between relative overflow-hidden",
        controversy.severity === "Severe" && "border-brand-red"
      )}
    >
      {/* Top Header Row */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink pb-3">
          <div className="flex items-center space-x-2">
            <span
              className={cn(
                "px-2 py-0.5 text-[10px] font-black uppercase border shadow-hard-xs",
                sevStyle.badge
              )}
            >
              {controversy.severity} SEVERITY
            </span>
            <span
              className={cn(
                "px-2 py-0.5 text-[10px] font-bold uppercase border shadow-hard-xs",
                statusClass
              )}
            >
              {controversy.status}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-gray-600 font-bold">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span>{new Date(controversy.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="font-display font-black text-base sm:text-lg text-ink uppercase leading-snug">
          {controversy.title}
        </h4>

        {/* Category Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {controversy.categories.map((cat, idx) => (
            <span
              key={idx}
              className="bg-surface-muted text-gray-800 text-[10px] font-bold px-2 py-0.5 border border-ink"
            >
              #{cat}
            </span>
          ))}
        </div>

        {/* 3-4 Line Summary */}
        <p className="text-xs text-gray-800 leading-relaxed pt-1">
          {controversy.summary}
        </p>

        {/* Expandable Section */}
        {isExpanded && (
          <div className="pt-3 border-t-2 border-dashed border-ink space-y-3 animate-in fade-in duration-200">
            {/* Official Response */}
            {controversy.officialResponse && (
              <div className="bg-canvas border-1.5 border-ink p-3 space-y-1">
                <span className="text-[10px] font-bold text-gray-600 uppercase flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3 text-brand-cyan" />
                  <span>OFFICIAL RESPONSE / CANDIDATE STANCE:</span>
                </span>
                <p className="text-xs text-ink font-medium leading-relaxed">
                  &quot;{controversy.officialResponse}&quot;
                </p>
              </div>
            )}

            {/* Resolution Details */}
            {controversy.resolution && (
              <div className="bg-brand-green/10 border-1.5 border-ink p-3 space-y-1">
                <span className="text-[10px] font-bold text-green-900 uppercase flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-green-700" />
                  <span>LEGAL / ADMINISTRATIVE RESOLUTION:</span>
                </span>
                <p className="text-xs text-gray-900 font-medium leading-relaxed">
                  {controversy.resolution}
                </p>
              </div>
            )}

            {/* Source Links Array */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">
                EVIDENTIARY SOURCES ({controversy.sources.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {controversy.sources.map((src, sIdx) => (
                  <a
                    key={sIdx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-surface hover:bg-surface-muted border border-ink p-2 flex items-center justify-between shadow-hard-xs transition-colors group"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {getSourceIcon(src.type)}
                      <div className="truncate">
                        <span className="font-bold text-[11px] text-ink block truncate">
                          {src.sourceName}
                        </span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase">
                          {src.type} DOCKET
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-brand-red shrink-0 ml-1" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expand/Collapse Trigger Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-surface-muted hover:bg-brand-yellow/30 border-t-2 border-ink py-2 px-4 flex items-center justify-between font-bold text-xs text-ink transition-colors cursor-pointer"
      >
        <span>{isExpanded ? "HIDE DETAILS & OFFICIAL RESPONSE" : "VIEW FULL DETAILS & SOURCES"}</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
    </div>
  );
}
