"use client";

import React, { useState } from "react";
import { Sliders, FileSpreadsheet, ChevronRight } from "lucide-react";
import { Politician } from "@/types";
import { calculateVerdictScore } from "@/lib/verdict-score-calc";
import { getScoreColor } from "@/lib/utils";
import BrutalistCard from "@/components/ui/BrutalistCard";
import BrutalistButton from "@/components/ui/BrutalistButton";
import ScoreBreakdownModal from "./ScoreBreakdownModal";
import ScoreSimulatorModal from "./ScoreSimulatorModal";

interface VerdictScoreGaugeProps {
  politician: Politician;
}

export default function VerdictScoreGauge({ politician }: VerdictScoreGaugeProps) {
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const [simulatorModalOpen, setSimulatorModalOpen] = useState(false);

  const breakdown = calculateVerdictScore({
    attendancePercentage: politician.attendancePercentage,
    debatesParticipated: politician.debatesParticipated,
    questionsAsked: politician.questionsAsked,
    privateMemberBills: politician.privateMemberBills,
    assetDeclarations: politician.assetDeclarations,
    criminalCases: politician.criminalCases,
    educationStatus: politician.educationStatus,
    partyHistory: politician.partyHistory,
    citizenRatings: politician.citizenRatings,
    newsItems: politician.newsItems,
  });

  const scoreColor = getScoreColor(breakdown.finalScore);

  // Derive parameters for simulator initial values
  const activeSerious = politician.criminalCases.filter(
    (c) => (c.severityTier === "serious" || c.severityTier === "moderate") && c.status !== "acquitted"
  ).length;
  const activeSevere = politician.criminalCases.filter(
    (c) => c.severityTier === "severe" && c.status !== "acquitted"
  ).length;

  return (
    <>
      <BrutalistCard
        title="VERDICT SCORE ENGINE"
        badge="0.0 – 10.0 ALGORITHMIC"
        badgeColor="green"
        headerBg="bg-ink text-white"
        showWindowControls={true}
        statusLight="green"
        statusLightLabel="TAMPER PROOF"
      >
        <div className="space-y-6 font-mono">
          {/* Main Score Hero Block */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b-2.5 border-ink pb-6">
            <div className="flex items-center space-x-5">
              {/* Big Brutalist Score Number Badge */}
              <div
                className={`w-28 h-28 sm:w-32 sm:h-32 border-3 border-ink flex flex-col items-center justify-center shadow-hard-md ${scoreColor.bg} ${scoreColor.text} select-none`}
              >
                <span className="font-display font-black text-4xl sm:text-5xl tracking-tighter">
                  {breakdown.finalScore.toFixed(1)}
                </span>
                <span className="font-mono text-[11px] font-extrabold uppercase mt-0.5">
                  OUT OF 10.0
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-mono text-xs font-black px-2.5 py-0.5 border border-black uppercase shadow-hard-xs ${scoreColor.bg} ${scoreColor.text}`}
                  >
                    {breakdown.scoreBand}
                  </span>
                </div>
                <h3 className="font-display font-black text-lg sm:text-xl text-ink uppercase tracking-tight">
                  PUBLIC ACCOUNTABILITY RATING
                </h3>
                <p className="text-xs text-gray-600 max-w-sm leading-relaxed">
                  Synthesized dynamically from Form 26 disclosures, eCourts live sync, attendance records, and DigiLocker citizen votes.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col w-full sm:w-auto space-y-2 shrink-0">
              <BrutalistButton
                variant="outline"
                size="sm"
                shadow="sm"
                onClick={() => setBreakdownModalOpen(true)}
                className="flex items-center justify-between space-x-2 bg-surface"
              >
                <div className="flex items-center space-x-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-brand-red" />
                  <span>AUDIT FORMULA</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </BrutalistButton>

              <BrutalistButton
                variant="secondary"
                size="sm"
                shadow="sm"
                onClick={() => setSimulatorModalOpen(true)}
                className="flex items-center justify-between space-x-2"
              >
                <div className="flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-black" />
                  <span>WHAT-IF SIMULATOR</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </BrutalistButton>
            </div>
          </div>

          {/* Metric Breakdown Progress Mini-Bars */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-700">
              <span>SCORE CONSTITUENTS BREAKDOWN</span>
              <span className="text-[10px] text-gray-500">MAX WEIGHTS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* 1. Attendance */}
              <div className="bg-surface-muted border-1.5 border-ink p-2.5 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Parliament Attendance:</span>
                  <span className="text-green-700">+{breakdown.attendanceScore} / 2.0</span>
                </div>
                <div className="h-2 bg-gray-200 border border-ink overflow-hidden">
                  <div
                    className="h-full bg-brand-green"
                    style={{ width: `${(breakdown.attendanceScore / 2.0) * 100}%` }}
                  />
                </div>
              </div>

              {/* 2. Asset Trajectory */}
              <div className="bg-surface-muted border-1.5 border-ink p-2.5 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Asset Trajectory:</span>
                  <span className={breakdown.assetGrowthScore === 0 ? "text-brand-red font-black" : "text-green-700"}>
                    +{breakdown.assetGrowthScore} / 2.0
                  </span>
                </div>
                <div className="h-2 bg-gray-200 border border-ink overflow-hidden">
                  <div
                    className="h-full bg-brand-yellow"
                    style={{ width: `${(breakdown.assetGrowthScore / 2.0) * 100}%` }}
                  />
                </div>
              </div>

              {/* 3. Citizen Rating */}
              <div className="bg-surface-muted border-1.5 border-ink p-2.5 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>DigiLocker Citizen Rating:</span>
                  <span className="text-green-700">+{breakdown.citizenRatingScore} / 2.5</span>
                </div>
                <div className="h-2 bg-gray-200 border border-ink overflow-hidden">
                  <div
                    className="h-full bg-brand-pink"
                    style={{ width: `${(breakdown.citizenRatingScore / 2.5) * 100}%` }}
                  />
                </div>
              </div>

              {/* 4. Criminal Deductions */}
              <div className="bg-surface-muted border-1.5 border-ink p-2.5 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>eCourts Criminal Penalties:</span>
                  <span className={breakdown.criminalDeduction > 0 ? "text-brand-red font-black" : "text-green-700"}>
                    {breakdown.criminalDeduction > 0 ? `-${breakdown.criminalDeduction}` : "0.0"} / -4.0
                  </span>
                </div>
                <div className="h-2 bg-gray-200 border border-ink overflow-hidden">
                  <div
                    className="h-full bg-brand-red"
                    style={{ width: `${(breakdown.criminalDeduction / 4.0) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </BrutalistCard>

      {/* Audit Modal */}
      <ScoreBreakdownModal
        isOpen={breakdownModalOpen}
        onClose={() => setBreakdownModalOpen(false)}
        politician={politician}
      />

      {/* Simulator Modal */}
      <ScoreSimulatorModal
        isOpen={simulatorModalOpen}
        onClose={() => setSimulatorModalOpen(false)}
        politicianName={politician.fullName}
        initialAttendance={politician.attendancePercentage}
        initialEducation={politician.educationStatus}
        initialSwitches={Math.max(0, politician.partyHistory.length - 1)}
        initialSeriousCases={activeSerious}
        initialSevereCases={activeSevere}
        initialAssetGrowth={120}
        initialCitizenRating={4.0}
      />
    </>
  );
}
