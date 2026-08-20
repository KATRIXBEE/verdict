"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  GitCompare, 
  MapPin, 
  Award, 
  Scale, 
  Briefcase, 
  DollarSign, 
  History, 
  GraduationCap, 
  Star,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { Politician } from "@/types";
import { MOCK_POLITICIANS } from "@/data/mock-politicians";
import { formatINR, getScoreColor, getEducationBadge } from "@/lib/utils";
import BrutalistCard from "@/components/ui/BrutalistCard";
import BrutalistButton from "@/components/ui/BrutalistButton";

interface CompareMatrixProps {
  initialSlug1?: string;
  initialSlug2?: string;
}

export default function CompareMatrix({
  initialSlug1,
  initialSlug2,
}: CompareMatrixProps) {
  const [slug1, setSlug1] = useState<string>(initialSlug1 || MOCK_POLITICIANS[0].slug);
  const [slug2, setSlug2] = useState<string>(initialSlug2 || MOCK_POLITICIANS[1].slug);

  const neta1 = MOCK_POLITICIANS.find((p) => p.slug === slug1) || MOCK_POLITICIANS[0];
  const neta2 = MOCK_POLITICIANS.find((p) => p.slug === slug2) || MOCK_POLITICIANS[1];

  const score1Color = getScoreColor(neta1.calculatedVerdictScore);
  const score2Color = getScoreColor(neta2.calculatedVerdictScore);

  const edu1 = getEducationBadge(neta1.educationStatus);
  const edu2 = getEducationBadge(neta2.educationStatus);

  const latestAsset1 = neta1.assetDeclarations[neta1.assetDeclarations.length - 1]?.totalAssets || 0;
  const latestAsset2 = neta2.assetDeclarations[neta2.assetDeclarations.length - 1]?.totalAssets || 0;

  const activeCases1 = neta1.criminalCases.filter((c) => c.status !== "acquitted").length;
  const activeCases2 = neta2.criminalCases.filter((c) => c.status !== "acquitted").length;

  const switches1 = Math.max(0, neta1.partyHistory.length - 1);
  const switches2 = Math.max(0, neta2.partyHistory.length - 1);

  return (
    <div className="space-y-8 font-mono">
      {/* Header Selector Bar */}
      <div className="bg-surface border-3 border-ink p-4 sm:p-6 shadow-hard-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-ink pb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-red text-white p-2 border-2 border-ink shadow-hard-xs">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-2xl uppercase text-ink">
                NETA FACE-OFF: HEAD-TO-HEAD AUDIT
              </h2>
              <p className="text-xs text-gray-600">
                Compare any two elected representatives side-by-side on verified public metrics.
              </p>
            </div>
          </div>

          <span className="bg-brand-yellow text-black font-extrabold text-xs px-2.5 py-1 border border-ink shadow-hard-xs">
            ALGORITHMIC BENCHMARK
          </span>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div>
            <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
              SELECT CANDIDATE 1:
            </label>
            <select
              value={slug1}
              onChange={(e) => setSlug1(e.target.value)}
              className="w-full bg-surface-muted border-2.5 border-ink p-2.5 font-bold text-xs sm:text-sm text-ink focus:outline-none shadow-hard-xs"
            >
              {MOCK_POLITICIANS.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.fullName} ({p.partyAbbr} - {p.currentConstituency.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
              SELECT CANDIDATE 2:
            </label>
            <select
              value={slug2}
              onChange={(e) => setSlug2(e.target.value)}
              className="w-full bg-surface-muted border-2.5 border-ink p-2.5 font-bold text-xs sm:text-sm text-ink focus:outline-none shadow-hard-xs"
            >
              {MOCK_POLITICIANS.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.fullName} ({p.partyAbbr} - {p.currentConstituency.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Candidate 1 Card */}
        <div className="bg-surface border-3 border-ink shadow-hard-lg overflow-hidden flex flex-col justify-between">
          <div className="bg-ink text-white px-4 py-2 border-b-2.5 border-ink font-bold text-xs flex justify-between items-center">
            <span>CANDIDATE 1</span>
            <span className="text-brand-green">{neta1.currentConstituency.state}</span>
          </div>

          <div className="p-5 space-y-5 flex-1">
            {/* Portrait and Name */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 border-2.5 border-ink bg-gray-200 overflow-hidden shrink-0 shadow-hard-xs">
                <img
                  src={neta1.photoUrl}
                  alt={neta1.fullName}
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              </div>
              <div className="truncate">
                <h3 className="font-display font-black text-xl text-ink uppercase truncate">
                  {neta1.fullName}
                </h3>
                <span
                  className="inline-block font-mono text-xs font-bold px-2 py-0.5 border border-ink mt-1"
                  style={{ backgroundColor: neta1.partyColor + "33" }}
                >
                  {neta1.currentParty} ({neta1.partyAbbr})
                </span>
                <div className="text-xs text-gray-600 mt-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                  <span>{neta1.currentConstituency.name}</span>
                </div>
              </div>
            </div>

            {/* Score Hero */}
            <div className={`p-4 border-2.5 border-ink shadow-hard-sm ${score1Color.bg} ${score1Color.text}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-black/70">VERDICT SCORE</span>
                  <div className="font-display font-black text-3xl">
                    {neta1.calculatedVerdictScore.toFixed(1)} <span className="text-base font-normal">/ 10</span>
                  </div>
                </div>
                <span className="font-black text-xs px-2 py-1 bg-black text-white border border-black uppercase">
                  {neta1.scoreBand}
                </span>
              </div>
            </div>

            {/* Comparison Metrics List */}
            <div className="space-y-3 text-xs divide-y divide-gray-200">
              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-600 font-bold">Attendance:</span>
                <span className="font-black text-ink">{neta1.attendancePercentage}%</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-600 font-bold">Debates Participated:</span>
                <span className="font-bold text-ink">{neta1.debatesParticipated}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-600 font-bold">Active Criminal Cases:</span>
                <span className={`font-black ${activeCases1 > 0 ? "text-brand-red" : "text-green-700"}`}>
                  {activeCases1} {activeCases1 === 0 ? "(Clean)" : "Cases"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-600 font-bold">Latest Declared Assets:</span>
                <span className="font-black text-ink">{formatINR(latestAsset1)}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-600 font-bold">Party Switches:</span>
                <span className="font-bold text-ink">{switches1} Switch(es)</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-600 font-bold">UGC Education Check:</span>
                <span className={`px-1.5 py-0.5 text-[10px] font-bold border ${edu1.classNames}`}>
                  {edu1.label}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-canvas border-t-2 border-ink">
            <Link href={`/politician/${neta1.slug}`}>
              <BrutalistButton variant="outline" size="sm" className="w-full justify-between">
                <span>VIEW FULL DOSSIER</span>
                <ArrowRight className="w-4 h-4" />
              </BrutalistButton>
            </Link>
          </div>
        </div>

        {/* Candidate 2 Card */}
        <div className="bg-surface border-3 border-ink shadow-hard-lg overflow-hidden flex flex-col justify-between">
          <div className="bg-ink text-white px-4 py-2 border-b-2.5 border-ink font-bold text-xs flex justify-between items-center">
            <span>CANDIDATE 2</span>
            <span className="text-brand-cyan">{neta2.currentConstituency.state}</span>
          </div>

          <div className="p-5 space-y-5 flex-1">
            {/* Portrait and Name */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 border-2.5 border-ink bg-gray-200 overflow-hidden shrink-0 shadow-hard-xs">
                <img
                  src={neta2.photoUrl}
                  alt={neta2.fullName}
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              </div>
              <div className="truncate">
                <h3 className="font-display font-black text-xl text-ink uppercase truncate">
                  {neta2.fullName}
                </h3>
                <span
                  className="inline-block font-mono text-xs font-bold px-2 py-0.5 border border-ink mt-1"
                  style={{ backgroundColor: neta2.partyColor + "33" }}
                >
                  {neta2.currentParty} ({neta2.partyAbbr})
                </span>
                <div className="text-xs text-gray-600 mt-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                  <span>{neta2.currentConstituency.name}</span>
                </div>
              </div>
            </div>

            {/* Score Hero */}
            <div className={`p-4 border-2.5 border-ink shadow-hard-sm ${score2Color.bg} ${score2Color.text}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-black/70">VERDICT SCORE</span>
                  <div className="font-display font-black text-3xl">
                    {neta2.calculatedVerdictScore.toFixed(1)} <span className="text-base font-normal">/ 10</span>
                  </div>
                </div>
                <span className="font-black text-xs px-2 py-1 bg-black text-white border border-black uppercase">
                  {neta2.scoreBand}
                </span>
              </div>
            </div>

            {/* Comparison Metrics List */}
            <div className="space-y-3 text-xs divide-y divide-gray-200">
              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-600 font-bold">Attendance:</span>
                <span className="font-black text-ink">{neta2.attendancePercentage}%</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-600 font-bold">Debates Participated:</span>
                <span className="font-bold text-ink">{neta2.debatesParticipated}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-600 font-bold">Active Criminal Cases:</span>
                <span className={`font-black ${activeCases2 > 0 ? "text-brand-red" : "text-green-700"}`}>
                  {activeCases2} {activeCases2 === 0 ? "(Clean)" : "Cases"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-600 font-bold">Latest Declared Assets:</span>
                <span className="font-black text-ink">{formatINR(latestAsset2)}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-600 font-bold">Party Switches:</span>
                <span className="font-bold text-ink">{switches2} Switch(es)</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-600 font-bold">UGC Education Check:</span>
                <span className={`px-1.5 py-0.5 text-[10px] font-bold border ${edu2.classNames}`}>
                  {edu2.label}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-canvas border-t-2 border-ink">
            <Link href={`/politician/${neta2.slug}`}>
              <BrutalistButton variant="outline" size="sm" className="w-full justify-between">
                <span>VIEW FULL DOSSIER</span>
                <ArrowRight className="w-4 h-4" />
              </BrutalistButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
