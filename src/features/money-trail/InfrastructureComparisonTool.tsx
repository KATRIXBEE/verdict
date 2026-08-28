"use client";

import React, { useState } from "react";
import { INFRASTRUCTURE_COST_DATA } from "@/data/mock-scams";
import { Globe2 } from "lucide-react";

export default function InfrastructureComparisonTool() {
  const [projectKey, setProjectKey] = useState<string>("highway_4lane");
  const [countryKey, setCountryKey] = useState<string>("china");

  const project = INFRASTRUCTURE_COST_DATA[projectKey] || INFRASTRUCTURE_COST_DATA.highway_4lane;

  const countryLabels: Record<string, { name: string; code: string }> = {
    china: { name: "China", code: "CN" },
    usa: { name: "USA", code: "US" },
    germany: { name: "Germany", code: "DE" },
    brazil: { name: "Brazil", code: "BR" },
    south_africa: { name: "South Africa", code: "ZA" },
    uk: { name: "United Kingdom", code: "GB" },
    australia: { name: "Australia", code: "AU" },
  };

  const countryCost = (project as any)[countryKey] || 0;
  const maxVal = Math.max(
    countryCost,
    project.india_normal,
    project.india_worst_case.cost,
    1
  );

  return (
    <section className="bg-surface border-3 border-ink p-6 sm:p-8 shadow-hard-lg font-mono space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2.5 border-ink pb-4">
        <div className="flex items-center space-x-2">
          <Globe2 className="w-5 h-5 text-brand-blue stroke-[2.5]" />
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
            MINI TOOL: HOW EXPENSIVE IS INFRASTRUCTURE IN INDIA?
          </h2>
        </div>
        <span className="text-xs font-bold text-gray-500 bg-surface-muted px-2.5 py-1 border border-ink shadow-hard-xs">
          WORLD BANK &amp; OECD BENCHMARKS
        </span>
      </div>

      <p className="text-xs sm:text-sm text-gray-700 font-semibold leading-relaxed">
        Compare standard construction benchmarks across global economies against India&apos;s government-approved cost norms and peak sanctioned project costs.
      </p>

      {/* Step 1: Select Project Type */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-ink flex items-center space-x-1.5">
          <span className="bg-brand-red text-white px-1.5 py-0.2 border border-ink text-[10px]">STEP 1</span>
          <span>CHOOSE PROJECT TYPE:</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(INFRASTRUCTURE_COST_DATA).map(([key, item]) => {
            const isSelected = projectKey === key;
            return (
              <button
                key={key}
                onClick={() => setProjectKey(key)}
                className={`px-3 py-1.5 border-2 border-ink text-xs font-bold transition-all shadow-hard-xs ${
                  isSelected
                    ? "bg-brand-red text-white -translate-x-0.5 -translate-y-0.5 shadow-hard-sm"
                    : "bg-surface hover:bg-surface-muted text-ink"
                }`}
              >
                {item.label.split("(")[0].trim()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Select Comparison Country */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-ink flex items-center space-x-1.5">
          <span className="bg-brand-blue text-white px-1.5 py-0.2 border border-ink text-[10px]">STEP 2</span>
          <span>CHOOSE COMPARISON COUNTRY:</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(countryLabels).map(([ckey, cval]) => {
            const isSelected = countryKey === ckey;
            return (
              <button
                key={ckey}
                onClick={() => setCountryKey(ckey)}
                className={`px-3 py-1.5 border-2 border-ink text-xs font-bold transition-all shadow-hard-xs inline-flex items-center ${
                  isSelected
                    ? "bg-brand-blue text-white -translate-x-0.5 -translate-y-0.5 shadow-hard-sm"
                    : "bg-surface hover:bg-surface-muted text-ink"
                }`}
              >
                <span className="font-mono font-black text-[9px] bg-black/10 px-1 py-0.2 border border-ink/30 mr-1.5" aria-hidden="true">
                  {cval.code}
                </span>
                <span>{cval.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Output Display */}
      <div className="bg-canvas border-2.5 border-ink p-5 space-y-4 shadow-hard-md text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-ink/20 pb-2">
          <span className="font-black text-ink uppercase text-sm">
            {project.label}
          </span>
          <span className="text-gray-500 font-bold text-[11px]">
            UNIT: {project.unit}
          </span>
        </div>

        {/* Visual Comparative Bars */}
        <div className="space-y-3 pt-1">
          {/* Selected Country */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold items-center">
              <span className="inline-flex items-center gap-1.5">
                <span className="font-mono font-black text-[9px] bg-brand-blue text-white px-1 py-0.2 border border-ink" aria-hidden="true">
                  {countryLabels[countryKey].code}
                </span>
                <span>{countryLabels[countryKey].name.toUpperCase()} BENCHMARK</span>
              </span>
              <span className="text-brand-blue font-black">{countryCost} {project.unit}</span>
            </div>
            <div className="w-full bg-gray-200 border border-ink h-5 relative">
              <div
                className="bg-brand-blue h-full border-r border-ink flex items-center px-2 text-[10px] font-black text-white"
                style={{ width: `${Math.max(8, (countryCost / maxVal) * 100)}%` }}
              >
                {countryCost}
              </div>
            </div>
          </div>

          {/* India Normal */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold items-center">
              <span className="inline-flex items-center gap-1.5">
                <span className="font-mono font-black text-[9px] bg-brand-green text-black px-1 py-0.2 border border-ink" aria-hidden="true">
                  IN
                </span>
                <span>INDIA GOVT APPROVED NORMAL</span>
              </span>
              <span className="text-brand-green font-black">{project.india_normal} {project.unit}</span>
            </div>
            <div className="w-full bg-gray-200 border border-ink h-5 relative">
              <div
                className="bg-brand-green h-full border-r border-ink flex items-center px-2 text-[10px] font-black text-black"
                style={{ width: `${Math.max(8, (project.india_normal / maxVal) * 100)}%` }}
              >
                {project.india_normal}
              </div>
            </div>
          </div>

          {/* India Flagged / Peak */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-brand-red items-center">
              <span className="inline-flex items-center gap-1.5">
                <span className="font-mono font-black text-[9px] bg-brand-red text-white px-1 py-0.2 border border-ink" aria-hidden="true">
                  IN-PEAK
                </span>
                <span>INDIA FLAGGED COST ({project.india_worst_case.project})</span>
              </span>
              <span className="font-black">{project.india_worst_case.cost} {project.unit}</span>
            </div>
            <div className="w-full bg-gray-200 border-2 border-brand-red h-6 relative">
              <div
                className="bg-brand-red h-full flex items-center px-2 text-[10px] font-black text-white"
                style={{ width: `${Math.max(12, (project.india_worst_case.cost / maxVal) * 100)}%` }}
              >
                {project.india_worst_case.cost}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Insight Banner */}
        <div className="bg-surface border-2 border-ink p-3 space-y-1 font-bold text-[11px] text-gray-700">
          <span className="text-brand-red font-black uppercase block text-xs">
            CRITICAL TAKEAWAY:
          </span>
          <p>
            While India&apos;s baseline cost norm of <strong>{project.india_normal} {project.unit}</strong> is comparable to emerging market peers, audited execution on peak contracts reached <strong>{project.india_worst_case.cost} {project.unit}</strong> — which is <strong>{(project.india_worst_case.cost / countryCost).toFixed(1)}x higher than {countryLabels[countryKey].name}</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}
