"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Scale, 
  Search, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Award, 
  History, 
  Flame, 
  ArrowRight, 
  UserCheck, 
  Landmark,
  Sparkles,
  MapPin
} from "lucide-react";
import SearchBar from "@/features/search/SearchBar";
import { MOCK_POLITICIANS } from "@/data/mock-politicians";
import { Politician } from "@/types";
import { formatINR, getScoreColor, getEducationBadge, getProxiedImageUrl } from "@/lib/utils";
import BrutalistCard from "@/components/ui/BrutalistCard";
import BrutalistButton from "@/components/ui/BrutalistButton";
import CrimeCounter from "@/components/CrimeCounter";

export default function HomePage() {
  const [filteredPoliticians, setFilteredPoliticians] = useState<Politician[]>(MOCK_POLITICIANS);

  const handleFilterChange = useCallback((filtered: Politician[]) => {
    setFilteredPoliticians(filtered);
  }, []);

  // Top Ranked Politicians (High Verdict Score)
  const topRanked = [...MOCK_POLITICIANS]
    .sort((a, b) => b.calculatedVerdictScore - a.calculatedVerdictScore)
    .slice(0, 3);

  // Party Hoppers ("Aaya Ram Gaya Ram" Candidates)
  const partyHoppers = [...MOCK_POLITICIANS]
    .filter((p) => p.partyHistory.length > 1)
    .sort((a, b) => b.partyHistory.length - a.partyHistory.length)
    .slice(0, 3);

  // High Case or Outlier Candidates
  const alertCases = [...MOCK_POLITICIANS]
    .filter((p) => (p.criminalCases?.length || 0) > 0 || p.assetDeclarations.some((a) => a.isOutlierGrowth))
    .slice(0, 3);

  return (
    <div className="space-y-10 sm:space-y-14 font-mono">
      {/* Hero Section */}
      <section className="border-3 border-ink bg-surface shadow-hard-xl p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        {/* Retro scanline overlay */}
        <div className="absolute inset-0 bg-dot-matrix opacity-25 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Top Tag */}
          <div className="inline-flex items-center space-x-2 bg-brand-yellow px-3 py-1 border-2 border-ink shadow-hard-xs">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-black">
              DEMOCRATIC TRANSPARENCY INITIATIVE • SIH 2026
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-ink leading-none">
            INDIA&apos;S POLITICIAN <span className="bg-brand-green px-2 text-black border-2 border-ink">ACCOUNTABILITY</span> PLATFORM
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-gray-700 max-w-2xl mx-auto font-medium leading-relaxed">
            Transforming legally mandated ECI Form 26 affidavits, eCourts judicial dockets, and parliamentary transcripts into verifiable, tamper-proof <strong>VERDICT Scores (0–10.0)</strong>.
          </p>

          {/* Big Search Bar */}
          <div className="pt-2">
            <SearchBar onFilterChange={handleFilterChange} />
          </div>

          {/* Quick Disambiguation Demo Hint */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs pt-2">
            <span className="font-bold text-gray-500 uppercase">TRY SEARCHING:</span>
            <Link
              href="/politician/dr-arvind-shrivastava"
              className="bg-surface-muted hover:bg-brand-yellow px-2.5 py-1 border-1.5 border-ink font-bold transition-colors"
            >
              Dr. Arvind Shrivastava (9.7 Score)
            </Link>
            <Link
              href="/politician/digvijay-rathore"
              className="bg-surface-muted hover:bg-brand-yellow px-2.5 py-1 border-1.5 border-ink font-bold transition-colors"
            >
              Digvijay Rathore (4 Party Switches)
            </Link>
            <Link
              href="/politician/rameshwar-singh"
              className="bg-surface-muted hover:bg-brand-yellow px-2.5 py-1 border-1.5 border-ink font-bold transition-colors"
            >
              Rameshwar Singh (High Criminal / Asset Spike)
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Core Metric Highlights */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-surface border-3 border-ink p-5 shadow-hard-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">INDEXED REPRESENTATIVES</span>
            <Landmark className="w-5 h-5 text-brand-green" />
          </div>
          <div className="font-display font-black text-3xl sm:text-4xl text-ink">
            543 <span className="text-sm font-mono font-bold text-gray-600">MPs</span>
          </div>
          <p className="text-[11px] text-gray-600">
            Form 26 affidavit disclosures audited across 28 States and 8 Union Territories.
          </p>
        </div>

        <div className="bg-surface border-3 border-ink p-5 shadow-hard-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">eCOURTS LIVE DOCKETS</span>
            <Scale className="w-5 h-5 text-brand-red" />
          </div>
          <div className="font-display font-black text-3xl sm:text-4xl text-ink">
            1,420+ <span className="text-sm font-mono font-bold text-gray-600">CASES</span>
          </div>
          <p className="text-[11px] text-gray-600">
            Automated synchronization with National Judicial Data Grid (NJDG).
          </p>
        </div>

        <div className="bg-surface border-3 border-ink p-5 shadow-hard-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">DIGILOCKER 1-CITIZEN-1-VOTE</span>
            <ShieldCheck className="w-5 h-5 text-brand-cyan" />
          </div>
          <div className="font-display font-black text-3xl sm:text-4xl text-ink">
            100% <span className="text-sm font-mono font-bold text-gray-600">ANTI-BOT</span>
          </div>
          <p className="text-[11px] text-gray-600">
            Constituency-isolated citizen trust rating prevents cross-state IT cell raids.
          </p>
        </div>
      </section>

      {/* Money Trail Teaser Banner */}
      <section className="bg-[#111111] text-[#F5F3EF] border-3 border-ink p-5 sm:p-7 shadow-hard-xl font-mono relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-brand-red text-white px-2.5 py-0.5 border border-ink text-xs font-black uppercase shadow-hard-xs">
              <span className="w-2 h-2 rounded-full bg-brand-yellow animate-ping" />
              <span>GROUND TRUTH • CITIZEN MONEY TRAIL</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
              ₹4.83 LAKH CRORE EXPOSED BY <span className="text-brand-yellow underline decoration-brand-red decoration-2">CAG AUDITS</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-semibold leading-relaxed">
              Explore verified findings on highway cost inflation, unspent workers welfare treasuries, and ₹54,000+ crore booked under miscellaneous heads.
            </p>
          </div>

          <div className="shrink-0">
            <Link href="/money-trail">
              <BrutalistButton variant="primary" size="md" className="font-display font-black text-sm uppercase">
                <span>EXPLORE MONEY TRAIL</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </BrutalistButton>
            </Link>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-800 flex flex-wrap items-center gap-2 text-[11px] font-bold text-gray-400 relative z-10">
          <span className="text-brand-yellow uppercase text-[10px] font-black">FLAGGED CASES:</span>
          <span className="bg-[#1A1A1A] border border-gray-700 px-2 py-0.5 text-gray-200">Dwarka Expressway (14x Cost)</span>
          <span className="bg-[#1A1A1A] border border-gray-700 px-2 py-0.5 text-gray-200">BOCW Workers Fund (₹40,000 Cr)</span>
          <span className="bg-[#1A1A1A] border border-gray-700 px-2 py-0.5 text-gray-200">Nirbhaya Fund (&lt;20% Spent)</span>
          <span className="bg-[#1A1A1A] border border-gray-700 px-2 py-0.5 text-gray-200">Minor Head 800 (₹54,282 Cr)</span>
        </div>
      </section>

      {/* Featured Grids */}
      <section className="space-y-8">
        {/* 1. All Indexed Politician Dossiers */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-3 border-ink pb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-brand-green p-1.5 border-2 border-ink shadow-hard-xs">
                <Award className="w-5 h-5 text-black" />
              </div>
              <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
                ELECTED REPRESENTATIVES DIRECTORY ({filteredPoliticians.length})
              </h2>
            </div>

            <Link href="/compare">
              <BrutalistButton variant="cyan" size="sm" shadow="sm">
                COMPARE ANY TWO NETAS
              </BrutalistButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredPoliticians.map((p) => {
              const scoreColor = getScoreColor(p.calculatedVerdictScore);
              const eduBadge = getEducationBadge(p.educationStatus);
              const activeCases = (p.criminalCases || []).filter((c) => c.status !== "acquitted").length;
              const switches = Math.max(0, p.partyHistory.length - 1);

              return (
                <div
                  key={p.id}
                  className="bg-surface border-3 border-ink shadow-hard-md hover:-translate-y-1 hover:shadow-hard-lg transition-all flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Bar */}
                  <div className="bg-ink text-white px-3 py-1.5 flex items-center justify-between text-[11px] font-bold">
                    <span className="truncate">{p.house}</span>
                    <span className="text-brand-yellow truncate">{p.currentConstituency.state}</span>
                  </div>

                  <div className="p-4 space-y-4 flex-1">
                    {/* Portrait and Bio */}
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-20 border-2 border-ink bg-gray-200 overflow-hidden relative shrink-0 shadow-hard-xs">
                        <img
                          src={getProxiedImageUrl(p.photoUrl)}
                          alt={p.fullName}
                          className="w-full h-full object-cover grayscale contrast-125"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/default-politician.svg";
                          }}
                        />
                      </div>

                      <div className="flex-1 truncate">
                        <h3 className="font-display font-black text-lg uppercase text-ink truncate">
                          {p.fullName}
                        </h3>
                        <span
                          className="inline-block font-mono text-[11px] font-bold px-1.5 py-0.5 border border-ink mt-0.5"
                          style={{ backgroundColor: p.partyColor + "33" }}
                        >
                          {p.currentParty} ({p.partyAbbr})
                        </span>
                        <div className="text-xs text-gray-700 font-bold mt-1 flex items-center space-x-1 truncate">
                          <MapPin className="w-3 h-3 text-brand-red shrink-0" />
                          <span className="truncate">{p.currentConstituency.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Verdict Score Hero Card */}
                    <div className={`p-3 border-2 border-ink shadow-hard-xs flex items-center justify-between ${scoreColor.bg} ${scoreColor.text}`}>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-black/70 block">
                          VERDICT SCORE
                        </span>
                        <div className="font-display font-black text-2xl">
                          {p.calculatedVerdictScore.toFixed(1)} <span className="text-xs font-normal">/ 10</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-black text-white border border-black uppercase">
                        {p.scoreBand}
                      </span>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-800">
                      <div className="bg-surface-muted p-2 border border-ink">
                        <span className="text-gray-500 font-bold block text-[10px]">ATTENDANCE</span>
                        <strong>{p.attendancePercentage}%</strong>
                      </div>
                      <div className="bg-surface-muted p-2 border border-ink">
                        <span className="text-gray-500 font-bold block text-[10px]">ACTIVE CASES</span>
                        <strong className={activeCases > 0 ? "text-brand-red font-black" : "text-green-700"}>
                          {activeCases} {activeCases === 0 ? "Clean" : "Cases"}
                        </strong>
                      </div>
                    </div>

                    {/* Education Flag */}
                    <div className="flex items-center justify-between text-[10px] border-t border-gray-200 pt-2">
                      <span className="text-gray-600 font-bold">UGC Status:</span>
                      <span className={`px-1.5 py-0.2 font-bold border ${eduBadge.classNames}`}>
                        {eduBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="p-3 bg-canvas border-t-2 border-ink">
                    <Link href={`/politician/${p.slug}`}>
                      <BrutalistButton variant="primary" size="sm" className="w-full justify-between">
                        <span>VIEW FULL REPORT CARD</span>
                        <ArrowRight className="w-4 h-4" />
                      </BrutalistButton>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Spotlight: "Aaya Ram Gaya Ram" Serial Party Switchers */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between border-b-3 border-ink pb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-brand-red p-1.5 border-2 border-ink shadow-hard-xs text-white">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
                  &quot;AAYA RAM GAYA RAM&quot; PARTY-HOPPER SPOTLIGHT
                </h2>
                <p className="text-xs text-gray-600 font-medium">
                  Tracking multi-term party jump frequency and ideological loyalty scores.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {partyHoppers.map((p) => {
              const totalSwitches = p.partyHistory.length - 1;
              return (
                <div
                  key={p.id}
                  className="bg-surface border-3 border-ink p-5 shadow-hard-md space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-brand-red text-white text-xs font-black px-2 py-0.5 border border-ink shadow-hard-xs">
                        {totalSwitches} PARTY SWITCHES
                      </span>
                      <span className="text-xs font-bold text-gray-600">
                        {p.currentConstituency.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 border-2 border-ink bg-gray-200 overflow-hidden shrink-0">
                        <img
                          src={getProxiedImageUrl(p.photoUrl)}
                          alt={p.fullName}
                          className="w-full h-full object-cover grayscale"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/default-politician.svg";
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="font-display font-black text-base text-ink uppercase">
                          {p.fullName}
                        </h4>
                        <span className="text-xs text-gray-600 font-bold">
                          Now serving in: <strong>{p.currentParty}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Mini chronological chain */}
                    <div className="bg-canvas border-2 border-ink p-2.5 text-xs text-gray-800 space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">SWITCH HISTORY:</span>
                      <div className="font-bold text-[11px] leading-relaxed">
                        {p.partyHistory.map((h, i) => (
                          <span key={h.id} className="inline-flex items-center">
                            <span>{h.partyAbbr} ({h.startYear})</span>
                            {i < p.partyHistory.length - 1 && (
                              <ArrowRight className="w-3 h-3 mx-1 text-gray-500 stroke-[2.5]" aria-hidden="true" />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Link href={`/politician/${p.slug}`}>
                    <BrutalistButton variant="outline" size="sm" className="w-full">
                      INSPECT SUBWAY MAP
                    </BrutalistButton>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Crime Counter Section */}
      <CrimeCounter />
    </div>
  );
}
