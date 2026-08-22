"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertOctagon, 
  Flame, 
  ShieldAlert, 
  Activity, 
  ExternalLink, 
  BarChart3, 
  Scale, 
  Clock, 
  MapPin, 
  AlertTriangle 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  CartesianGrid 
} from "recharts";
import BrutalistCard from "@/components/ui/BrutalistCard";

const NCRB_DATA = {
  annual: {
    year: 2022,
    rape_cases: 31516,
    murder_cases: 28522,
    kidnapping_cases: 100545,
    robbery_cases: 24393,
    crimes_against_women: 445256,
    crimes_against_children: 162449,
    cybercrime_cases: 65893,
    total_ipc_crimes: 4461679,
  },
  daily_average: {
    rape_cases: 86.35,        // 31516 / 365
    murder_cases: 78.14,       // 28522 / 365
    crimes_against_women: 1219.88, // 445256 / 365
    cybercrime_cases: 180.53,  // 65893 / 365
  },
  monthly_chart: [
    { category: "Women Safety", monthly: Math.round(445256 / 12), annual: 445256 },
    { category: "Kidnapping", monthly: Math.round(100545 / 12), annual: 100545 },
    { category: "Cybercrime", monthly: Math.round(65893 / 12), annual: 65893 },
    { category: "Rape Cases", monthly: Math.round(31516 / 12), annual: 31516 },
    { category: "Murders", monthly: Math.round(28522 / 12), annual: 28522 },
    { category: "Robberies", monthly: Math.round(24393 / 12), annual: 24393 },
  ],
  top_states: [
    { state: "Uttar Pradesh", crimes: 682000, ratePerLakh: 312.4, color: "#990000" },
    { state: "Maharashtra", crimes: 445000, ratePerLakh: 288.6, color: "#CC0000" },
    { state: "Rajasthan", crimes: 333000, ratePerLakh: 416.3, color: "#E62E00" },
    { state: "Madhya Pradesh", crimes: 308000, ratePerLakh: 358.9, color: "#FF4545" },
    { state: "West Bengal", crimes: 229000, ratePerLakh: 234.1, color: "#FF6666" },
  ]
};

