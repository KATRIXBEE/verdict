"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Newspaper, 
  Filter, 
  MapPin, 
  LayoutGrid, 
  Compass, 
  ArrowUpDown, 
  Search, 
  X, 
  SlidersHorizontal,
  Flame,
  Users,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { GroundTruthArticle, GroundTruthCategory } from "@/types";
import { MOCK_GROUND_TRUTH_ARTICLES, filterGroundTruthArticles } from "@/data/mock-ground-truth";
import { MOCK_POLITICIANS } from "@/data/mock-politicians";
import ArticleCard from "@/features/ground-truth/ArticleCard";
import GroundTruthMap from "@/features/ground-truth/GroundTruthMap";
import BrutalistButton from "@/components/ui/BrutalistButton";

function GroundTruthListingContent() {
  const searchParams = useSearchParams();
  const initialPolitician = searchParams.get("politician") || "ALL";

  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedPolitician, setSelectedPolitician] = useState<string>(initialPolitician);
  const [sortBy, setSortBy] = useState<"recent" | "read" | "shared" | "impact">("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // Keep synced if query param changes
  useEffect(() => {
    if (initialPolitician && initialPolitician !== "ALL") {
      setSelectedPolitician(initialPolitician);
    }
  }, [initialPolitician]);

  const categories: GroundTruthCategory[] = [
    "Industrial & Environmental",
    "Infrastructure & Contractor Fraud",
    "Healthcare & Public Health",
    "Education",
    "Water & Sanitation",
    "Agriculture & Farmers",
    "Housing & Displacement",
    "Electoral Malpractice",
    "Financial Corruption",
    "Police & Justice",
    "Media Blackout Stories",
  ];

  const states = [
    "ALL",
    "Gujarat",
    "Uttar Pradesh",
    "Madhya Pradesh",
    "West Bengal",
    "Delhi",
    "Bihar",
    "Karnataka",
  ];

  const filteredArticles = filterGroundTruthArticles({
    state: selectedState,
    category: selectedCategory,
    politicianId: selectedPolitician,
    sortBy,
    searchQuery,
  });

  const totalAffected = filteredArticles.reduce((acc, a) => acc + a.affectedPeopleCount, 0);

  const activePoliticianObj = MOCK_POLITICIANS.find(
    (p) => p.slug.toLowerCase() === selectedPolitician.toLowerCase() || p.id.toLowerCase() === selectedPolitician.toLowerCase()
  );

  return (
    <div className="space-y-8 font-mono">
      {/* Header Banner */}
      <section className="border-3 border-ink bg-surface shadow-hard-xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-brand-pink text-black px-3 py-1 border-2 border-ink text-xs font-black uppercase shadow-hard-xs">
            <Newspaper className="w-4 h-4" />
            <span>GRASSROOTS CIVIC JOURNALISM DESK</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-ink">
            GROUND TRUTH
          </h1>

          <p className="font-display font-extrabold text-base sm:text-xl text-brand-red uppercase tracking-tight">
            &quot;Stories mainstream media won&apos;t tell you.&quot;
          </p>

          <p className="text-xs sm:text-sm text-gray-700 max-w-2xl leading-relaxed">
            Independent, on-the-ground investigative reports documenting environmental violations, infrastructure corruption, ghost public health clinics, and citizen grievances with verified RTI dockets and satellite evidence.
          </p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-bold">
            <div className="bg-canvas border-2 border-ink px-3 py-1.5 shadow-hard-xs">
              <span>{MOCK_GROUND_TRUTH_ARTICLES.length} INVESTIGATIONS PUBLISHED</span>
            </div>
            <div className="bg-brand-red text-white border-2 border-ink px-3 py-1.5 shadow-hard-xs">
              <span>{totalAffected.toLocaleString("en-IN")} CITIZENS DIRECTLY IMPACTED</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & View Mode Control Bar */}
      <div className="bg-surface border-3 border-ink p-4 sm:p-5 shadow-hard-md space-y-4">
        {/* Search and View Mode Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="flex-1 w-full sm:w-auto flex items-center bg-canvas border-2 border-ink shadow-hard-xs">
            <div className="p-2.5 bg-brand-yellow border-r-2 border-ink">
              <Search className="w-4 h-4 text-black" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by keyword, district, department, or issue..."
              className="w-full bg-transparent px-3 py-2 text-xs font-bold text-ink focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-2 text-gray-500 hover:text-brand-red mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Mode Toggle: Grid vs Map */}
          <div className="flex items-center space-x-1 bg-canvas border-2 border-ink p-1 self-stretch sm:self-auto justify-center">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-brand-yellow text-black border border-ink shadow-hard-xs font-black"
                  : "text-gray-700 hover:text-black"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>REPORT GRID</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === "map"
                  ? "bg-brand-cyan text-black border border-ink shadow-hard-xs font-black"
                  : "text-gray-700 hover:text-black"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>DISTRICT RADAR MAP</span>
            </button>
          </div>
        </div>

        {/* Dropdowns Row: State, Category, Politician, Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* State */}
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
              STATE:
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-surface-muted border-1.5 border-ink p-2 font-bold text-ink focus:outline-none"
            >
              {states.map((st) => (
                <option key={st} value={st}>
                  {st === "ALL" ? "ALL STATES" : st}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
              INVESTIGATION CATEGORY:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-surface-muted border-1.5 border-ink p-2 font-bold text-ink focus:outline-none"
            >
              <option value="ALL">ALL CATEGORIES ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Politician Filter */}
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
              FILTER BY NAMED POLITICIAN:
            </label>
            <select
              value={selectedPolitician}
              onChange={(e) => setSelectedPolitician(e.target.value)}
              className="w-full bg-surface-muted border-1.5 border-ink p-2 font-bold text-ink focus:outline-none"
            >
              <option value="ALL">ALL POLITICIANS</option>
              {MOCK_POLITICIANS.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.fullName} ({p.partyAbbr} - {p.currentConstituency.name})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
              SORT ORDER:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-surface-muted border-1.5 border-ink p-2 font-bold text-ink focus:outline-none"
            >
              <option value="recent">Most Recent First</option>
              <option value="impact">Highest Affected Population</option>
              <option value="read">Most Upvoted (&quot;This Matters&quot;)</option>
              <option value="shared">Most Citizen Verified</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(selectedState !== "ALL" || selectedCategory !== "ALL" || selectedPolitician !== "ALL" || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-300 text-xs">
            <span className="text-[10px] text-gray-500 font-bold uppercase">ACTIVE FILTERS:</span>
            {selectedState !== "ALL" && (
              <span className="bg-brand-cyan text-black px-2 py-0.5 border border-ink text-[11px] font-bold">
                State: {selectedState}
              </span>
            )}
            {selectedCategory !== "ALL" && (
              <span className="bg-brand-yellow text-black px-2 py-0.5 border border-ink text-[11px] font-bold">
                Category: {selectedCategory}
              </span>
            )}
            {selectedPolitician !== "ALL" && (
              <span className="bg-brand-red text-white px-2 py-0.5 border border-ink text-[11px] font-bold">
                Lawmaker: {activePoliticianObj?.fullName || selectedPolitician}
              </span>
            )}
            {searchQuery && (
              <span className="bg-surface-muted text-ink px-2 py-0.5 border border-ink text-[11px] font-bold">
                Query: &quot;{searchQuery}&quot;
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedState("ALL");
                setSelectedCategory("ALL");
                setSelectedPolitician("ALL");
                setSearchQuery("");
              }}
              className="text-[11px] font-bold text-brand-red hover:underline ml-auto"
            >
              RESET ALL
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area: Grid vs Map */}
      {viewMode === "map" ? (
        <GroundTruthMap articles={filteredArticles} />
      ) : filteredArticles.length === 0 ? (
        <div className="bg-surface border-3 border-ink p-12 text-center space-y-3 shadow-hard-md">
          <p className="font-display font-black text-xl text-ink uppercase">
            NO INVESTIGATIVE REPORTS FOUND
          </p>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            No ground truth reports match your selected filters. Try clearing or expanding your category or state criteria.
          </p>
          <div className="pt-2">
            <BrutalistButton
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedState("ALL");
                setSelectedCategory("ALL");
                setSelectedPolitician("ALL");
                setSearchQuery("");
              }}
            >
              CLEAR ALL FILTERS
            </BrutalistButton>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function GroundTruthListingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono font-bold">LOADING GROUND TRUTH REPORTS...</div>}>
      <GroundTruthListingContent />
    </Suspense>
  );
}
