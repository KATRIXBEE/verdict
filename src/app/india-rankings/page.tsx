"use client";

import React, { useState, useMemo } from "react";
import {
  Globe2,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Search,
  Share2,
  Check,
  Award,
  Sparkles,
  Info,
  Coins,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Star,
  Users,
  Landmark,
  Leaf,
  GraduationCap,
  HeartPulse,
  Lightbulb,
  Scale,
  Shield,
  Plane,
  Trophy,
  Building,
  Film,
  Globe,
  Dna,
  Utensils,
  Smile,
  Home,
  Baby,
  Activity,
  Wheat,
  Newspaper,
  Vote,
  Laptop,
  FileSpreadsheet,
  Bot,
  ShieldAlert,
  DollarSign,
  CircleDollarSign,
  Ship,
  HandCoins,
  Building2,
  Briefcase,
  LineChart,
  PieChart,
  TreePine,
  HeartHandshake,
  Wind,
  Waves,
  Zap,
  Trash2,
  Sun,
  BookOpen,
  School,
  Brain,
  BookMarked,
  Stethoscope,
  FlaskConical,
  Ribbon,
  Syringe,
  Bug,
  AlertTriangle,
  Smartphone,
  Network,
  Rocket,
  Compass,
  CreditCard,
  UserCheck,
  Heart,
  Accessibility,
  Radio,
  Bomb,
  Lock,
  FileBadge,
  Palmtree,
  Luggage,
  Medal,
  Target,
  Flame,
  Crown,
  Construction,
  Anchor,
  TrainTrack,
  CloudLightning,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import {
  INDIA_RANKINGS_DATA,
  getAllIndiaRankings,
  RankingIndex,
  TrendType,
  StatusColor,
} from "@/data/india-rankings";
import RupeeTracker from "@/features/india-rankings/RupeeTracker";
import BrutalistButton from "@/components/ui/BrutalistButton";

type SortOption = "trend_best" | "trend_worst" | "rank_best" | "alphabetical";

// Helper to render dynamic Lucide icon by name
function RenderRankingIcon({ name, className }: { name: string; className?: string }) {
  const iconMap: Record<string, React.ElementType> = {
    Users,
    Landmark,
    TrendingUp,
    Leaf,
    GraduationCap,
    HeartPulse,
    Lightbulb,
    Scale,
    Shield,
    Plane,
    Trophy,
    Building,
    Film,
    Globe,
    Dna,
    Utensils,
    Smile,
    Home,
    Baby,
    Activity,
    Wheat,
    Coins,
    Newspaper,
    Vote,
    Laptop,
    FileSpreadsheet,
    Bot,
    ShieldAlert,
    DollarSign,
    CircleDollarSign,
    Award,
    Ship,
    HandCoins,
    Building2,
    Briefcase,
    LineChart,
    PieChart,
    TreePine,
    Globe2,
    HeartHandshake,
    Wind,
    Waves,
    Zap,
    Trash2,
    Sun,
    BookOpen,
    School,
    Brain,
    BookMarked,
    Stethoscope,
    FlaskConical,
    Ribbon,
    Syringe,
    Bug,
    AlertTriangle,
    Smartphone,
    Network,
    Rocket,
    Compass,
    CreditCard,
    UserCheck,
    Heart,
    Accessibility,
    Radio,
    Bomb,
    Lock,
    FileBadge,
    Palmtree,
    Luggage,
    Medal,
    Target,
    Flame,
    Crown,
    Construction,
    Anchor,
    TrainTrack,
    CloudLightning,
    ShieldCheck,
    Wifi,
  };

  const IconComponent = iconMap[name] || Globe;
  return <IconComponent className={className || "w-5 h-5 stroke-[2.5]"} aria-hidden="true" />;
}

export default function IndiaRankingsPage() {
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("trend_best");
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);
  const [pageCopied, setPageCopied] = useState(false);

  const allIndices = useMemo(() => getAllIndiaRankings(), []);

  // Summary Metrics Computation
  const summaryMetrics = useMemo(() => {
    let improved = 0;
    let stable = 0;
    let worsened = 0;
    let newOrOther = 0;

    for (const item of allIndices) {
      if (item.trend === "much_better" || item.trend === "better") {
        improved++;
      } else if (item.trend === "stable") {
        stable++;
      } else if (item.trend === "worse" || item.trend === "much_worse" || item.trend === "slight_worse") {
        worsened++;
      } else {
        newOrOther++;
      }
    }

    return { improved, stable, worsened, newOrOther, total: allIndices.length };
  }, [allIndices]);

  // Filter and Sort Processing
  const filteredIndices = useMemo(() => {
    let list = allIndices.filter((item) => {
      const matchesCategory =
        selectedCategoryKey === "ALL" || item.categoryKey === selectedCategoryKey;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        item.publisher.toLowerCase().includes(q) ||
        item.note.toLowerCase().includes(q) ||
        item.context.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });

    // Sorting
    if (sortBy === "trend_best") {
      const orderMap: Record<TrendType, number> = {
        much_better: 1,
        better: 2,
        stable: 3,
        new: 4,
        slight_worse: 5,
        worse: 6,
        much_worse: 7,
      };
      list = [...list].sort((a, b) => (orderMap[a.trend] || 9) - (orderMap[b.trend] || 9));
    } else if (sortBy === "trend_worst") {
      const orderMap: Record<TrendType, number> = {
        much_worse: 1,
        worse: 2,
        slight_worse: 3,
        stable: 4,
        new: 5,
        better: 6,
        much_better: 7,
      };
      list = [...list].sort((a, b) => (orderMap[a.trend] || 9) - (orderMap[b.trend] || 9));
    } else if (sortBy === "rank_best") {
      list = [...list].sort((a, b) => {
        const rankA = a.rank2025 !== null ? a.rank2025 : 9999;
        const rankB = b.rank2025 !== null ? b.rank2025 : 9999;
        return rankA - rankB;
      });
    } else if (sortBy === "alphabetical") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [allIndices, selectedCategoryKey, searchQuery, sortBy]);

  // Share entire page handler
  const handleSharePage = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "India Global Rankings Board — VERDICT",
          text: "Track India's position across 100+ global indices (~2005 vs 2025/26) and 20 years of Rupee value on VERDICT.",
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(window.location.href);
    setPageCopied(true);
    setTimeout(() => setPageCopied(false), 2000);
  };

  // Share individual card handler
  const handleShareCard = (name: string) => {
    const shareUrl = `${window.location.origin}/india-rankings?search=${encodeURIComponent(name)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedCardId(name);
    setTimeout(() => setCopiedCardId(null), 2000);
  };

  const getTrendBadge = (trend: TrendType) => {
    switch (trend) {
      case "much_better":
        return {
          bg: "bg-[#00F5D4] text-black border-black",
          icon: <TrendingUp className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />,
          label: "MUCH BETTER",
        };
      case "better":
        return {
          bg: "bg-[#70D6FF] text-black border-black",
          icon: <ArrowUp className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />,
          label: "IMPROVED",
        };
      case "stable":
        return {
          bg: "bg-gray-200 text-gray-800 border-gray-400",
          icon: <Minus className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />,
          label: "STABLE",
        };
      case "slight_worse":
      case "worse":
        return {
          bg: "bg-[#FF9F1C] text-black border-black",
          icon: <ArrowDown className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />,
          label: "WORSE",
        };
      case "much_worse":
        return {
          bg: "bg-[#FF4336] text-white border-black",
          icon: <TrendingDown className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />,
          label: "CRITICAL SLIDE",
        };
      case "new":
        return {
          bg: "bg-[#70D6FF] text-black border-black",
          icon: <Star className="w-3.5 h-3.5 fill-black stroke-black" aria-hidden="true" />,
          label: "NEW INDEX",
        };
      default:
        return {
          bg: "bg-gray-100 text-black border-black",
          icon: <Minus className="w-3.5 h-3.5" aria-hidden="true" />,
          label: "UNCLASSIFIED",
        };
    }
  };

  const getCardBackground = (statusColor: StatusColor, trend: TrendType) => {
    if (trend === "much_better" || statusColor === "green") {
      return "bg-[#E6FAF4] hover:bg-[#D5F5EC]";
    }
    if (trend === "much_worse" || statusColor === "red") {
      return "bg-[#FFF0F0] hover:bg-[#FFE5E5]";
    }
    if (statusColor === "orange" || trend === "worse") {
      return "bg-[#FFF8F0] hover:bg-[#FFEFE0]";
    }
    return "bg-surface hover:bg-brand-yellow/10";
  };

  return (
    <div className="space-y-8 font-mono pb-12">
      {/* 1. Header Banner */}
      <section className="border-3 border-ink bg-surface shadow-hard-xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
        <div className="relative z-10 max-w-5xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 bg-brand-yellow text-black px-3 py-1 border-2 border-ink text-xs font-black uppercase shadow-hard-xs">
              <Globe2 className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              <span>GLOBAL BENCHMARK DOSSIER • 20-YEAR RETROSPECTIVE</span>
            </div>
            <span className="bg-brand-cyan text-black px-2.5 py-1 border-2 border-ink text-xs font-extrabold shadow-hard-xs">
              {summaryMetrics.total} VERIFIED INDICES
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-ink">
                INDIA ON THE WORLD STAGE
              </h1>
              <p className="text-sm sm:text-base text-gray-700 font-bold max-w-3xl mt-1">
                Where India truly stands across 100+ international indices (~2005 vs 2025–26). Sourced directly from official UN, World Bank, WHO, IMF, and global research institutions.
              </p>
            </div>

            {/* Quick Share Page Button & Jump to Rupee Tracker */}
            <div className="flex items-center space-x-2 shrink-0">
              <a href="#rupee-tracker">
                <BrutalistButton variant="secondary" size="sm" shadow="sm">
                  <Coins className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  RUPEE TRACKER
                </BrutalistButton>
              </a>
              <button
                type="button"
                onClick={handleSharePage}
                className="bg-brand-green text-black font-extrabold px-3.5 py-2 border-2 border-ink text-xs uppercase shadow-hard-xs hover:-translate-y-0.5 transition-transform flex items-center space-x-1.5 cursor-pointer"
              >
                {pageCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{pageCopied ? "COPIED URL!" : "SHARE DOSSIER"}</span>
              </button>
            </div>
          </div>

          {/* Last Updated Timestamp */}
          <div className="pt-2 flex items-center space-x-2 text-xs font-bold text-gray-500">
            <Info className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Rankings data: 2025–2026. Last updated: August 2026.</span>
          </div>
        </div>
      </section>

      {/* 2. Executive Summary Metric Cards at Top */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#E6FAF4] border-3 border-ink p-4 shadow-hard-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-gray-700">INDIA IMPROVED IN</span>
            <div className="p-1 bg-brand-green border border-ink text-black">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-ink">
            {summaryMetrics.improved} INDICES
          </div>
          <p className="text-[11px] text-gray-600 font-bold">
            Major gains in GDP, Startups, Renewables, Chess & Patents.
          </p>
        </div>

        <div className="bg-[#FFFDF0] border-3 border-ink p-4 shadow-hard-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-gray-700">INDIA IS STABLE IN</span>
            <div className="p-1 bg-brand-yellow border border-ink text-black">
              <Minus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-ink">
            {summaryMetrics.stable} INDICES
          </div>
          <p className="text-[11px] text-gray-600 font-bold">
            Consistent performance in Space, Railways & Remittances.
          </p>
        </div>

        <div className="bg-[#FFF0F0] border-3 border-ink p-4 shadow-hard-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-gray-700">INDIA WORSENED IN</span>
            <div className="p-1 bg-brand-red border border-ink text-white">
              <TrendingDown className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-brand-red">
            {summaryMetrics.worsened} INDICES
          </div>
          <p className="text-[11px] text-gray-600 font-bold">
            Severe lags in Hunger (102nd), Press Freedom (151st) & Air Quality.
          </p>
        </div>

        <div className="bg-brand-yellow/30 border-3 border-ink p-4 shadow-hard-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-gray-800">WORLD #1 LEADER IN</span>
            <div className="p-1 bg-brand-yellow border border-ink text-black">
              <Award className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </div>
          </div>
          <div className="text-xl font-display font-black text-ink truncate">
            REMITTANCES & FINTECH
          </div>
          <p className="text-[11px] text-gray-700 font-bold">
            Also #1 in Film Output, Chess Champions 2024, TB Burden & Diabetes.
          </p>
        </div>
      </section>

      {/* 3. Filter, Search & Sorting Controls */}
      <section className="bg-surface border-3 border-ink p-5 shadow-hard-lg space-y-4">
        {/* Search and Sort row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80 lg:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search index (e.g. Hunger, GDP, Press, AI)..."
              className="w-full bg-canvas border-2 border-ink pl-9 pr-3 py-2 text-xs font-bold text-ink placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs font-bold text-gray-500 shrink-0">SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-canvas border-2 border-ink px-3 py-2 text-xs font-bold text-ink focus:outline-none cursor-pointer"
            >
              <option value="trend_best">Improved (Best to Worst Trend)</option>
              <option value="trend_worst">Worsened (Worst Trend First)</option>
              <option value="rank_best">Current Rank (Best Rank First)</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* 14 Category Scrollable Tabs */}
        <div className="border-t-2 border-ink/20 pt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-gray-600">
              FILTER BY SECTOR (14 CATEGORIES):
            </span>
            <span className="text-xs font-black text-brand-red">
              Showing {filteredIndices.length} / {summaryMetrics.total} rankings
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setSelectedCategoryKey("ALL")}
              className={`text-xs font-black px-3 py-1.5 border-2 border-ink shadow-hard-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                selectedCategoryKey === "ALL"
                  ? "bg-brand-red text-white -translate-y-0.5"
                  : "bg-surface hover:bg-brand-yellow text-ink"
              }`}
            >
              <Globe className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
              <span>ALL SECTORS ({summaryMetrics.total})</span>
            </button>

            {Object.entries(INDIA_RANKINGS_DATA).map(([catKey, group]) => {
              const isSelected = selectedCategoryKey === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategoryKey(catKey)}
                  className={`text-xs font-black px-3 py-1.5 border-2 border-ink shadow-hard-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-brand-red text-white -translate-y-0.5"
                      : "bg-surface hover:bg-brand-yellow text-ink"
                  }`}
                >
                  <RenderRankingIcon name={group.icon} className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{group.label}</span>
                  <span className="opacity-75 font-normal">({group.indices.length})</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Rankings Cards Grid */}
      <section className="space-y-4">
        {filteredIndices.length === 0 ? (
          <div className="bg-canvas border-3 border-ink p-12 text-center text-gray-600 font-bold">
            <p className="text-base">NO RANKING INDICES FOUND FOR &quot;{searchQuery}&quot;</p>
            <p className="text-xs text-gray-500 font-normal mt-1">
              Try searching by topic (e.g. GDP, Press, Education, Health, Space, Olympic).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredIndices.map((item, idx) => {
              const trendBadge = getTrendBadge(item.trend);
              const cardBg = getCardBackground(item.statusColor, item.trend);
              const isCopied = copiedCardId === item.name;

              return (
                <div
                  key={`${item.name}-${idx}`}
                  className={`${cardBg} border-3 border-ink p-5 shadow-hard-sm hover:-translate-y-1 hover:shadow-hard-md transition-all flex flex-col justify-between space-y-4 group relative`}
                >
                  {/* Top Bar: Icon, Name & Category */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="p-1.5 bg-surface border-2 border-ink shadow-hard-xs text-ink">
                          <RenderRankingIcon name={item.icon} className="w-5 h-5 stroke-[2.5]" />
                        </span>
                        <div>
                          <span className="text-[10px] font-black uppercase text-gray-600 block">
                            {item.categoryLabel}
                          </span>
                          <span className="text-[10px] text-gray-500 font-bold">
                            Published by {item.publisher}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleShareCard(item.name)}
                          title="Copy share link for this index"
                          className="p-1 hover:bg-brand-yellow border border-transparent hover:border-ink transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-brand-green" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5 text-gray-500 hover:text-ink" />
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="font-display font-black text-base uppercase text-ink leading-snug group-hover:text-brand-red transition-colors">
                      {item.name}
                    </h3>
                  </div>

                  {/* Rank Comparison Numbers (~2005 vs 2025/26) */}
                  <div className="bg-surface/80 border-2 border-ink p-3 grid grid-cols-2 gap-2 text-center shadow-hard-xs">
                    <div className="border-r border-ink/20 pr-1">
                      <div className="text-[9px] text-gray-500 font-black uppercase">
                        ~2005–06 RANK
                      </div>
                      <div className="font-display font-black text-sm sm:text-base text-gray-700 mt-0.5">
                        {item.rank2005 !== null
                          ? `#${item.rank2005} / ${item.total2005 || "—"}`
                          : "Not Tracked"}
                      </div>
                    </div>

                    <div className="pl-1">
                      <div className="text-[9px] text-gray-500 font-black uppercase">
                        2025–26 STATUS
                      </div>
                      <div className="font-display font-black text-sm sm:text-base text-ink mt-0.5">
                        {item.rank2025 !== null
                          ? `#${item.rank2025} / ${item.total2025 || "—"}`
                          : item.score2025}
                      </div>
                    </div>
                  </div>

                  {/* Trend Indicator & Status Label */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 border shadow-hard-xs uppercase flex items-center space-x-1 ${trendBadge.bg}`}
                      >
                        <span className="shrink-0">{trendBadge.icon}</span>
                        <span>{trendBadge.label}</span>
                      </span>

                      <span className="text-[10px] font-bold text-gray-600 bg-surface border border-ink/40 px-2 py-0.5">
                        {item.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-ink leading-snug">
                        {item.note}
                      </p>
                      <p className="text-[11px] text-gray-600 leading-tight">
                        {item.context}
                      </p>
                    </div>
                  </div>

                  {/* Official Source Link */}
                  <div className="pt-2 border-t border-ink/20 flex items-center justify-between text-[11px]">
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-ink font-bold hover:text-brand-red underline"
                    >
                      <span>Official Source Report</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>

                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      VERIFIED DATA
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Comprehensive Rupee Tracker Section (#rupee-tracker) */}
      <RupeeTracker />
    </div>
  );
}
