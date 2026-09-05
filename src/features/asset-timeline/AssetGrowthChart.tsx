"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, AlertTriangle, ShieldCheck, DollarSign, ExternalLink, Info } from "lucide-react";
import { AssetDeclaration } from "@/types";
import { formatINR } from "@/lib/utils";
import BrutalistCard from "@/components/ui/BrutalistCard";
import { useIsMobile } from "@/hooks/useIsMobile";

interface AssetGrowthChartProps {
  declarations: AssetDeclaration[];
  politicianName: string;
}

export default function AssetGrowthChart({
  declarations,
  politicianName,
}: AssetGrowthChartProps) {
  const isMobile = useIsMobile();
  const [chartType, setChartType] = useState<"stacked" | "total">("stacked");

  const sortedDeclarations = [...declarations].sort((a, b) => a.electionYear - b.electionYear);
  const hasOutlier = sortedDeclarations.some((d) => d.isOutlierGrowth);

  // Compute multi-term growth percentage
  let growthPercentage = 0;
  if (sortedDeclarations.length >= 2) {
    const first = sortedDeclarations[0].totalAssets;
    const last = sortedDeclarations[sortedDeclarations.length - 1].totalAssets;
    if (first > 0) {
      growthPercentage = ((last - first) / first) * 100;
    }
  }

  // Format data for Recharts (convert to Crores for clean chart axis)
  const chartData = sortedDeclarations.map((d) => ({
    year: `${d.electionYear}`,
    movableCr: Number((d.movableAssets / 10000000).toFixed(2)),
    immovableCr: Number((d.immovableAssets / 10000000).toFixed(2)),
    totalCr: Number((d.totalAssets / 10000000).toFixed(2)),
    liabilitiesCr: Number((d.totalLiabilities / 10000000).toFixed(2)),
    rawTotal: d.totalAssets,
    rawMovable: d.movableAssets,
    rawImmovable: d.immovableAssets,
    rawLiabilities: d.totalLiabilities,
    isOutlier: d.isOutlierGrowth,
  }));

  // Custom Brutalist Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface border-2.5 border-ink p-2.5 shadow-hard-md font-mono text-xs space-y-1 max-w-[220px] pointer-events-none z-50 break-words">
          <div className="font-extrabold uppercase text-ink border-b border-ink pb-1">
            ELECTION YEAR: {label}
          </div>
          <div className="text-gray-800">
            <strong>Movable:</strong> {formatINR(data.rawMovable)}
          </div>
          <div className="text-gray-800">
            <strong>Immovable:</strong> {formatINR(data.rawImmovable)}
          </div>
          <div className="text-ink font-bold border-t border-gray-300 pt-1">
            <strong>Total:</strong> {formatINR(data.rawTotal)}
          </div>
          <div className="text-brand-red">
            <strong>Liabilities:</strong> {formatINR(data.rawLiabilities)}
          </div>
          {data.isOutlier && (
            <div className="bg-brand-red text-white text-[10px] font-bold p-1 mt-1 inline-flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
              <span>UNUSUAL GROWTH (&gt;500%)</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <BrutalistCard
      title="MULTI-YEAR ASSET & LIABILITY TRAJECTORY"
      badge={
        hasOutlier
          ? "UNUSUAL ASSET GROWTH (OUTLIER)"
          : `+${growthPercentage.toFixed(0)}% OVER ${sortedDeclarations.length} TERMS`
      }
      badgeColor={hasOutlier ? "red" : "green"}
      statusLight={hasOutlier ? "red" : "green"}
      statusLightLabel={hasOutlier ? "GROWTH OUTLIER" : "ECI AUDITED"}
    >
      <div className="space-y-6 font-mono">
        {/* Metric summary bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-muted border-2 border-ink p-3 text-xs">
          <div>
            <span className="text-gray-500 uppercase font-bold text-[10px] block">
              LATEST DECLARED NET WEALTH (2024 FORM 26)
            </span>
            <div className="font-display font-black text-xl text-ink">
              {formatINR(sortedDeclarations[sortedDeclarations.length - 1]?.totalAssets || 0)}
            </div>
          </div>

          {/* Toggle buttons */}
          <div className="flex items-center space-x-1 bg-surface border-2 border-ink p-1">
            <button
              onClick={() => setChartType("stacked")}
              className={`px-2.5 py-1 text-xs font-bold transition-all ${
                chartType === "stacked" ? "bg-brand-yellow text-black border border-ink" : "text-gray-700"
              }`}
            >
              ASSET SPLIT
            </button>
            <button
              onClick={() => setChartType("total")}
              className={`px-2.5 py-1 text-xs font-bold transition-all ${
                chartType === "total" ? "bg-brand-yellow text-black border border-ink" : "text-gray-700"
              }`}
            >
              NET TREND
            </button>
          </div>
        </div>

        {/* Outlier Alert Banner if >500% surge */}
        {hasOutlier && (
          <div className="bg-brand-red/10 border-2.5 border-brand-red p-3.5 flex items-start space-x-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold uppercase text-brand-red">
                STATISTICAL ANOMALY DETECTED: UNUSUAL ASSET GROWTH OUTLIER
              </span>
              <p className="text-gray-800 leading-relaxed">
                Declared wealth increased over 500% across electoral terms without proportional declared commercial income in Form 26. VERDICT provides factual trend comparisons without editorial accusations.
              </p>
            </div>
          </div>
        )}

        {/* Recharts Visualization */}
        <div className={`w-full ${isMobile ? "h-60" : "h-64 sm:h-72"} bg-surface border-2 border-ink p-2 sm:p-3 pt-4 shadow-hard-xs`}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "stacked" ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="year" stroke="#111111" fontSize={isMobile ? 10 : 12} fontWeight={700} />
                <YAxis
                  stroke="#111111"
                  fontSize={isMobile ? 9 : 11}
                  tickFormatter={(val) => `₹${val} Cr`}
                  fontWeight={600}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  wrapperStyle={{ zIndex: 100, outline: "none" }}
                  isAnimationActive={false}
                />
                <Legend
                  wrapperStyle={{ fontSize: isMobile ? 9 : 11, fontWeight: 700, paddingTop: 8 }}
                  formatter={(val) =>
                    val === "movableCr"
                      ? "Movable Assets (Cr)"
                      : val === "immovableCr"
                      ? "Immovable Assets (Cr)"
                      : "Liabilities (Cr)"
                  }
                />
                <Bar dataKey="movableCr" fill="#70D6FF" stroke="#111111" strokeWidth={1.5} stackId="a" />
                <Bar dataKey="immovableCr" fill="#FFD028" stroke="#111111" strokeWidth={1.5} stackId="a" />
                <Bar dataKey="liabilitiesCr" fill="#FF4336" stroke="#111111" strokeWidth={1.5} />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="year" stroke="#111111" fontSize={isMobile ? 10 : 12} fontWeight={700} />
                <YAxis
                  stroke="#111111"
                  fontSize={isMobile ? 9 : 11}
                  tickFormatter={(val) => `₹${val} Cr`}
                  fontWeight={600}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  wrapperStyle={{ zIndex: 100, outline: "none" }}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="totalCr"
                  stroke="#111111"
                  strokeWidth={2.5}
                  fill="#00FF66"
                  fillOpacity={0.6}
                  name="Total Net Assets (Cr)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Declarations Breakdown Table */}
        <div className="border-2 border-ink overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-ink text-white">
                <th className="p-2.5 border-r border-gray-700">YEAR</th>
                <th className="p-2.5 border-r border-gray-700">MOVABLE</th>
                <th className="p-2.5 border-r border-gray-700">IMMOVABLE</th>
                <th className="p-2.5 border-r border-gray-700 font-black">TOTAL ASSETS</th>
                <th className="p-2.5 border-r border-gray-700">LIABILITIES</th>
                <th className="p-2.5">PDF AFFIDAVIT</th>
              </tr>
            </thead>
            <tbody className="divide-y border-t border-ink">
              {sortedDeclarations.map((d) => (
                <tr key={d.id} className="hover:bg-surface-muted transition-colors">
                  <td className="p-2.5 font-bold border-r border-gray-300">{d.electionYear}</td>
                  <td className="p-2.5 border-r border-gray-300">{formatINR(d.movableAssets)}</td>
                  <td className="p-2.5 border-r border-gray-300">{formatINR(d.immovableAssets)}</td>
                  <td className="p-2.5 font-black text-ink border-r border-gray-300">
                    {formatINR(d.totalAssets)}
                  </td>
                  <td className="p-2.5 text-brand-red font-bold border-r border-gray-300">
                    {formatINR(d.totalLiabilities)}
                  </td>
                  <td className="p-2.5">
                    <a
                      href={d.affidavitPdfUrl || "https://affidavit.eci.gov.in"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-ink font-bold hover:text-brand-red underline decoration-1"
                    >
                      <span>FORM 26</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BrutalistCard>
  );
}
