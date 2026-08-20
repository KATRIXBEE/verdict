"use client";

import React from "react";
import { Calculator, CheckCircle2, AlertOctagon, Info, ShieldCheck, Scale } from "lucide-react";
import { Politician } from "@/types";
import { calculateVerdictScore } from "@/lib/verdict-score-calc";
import { getScoreColor } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import BrutalistButton from "@/components/ui/BrutalistButton";

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  politician: Politician;
}

export default function ScoreBreakdownModal({
  isOpen,
  onClose,
  politician,
}: ScoreBreakdownModalProps) {
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

  const parameterRows = [
    {
      title: "1. Parliamentary Session Attendance",
      max: "+2.0 pts",
      awarded: `+${breakdown.attendanceScore.toFixed(2)} pts`,
      isPositive: true,
      desc: breakdown.details.attendanceText,
      weightRule: ">90% = +2.0 | 75-90% = +1.5 | 50-74% = +1.0 | <50% = +0.5",
    },
    {
      title: "2. Asset Growth Trajectory & Sanity",
      max: "+2.0 pts",
      awarded: `+${breakdown.assetGrowthScore.toFixed(2)} pts`,
      isPositive: true,
      desc: breakdown.details.assetText,
      weightRule: "Normal (<200%) = +2.0 | High (200-500%) = +1.0 | Outlier (>500%) = 0.0",
    },
    {
      title: "3. DigiLocker-Verified Citizen Trust Score",
      max: "+2.5 pts",
      awarded: `+${breakdown.citizenRatingScore.toFixed(2)} pts`,
      isPositive: true,
      desc: breakdown.details.citizenText,
      weightRule: "Normalized (Weighted Avg Star / 5.0) × 2.5 with 70% local voter weight",
    },
    {
      title: "4. 90-Day Media Scrape AI Sentiment",
      max: "+1.0 pts",
      awarded: `+${breakdown.newsSentimentScore.toFixed(2)} pts`,
      isPositive: true,
      desc: breakdown.details.newsText,
      weightRule: "Positive Coverage = +1.0 | Neutral = +0.5 | Critical = 0.0",
    },
    {
      title: "5. UGC / AICTE Academic Degree Verification",
      max: "+0.5 pts",
      awarded: `+${breakdown.educationScore.toFixed(2)} pts`,
      isPositive: true,
      desc: breakdown.details.educationText,
      weightRule: "Verified = +0.5 | Digital Archive = +0.2 | Suspicious / Fake List = 0.0",
    },
    {
      title: "6. Party Loyalty & Switch Track",
      max: "+0.5 pts",
      awarded: `+${breakdown.partyLoyaltyScore.toFixed(2)} pts`,
      isPositive: true,
      desc: breakdown.details.partyText,
      weightRule: "0 switches = +0.5 | 1 switch = +0.3 | ≥2 switches = 0.0",
    },
    {
      title: "7. Criminal Case Penal Deductions (eCourts Live)",
      max: "-4.0 pts",
      awarded: `-${breakdown.criminalDeduction.toFixed(2)} pts`,
      isPositive: false,
      desc: breakdown.details.criminalText,
      weightRule: "Minor (-0.5) | Moderate (-1.0) | Serious (-2.0) | Severe (-3.5) | Conviction (2x)",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`ALGORITHMIC SCORE AUDIT: ${politician.fullName.toUpperCase()}`}
      badge="FORMULA TRANSPARENCY"
      badgeColor="green"
      maxWidth="3xl"
    >
      <div className="space-y-6 font-mono">
        {/* Math Formula Callout */}
        <div className="bg-canvas border-2.5 border-ink p-4 shadow-hard-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-xs uppercase text-ink">
            <Scale className="w-4 h-4 text-brand-red" />
            <span>THE VERDICT FORMULA:</span>
          </div>
          <div className="bg-surface border border-ink p-2.5 text-xs text-gray-900 font-bold overflow-x-auto">
            VERDICT Score = clamp( Σ(Positive Parameters) - Σ(Criminal Deductions), 0.0, 10.0 )
          </div>
        </div>

        {/* Audit Table */}
        <div className="border-2.5 border-ink bg-surface overflow-hidden shadow-hard-sm">
          <div className="bg-ink text-white px-4 py-2 text-xs font-bold uppercase grid grid-cols-12 gap-2">
            <span className="col-span-7 sm:col-span-8">METRIC PARAMETER</span>
            <span className="col-span-2 text-right hidden sm:block">MAX</span>
            <span className="col-span-5 sm:col-span-2 text-right">AWARDED</span>
          </div>

          <div className="divide-y-2 divide-ink text-xs">
            {parameterRows.map((row, idx) => (
              <div key={idx} className="p-3 sm:p-4 hover:bg-surface-muted transition-colors space-y-1">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-7 sm:col-span-8 font-bold text-ink flex items-center space-x-1.5">
                    {row.isPositive ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
                    ) : (
                      <AlertOctagon className="w-3.5 h-3.5 text-brand-red shrink-0" />
                    )}
                    <span>{row.title}</span>
                  </div>

                  <div className="col-span-2 text-right text-gray-500 font-bold hidden sm:block">
                    {row.max}
                  </div>

                  <div
                    className={`col-span-5 sm:col-span-2 text-right font-black ${
                      row.isPositive ? "text-green-700" : "text-brand-red"
                    }`}
                  >
                    {row.awarded}
                  </div>
                </div>

                <div className="text-[11px] text-gray-600 pl-5">
                  {row.desc}
                </div>
                <div className="text-[10px] text-gray-400 pl-5 font-medium">
                  Logic: {row.weightRule}
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer Total */}
          <div className="bg-ink text-white p-4 border-t-2.5 border-ink flex items-center justify-between">
            <span className="font-display font-black text-sm uppercase">
              FINAL COMPUTED VERDICT SCORE:
            </span>
            <div className="flex items-center space-x-2">
              <span className={`font-mono font-black text-base px-2 py-0.5 border border-black ${scoreColor.bg} ${scoreColor.text}`}>
                {breakdown.finalScore.toFixed(1)} / 10.0
              </span>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex justify-end">
          <BrutalistButton variant="primary" size="sm" onClick={onClose}>
            CLOSE AUDIT
          </BrutalistButton>
        </div>
      </div>
    </Modal>
  );
}
