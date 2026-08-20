"use client";

import React, { useState } from "react";
import { GitCommit, ArrowRight, Clock, AlertTriangle, ShieldCheck, History, Info } from "lucide-react";
import { PartyTenure } from "@/types";
import BrutalistCard from "@/components/ui/BrutalistCard";

interface PartyHopperTimelineProps {
  partyHistory: PartyTenure[];
  politicianName: string;
}

export default function PartyHopperTimeline({
  partyHistory,
  politicianName,
}: PartyHopperTimelineProps) {
  const [selectedTenure, setSelectedTenure] = useState<PartyTenure | null>(
    partyHistory.find((p) => p.isCurrent) || partyHistory[partyHistory.length - 1] || null
  );

  const totalSwitches = Math.max(0, partyHistory.length - 1);
  const isSerialSwitcher = totalSwitches >= 2;
  const isLoyalist = totalSwitches === 0;

  // Calculate years spanned
  const startYear = partyHistory[0]?.startYear || 2014;
  const currentYear = new Date().getFullYear();
  const totalYears = currentYear - startYear;

  return (
    <BrutalistCard
      title='PARTY SWITCH TIMELINE ("AAYA RAM GAYA RAM" MODULE)'
      badge={
        isLoyalist
          ? "0 SWITCHES (LOYAL)"
          : isSerialSwitcher
          ? `${totalSwitches} SWITCHES (HIGH FREQUENCY)`
          : "1 SWITCH RECORDED"
      }
      badgeColor={isLoyalist ? "green" : isSerialSwitcher ? "red" : "yellow"}
      statusLight={isSerialSwitcher ? "red" : "green"}
      statusLightLabel={isSerialSwitcher ? "TURNCOAT ALERT" : "PARTY RECORD"}
    >
      <div className="space-y-6 font-mono">
        {/* Metric summary bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-muted border-2 border-ink p-3 text-xs">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-brand-cyan" />
            <span className="font-bold text-ink">
              POLITICAL TRAJECTORY: {startYear} ➔ {currentYear} ({totalYears} Years Active)
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-bold">
            <span className="text-gray-600">Total Party Switches:</span>
            <span
              className={`px-2 py-0.5 border border-ink ${
                isLoyalist
                  ? "bg-brand-green text-black"
                  : isSerialSwitcher
                  ? "bg-brand-red text-white"
                  : "bg-brand-yellow text-black"
              }`}
            >
              {totalSwitches} {totalSwitches === 1 ? "Switch" : "Switches"}
            </span>
          </div>
        </div>

        {/* The Subway Map Track */}
        <div className="relative py-6 px-2 overflow-x-auto">
          {/* Main Connecting Track Line */}
          <div className="absolute top-1/2 left-6 right-6 h-1.5 bg-ink -translate-y-1/2 z-0 hidden sm:block" />

          {/* Subway Nodes */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-2 relative z-10 min-w-full">
            {partyHistory.map((tenure, idx) => {
              const isSelected = selectedTenure?.id === tenure.id;
              const durationYears = (tenure.endYear || currentYear) - tenure.startYear;

              return (
                <div
                  key={tenure.id}
                  onClick={() => setSelectedTenure(tenure)}
                  className={`flex-1 bg-surface border-2.5 border-ink p-3 cursor-pointer transition-all duration-150 relative ${
                    isSelected
                      ? "shadow-hard-md -translate-y-1 bg-brand-yellow/15 border-brand-red"
                      : "hover:-translate-y-0.5 hover:shadow-hard-sm"
                  }`}
                >
                  {/* Station Node Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border-2 border-black shrink-0 inline-block shadow-hard-xs"
                        style={{ backgroundColor: tenure.partyColor || "#111111" }}
                      />
                      <span className="font-extrabold text-xs text-ink uppercase">
                        {tenure.partyAbbr}
                      </span>
                    </div>

                    {tenure.isCurrent && (
                      <span className="bg-brand-green text-black text-[9px] font-black px-1.5 py-0.2 border border-black animate-pulse">
                        CURRENT
                      </span>
                    )}
                  </div>

                  {/* Party Full Name */}
                  <div className="font-bold text-xs text-ink truncate mb-1">
                    {tenure.partyName}
                  </div>

                  {/* Tenure Years */}
                  <div className="text-[11px] text-gray-700 flex items-center justify-between border-t border-gray-300 pt-1">
                    <span>
                      {tenure.startYear} – {tenure.endYear ? tenure.endYear : "Present"}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold">
                      ({durationYears || 1} {durationYears === 1 ? "yr" : "yrs"})
                    </span>
                  </div>

                  {/* Connecting Arrow for mobile */}
                  {idx < partyHistory.length - 1 && (
                    <div className="sm:hidden flex justify-center my-1 text-ink">
                      <ArrowRight className="w-4 h-4 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Tenure Detailed Inspector Drawer */}
        {selectedTenure && (
          <div className="bg-canvas border-2 border-ink p-4 shadow-hard-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-300 pb-2">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-brand-red" />
                <span className="font-bold text-xs uppercase text-ink">
                  TENURE DETAILS: {selectedTenure.partyName} ({selectedTenure.partyAbbr})
                </span>
              </div>
              <span className="text-xs font-bold text-gray-600">
                {selectedTenure.startYear} – {selectedTenure.endYear || "Present (Serving)"}
              </span>
            </div>

            <div className="text-xs text-gray-800 space-y-1">
              <p>
                <strong>Affidavit Record Context:</strong>{" "}
                {selectedTenure.switchReason || "Represented political party in general elections."}
              </p>
            </div>
          </div>
        )}

        {/* Historical Context Note */}
        <div className="flex items-start space-x-2 text-[11px] text-gray-600 bg-surface-muted p-2.5 border border-ink">
          <Info className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
          <p>
            The term <em>&quot;Aaya Ram Gaya Ram&quot;</em> stems from 1967 Haryana politics when MLA Gaya Lal changed parties thrice in a fortnight. VERDICT tracks chronological party affiliations purely from ECI nomination submissions.
          </p>
        </div>
      </div>
    </BrutalistCard>
  );
}
