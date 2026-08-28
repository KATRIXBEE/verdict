"use client";

import React, { useEffect, useState } from "react";
import { AlertOctagon, ShieldCheck, FileSearch } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface MoneyTrailHeroProps {
  totalExposedCrore?: number;
  totalWastedCrore?: number;
  totalRecoveredCrore?: number;
  totalScamsCount?: number;
}

export default function MoneyTrailHero({
  totalExposedCrore = 483321.46,
  totalWastedCrore = 454365.32,
  totalRecoveredCrore = 1031.0,
  totalScamsCount = 10,
}: MoneyTrailHeroProps) {
  const [displayExposed, setDisplayExposed] = useState(0);
  const [displayWasted, setDisplayWasted] = useState(0);
  const [displayRecovered, setDisplayRecovered] = useState(0);

  useEffect(() => {
    const duration = 1400; // ms
    const steps = 40;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      setDisplayExposed(Math.round(totalExposedCrore * ease));
      setDisplayWasted(Math.round(totalWastedCrore * ease));
      setDisplayRecovered(Math.round(totalRecoveredCrore * ease));

      if (progress >= 1) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [totalExposedCrore, totalWastedCrore, totalRecoveredCrore]);

  const wastedPercent = ((totalWastedCrore / totalExposedCrore) * 100).toFixed(1);
  const recoveredPercent = ((totalRecoveredCrore / totalExposedCrore) * 100).toFixed(2);

  return (
    <section className="bg-[#111111] text-[#F5F3EF] border-3 border-ink p-6 sm:p-10 lg:p-12 shadow-hard-xl font-mono relative overflow-hidden space-y-8">
      {/* Background Accent Grids */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/10 blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-yellow/5 blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Top Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="inline-flex items-center space-x-2 bg-brand-red text-white px-3 py-1 border-2 border-ink text-xs font-black uppercase shadow-hard-xs">
          <AlertOctagon className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span>GROUND TRUTH • CITIZEN MONEY TRAIL</span>
        </div>
        <div className="inline-flex items-center space-x-1.5 text-xs text-gray-400 font-bold uppercase">
          <FileSearch className="w-3.5 h-3.5 text-brand-yellow" />
          <span>CAG AUDIT &amp; SC PROCEEDINGS REPOSITORY</span>
        </div>
      </div>

      {/* Hero Headings */}
      <div className="max-w-4xl space-y-3 relative z-10">
        <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-tight">
          WHERE DOES YOUR <span className="text-brand-red underline decoration-brand-yellow decoration-4">TAX MONEY</span> GO?
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed font-semibold">
          Every figure below is sourced from official <strong>CAG audit reports, Supreme Court orders, and Parliamentary records</strong>. These are not partisan allegations. These are verified constitutional findings of taxpayer fund inflation, diversion, and unspent welfare treasuries.
        </p>
      </div>

      {/* Live Animated Metric Counter Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative z-10">
        {/* Metric 1: Total Exposed */}
        <div className="bg-[#1A1A1A] border-2.5 border-ink p-5 shadow-hard-md space-y-2 relative group hover:border-brand-yellow transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase">
            <span>TOTAL EXPOSED BY AUDITS</span>
            <span className="bg-brand-yellow text-black px-1.5 py-0.2 border border-ink text-[10px]">
              {totalScamsCount} CASES
            </span>
          </div>
          <div className="font-display font-black text-2xl sm:text-4xl text-brand-yellow tracking-tight">
            {formatINR(displayExposed * 10000000, { short: true })}
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            Accumulated public capital flagged across major central &amp; state audit reviews.
          </p>
        </div>

        {/* Metric 2: Money Wasted / Diverted */}
        <div className="bg-[#1A1A1A] border-2.5 border-ink p-5 shadow-hard-md space-y-2 relative group hover:border-brand-red transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase">
            <span>MONEY WASTED / UNACCOUNTED</span>
            <span className="bg-brand-red text-white px-1.5 py-0.2 border border-ink text-[10px]">
              {wastedPercent}% LOST
            </span>
          </div>
          <div className="font-display font-black text-2xl sm:text-4xl text-brand-red tracking-tight">
            {formatINR(displayWasted * 10000000, { short: true })}
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            Overpriced infrastructure, locked welfare funds, or uncertified disbursements.
          </p>
        </div>

        {/* Metric 3: Money Recovered */}
        <div className="bg-[#1A1A1A] border-2.5 border-ink p-5 shadow-hard-md space-y-2 relative group hover:border-brand-green transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase">
            <span>MONEY RECOVERED TO DATE</span>
            <span className="bg-brand-green text-black px-1.5 py-0.2 border border-ink text-[10px]">
              {recoveredPercent}% ONLY
            </span>
          </div>
          <div className="font-display font-black text-2xl sm:text-4xl text-brand-green tracking-tight">
            {formatINR(displayRecovered * 10000000, { short: true })}
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            Funds clawed back by enforcement agencies or disbursed after Supreme Court orders.
          </p>
        </div>
      </div>

      {/* Bottom Citation Disclaimer */}
      <div className="pt-2 border-t border-gray-800 text-[11px] text-gray-400 flex flex-wrap items-center justify-between gap-2 relative z-10">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#00C853] stroke-[2.5]" />
          <span>Primary Authorities: CAG of India, Supreme Court of India, Public Accounts Committee.</span>
        </div>
        <span className="text-gray-500 font-bold uppercase text-[10px]">
          VERIFIED OFFICIAL DATA • NO EDITORIAL ALLEGATION
        </span>
      </div>
    </section>
  );
}
