"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from "recharts";
import {
  Coins,
  TrendingDown,
  Info,
  ExternalLink,
  Landmark,
  Scale,
  Zap,
  ArrowRight,
  Globe2,
} from "lucide-react";
import { RUPEE_HISTORICAL_DATA, CurrencyData } from "@/data/rupee-data";
import { useIsMobile } from "@/hooks/useIsMobile";

const CURRENCY_KEYS = ["usd", "gbp", "eur", "jpy", "cny", "aed", "sar", "cad", "sgd"] as const;
type CurrencyKey = (typeof CURRENCY_KEYS)[number];

const COUNTRY_CODES: Record<CurrencyKey, string> = {
  usd: "US",
  gbp: "UK",
  eur: "EU",
  jpy: "JP",
  cny: "CN",
  aed: "AE",
  sar: "SA",
  cad: "CA",
  sgd: "SG",
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  currency: CurrencyData;
}

function CustomRupeeTooltip({ active, payload, label, currency }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-surface border-2.5 border-ink p-2.5 shadow-hard-md font-mono text-xs max-w-[220px] pointer-events-none z-50 break-words">
        <div className="flex items-center justify-between border-b border-ink/20 pb-1 mb-1.5">
          <span className="font-extrabold text-ink">YEAR: {label}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-brand-yellow border border-ink">
            1 {currency.symbol} = ₹{dataPoint.rate}
          </span>
        </div>
        <div className="text-gray-700 font-bold">
          Rate: <span className="text-brand-red font-black">₹{dataPoint.rate}</span>
        </div>
        {dataPoint.annotation && (
          <div className="mt-1 text-[10px] text-black bg-brand-pink/30 p-1 border border-ink/40 font-bold inline-flex items-center gap-1 w-full leading-tight">
            <Zap className="w-3 h-3 text-black stroke-[2.5] shrink-0" aria-hidden="true" />
            <span>{dataPoint.annotation}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export default function RupeeTracker() {
  const isMobile = useIsMobile();
  const [selectedCurrencyKey, setSelectedCurrencyKey] = useState<CurrencyKey>("usd");

  const currency = RUPEE_HISTORICAL_DATA[selectedCurrencyKey] || RUPEE_HISTORICAL_DATA.usd;

  // Chart data formatting
  const chartData = useMemo(() => {
    return currency.data.map((d) => ({
      year: d.year,
      rate: d.rate,
      annotation: d.annotation,
    }));
  }, [currency]);

  // Dynamic Purchasing Power Calculation (Base ₹1,00,000 in 2005)
  const initialYearRate = currency.data[0]?.rate || 44.27;
  const latestYearRate = currency.data[currency.data.length - 1]?.rate || 95.70;
  
  const foreignVal2005 = Math.round(100000 / initialYearRate);
  const foreignVal2026 = Math.round(100000 / latestYearRate);
  const purchasingPowerLostPct = (
    ((foreignVal2005 - foreignVal2026) / foreignVal2005) *
    100
  ).toFixed(1);

  // Key Event Milestones for Display
  const keyEvents = [
    { year: "2008", event: "Global Financial Crisis", impact: "Capital flight from emerging markets" },
    { year: "2013", event: "US Fed Taper Tantrum", impact: "FII outflows trigger sharp rupee slide" },
    { year: "2016", event: "Demonetisation", impact: "Cash liquidity shock and short-term volatility" },
    { year: "2020", event: "COVID-19 Global Shock", impact: "Global supply disruptions & USD rush" },
    { year: "2022", event: "Russia-Ukraine & Crude Shock", impact: "Brent crude surpasses $120; USD surge" },
    { year: "2024–26", event: "Global Trade Shifts & Rates", impact: "Persistent energy import bills" },
  ];

  return (
    <section
      id="rupee-tracker"
      className="mt-12 bg-surface border-3 border-ink p-5 sm:p-8 lg:p-10 shadow-hard-xl space-y-8 font-mono"
    >
      {/* Section Header */}
      <div className="space-y-3 border-b-3 border-ink pb-6">
        <div className="inline-flex items-center space-x-2 bg-brand-yellow text-black px-3 py-1 border-2 border-ink text-xs font-black uppercase shadow-hard-xs">
          <Coins className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span>MACRO CURRENCY ANALYSIS • 20-YEAR TRAJECTORY</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-ink">
              THE RUPEE&apos;S JOURNEY — 20 YEARS OF VALUE
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 font-bold mt-1">
              1 USD in 2005 bought ₹44.27. Today it buys ₹95.70+. Tracking two decades of Indian Rupee purchasing power.
            </p>
          </div>

          <div className="text-left md:text-right shrink-0">
            <span className="inline-block bg-brand-red text-white text-xs font-extrabold px-3 py-1.5 border-2 border-ink shadow-hard-xs uppercase">
              {currency.change_pct}
            </span>
          </div>
        </div>
      </div>

      {/* 1. Header Stat Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-canvas border-2.5 border-ink p-4 shadow-hard-xs">
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-wider">
            DOMESTIC INFLATION EROSION
          </div>
          <div className="text-xl sm:text-2xl font-black text-ink font-display mt-1">
            ₹1 (2005) = ₹0.46 TODAY
          </div>
          <p className="text-[11px] text-gray-600 font-bold mt-1">
            Adjusted for cumulative domestic CPI consumer price inflation.
          </p>
        </div>

        <div className="bg-canvas border-2.5 border-ink p-4 shadow-hard-xs">
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-wider">
            USD EXCHANGE EROSION
          </div>
          <div className="text-xl sm:text-2xl font-black text-brand-red font-display mt-1 inline-flex items-center gap-1.5">
            <span>₹44.27</span>
            <ArrowRight className="w-4 h-4 text-brand-red stroke-[2.5]" aria-hidden="true" />
            <span>₹95.70 (+116%)</span>
          </div>
          <p className="text-[11px] text-gray-600 font-bold mt-1">
            Depreciation of INR against the benchmark US Dollar reserve currency.
          </p>
        </div>

        <div className="bg-brand-cyan/20 border-2.5 border-ink p-4 shadow-hard-xs sm:col-span-2 lg:col-span-1">
          <div className="text-[10px] text-ink font-black uppercase tracking-wider">
            PRIMARY CAUSE
          </div>
          <div className="text-lg sm:text-xl font-black text-ink font-display mt-1">
            CRUDE OIL & TRADE DEFICIT
          </div>
          <p className="text-[11px] text-gray-800 font-bold mt-1">
            India imports ~87% of its crude oil, creating structural foreign exchange demand.
          </p>
        </div>
      </div>

      {/* 2. Currency Selector Pills */}
      <div className="space-y-2">
        <label className="text-xs text-ink font-black uppercase tracking-wider block">
          SELECT CURRENCY BENCHMARK ({CURRENCY_KEYS.length} GLOBAL PAIRS):
        </label>
        <div className="flex flex-wrap gap-2">
          {CURRENCY_KEYS.map((key) => {
            const item = RUPEE_HISTORICAL_DATA[key];
            const isSelected = selectedCurrencyKey === key;
            const countryCode = COUNTRY_CODES[key] || "GL";
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCurrencyKey(key)}
                className={`px-3 py-2 border-2 border-ink text-xs font-black uppercase shadow-hard-xs transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-brand-red text-white -translate-y-0.5 shadow-hard-sm"
                    : "bg-surface hover:bg-brand-yellow text-ink"
                }`}
              >
                <span className="text-[10px] font-black px-1 py-0.2 bg-black text-white border border-white/40">
                  {countryCode}
                </span>
                <span>{key.toUpperCase()}</span>
                <span className="opacity-75 font-normal">({item.symbol})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Interactive Line Chart */}
      <div className="bg-canvas border-3 border-ink p-4 sm:p-6 shadow-hard-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-ink/20 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black px-2 py-1 bg-brand-yellow border-2 border-ink shadow-hard-xs">
              {COUNTRY_CODES[selectedCurrencyKey]}
            </span>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg uppercase text-ink">
                1 {currency.name.toUpperCase()} IN INDIAN RUPEES (INR)
              </h3>
              <p className="text-xs text-gray-600 font-bold">{currency.context}</p>
            </div>
          </div>

          <div className="text-xs font-mono font-bold text-gray-500 bg-surface border border-ink px-2.5 py-1 shadow-hard-xs self-start sm:self-auto">
            RANGE: {currency.data[0]?.year} – {currency.data[currency.data.length - 1]?.year}
          </div>
        </div>

        {/* Recharts Container */}
        <div className={`w-full ${isMobile ? "h-64" : "h-72 sm:h-96"} pt-2`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: isMobile ? 10 : 20, left: isMobile ? -15 : 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="year"
                stroke="#111111"
                tick={{ fontSize: isMobile ? 9 : 11, fontWeight: "bold", fontFamily: "monospace" }}
              />
              <YAxis
                stroke="#111111"
                tick={{ fontSize: isMobile ? 9 : 11, fontWeight: "bold", fontFamily: "monospace" }}
                domain={["dataMin - 5", "dataMax + 5"]}
                unit="₹"
              />
              <Tooltip 
                content={<CustomRupeeTooltip currency={currency} />} 
                wrapperStyle={{ zIndex: 100, outline: "none" }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="rate"
                name={`1 ${currency.symbol} in INR`}
                stroke="#C4362D"
                strokeWidth={3.5}
                dot={{ r: 4, fill: "#111111", stroke: "#C4362D", strokeWidth: 2 }}
                activeDot={{ r: 7, fill: "#FFD028", stroke: "#111111", strokeWidth: 3 }}
              />
              {/* Highlight 2008 Crisis */}
              <ReferenceDot x={2008} y={currency.data.find(d => d.year === 2008)?.rate || 43.97} r={6} fill="#FF4336" stroke="#000" />
              {/* Highlight 2020 COVID */}
              <ReferenceDot x={2020} y={currency.data.find(d => d.year === 2020)?.rate || 74.10} r={6} fill="#FF4336" stroke="#000" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Event Timeline Chips */}
        <div className="pt-2 border-t border-ink/20">
          <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">
            KEY MACROECONOMIC CRISIS MILESTONES:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            {keyEvents.map((evt) => (
              <div key={evt.year} className="bg-surface border border-ink p-2 shadow-hard-xs">
                <div className="font-extrabold text-brand-red">{evt.year}</div>
                <div className="font-bold text-[11px] text-ink truncate" title={evt.event}>
                  {evt.event}
                </div>
                <div className="text-[9px] text-gray-600 mt-0.5 leading-tight">{evt.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Comparison Purchasing Power Card */}
      <div className="border-3 border-ink bg-brand-yellow/15 p-5 sm:p-6 shadow-hard-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="bg-brand-red text-white text-[10px] font-black px-2 py-0.5 border border-black shadow-hard-xs uppercase">
              REAL-WORLD PURCHASING POWER IMPACT
            </span>
            <h4 className="font-display font-black text-lg sm:text-xl uppercase text-ink">
              IF YOU HAD ₹1,00,000 IN 2005...
            </h4>
            <p className="text-xs text-gray-700 font-bold">
              Comparing what ₹1 Lakh could convert into in {currency.name} then vs today.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center shrink-0">
            <div className="bg-surface border-2 border-ink p-2 sm:p-3 shadow-hard-xs">
              <div className="text-[9px] text-gray-500 font-bold uppercase">VALUE IN 2005</div>
              <div className="font-display font-black text-sm sm:text-base text-ink">
                {currency.symbol}{foreignVal2005.toLocaleString()}
              </div>
            </div>

            <div className="bg-surface border-2 border-ink p-2 sm:p-3 shadow-hard-xs">
              <div className="text-[9px] text-gray-500 font-bold uppercase">VALUE TODAY</div>
              <div className="font-display font-black text-sm sm:text-base text-brand-red">
                {currency.symbol}{foreignVal2026.toLocaleString()}
              </div>
            </div>

            <div className="bg-brand-red text-white border-2 border-ink p-2 sm:p-3 shadow-hard-xs">
              <div className="text-[9px] text-white/80 font-bold uppercase">POWER LOST</div>
              <div className="font-display font-black text-sm sm:text-base">
                -{purchasingPowerLostPct}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Macro Context Text (Why Rupee Weakens) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-surface border-2 border-ink p-4 shadow-hard-xs space-y-2">
          <div className="flex items-center space-x-2 font-black uppercase text-ink">
            <TrendingDown className="w-4 h-4 text-brand-red" aria-hidden="true" />
            <span>1. WHY THE RUPEE WEAKENS</span>
          </div>
          <p className="text-gray-700 leading-relaxed">
            India runs a structural <strong>trade deficit</strong> because we import significantly more goods (especially crude oil, electronic chips, and machinery) than we export in merchandise. Every imported barrel requires converting INR to USD.
          </p>
        </div>

        <div className="bg-surface border-2 border-ink p-4 shadow-hard-xs space-y-2">
          <div className="flex items-center space-x-2 font-black uppercase text-ink">
            <Landmark className="w-4 h-4 text-brand-green" aria-hidden="true" />
            <span>2. HOW RBI INTERVENES</span>
          </div>
          <p className="text-gray-700 leading-relaxed">
            The Reserve Bank of India holds over <strong>$650 Billion in Foreign Exchange Reserves</strong>. When the rupee falls too fast, RBI sells dollars in the open market to absorb excess rupee supply and curb abrupt currency volatility.
          </p>
        </div>

        <div className="bg-surface border-2 border-ink p-4 shadow-hard-xs space-y-2">
          <div className="flex items-center space-x-2 font-black uppercase text-ink">
            <Scale className="w-4 h-4 text-brand-yellow" aria-hidden="true" />
            <span>3. IS WEAKENING ALWAYS BAD?</span>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Not necessarily. A weaker rupee makes Indian IT software exports, textiles, and pharmaceutical products <strong>more competitive globally</strong>. However, it increases domestic petrol and diesel prices and raises inflation on imported goods.
          </p>
        </div>
      </div>

      {/* 6. Source Attribution & Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-ink/20 text-xs text-gray-600 font-bold">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-ink shrink-0" aria-hidden="true" />
          <span>
            Data Sources: Reserve Bank of India (RBI) Reference Rates, Bank of England, Wikipedia INR Exchange Rate History.
          </span>
        </div>

        <a
          href="https://www.rbi.org.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-ink hover:text-brand-red underline"
        >
          <span>Official RBI Database</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
