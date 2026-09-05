"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, MapPin, ArrowRight } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { getPoliticianImageSrc } from "@/lib/utils";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: "/" to focus, "Escape" to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setMobileExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
        setMobileExpanded(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (query.trim() === "") {
          setMobileExpanded(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query]);

  // Fetch search results on debounced query change
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    let isMounted = true;
    const search = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery.trim())}&limit=5`
        );
        if (!res.ok) throw new Error("Search fetch failed");
        const data = await res.json();
        if (isMounted) {
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch {
        if (isMounted) setResults([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    search();
    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  const handleNavigate = (url: string) => {
    router.push(url);
    setIsOpen(false);
    setQuery("");
    setMobileExpanded(false);
  };

  return (
    <div
      ref={containerRef}
      className={`navbar-search relative font-mono text-xs ${
        mobileExpanded ? "w-full" : "w-auto"
      }`}
    >
      {/* Mobile Trigger Button */}
      {!mobileExpanded && (
        <button
          type="button"
          onClick={() => {
            setMobileExpanded(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="md:hidden p-2 min-h-[40px] min-w-[40px] bg-surface border-2 border-ink text-ink shadow-hard-xs hover:bg-brand-yellow transition-colors flex items-center justify-center"
          aria-label="Open search input"
        >
          <Search className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {/* Mobile Full-Width Overlay Search Box (Prevents Navbar Overflow/Overlap) */}
      {mobileExpanded && (
        <div className="md:hidden fixed inset-x-2 top-2 z-[1001] h-10 flex items-center bg-surface border-2.5 border-ink shadow-hard-md">
          <div className="pl-3 pr-2 text-gray-500 flex items-center justify-center">
            <Search className="w-4 h-4 stroke-[2.5]" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim().length >= 2) {
                handleNavigate(`/search?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            placeholder='Search neta by name, party...'
            className="navbar-search-input w-full bg-transparent h-full py-2 px-1 text-xs font-bold text-ink placeholder:text-gray-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-2 text-gray-500 hover:text-brand-red"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setMobileExpanded(false);
              setIsOpen(false);
            }}
            className="px-2.5 h-full bg-surface-muted hover:bg-brand-red hover:text-white border-l-2 border-ink text-ink font-bold text-xs flex items-center justify-center transition-colors"
            aria-label="Close search"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Desktop Search Input Box */}
      <div className="hidden md:flex relative items-center flex-shrink min-w-0">
        <div className="relative flex items-center flex-shrink min-w-0">
          <input
            ref={!mobileExpanded ? inputRef : undefined}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim().length >= 2) {
                handleNavigate(`/search?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            placeholder="Search neta... (/)"
            className="w-36 sm:w-44 md:w-52 lg:w-56 xl:w-64 pl-8 pr-7 py-1.5 text-xs font-mono bg-white text-black border-[2px] border-black shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-0 placeholder:text-neutral-500"
          />

          <div className="absolute left-2.5 pointer-events-none text-neutral-500 flex items-center justify-center">
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>

          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-2 p-0.5 text-neutral-500 hover:text-brand-red cursor-pointer"
              aria-label="Clear query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden lg:inline-block absolute right-2 bg-surface-muted border border-ink px-1.5 py-0.2 text-[10px] font-extrabold text-gray-500 shadow-hard-xs pointer-events-none">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full right-0 mt-1 bg-surface border-2.5 border-ink shadow-hard-xl z-[1002] max-h-[380px] overflow-y-auto w-[calc(100vw-24px)] md:w-full md:min-w-[320px] max-w-[420px]">
          <div className="bg-ink text-white px-3 py-1.5 text-[10px] font-bold uppercase flex justify-between items-center">
            <span>RESULTS ({results.length})</span>
            {isLoading && <span className="text-brand-yellow">SEARCHING...</span>}
          </div>

          <div className="divide-y border-t border-ink">
            {results.map((p: any) => {
              const score = typeof p.verdict_score === "number" ? p.verdict_score : (p.calculatedVerdictScore || 0);
              const party = p.current_party || p.currentParty || p.partyAbbr || "IND";
              const constituency = p.constituency || p.currentConstituency?.name || "";
              const state = p.state || p.currentConstituency?.state || "";

              return (
                <div
                  key={p.id || p.slug}
                  onClick={() => handleNavigate(`/politician/${p.slug}`)}
                  className="p-2.5 hover:bg-brand-yellow/20 cursor-pointer flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <img
                      src={getPoliticianImageSrc(p.photo_url || p.photoUrl)}
                      alt={p.name || p.fullName}
                      className="w-8 h-8 object-cover border border-ink grayscale shrink-0 bg-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/default-politician.svg";
                      }}
                    />
                    <div className="truncate">
                      <div className="font-display font-black text-xs text-ink uppercase group-hover:text-brand-red truncate">
                        {p.name || p.fullName}
                      </div>
                      <div className="text-[10px] text-gray-600 font-mono flex items-center space-x-1 truncate">
                        <span className="font-bold">{party}</span>
                        {constituency && <span>• {constituency}</span>}
                        {state && <span>({state})</span>}
                      </div>
                    </div>
                  </div>

                  <div className="ml-2 shrink-0 text-right">
                    <span className="font-mono font-black text-xs px-1.5 py-0.5 bg-brand-yellow border border-ink text-black">
                      {score > 0 ? score.toFixed(1) : "N/A"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            onClick={() => handleNavigate(`/search?q=${encodeURIComponent(query.trim())}`)}
            className="p-2 bg-surface-muted hover:bg-brand-yellow/30 text-brand-red text-center font-bold text-[11px] border-t-2 border-ink cursor-pointer transition-colors inline-flex items-center justify-center gap-1.5 w-full"
          >
            <span>View all results for &quot;{query}&quot;</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
