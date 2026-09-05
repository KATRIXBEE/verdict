"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  DollarSign, 
  Coins, 
  PieChart as PieIcon, 
  BarChart3, 
  Landmark, 
  Scale, 
  ShieldCheck, 
  ExternalLink, 
  HelpCircle, 
  Users, 
  ArrowRight, 
  Building2, 
  FileText, 
  Info,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from "recharts";
import { BUDGET_2024, MINISTER_SALARIES, SAMPLE_BUDGET_BILLS } from "@/data/budget-data";
import { formatINR } from "@/lib/utils";
import BrutalistCard from "@/components/ui/BrutalistCard";
import BrutalistButton from "@/components/ui/BrutalistButton";
import { useIsMobile } from "@/hooks/useIsMobile";

// Custom tooltip component that is mobile-safe
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];
  const color = data.payload?.color || data.payload?.fill || "#FF4545";
  const amount = data.payload?.amount_crore ?? data.payload?.amount;

  return (
    <div
      style={{
        background: "#1A1A1A",
        border: "1px solid #FF4545",
        padding: "8px 12px",
        fontSize: "11px",
        color: "#FFFFFF",
        fontFamily: "monospace",
        maxWidth: "200px", // CRITICAL: cap width
        wordWrap: "break-word",
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      <div style={{ fontWeight: "bold", color }}>
        {data.name}
      </div>
      <div>
        {data.payload?.percent}% ({amount ? `₹${amount.toLocaleString("en-IN")} Cr` : ""})
      </div>
    </div>
  );
}

// Mobile-safe tooltip for minister salaries comparison
function SalaryTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const p = item.payload;
  return (
    <div
      style={{
        background: "#1A1A1A",
        border: "1px solid #00E5FF",
        padding: "8px 12px",
        fontSize: "11px",
        color: "#FFFFFF",
        fontFamily: "monospace",
        maxWidth: "200px",
        wordWrap: "break-word",
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      <div style={{ fontWeight: "bold", color: p.country === "India" ? "#FF4336" : "#70D6FF" }}>
        {p.country} — {p.role}
      </div>
      <div>
        ${Number(item.value).toLocaleString("en-US")} / yr
      </div>
      <div style={{ fontSize: "10px", color: "#AAAAAA" }}>
        GDP/Capita: ${p.gdp_per_capita_usd?.toLocaleString("en-US")}
      </div>
    </div>
  );
}

export default function TaxMoneyPage() {
  const isMobile = useIsMobile();
  const [selectedMinistry, setSelectedMinistry] = useState<string | null>(null);

  const activeAlloc = BUDGET_2024.top_allocations.find((a) => a.ministry === selectedMinistry) || BUDGET_2024.top_allocations[0];

  return (
    <div className="space-y-10 sm:space-y-12 font-mono">
      {/* 1. Header Banner */}
      <section className="border-3 border-ink bg-surface shadow-hard-xl p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-brand-green text-black px-3 py-1 border-2 border-ink text-xs font-black uppercase shadow-hard-xs">
            <Coins className="w-4 h-4" />
            <span>CITIZEN TAX TRANSPARENCY DESK</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-ink">
            WHERE IS MY TAX MONEY GOING?
          </h1>

          <p className="font-display font-extrabold text-base sm:text-xl text-brand-red uppercase tracking-tight">
            Union Budget 2024–25 & Public Treasury Spending Audit
          </p>

          <p className="text-xs sm:text-sm text-gray-700 max-w-3xl leading-relaxed">
            Every direct and indirect rupee paid in GST, income tax, fuel excise, and import customs funds India&apos;s <strong>₹47.94 Lakh Crore ($578 Billion)</strong> annual Union Budget. Here is the exact, department-wise public ledger.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold">
            <div className="bg-canvas border-2 border-ink p-3 shadow-hard-xs space-y-1">
              <span className="text-gray-500 uppercase text-[10px]">TOTAL UNION BUDGET</span>
              <div className="font-display font-black text-xl text-ink">
                ₹47.94 LAKH CR
              </div>
            </div>
            <div className="bg-canvas border-2 border-ink p-3 shadow-hard-xs space-y-1">
              <span className="text-gray-500 uppercase text-[10px]">PER-CITIZEN SPEND (1.4B POP.)</span>
              <div className="font-display font-black text-xl text-brand-green">
                ₹34,246 / PERSON
              </div>
            </div>
            <div className="bg-canvas border-2 border-ink p-3 shadow-hard-xs space-y-1">
              <span className="text-gray-500 uppercase text-[10px]">SOVEREIGN DEBT INTEREST</span>
              <div className="font-display font-black text-xl text-brand-red">
                22.1% (₹10.6L CR)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: Your Money — Budget Breakdown */}
      <section className="bg-surface border-3 border-ink p-6 sm:p-8 shadow-hard-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2.5 border-ink pb-4">
          <div className="flex items-center space-x-2">
            <PieIcon className="w-5 h-5 text-brand-orange" />
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
              SECTION 1: BUDGET 2024–25 ALLOCATION BREAKDOWN
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-surface-muted px-2.5 py-1 border border-ink">
            MINISTRY OF FINANCE LEDGER
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Donut / Pie Chart */}
          <div className={`lg:col-span-6 ${isMobile ? "h-[260px]" : "h-[380px]"} w-full relative`}>
            <ResponsiveContainer width="100%" height={isMobile ? 260 : 380}>
              <PieChart>
                <Pie
                  data={BUDGET_2024.top_allocations}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 55 : 90}
                  outerRadius={isMobile ? 90 : 150}
                  paddingAngle={2}
                  dataKey="percent"
                  nameKey="ministry"
                  onClick={(entry) => setSelectedMinistry(entry.ministry)}
                >
                  {BUDGET_2024.top_allocations.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="#000" 
                      strokeWidth={2}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={<CustomTooltip />}
                  wrapperStyle={{ zIndex: 100, outline: "none" }}
                  isAnimationActive={false}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-gray-500 uppercase">TOTAL SIZE</span>
              <span className={`font-display font-black ${isMobile ? "text-base" : "text-lg"} text-ink`}>₹47.94 L CR</span>
            </div>
          </div>

          {/* Allocation Details Card */}
          <div className="lg:col-span-6 bg-canvas border-2.5 border-ink p-5 shadow-hard-md space-y-4 mt-5 lg:mt-0">
            <div className="flex items-center justify-between border-b-2 border-ink pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: activeAlloc.color }} />
                <h3 className="font-display font-black text-lg uppercase text-ink">
                  {activeAlloc.ministry}
                </h3>
              </div>
              <span className="bg-brand-yellow text-black font-black text-xs px-2 py-0.5 border border-black shadow-hard-xs">
                {activeAlloc.percent}% OF TOTAL
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-surface p-3 border border-ink space-y-1">
                <span className="text-gray-500 font-bold block text-[10px]">TOTAL OUTLAY</span>
                <strong className="text-sm font-black text-ink">₹{activeAlloc.amount_crore.toLocaleString("en-IN")} Cr</strong>
              </div>
              <div className="bg-surface p-3 border border-ink space-y-1">
                <span className="text-gray-500 font-bold block text-[10px]">CITIZEN COST SHARE</span>
                <strong className="text-sm font-black text-brand-red">₹{activeAlloc.perPersonInr.toLocaleString("en-IN")} / citizen</strong>
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              {activeAlloc.description}
            </p>

            <div className="space-y-1 pt-1 border-t border-gray-300">
              <span className="text-[10px] font-bold text-gray-500 uppercase">KEY FUNDED SCHEMES:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeAlloc.keySchemes.map((scheme) => (
                  <span key={scheme} className="bg-surface-muted text-ink border border-ink text-[10px] font-bold px-2 py-0.5">
                    {scheme}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Per-Citizen Share */}
      <section className="bg-surface border-3 border-ink p-6 sm:p-8 shadow-hard-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2.5 border-ink pb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-brand-green" />
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
              SECTION 2: YOUR PERSONAL CONTRIBUTION (₹ PER PERSON)
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-surface-muted px-2.5 py-1 border border-ink">
            BASED ON 1.4 BILLION CITIZENS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUDGET_2024.top_allocations.map((alloc) => (
            <div 
              key={alloc.ministry} 
              onClick={() => setSelectedMinistry(alloc.ministry)}
              className="bg-canvas border-2 border-ink p-4 shadow-hard-xs space-y-2 hover:bg-brand-yellow/10 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-black text-sm uppercase truncate text-ink">
                  {alloc.ministry}
                </span>
                <span className="w-3 h-3 rounded-full border border-black shrink-0" style={{ backgroundColor: alloc.color }} />
              </div>
              <div className="font-display font-black text-2xl text-ink">
                ₹{alloc.perPersonInr.toLocaleString("en-IN")}
                <span className="text-[10px] font-mono text-gray-500 font-normal"> / person</span>
              </div>
              <div className="text-[10px] text-gray-600 font-bold border-t border-gray-300 pt-1.5 flex justify-between">
                <span>Outlay: ₹{alloc.amount_crore.toLocaleString("en-IN")} Cr</span>
                <span>{alloc.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: Global Minister Pay Comparison */}
      <section className="bg-surface border-3 border-ink p-6 sm:p-8 shadow-hard-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2.5 border-ink pb-4">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-brand-purple" />
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
              SECTION 3: GLOBAL HEAD OF STATE SALARY COMPARISON
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-surface-muted px-2.5 py-1 border border-ink">
            ANNUAL COMPENSATION (USD)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className={`lg:col-span-7 ${isMobile ? "h-[280px]" : "h-80"} w-full`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MINISTER_SALARIES.comparison}
                layout="vertical"
                margin={{ top: 10, right: 30, left: isMobile ? 10 : 40, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#000" }} unit="$" />
                <YAxis dataKey="country" type="category" tick={{ fontSize: isMobile ? 9 : 11, fill: "#000", fontWeight: "bold" }} width={isMobile ? 65 : 80} />
                <RechartsTooltip 
                  content={<SalaryTooltip />}
                  wrapperStyle={{ zIndex: 100, outline: "none" }}
                  isAnimationActive={false}
                />
                <Bar dataKey="annual_usd" fill="#00E5FF" stroke="#000" strokeWidth={1.5}>
                  {MINISTER_SALARIES.comparison.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.country === "India" ? "#FF4336" : "#70D6FF"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-5 bg-canvas border-2.5 border-ink p-5 shadow-hard-md space-y-4">
            <div className="flex items-center space-x-2 text-brand-red font-bold text-sm">
              <Info className="w-4 h-4 shrink-0" />
              <span>CRITICAL CONTEXTUAL PERSPECTIVE:</span>
            </div>

            <blockquote className="border-l-3 border-ink pl-3 text-xs text-gray-800 leading-relaxed font-bold">
              &quot;India&apos;s Prime Minister earns among the lowest nominal compensation ($24,000 / yr) of all G20 leaders, but India also has among the lowest GDP per capita ($2,500). Full economic context matters when auditing official compensation.&quot;
            </blockquote>

            <div className="bg-surface p-3 border border-ink text-xs space-y-1.5">
              <div className="flex justify-between font-bold">
                <span>India PM Monthly Salary:</span>
                <span className="text-ink">₹1,60,000 / month</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Cabinet Minister Monthly:</span>
                <span className="text-ink">₹1,00,000 / month</span>
              </div>
              <div className="flex justify-between font-bold text-gray-500 text-[10px]">
                <span>Source:</span>
                <span>{MINISTER_SALARIES.india.source}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: MP Benefits & Allowances Card */}
      <section className="bg-surface border-3 border-ink p-6 sm:p-8 shadow-hard-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2.5 border-ink pb-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-brand-pink" />
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
              SECTION 4: MEMBER OF PARLIAMENT (MP) PERKS & ALLOWANCES
            </h2>
          </div>
          <span className="text-xs font-bold text-brand-red bg-canvas px-2.5 py-1 border border-ink">
            TOTAL MONTHLY DRAW: ~₹3,70,000
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-canvas border-2 border-ink p-4 space-y-3">
            <h4 className="font-display font-black text-base uppercase text-ink border-b border-gray-300 pb-1.5">
              MONTHLY CASH ALLOWANCES
            </h4>
            <ul className="space-y-2 text-xs text-gray-800 font-bold">
              <li className="flex justify-between">
                <span>Basic Salary:</span>
                <span>₹1,00,000</span>
              </li>
              <li className="flex justify-between">
                <span>Constituency Allowance:</span>
                <span>₹70,000</span>
              </li>
              <li className="flex justify-between">
                <span>Office & Secretarial Staff:</span>
                <span>₹60,000</span>
              </li>
              <li className="flex justify-between">
                <span>Daily Parliamentary Sitting Allowance:</span>
                <span>₹2,000 / day</span>
              </li>
            </ul>
          </div>

          <div className="bg-canvas border-2 border-ink p-4 space-y-3">
            <h4 className="font-display font-black text-base uppercase text-ink border-b border-gray-300 pb-1.5">
              STATUTORY PERKS & AMENITIES
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-800 list-disc list-inside">
              {MINISTER_SALARIES.india.perks.map((perk, idx) => (
                <li key={idx} className="leading-snug">
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 5: Legislative Bills Linked to Budget Outlays */}
      <section className="bg-surface border-3 border-ink p-6 sm:p-8 shadow-hard-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2.5 border-ink pb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-brand-cyan" />
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
              SECTION 5: RECENT PARLIAMENT BILLS TIED TO BUDGET OUTLAYS
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-surface-muted px-2.5 py-1 border border-ink">
            RTI WIKI PARLIAMENTARY REPOSITORY
          </span>
        </div>

        <div className="space-y-3">
          {SAMPLE_BUDGET_BILLS.map((bill) => (
            <div key={bill.bill_number} className="bg-canvas border-2 border-ink p-4 shadow-hard-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-surface-muted transition-colors">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[10px] font-bold">
                  <span className="bg-brand-yellow px-2 py-0.5 border border-ink text-black">
                    {bill.ministry}
                  </span>
                  <span className="text-gray-500">BILL NO. {bill.bill_number} ({bill.year})</span>
                  <span className="bg-brand-green text-black px-1.5 py-0.2 border border-black">
                    {bill.status}
                  </span>
                </div>
                <h4 className="font-display font-black text-sm uppercase text-ink">
                  {bill.bill_name}
                </h4>
                <p className="text-xs text-gray-600 font-bold">
                  {bill.allocation}
                </p>
              </div>

              <a
                href={bill.link}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center space-x-1 bg-ink text-white px-3 py-1.5 text-xs font-bold border border-ink hover:bg-brand-red transition-colors shadow-hard-xs"
              >
                <span>SANSAD GAZETTE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Attribution Footer */}
      <div className="bg-surface-muted border-2 border-ink p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
        <p>
          Data sources: Union Budget 2024–25 (Ministry of Finance, indiabudget.gov.in), MPs&apos; Salaries Act 1954, and Right To Information Wiki (CC-BY 4.0).
        </p>
        <Link href="/" className="font-bold text-ink hover:text-brand-red underline decoration-1 inline-flex items-center gap-1.5">
          <span>Back to Representatives Directory</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
