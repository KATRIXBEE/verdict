"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building, ArrowRight, UserCheck, Sparkles, Filter, X, ArrowUpDown } from "lucide-react";
import { Politician } from "@/types";
import { searchPoliticians, MOCK_POLITICIANS } from "@/data/mock-politicians";
import DisambiguationModal from "./DisambiguationModal";
import { getScoreColor, getProxiedImageUrl } from "@/lib/utils";

export const ALL_STATES = [
  // 28 States
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  // 8 Union Territories
  "Andaman & Nicobar Islands", "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi", "Jammu & Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry",
].sort();

export const ALL_PARTIES = [
  "BJP", "INC", "SP", "DMK", "AITC", "RJD", "AAP", "JD(U)", "TDP", "SHS", "NCP", "CPI(M)", "YSRCP", "IND"
];

interface SearchBarProps {
  initialQuery?: string;
  showFilters?: boolean;
  onFilterChange?: (filtered: Politician[]) => void;
  className?: string;
}

export default function SearchBar({
  initialQuery = "",
  showFilters = true,
  onFilterChange,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<string>("All States");
  const [selectedParty, setSelectedParty] = useState<string>("All Parties");
  const [selectedHouse, setSelectedHouse] = useState<string>("All Houses");
  const [sortBy, setSortBy] = useState<string>("name_asc");
  const [disambiguationOpen, setDisambiguationOpen] = useState(false);
  const [disambiguationCandidates, setDisambiguationCandidates] = useState<Politician[]>([]);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener ('/' to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Coordinated multi-filter and sorting computation
  const filteredAndSortedPoliticians = useMemo(() => {
    let list = MOCK_POLITICIANS.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q === "" ||
        p.fullName.toLowerCase().includes(q) ||
        p.currentConstituency.name.toLowerCase().includes(q) ||
        p.currentConstituency.state.toLowerCase().includes(q) ||
        p.currentParty.toLowerCase().includes(q) ||
        p.partyAbbr.toLowerCase().includes(q);

      const matchesState =
        selectedState === "All States" ||
        p.currentConstituency.state.toLowerCase() === selectedState.toLowerCase();

      const matchesParty =
        selectedParty === "All Parties" ||
        p.partyAbbr.toLowerCase() === selectedParty.toLowerCase() ||
        p.currentParty.toLowerCase().includes(selectedParty.toLowerCase());

      const matchesHouse =
        selectedHouse === "All Houses" ||
        p.house.toLowerCase() === selectedHouse.toLowerCase();

      return matchesQuery && matchesState && matchesParty && matchesHouse;
    });

    // Apply sorting
    if (sortBy === "score_desc") {
      list = [...list].sort((a, b) => b.calculatedVerdictScore - a.calculatedVerdictScore);
    } else if (sortBy === "score_asc") {
      list = [...list].sort((a, b) => a.calculatedVerdictScore - b.calculatedVerdictScore);
    } else if (sortBy === "cases_desc") {
      list = [...list].sort((a, b) => (b.criminalCases?.length || 0) - (a.criminalCases?.length || 0));
    } else {
      list = [...list].sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    return list;
  }, [query, selectedState, selectedParty, selectedHouse, sortBy]);

  // Notify parent component
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filteredAndSortedPoliticians);
    }
  }, [filteredAndSortedPoliticians, onFilterChange]);

  const handleSelectPolitician = (p: Politician) => {
    const exactNameMatches = MOCK_POLITICIANS.filter(
      (item) => item.fullName.toLowerCase() === p.fullName.toLowerCase()
    );

    if (exactNameMatches.length > 1) {
      setDisambiguationCandidates(exactNameMatches);
      setDisambiguationOpen(true);
      setIsOpen(false);
    } else {
      router.push(`/politician/${p.slug}`);
      setIsOpen(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const matches = searchPoliticians(query);
    if (matches.length === 1) {
      router.push(`/politician/${matches[0].slug}`);
      setIsOpen(false);
    } else if (matches.length > 1) {
      setDisambiguationCandidates(matches);
      setDisambiguationOpen(true);
      setIsOpen(false);
    }
  };

  const hasActiveFilters =
    selectedState !== "All States" ||
    selectedParty !== "All Parties" ||
    selectedHouse !== "All Houses" ||
    sortBy !== "name_asc" ||
    query.trim() !== "";

  const handleResetFilters = () => {
    setSelectedState("All States");
    setSelectedParty("All Parties");
    setSelectedHouse("All Houses");
    setSortBy("name_asc");
    setQuery("");
  };

  return (
    <div className={`w-full font-mono relative ${className || ""}`} ref={searchContainerRef}>
      {/* Search Input Container */}
      <form onSubmit={handleFormSubmit} className="relative z-30">
        <div className="flex items-center bg-surface border-3 border-ink shadow-hard-lg focus-within:shadow-hard-xl transition-all">
          <div className="bg-brand-yellow px-3 sm:px-4 py-3.5 sm:py-4 border-r-2.5 border-ink flex items-center justify-center">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-black stroke-[2.5]" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search Neta by Name, Constituency, Party, or State (e.g. Narendra Modi, Varanasi, BJP)..."
            className="w-full bg-transparent px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-base font-bold text-ink placeholder:text-gray-400 focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-brand-red cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-2 pr-4 shrink-0">
            <kbd className="bg-surface-muted border-1.5 border-ink px-2 py-1 text-[11px] font-bold text-gray-600 shadow-hard-xs">
              /
            </kbd>
            <button
              type="submit"
              className="bg-brand-green text-black font-extrabold px-3 py-1.5 border-2 border-ink text-xs uppercase shadow-hard-xs hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              FIND DOSSIER
            </button>
          </div>
        </div>
      </form>

      {/* Comprehensive Filter & Sort Bar */}
      {showFilters && (
        <div className="mt-3 bg-surface border-2.5 border-ink p-3 sm:p-4 shadow-hard-xs space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/20 pb-2">
            <div className="flex items-center space-x-1.5 font-bold text-ink uppercase">
              <Filter className="w-3.5 h-3.5 text-brand-red" />
              <span>DIRECT QUERY FILTERS &amp; SORT:</span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="min-h-[36px] text-[11px] font-bold text-brand-red hover:underline inline-flex items-center space-x-1 cursor-pointer px-2 py-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>RESET ALL FILTERS</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {/* 1. State Filter (All 36 States & UTs) */}
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                STATE / UT ({ALL_STATES.length}):
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full min-h-[42px] sm:min-h-[38px] bg-canvas border-1.5 border-ink p-2 sm:p-1.5 text-xs font-bold text-ink focus:outline-none"
              >
                <option value="All States">All States ({ALL_STATES.length} States &amp; UTs)</option>
                {ALL_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Party Filter */}
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                POLITICAL PARTY:
              </label>
              <select
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
                className="w-full min-h-[42px] sm:min-h-[38px] bg-canvas border-1.5 border-ink p-2 sm:p-1.5 text-xs font-bold text-ink focus:outline-none"
              >
                <option value="All Parties">All Parties</option>
                {ALL_PARTIES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. House Filter */}
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                PARLIAMENTARY HOUSE:
              </label>
              <select
                value={selectedHouse}
                onChange={(e) => setSelectedHouse(e.target.value)}
                className="w-full min-h-[42px] sm:min-h-[38px] bg-canvas border-1.5 border-ink p-2 sm:p-1.5 text-xs font-bold text-ink focus:outline-none"
              >
                <option value="All Houses">All Houses</option>
                <option value="Lok Sabha">Lok Sabha (18th)</option>
                <option value="Rajya Sabha">Rajya Sabha</option>
              </select>
            </div>

            {/* 4. Sort By Dropdown */}
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                SORT BY:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full min-h-[42px] sm:min-h-[38px] bg-canvas border-1.5 border-ink p-2 sm:p-1.5 text-xs font-bold text-ink focus:outline-none"
              >
                <option value="name_asc">Name (A-Z)</option>
                <option value="score_desc">VERDICT Score (Highest first)</option>
                <option value="score_asc">VERDICT Score (Lowest first)</option>
                <option value="cases_desc">Criminal Cases (Most first)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border-3 border-ink shadow-hard-xl z-40 max-h-96 overflow-y-auto">
          <div className="bg-ink text-white px-4 py-2 text-xs font-bold uppercase flex justify-between items-center">
            <span>RESULTS ({filteredAndSortedPoliticians.length})</span>
            <span className="text-brand-yellow text-[10px]">CLICK TO VIEW VERIFIED DOSSIER</span>
          </div>

          {filteredAndSortedPoliticians.length === 0 ? (
            <div className="p-6 text-center text-sm font-bold text-gray-600 bg-surface-muted">
              <p>NO ELECTED REPRESENTATIVE FOUND FOR &quot;{query}&quot;</p>
              <p className="text-xs text-gray-500 font-normal mt-1">
                Try searching by official constituency name (e.g. Varanasi, Wayanad) or party abbreviation.
              </p>
            </div>
          ) : (
            <div className="divide-y-2 divide-ink">
              {filteredAndSortedPoliticians.slice(0, 10).map((p) => {
                const scoreColor = getScoreColor(p.calculatedVerdictScore);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPolitician(p)}
                    className="p-3 sm:p-4 hover:bg-brand-yellow/15 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      {/* Photo Thumbnail */}
                      <div className="w-10 h-10 border-2 border-ink bg-gray-200 overflow-hidden shrink-0">
                        <img
                          src={getProxiedImageUrl(p.photoUrl)}
                          alt={p.fullName}
                          className="w-full h-full object-cover grayscale contrast-125"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/default-politician.svg";
                          }}
                        />
                      </div>

                      <div className="truncate">
                        <div className="flex items-center space-x-2">
                          <span className="font-display font-black text-sm sm:text-base text-ink uppercase group-hover:text-brand-red transition-colors truncate">
                            {p.fullName}
                          </span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 border border-ink"
                            style={{ backgroundColor: p.partyColor + "33" }}
                          >
                            {p.partyAbbr}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-600 font-mono mt-0.5 truncate">
                          <span className="flex items-center space-x-1 truncate">
                            <MapPin className="w-3 h-3 text-brand-red shrink-0" />
                            <span>{p.currentConstituency.name}, {p.currentConstituency.state}</span>
                          </span>
                          <span>•</span>
                          <span>{p.house}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 ml-2">
                      <div className="text-right hidden sm:block font-mono">
                        <div className="text-[10px] text-gray-500 font-bold uppercase">VERDICT SCORE</div>
                        <span
                          className={`inline-block font-black text-xs px-2 py-0.5 border border-black ${scoreColor.bg} ${scoreColor.text}`}
                        >
                          {p.calculatedVerdictScore.toFixed(1)} / 10
                        </span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-ink group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Disambiguation Modal Dialog */}
      <DisambiguationModal
        isOpen={disambiguationOpen}
        onClose={() => setDisambiguationOpen(false)}
        query={query}
        candidates={disambiguationCandidates}
      />
    </div>
  );
}
