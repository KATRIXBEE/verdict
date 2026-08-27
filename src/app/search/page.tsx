"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ArrowLeft, ArrowRight, User, AlertTriangle, ShieldCheck, MapPin, Building2 } from "lucide-react";
import BrutalistCard from "@/components/ui/BrutalistCard";
import BrutalistButton from "@/components/ui/BrutalistButton";
import { getProxiedImageUrl, getScoreColor } from "@/lib/utils";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setTotal(0);
      return;
    }

    let isMounted = true;
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}&page=${page}&limit=20`
        );
        if (!res.ok) throw new Error("Search query failed");
        const data = await res.json();
        if (isMounted) {
          setResults(data.results || []);
          setTotal(data.total || 0);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load search results.");
          setResults([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchResults();
    return () => {
      isMounted = false;
    };
  }, [query, page]);

  const totalPages = Math.ceil(total / 20) || 1;

  if (query.trim().length < 2) {
    return (
      <div className="bg-canvas border-3 border-ink p-12 text-center shadow-hard-md space-y-3 font-mono">
        <Search className="w-10 h-10 mx-auto text-gray-400 stroke-[2.5]" aria-hidden="true" />
        <h2 className="font-display font-black text-xl text-ink uppercase">SEARCH VERDICT DATABASE</h2>
        <p className="text-xs text-gray-600 font-bold max-w-md mx-auto">
          Please enter at least 2 characters in the search bar to look up 543 Lok Sabha MPs by name, constituency, state, or party.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border-3 border-ink p-5 shadow-hard-md">
        <div>
          <div className="inline-flex items-center space-x-2 bg-brand-yellow text-black px-2.5 py-0.5 border-2 border-ink text-[11px] font-black uppercase shadow-hard-xs mb-2">
            <Search className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
            <span>GLOBAL CIVIC SEARCH RESULTS</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-ink">
            RESULTS FOR &quot;{query}&quot;
          </h1>
          {!isLoading && (
            <p className="text-xs text-gray-600 font-bold mt-1">
              Found <strong>{total}</strong> representative{total !== 1 ? "s" : ""} matching your query
            </p>
          )}
        </div>

        <Link href="/">
          <BrutalistButton variant="outline" size="sm" shadow="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" aria-hidden="true" />
            BACK TO DASHBOARD
          </BrutalistButton>
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-canvas border-3 border-ink p-16 text-center shadow-hard-md space-y-3">
          <div className="w-8 h-8 border-4 border-ink border-t-brand-red animate-spin mx-auto" />
          <p className="text-xs font-black uppercase text-ink tracking-wider">
            QUERYING 543 PARLIAMENTARY DOSSIERS...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-brand-red/15 border-3 border-brand-red p-6 shadow-hard-md text-ink space-y-2">
          <div className="flex items-center space-x-2 text-brand-red font-black uppercase text-sm">
            <AlertTriangle className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
            <span>SEARCH ERROR</span>
          </div>
          <p className="text-xs font-bold">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && results.length === 0 && (
        <div className="bg-canvas border-3 border-ink p-12 text-center shadow-hard-md space-y-3">
          <div className="text-3xl">🔍</div>
          <h3 className="font-display font-black text-lg uppercase text-ink">
            NO REPRESENTATIVES FOUND FOR &quot;{query}&quot;
          </h3>
          <p className="text-xs text-gray-600 font-bold max-w-md mx-auto">
            Try searching by alternative spellings, constituency names, political party initials, or state names.
          </p>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && !error && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {results.map((politician) => {
            const photoSrc = politician.photo_url
              ? getProxiedImageUrl(politician.photo_url)
              : "/images/default-politician.svg";
            const scoreConfig = getScoreColor(politician.verdict_score ?? 5.0);

            return (
              <Link
                key={politician.id || politician.slug}
                href={`/politician/${politician.slug}`}
                className="group block bg-surface border-3 border-ink p-4 shadow-hard-sm hover:-translate-y-1 hover:shadow-hard-md transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* MP Image */}
                  <div className="w-16 h-20 shrink-0 border-2 border-ink bg-canvas overflow-hidden relative shadow-hard-xs">
                    <img
                      src={photoSrc}
                      alt={politician.name || politician.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/default-politician.svg";
                      }}
                    />
                  </div>

                  {/* Info Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h3 className="font-display font-black text-base text-ink uppercase truncate group-hover:text-brand-red transition-colors">
                      {politician.name || politician.fullName}
                    </h3>

                    <div className="flex items-center space-x-1.5 text-xs font-bold">
                      <span className="px-1.5 py-0.2 bg-brand-yellow text-black border border-ink text-[10px] uppercase truncate">
                        {politician.current_party || politician.currentParty}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-600 font-bold truncate flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-brand-red shrink-0" aria-hidden="true" />
                      <span>
                        {politician.constituency}, {politician.state}
                      </span>
                    </div>
                  </div>

                  {/* Verdict Score Badge */}
                  <div
                    className="shrink-0 border-2 border-ink p-1.5 text-center shadow-hard-xs min-w-[48px]"
                    style={{ backgroundColor: scoreConfig.bg }}
                  >
                    <div className="text-[8px] font-black uppercase text-black">SCORE</div>
                    <div className="font-display font-black text-base text-black">
                      {typeof politician.verdict_score === "number"
                        ? politician.verdict_score.toFixed(1)
                        : politician.verdictScore?.toFixed(1) ?? "5.0"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-ink/20 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase">
                  <span>VIEW PUBLIC DOSSIER</span>
                  <ArrowRight className="w-3 h-3 text-ink group-hover:translate-x-1 transition-transform stroke-[2.5]" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 border-2 border-ink text-xs font-black uppercase shadow-hard-xs ${
              page === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-surface hover:bg-brand-yellow text-ink cursor-pointer"
            }`}
          >
            ← PREVIOUS
          </button>

          <span className="px-4 py-2 bg-canvas border-2 border-ink text-xs font-bold shadow-hard-xs">
            PAGE {page} OF {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`px-4 py-2 border-2 border-ink text-xs font-black uppercase shadow-hard-xs ${
              page >= totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-surface hover:bg-brand-yellow text-ink cursor-pointer"
            }`}
          >
            NEXT →
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen pb-16">
      <Suspense
        fallback={
          <div className="bg-canvas border-3 border-ink p-16 text-center shadow-hard-md space-y-3 font-mono">
            <div className="w-8 h-8 border-4 border-ink border-t-brand-red animate-spin mx-auto" />
            <p className="text-xs font-black uppercase text-ink tracking-wider">
              LOADING SEARCH INTERFACE...
            </p>
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </main>
  );
}