export default function CrimeCounter() {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Per-second calculations
  const rapeSinceOpen = (secondsElapsed * (NCRB_DATA.daily_average.rape_cases / 86400)).toFixed(2);
  const murderSinceOpen = (secondsElapsed * (NCRB_DATA.daily_average.murder_cases / 86400)).toFixed(2);
  const womenSinceOpen = (secondsElapsed * (NCRB_DATA.daily_average.crimes_against_women / 86400)).toFixed(2);
  const cyberSinceOpen = (secondsElapsed * (NCRB_DATA.daily_average.cybercrime_cases / 86400)).toFixed(2);

  return (
    <section className="bg-surface border-3 border-ink p-5 sm:p-8 lg:p-10 shadow-hard-xl space-y-8 font-mono">
      {/* Header with red pulsing dot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-3 border-ink pb-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-brand-red animate-ping absolute" />
            <span className="w-3.5 h-3.5 rounded-full bg-brand-red inline-block border border-black z-10" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-ink uppercase tracking-tight">
                INDIA CRIME CLOCK
              </h2>
              <span className="bg-brand-red text-white text-[10px] font-black px-2 py-0.5 border border-black shadow-hard-xs uppercase">
                LIVE SIMULATION
              </span>
            </div>
            <p className="text-xs text-gray-600 font-bold mt-0.5">
              Real-time statistical incident counters tracking national police filings per second.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-600 bg-canvas border border-ink px-3 py-1.5 shadow-hard-xs">
          <Clock className="w-4 h-4 text-brand-red animate-spin text-ink" style={{ animationDuration: "8s" }} />
          <span>TIME ON PAGE: <strong>{secondsElapsed}s</strong></span>
        </div>
      </div>

      {/* ROW 1 — Live Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Counter 1: Rape */}
        <div className="bg-canvas border-2.5 border-ink p-4 shadow-hard-md flex flex-col justify-between space-y-2 group hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase">
            <span>RAPE INCIDENTS</span>
            <AlertOctagon className="w-4 h-4 text-brand-red" />
          </div>
          <div>
            <div className="font-display font-black text-3xl sm:text-4xl text-brand-red tracking-tight">
              {rapeSinceOpen}
            </div>
            <p className="text-xs font-bold text-ink mt-1">
              Occurred since you opened this page
            </p>
          </div>
          <div className="text-[10px] text-gray-500 border-t border-gray-300 pt-1.5">
            Avg ~86 cases/day • 31,516/yr
          </div>
        </div>

        {/* Counter 2: Murder */}
        <div className="bg-canvas border-2.5 border-ink p-4 shadow-hard-md flex flex-col justify-between space-y-2 group hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase">
            <span>MURDER & HOMICIDE</span>
            <Flame className="w-4 h-4 text-brand-orange" />
          </div>
          <div>
            <div className="font-display font-black text-3xl sm:text-4xl text-brand-red tracking-tight">
              {murderSinceOpen}
            </div>
            <p className="text-xs font-bold text-ink mt-1">
              Occurred since you opened this page
            </p>
          </div>
          <div className="text-[10px] text-gray-500 border-t border-gray-300 pt-1.5">
            Avg ~78 cases/day • 28,522/yr
          </div>
        </div>

        {/* Counter 3: Crimes Against Women */}
        <div className="bg-canvas border-2.5 border-ink p-4 shadow-hard-md flex flex-col justify-between space-y-2 group hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase">
            <span>CRIMES AGAINST WOMEN</span>
            <ShieldAlert className="w-4 h-4 text-brand-red" />
          </div>
          <div>
            <div className="font-display font-black text-3xl sm:text-4xl text-brand-red tracking-tight">
              {womenSinceOpen}
            </div>
            <p className="text-xs font-bold text-ink mt-1">
              Occurred since you opened this page
            </p>
          </div>
          <div className="text-[10px] text-gray-500 border-t border-gray-300 pt-1.5">
            Avg ~1,220 cases/day • 445,256/yr
          </div>
        </div>

        {/* Counter 4: Cybercrime */}
        <div className="bg-canvas border-2.5 border-ink p-4 shadow-hard-md flex flex-col justify-between space-y-2 group hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase">
            <span>CYBER FRAUD & CRIME</span>
            <Activity className="w-4 h-4 text-brand-cyan" />
          </div>
          <div>
            <div className="font-display font-black text-3xl sm:text-4xl text-brand-red tracking-tight">
              {cyberSinceOpen}
            </div>
            <p className="text-xs font-bold text-ink mt-1">
              Occurred since you opened this page
            </p>
          </div>
          <div className="text-[10px] text-gray-500 border-t border-gray-300 pt-1.5">
            Avg ~181 cases/day • 65,893/yr
          </div>
        </div>
      </div>

      {/* ROW 2 & ROW 3 — Monthly Comparison Chart & State-wise Top 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Average Comparison Chart */}
        <div className="lg:col-span-7 bg-canvas border-2.5 border-ink p-5 shadow-hard-md space-y-4">
          <div className="flex items-center justify-between border-b-2 border-ink pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-brand-red" />
              <h3 className="font-display font-black text-base uppercase text-ink">
                MONTHLY REPORTED INCIDENTS BY CATEGORY
              </h3>
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase">
              NCRB 2022 FIGURES
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={NCRB_DATA.monthly_chart} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#000", fontWeight: "bold" }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: "#000" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1A1A1A", border: "2px solid #000", color: "#FFF", fontFamily: "monospace", fontSize: "12px" }}
                  formatter={(value: any) => [`${Number(value).toLocaleString("en-IN")} / month`, "Monthly Average"]}
                />
                <Bar dataKey="monthly" fill="#FF4336" stroke="#000" strokeWidth={1.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-gray-600 italic">
            Over 37,000 cases of crimes against women are registered with state police forces every 30 days across India.
          </p>
        </div>

        {/* State-wise Top 5 by Total Crime Volume */}
        <div className="lg:col-span-5 bg-canvas border-2.5 border-ink p-5 shadow-hard-md space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-brand-orange" />
                <h3 className="font-display font-black text-base uppercase text-ink">
                  TOP 5 STATES BY REGISTERED CRIMES
                </h3>
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase">
                ANNUAL TOTALS
              </span>
            </div>

            <div className="space-y-3 pt-3">
              {NCRB_DATA.top_states.map((st, i) => {
                const maxCrimes = NCRB_DATA.top_states[0].crimes;
                const widthPct = Math.round((st.crimes / maxCrimes) * 100);

                return (
                  <div key={st.state} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-ink">
                      <span>{i + 1}. {st.state}</span>
                      <span>{st.crimes.toLocaleString("en-IN")} IPC cases</span>
                    </div>
                    <div className="h-4 w-full bg-gray-200 border border-ink overflow-hidden relative">
                      <div
                        className="h-full border-r border-ink transition-all duration-700"
                        style={{ width: `${widthPct}%`, backgroundColor: st.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-muted p-2.5 border border-ink text-[11px] text-gray-700 space-y-1 mt-3">
            <span className="font-bold text-ink block">★ Key Observational Context:</span>
            <p>
              Higher registered crime numbers often reflect better police filing and citizen reporting rates in progressive states, alongside demographic population volume.
            </p>
          </div>
        </div>
      </div>

      {/* ROW 4 — Data source and disclaimer */}
      <div className="bg-surface-muted border-2 border-ink p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-700">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
          <p>
            <strong>Data Source & Methodology:</strong> Data extracted directly from the National Crime Records Bureau (NCRB) Annual Report 2022 (Ministry of Home Affairs, Govt. of India). Real-time ticker figures are estimates calculated from annual averages.
          </p>
        </div>

        <a
          href="https://ncrb.gov.in/en/crime-in-india-table-addtional-table-and-chapter-contents"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 font-bold text-ink hover:text-brand-red shrink-0 underline decoration-1"
        >
          <span>NCRB.GOV.IN REPORT</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
}
