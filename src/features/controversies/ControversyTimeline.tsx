"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  Filter, 
  LayoutGrid, 
  GitCommit, 
  History, 
  SlidersHorizontal,
  CheckCircle2,
  X
} from "lucide-react";
import { Controversy, ControversySeverity, ControversyStatus } from "@/types";
import BrutalistCard from "@/components/ui/BrutalistCard";
import ControversyCard from "./ControversyCard";

interface ControversyTimelineProps {
  controversies: Controversy[];
  politicianName: string;
}

export default function ControversyTimeline({
  controversies,
  politicianName,
}: ControversyTimelineProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline");

  // Collect all unique categories from controversies
  const allCategories = Array.from(
    new Set(controversies.flatMap((c) => c.categories))
  );

  // Filter and sort reverse chronologically
  const filteredControversies = controversies
    .filter((c) => {
      const matchCat = selectedCategory === "ALL" || c.categories.includes(selectedCategory);
      const matchSev = selectedSeverity === "ALL" || c.severity === selectedSeverity;
      const matchStat = selectedStatus === "ALL" || c.status === selectedStatus;
      return matchCat && matchSev && matchStat;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalOngoing = controversies.filter((c) => c.status === "Ongoing" || c.status === "Under Investigation").length;
  const totalSevere = controversies.filter((c) => c.severity === "Severe").length;

  return (
    <BrutalistCard
      title="RECENT CONTROVERSIES & PUBLIC AUDITS"
      badge={
        controversies.length === 0
          ? "NO CONTROVERSIES LOGGED"
          : `${controversies.length} RECORDED AUDITS (${totalOngoing} ACTIVE)`
      }
      badgeColor={totalSevere > 0 ? "red" : totalOngoing > 0 ? "orange" : "yellow"}
      statusLight={totalOngoing > 0 ? "red" : "green"}
      statusLightLabel={totalOngoing > 0 ? "ACTIVE ALERTS" : "RESOLVED RECORD"}
    >
      <div className="space-y-6 font-mono">
        {/* Top Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-muted border-2 border-ink p-3 text-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-brand-red shrink-0" />
            <span className="font-bold text-ink">
              MEDIA, CAG & JUDICIAL SCRUTINY DOSSIER
            </span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-surface border-2 border-ink p-1">
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`px-2.5 py-1 text-xs font-bold flex items-center space-x-1 transition-all ${
                viewMode === "timeline"
                  ? "bg-brand-yellow text-black border border-ink shadow-hard-xs"
                  : "text-gray-700 hover:text-black"
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>TIMELINE</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1 text-xs font-bold flex items-center space-x-1 transition-all ${
                viewMode === "grid"
                  ? "bg-brand-yellow text-black border border-ink shadow-hard-xs"
                  : "text-gray-700 hover:text-black"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>GRID VIEW</span>
            </button>
          </div>
        </div>

        {/* Multi-Filter Bar */}
        <div className="bg-canvas border-2 border-ink p-3 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5 font-bold text-ink uppercase">
              <Filter className="w-3.5 h-3.5 text-brand-red" />
              <span>FILTER CONTROVERSIES:</span>
            </div>

            {(selectedCategory !== "ALL" || selectedSeverity !== "ALL" || selectedStatus !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedSeverity("ALL");
                  setSelectedStatus("ALL");
                }}
                className="text-[11px] font-bold text-brand-red hover:underline flex items-center space-x-1"
              >
                <X className="w-3 h-3" />
                <span>RESET FILTERS</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Category Dropdown */}
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                CATEGORY:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-surface border-1.5 border-ink p-1.5 text-xs font-bold text-ink focus:outline-none"
              >
                <option value="ALL">ALL CATEGORIES ({controversies.length})</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                SEVERITY TIER:
              </label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full bg-surface border-1.5 border-ink p-1.5 text-xs font-bold text-ink focus:outline-none"
              >
                <option value="ALL">ALL SEVERITY TIERS</option>
                <option value="Minor">Minor (Yellow)</option>
                <option value="Moderate">Moderate (Orange)</option>
                <option value="Serious">Serious (Red)</option>
                <option value="Severe">Severe (Inverted Dark Red)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                JUDICIAL / CIVIC STATUS:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-surface border-1.5 border-ink p-1.5 text-xs font-bold text-ink focus:outline-none"
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Unverified">Unverified</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Container */}
        {filteredControversies.length === 0 ? (
          <div className="bg-canvas border-2 border-ink p-8 text-center space-y-2">
            <p className="font-bold text-sm text-ink">NO CONTROVERSIES MATCH CURRENT FILTERS</p>
            <p className="text-xs text-gray-600">
              Try adjusting your category, severity, or status filter selections above.
            </p>
          </div>
        ) : viewMode === "timeline" ? (
          /* Timeline Vertical View */
          <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-1 before:bg-ink">
            {filteredControversies.map((c) => (
              <div key={c.id} className="relative">
                {/* Node Dot on Timeline */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-5 w-3.5 h-3.5 rounded-full border-2 border-black -translate-x-1/2 z-10 ${
                    c.severity === "Severe"
                      ? "bg-brand-red animate-pulse"
                      : c.severity === "Serious"
                      ? "bg-brand-orange"
                      : "bg-brand-yellow"
                  }`}
                />
                <ControversyCard controversy={c} layoutMode="timeline" />
              </div>
            ))}
          </div>
        ) : (
          /* Grid View (2 Columns) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredControversies.map((c) => (
              <ControversyCard key={c.id} controversy={c} layoutMode="grid" />
            ))}
          </div>
        )}
      </div>
    </BrutalistCard>
  );
}
