"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function GlobalSearch() {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Keyboard shortcut "/" expands AND focuses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setExpanded(false);
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside collapses the search back to icon-only
  // (only if empty — don't collapse mid-search accidentally)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        query.length === 0
      ) {
        setExpanded(false);
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=5`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results || []);
          setIsOpen(true);
        })
        .catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleExpand = () => {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClose = () => {
    setExpanded(false);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="navbar-search-slot relative flex items-center">
      {!expanded ? (
        // COLLAPSED STATE — just an icon button, ~36px wide
        <button
          type="button"
          onClick={handleExpand}
          aria-label="Search"
          title='Search (Press "/")'
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1A1A1A",
            border: "1px solid #2E2E2E",
            color: "#AAAAAA",
            cursor: "pointer",
            flexShrink: 0,
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#FF4545")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2E2E2E")}
        >
          <Search size={16} />
        </button>
      ) : (
        // EXPANDED STATE — animates open to a reasonable width
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "min(260px, 40vw)",
            background: "#1A1A1A",
            border: "1px solid #FF4545",
            animation: "expandSearch 0.15s ease-out",
          }}
        >
          <style>{`
            @keyframes expandSearch {
              from { width: 36px; opacity: 0.6; }
              to { width: min(260px, 40vw); opacity: 1; }
            }
          `}</style>
          <Search
            size={14}
            style={{
              marginLeft: 10,
              color: "#666",
              flexShrink: 0,
            }}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim().length >= 2) {
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                handleClose();
              }
            }}
            placeholder="Search neta..."
            style={{
              flex: 1,
              minWidth: 0, // critical for flex shrink
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#FFFFFF",
              fontSize: 12,
              padding: "8px 6px",
            }}
          />
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close search"
            style={{
              background: "none",
              border: "none",
              color: "#666",
              cursor: "pointer",
              padding: "0 10px",
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Results dropdown — only renders when open */}
      {isOpen && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            right: 0,
            width: "min(320px, 90vw)", // never exceeds viewport
            background: "#1A1A1A",
            border: "1px solid #FF4545",
            zIndex: 9999,
            maxHeight: 360,
            overflowY: "auto",
          }}
        >
          {results.map((p: any) => {
            const score =
              typeof p.verdict_score === "number"
                ? p.verdict_score.toFixed(1)
                : p.calculatedVerdictScore
                ? p.calculatedVerdictScore.toFixed(1)
                : p.verdict_score || "N/A";
            const party = p.current_party || p.currentParty || p.partyAbbr || "";
            const name = p.name || p.fullName || "";
            const photoUrl = p.photo_url || p.photoUrl;

            return (
              <div
                key={p.id || p.slug}
                onClick={() => {
                  router.push(`/politician/${p.slug}`);
                  handleClose();
                }}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderBottom: "1px solid #2E2E2E",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2E2E2E")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <img
                  src={
                    photoUrl
                      ? `/api/proxy-image?url=${encodeURIComponent(photoUrl)}`
                      : "/images/default-politician.svg"
                  }
                  alt={name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/default-politician.svg";
                  }}
                  style={{ width: 30, height: 30, objectFit: "cover", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: "#FFF",
                      fontSize: 12,
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {name}
                  </div>
                  <div style={{ color: "#888", fontSize: 10 }}>{party}</div>
                </div>
                <div
                  style={{
                    color: "#FF4545",
                    fontWeight: "bold",
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {score}
                </div>
              </div>
            );
          })}
          <div
            onClick={() => {
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              handleClose();
            }}
            style={{
              padding: "10px",
              textAlign: "center",
              color: "#FF4545",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            View all results →
          </div>
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;

