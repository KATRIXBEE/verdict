"use client";

import React, { useState, useMemo } from "react";
import { SCAM_CASES_DATA, ScamCase } from "@/data/mock-scams";
import MoneyTrailHero from "@/features/money-trail/MoneyTrailHero";
import VerifiedDataDisclaimer from "@/components/VerifiedDataDisclaimer";
import CategoryBreakdownChart from "@/features/money-trail/CategoryBreakdownChart";
import ScamCard from "@/features/money-trail/ScamCard";
import InfrastructureComparisonTool from "@/features/money-trail/InfrastructureComparisonTool";
import MinisterAccountabilityMap from "@/features/money-trail/MinisterAccountabilityMap";
import CitizenActionSection from "@/features/money-trail/CitizenActionSection";
import ShareCardModal from "@/features/money-trail/ShareCardModal";
import { Filter, SlidersHorizontal, Layers } from "lucide-react";

export default function MoneyTrailClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedSort, setSelectedSort] = useState<string>("amount_desc");
  const [activeShareScam, setActiveShareScam] = useState<ScamCase | null>(null);

  const categories = [
    { label: "All Categories", value: "ALL" },
    { label: "Infrastructure", value: "Infrastructure Overpricing" },
    { label: "Welfare Funds", value: "Welfare Fund Misuse" },
    { label: "Environment", value: "Environmental Fund Misuse" },
    { label: "Healthcare", value: "Healthcare Fraud" },
    { label: "State Fraud", value: "State Government Fraud" },
    { label: "Financial / Scheme", value: "Financial Irregularity" },
  ];

  const severities = [
    { label: "All Severities", value: "ALL", color: "" },
    { label: "Severe", value: "Severe", color: "bg-brand-red" },
    { label: "Serious", value: "Serious", color: "bg-brand-orange" },
    { label: "Moderate", value: "Moderate", color: "bg-brand-yellow" },
  ];

  const filteredScams = useMemo(() => {
    let result = [...SCAM_CASES_DATA];

    if (selectedCategory !== "ALL") {
      result = result.filter((scam) =>
        scam.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (selectedSeverity !== "ALL") {
      result = result.filter(
        (scam) => scam.severity.toLowerCase() === selectedSeverity.toLowerCase()
      );
    }

    if (selectedSort === "corruption_percent") {
      result.sort((a, b) => (b.corruption_percent || 0) - (a.corruption_percent || 0));
    } else if (selectedSort === "newest") {
      result.sort((a, b) => (b.audit_year || 0) - (a.audit_year || 0));
    } else {
      // Default: Highest amount
      result.sort(
        (a, b) =>
          (b.amount_allocated_crore || b.amount_misused_crore || 0) -
          (a.amount_allocated_crore || a.amount_misused_crore || 0)
      );
    }

    return result;
  }, [selectedCategory, selectedSeverity, selectedSort]);

  return (
    <div className="space-y-10 sm:space-y-12 font-mono pb-12">
      {/* SECTION 1: HERO HEADER */}
      <MoneyTrailHero />

      {/* VERIFIED DATA DISCLAIMER */}
      <VerifiedDataDisclaimer />

      {/* SECTION 2: CATEGORY BREAKDOWN DONUT CHART */}
      <CategoryBreakdownChart />

      {/* SECTION 3: SCAM DOSSIERS & FILTER BAR */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2.5 border-ink pb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-brand-red stroke-[2.5]" />
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
              SECTION 3: VERIFIED CAG &amp; SUPREME COURT AUDIT DOSSIERS
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-surface px-2.5 py-1 border border-ink shadow-hard-xs">
            SHOWING {filteredScams.length} OF {SCAM_CASES_DATA.length} CASES
          </span>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-surface border-3 border-ink p-4 sm:p-5 shadow-hard-md space-y-4">
          {/* Category Filter */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-2">
            <span className="text-xs font-black uppercase text-gray-600 shrink-0 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5" />
              <span>CATEGORY:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-2.5 py-1 border-2 border-ink text-xs font-bold transition-all shadow-hard-xs ${
                      isSelected
                        ? "bg-brand-red text-white -translate-x-0.5 -translate-y-0.5 shadow-hard-sm"
                        : "bg-canvas hover:bg-surface-muted text-ink"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity & Sort Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-ink/20 text-xs">
            {/* Severity Filter */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="font-black text-gray-600 uppercase text-[11px]">SEVERITY:</span>
              {severities.map((sev) => {
                const isSelected = selectedSeverity === sev.value;
                return (
                  <button
                    key={sev.value}
                    onClick={() => setSelectedSeverity(sev.value)}
                    className={`px-2.5 py-0.5 border border-ink text-xs font-bold transition-all inline-flex items-center ${
                      isSelected
                        ? "bg-brand-yellow text-black font-black"
                        : "bg-canvas hover:bg-surface-muted text-gray-700"
                    }`}
                  >
                    {sev.color && (
                      <span
                        className={`w-2 h-2 rounded-full border border-ink inline-block mr-1.5 ${sev.color}`}
                        aria-hidden="true"
                      />
                    )}
                    <span>{sev.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
              <span className="font-black text-gray-600 uppercase text-[11px]">SORT BY:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-canvas border-2 border-ink px-2 py-1 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-brand-red"
              >
                <option value="amount_desc">Highest Amount Flagged</option>
                <option value="corruption_percent">Highest Corruption / Waste %</option>
                <option value="newest">Latest Audit Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scam Cards Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredScams.map((scam) => (
            <ScamCard
              key={scam.slug}
              scam={scam}
              onOpenShareModal={(s) => setActiveShareScam(s)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 5: MINI COMPARISON TOOL */}
      <InfrastructureComparisonTool />

      {/* SECTION 6: POLITICIAN ACCOUNTABILITY MAP */}
      <MinisterAccountabilityMap />

      {/* SECTION 7: WHAT CITIZENS CAN DO */}
      <CitizenActionSection />

      {/* SOCIAL SHARE CARD MODAL */}
      <ShareCardModal
        scam={activeShareScam}
        onClose={() => setActiveShareScam(null)}
      />
    </div>
  );
}
