"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building, ArrowRight, UserCheck, Sparkles, Filter, X } from "lucide-react";
import { Politician } from "@/types";
import { searchPoliticians, MOCK_POLITICIANS } from "@/data/mock-politicians";
import DisambiguationModal from "./DisambiguationModal";
import { getScoreColor } from "@/lib/utils";

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
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedParty, setSelectedParty] = useState<string>("ALL");
  const [disambiguationOpen, setDisambiguationOpen] = useState(false);
  const [disambiguationCandidates, setDisambiguationCandidates] = useState<Politician[]>([]);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener ('/' to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
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

  // Filter politicians based on query and selected pills
  const filteredPoliticians = MOCK_POLITICIANS.filter((p) => {
    const matchesQuery =
      query.trim() === "" ||
      p.fullName.toLowerCase().includes(query.toLowerCase()) ||
      p.currentConstituency.name.toLowerCase().includes(query.toLowerCase()) ||
      p.currentConstituency.state.toLowerCase().includes(query.toLowerCase()) ||
      p.currentParty.toLowerCase().includes(query.toLowerCase()) ||
      p.partyAbbr.toLowerCase().includes(query.toLowerCase());

    const matchesState = selectedState === "ALL" || p.currentConstituency.state === selectedState;
    const matchesParty = selectedParty === "ALL" || p.partyAbbr === selectedParty;

    return matchesQuery && matchesState && matchesParty;
  });

  // Notify parent component if callback provided
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filteredPoliticians);
    }
  }, [query, selectedState, selectedParty]);

  const handleSelectPolitician = (p: Politician) => {
    // Check if there are other candidates with identical full name
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

  const states = ["ALL", "Delhi", "Uttar Pradesh", "Karnataka", "West Bengal", "Madhya Pradesh", "Bihar", "Gujarat"];
  const parties = ["ALL", "BJP", "INC", "SP", "DMK", "AITC", "RJD", "IND"];

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
            placeholder="Search Neta by Name, Constituency, Party, or State (e.g. Ramesh Kumar, Delhi, BJP)..."
            className="w-full bg-transparent px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-base font-bold text-ink placeholder:text-gray-400 focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-2 text-gray-500 hover:text-brand-red mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-2 pr-4 shrink-0">
            <kbd className="bg-surface-muted border-1.5 border-ink px-2 py-1 text-[11px] font-bold text-gray-600 shadow-hard-xs">
              /
            </kbd>
            <button
              type="submit"
              className="bg-brand-green text-black font-extrabold px-3 py-1.5 border-2 border-ink text-xs uppercase shadow-hard-xs hover:-translate-y-0.5 transition-transform"
            >
              FIND DOSSIER
            </button>
          </div>
        </div>
      </form>

      {/* Quick Filter Bar */}
      {showFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          <div className="flex items-center space-x-1 text-gray-700 font-bold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[11px] uppercase">Filter:</span>
          </div>

          {/* State Pills */}
          <div className="flex flex-wrap items-center gap-1">
            {states.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedState(st)}
                className={`px-2 py-0.5 text-[11px] font-bold border-1.5 border-ink transition-all ${
                  selectedState === st
                    ? "bg-brand-cyan text-black shadow-hard-xs font-black"
                    : "bg-surface hover:bg-surface-muted text-gray-800"
                }`}
              >
                {st === "ALL" ? "ALL STATES" : st}
              </button>
            ))}
          </div>

          <span className="text-gray-400 font-bold mx-1 hidden sm:inline">|</span>

          {/* Party Pills */}
          <div className="flex flex-wrap items-center gap-1">
            {parties.map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() => setSelectedParty(pt)}
                className={`px-2 py-0.5 text-[11px] font-bold border-1.5 border-ink transition-all ${
                  selectedParty === pt
                    ? "bg-brand-yellow text-black shadow-hard-xs font-black"
                    : "bg-surface hover:bg-surface-muted text-gray-800"
                }`}
              >
                {pt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border-3 border-ink shadow-hard-xl z-40 max-h-96 overflow-y-auto">
          <div className="bg-ink text-white px-4 py-2 text-xs font-bold uppercase flex justify-between items-center">
            <span>RESULTS ({filteredPoliticians.length})</span>
            <span className="text-brand-yellow text-[10px]">CLICK TO VIEW VERIFIED DOSSIER</span>
          </div>

          {filteredPoliticians.length === 0 ? (
            <div className="p-6 text-center text-sm font-bold text-gray-600 bg-surface-muted">
              <p>NO ELECTED REPRESENTATIVE FOUND FOR &quot;{query}&quot;</p>
              <p className="text-xs text-gray-500 font-normal mt-1">
                Try searching by official constituency name (e.g. Varanasi, Wayanad) or party abbreviation.
              </p>
            </div>
          ) : (
            <div className="divide-y-2 divide-ink">
              {filteredPoliticians.map((p) => {
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
                          src={p.photoUrl}
                          alt={p.fullName}
                          className="w-full h-full object-cover grayscale contrast-125"
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
