"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { PieChart as PieIcon, Info, TrendingUp, AlertTriangle } from "lucide-react";
import { formatINR } from "@/lib/utils";

const CATEGORY_BREAKDOWN = [
  { name: "State Fund Misuse (Missing UCs)", amount: 229099, percent: 47.4, color: "#FF4336" },
  { name: "Environmental Fund Diversion & Lock", amount: 136000, percent: 28.1, color: "#FF9F1C" },
  { name: "Financial Irregularity (Minor Head 800)", amount: 54282, percent: 11.2, color: "#70D6FF" },
  { name: "Welfare Fund Misuse (BOCW/Nirbhaya)", amount: 46213, percent: 9.6, color: "#FFD028" },
  { name: "Scheme & Healthcare Fraud", amount: 14474, percent: 3.0, color: "#00F5D4" },
  { name: "Infrastructure Overpricing (Dwarka/NHAI)", amount: 9787, percent: 2.0, color: "#9D4EDD" },
];

export default function CategoryBreakdownChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeCategory = activeIndex !== null ? CATEGORY_BREAKDOWN[activeIndex] : null;

  return (
    <section className="bg-surface border-3 border-ink p-6 sm:p-8 shadow-hard-lg font-mono space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2.5 border-ink pb-4">
        <div className="flex items-center space-x-2">
          <PieIcon className="w-5 h-5 text-brand-red stroke-[2.5]" />
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
            ₹4.83 LAKH CRORE — CATEGORY BREAKDOWN
          </h2>
        </div>
        <span className="text-xs font-bold text-gray-500 bg-surface-muted px-2.5 py-1 border border-ink shadow-hard-xs">
          CAG &amp; JUDICIAL AUDIT AGGREGATE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Recharts Pie Chart (7 cols) */}
        <div className="lg:col-span-7 h-72 sm:h-80 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={CATEGORY_BREAKDOWN}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={115}
                paddingAngle={3}
                stroke="#0D0D0D"
                strokeWidth={2.5}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {CATEGORY_BREAKDOWN.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="cursor-pointer transition-all hover:opacity-85"
                  />
                ))}
              </Pie>
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-surface border-2.5 border-ink p-3 shadow-hard-sm font-mono text-xs space-y-1">
                        <div className="font-display font-black text-ink uppercase text-sm">
                          {data.name}
                        </div>
                        <div className="font-bold text-brand-red text-base">
                          {formatINR(data.amount * 10000000, { short: true })}
                        </div>
                        <div className="text-[10px] text-gray-600 font-bold">
                          {data.percent}% of total exposed public funds
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] font-black text-gray-500 uppercase">TOTAL EXPOSED</span>
            <span className="font-display font-black text-xl text-ink">₹4.83L CR</span>
          </div>
        </div>

        {/* Legend & Active Inspection Box (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="space-y-2 text-xs">
            {CATEGORY_BREAKDOWN.map((cat, idx) => {
              const isHovered = activeIndex === idx;
              return (
                <div
                  key={cat.name}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex items-center justify-between p-2 border-2 transition-all cursor-pointer ${
                    isHovered
                      ? "border-ink bg-canvas shadow-hard-xs -translate-x-1"
                      : "border-transparent hover:border-ink/40 bg-surface"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 shrink-0 border border-ink"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-bold text-ink truncate text-[11px] sm:text-xs">
                      {cat.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <span className="font-black text-ink">{cat.percent}%</span>
                    <span className="text-gray-500 text-[10px] block">
                      ({formatINR(cat.amount * 10000000, { short: true })})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Human Comparison Context Note */}
      <div className="bg-canvas border-2.5 border-ink p-4 shadow-hard-xs space-y-1.5 text-xs font-bold text-ink">
        <div className="flex items-center space-x-2 text-brand-red font-black uppercase text-[11px]">
          <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
          <span>REAL WORLD SCALE COMPARISON</span>
        </div>
        <p className="text-gray-700 leading-relaxed">
          For context: India&apos;s entire Union Education Budget for 2024–25 was <strong>₹1,20,627 Crore</strong>. The total government funds wasted, unspent in bureaucratic accounts, or unaccounted in missing audit certificates (<strong>₹4.83 Lakh Crore</strong>) equals <strong>4x the entire national education budget</strong>.
        </p>
      </div>
    </section>
  );
}
