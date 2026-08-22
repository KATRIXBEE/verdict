"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import Modal from "@/components/ui/Modal";
import BrutalistButton from "@/components/ui/BrutalistButton";
import { getScoreBand, getScoreColor } from "@/lib/utils";

interface ScoreSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  politicianName: string;
  initialAttendance?: number;
  initialEducation?: "verified" | "unverified" | "suspicious";
  initialSwitches?: number;
  initialSeriousCases?: number;
  initialSevereCases?: number;
  initialAssetGrowth?: number;
  initialCitizenRating?: number;
}

export default function ScoreSimulatorModal({
  isOpen,
  onClose,
  politicianName,
  initialAttendance = 85,
  initialEducation = "verified",
  initialSwitches = 0,
  initialSeriousCases = 0,
  initialSevereCases = 0,
  initialAssetGrowth = 120,
  initialCitizenRating = 4.2,
}: ScoreSimulatorModalProps) {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [education, setEducation] = useState<"verified" | "unverified" | "suspicious">(initialEducation);
  const [switches, setSwitches] = useState(initialSwitches);
  const [seriousCases, setSeriousCases] = useState(initialSeriousCases);
  const [severeCases, setSevereCases] = useState(initialSevereCases);
  const [assetGrowth, setAssetGrowth] = useState(initialAssetGrowth);
  const [citizenRating, setCitizenRating] = useState(initialCitizenRating);

  // Compute live simulated score
  const attScore = attendance >= 90 ? 2.0 : attendance >= 75 ? 1.5 : attendance >= 50 ? 1.0 : 0.5;
  const assetScore = assetGrowth > 500 ? 0.0 : assetGrowth > 200 ? 1.0 : 2.0;
  const eduScore = education === "verified" ? 0.5 : education === "suspicious" ? 0.0 : 0.2;
  const citizenScore = (citizenRating / 5.0) * 2.5;
  const partyScore = switches === 0 ? 0.5 : switches === 1 ? 0.3 : 0.0;
  const newsScore = 0.5; // baseline neutral
  const crimDeduction = Math.min(4.0, seriousCases * 2.0 + severeCases * 3.5);

  const rawSimulated = attScore + assetScore + eduScore + citizenScore + partyScore + newsScore - crimDeduction;
  const simFinalScore = Number(Math.max(0.0, Math.min(10.0, rawSimulated)).toFixed(1));
  const simBand = getScoreBand(simFinalScore);
  const simColor = getScoreColor(simFinalScore);

  const resetToOriginal = () => {
    setAttendance(initialAttendance);
    setEducation(initialEducation);
    setSwitches(initialSwitches);
    setSeriousCases(initialSeriousCases);
    setSevereCases(initialSevereCases);
    setAssetGrowth(initialAssetGrowth);
    setCitizenRating(initialCitizenRating);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`WHAT-IF SIMULATOR: ${politicianName.toUpperCase()}`}
      badge="INTERACTIVE ENGINE"
      badgeColor="yellow"
      maxWidth="2xl"
    >
      <div className="space-y-6 font-mono">
        {/* Top Simulated Score Card */}
        <div className="bg-ink text-white border-3 border-ink p-4 sm:p-5 shadow-hard-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">
              SIMULATED ALGORITHMIC SCORE
            </span>
            <div className="flex items-center space-x-3 mt-1">
              <span className="font-display font-black text-4xl sm:text-5xl text-brand-green">
                {simFinalScore.toFixed(1)}
              </span>
              <span className="text-gray-400 text-lg font-bold">/ 10.0</span>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span
              className={`inline-block font-black text-xs px-3 py-1 border border-black uppercase ${simColor.bg} ${simColor.text}`}
            >
              {simBand}
            </span>
            <div className="text-[11px] text-gray-300 mt-1">
              Deductions: -{crimDeduction.toFixed(1)} pts
            </div>
          </div>
        </div>

        {/* Sliders Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Attendance Slider */}
          <div className="bg-surface-muted border-2 border-ink p-3 space-y-1.5">
            <div className="flex justify-between font-bold">
              <span>Parliament Attendance:</span>
              <span className="text-brand-red">{attendance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={attendance}
              onChange={(e) => setAttendance(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
            <div className="text-[10px] text-gray-600">Points Awarded: +{attScore.toFixed(1)} / 2.0</div>
          </div>

          {/* 5-Year Asset Surge */}
          <div className="bg-surface-muted border-2 border-ink p-3 space-y-1.5">
            <div className="flex justify-between font-bold">
              <span>5-Year Asset Growth:</span>
              <span className={assetGrowth > 500 ? "text-brand-red font-black" : "text-ink"}>
                +{assetGrowth}% {assetGrowth > 500 ? "(OUTLIER)" : ""}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="1000"
              step="20"
              value={assetGrowth}
              onChange={(e) => setAssetGrowth(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
            <div className="text-[10px] text-gray-600">Points Awarded: +{assetScore.toFixed(1)} / 2.0</div>
          </div>

          {/* Severe Criminal Charges (Murder, Rape, POCSO) */}
          <div className="bg-surface-muted border-2 border-ink p-3 space-y-1.5">
            <div className="flex justify-between font-bold">
              <span>Severe Charges (IPC 302, POCSO):</span>
              <span className="text-brand-red font-black">{severeCases} Active</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={severeCases}
              onChange={(e) => setSevereCases(Number(e.target.value))}
              className="w-full accent-brand-red cursor-pointer"
            />
            <div className="text-[10px] text-brand-red font-bold">
              Penalty: -{(severeCases * 3.5).toFixed(1)} pts
            </div>
          </div>

          {/* Serious Charges (Cheating 420, Graft, Rioting) */}
          <div className="bg-surface-muted border-2 border-ink p-3 space-y-1.5">
            <div className="flex justify-between font-bold">
              <span>Serious Charges (IPC 420, PCA):</span>
              <span className="text-brand-orange font-black">{seriousCases} Active</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              step="1"
              value={seriousCases}
              onChange={(e) => setSeriousCases(Number(e.target.value))}
              className="w-full accent-brand-orange cursor-pointer"
            />
            <div className="text-[10px] text-brand-orange font-bold">
              Penalty: -{(seriousCases * 2.0).toFixed(1)} pts
            </div>
          </div>

          {/* Party Switches ("Aaya Ram Gaya Ram") */}
          <div className="bg-surface-muted border-2 border-ink p-3 space-y-1.5">
            <div className="flex justify-between font-bold">
              <span>Party Switches:</span>
              <span className="text-ink font-bold">{switches} Jump(s)</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              step="1"
              value={switches}
              onChange={(e) => setSwitches(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
            <div className="text-[10px] text-gray-600">Loyalty Points: +{partyScore.toFixed(1)} / 0.5</div>
          </div>

          {/* Citizen Rating */}
          <div className="bg-surface-muted border-2 border-ink p-3 space-y-1.5">
            <div className="flex justify-between font-bold">
              <span>Citizen Verified Rating:</span>
              <span className="text-brand-yellow font-black">★ {citizenRating.toFixed(1)} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={citizenRating}
              onChange={(e) => setCitizenRating(Number(e.target.value))}
              className="w-full accent-brand-yellow cursor-pointer"
            />
            <div className="text-[10px] text-gray-600">Citizen Points: +{citizenScore.toFixed(2)} / 2.5</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2 border-t-2 border-ink">
          <button
            type="button"
            onClick={resetToOriginal}
            className="flex items-center space-x-1 text-xs font-bold text-gray-700 hover:text-brand-red"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RESET TO ACTUAL RECORD</span>
          </button>

          <BrutalistButton variant="primary" size="sm" onClick={onClose}>
            DONE INSPECTING
          </BrutalistButton>
        </div>
      </div>
    </Modal>
  );
}
