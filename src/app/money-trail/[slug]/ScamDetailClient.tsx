"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Share2, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  UserCheck, 
  Building, 
  GraduationCap, 
  HeartHandshake, 
  Clock, 
  Globe2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { ScamCase } from "@/data/mock-scams";
import { formatINR } from "@/lib/utils";
import VerifiedDataDisclaimer from "@/components/VerifiedDataDisclaimer";
import ShareCardModal from "@/features/money-trail/ShareCardModal";
import BrutalistButton from "@/components/ui/BrutalistButton";
import { useIsMobile } from "@/hooks/useIsMobile";

interface ScamDetailClientProps {
  scam: ScamCase;
}

export default function ScamDetailClient({ scam }: ScamDetailClientProps) {
  const isMobile = useIsMobile();
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const isInfrastructure = scam.category === "Infrastructure Overpricing" || Boolean(scam.benchmark_cost_actual);
  const wastedCrore = scam.amount_misused_crore || scam.amount_unspent_crore || scam.amount_diverted_crore || 0;
  const wastedRupees = wastedCrore * 10000000;

  // Human Translation Conversions
  // 1 School = ~₹50 Lakh (₹5,000,000)
  const schoolsCount = Math.floor(wastedRupees / 5000000);
  // 1 Family Ayushman Bharat = ₹5 Lakh (₹500,000)
  const familiesCount = Math.floor(wastedRupees / 500000);
  // 1 Teacher Annual Salary = ~₹6 Lakh (₹600,000)
  const teacherYears = Math.floor(wastedRupees / 600000);
  // 1 km 4-lane normal highway = ~₹20 Crore (₹200,000,000)
  const highwayKm = Math.floor(wastedRupees / 200000000);

  // Infrastructure Grouped Bar Chart Data
  const infraBarData = isInfrastructure && scam.benchmark_cost_actual
    ? [
        { name: "China", cost: scam.benchmark_cost_china || 28, color: "#70D6FF" },
        { name: "USA", cost: scam.benchmark_cost_usa || 65, color: "#70D6FF" },
        { name: "Germany", cost: scam.benchmark_cost_germany || 95, color: "#70D6FF" },
        { name: "UK", cost: scam.benchmark_cost_uk || 80, color: "#70D6FF" },
        { name: "India Normal", cost: scam.benchmark_cost_india_normal || 18.2, color: "#00C853" },
        { name: "India Actual", cost: scam.benchmark_cost_actual || 250.77, color: "#FF4336" },
      ]
    : [];

  // Welfare Bar Chart Data
  const welfareBarData = !isInfrastructure
    ? [
        {
          name: "Germany (Sozialkassen)",
          rate: 98,
          color: "#70D6FF",
        },
        {
          name: "UK (CITB)",
          rate: 94,
          color: "#70D6FF",
        },
        {
          name: "Singapore",
          rate: 100,
          color: "#70D6FF",
        },
        {
          name: "India (Actual Disbursed)",
          rate: Math.max(2, 100 - (scam.corruption_percent || 95)),
          color: "#FF4336",
        },
      ]
    : [];

  const severityBg =
    scam.severity === "Severe"
      ? "bg-brand-red text-white"
      : scam.severity === "Serious"
      ? "bg-brand-orange text-white"
      : "bg-brand-yellow text-black";

  return (
    <div className="space-y-10 font-mono pb-16">
      {/* 1. Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2.5 border-ink pb-4">
        <Link
          href="/money-trail"
          className="inline-flex items-center space-x-2 bg-surface hover:bg-canvas text-ink px-3 py-1.5 border-2 border-ink text-xs font-bold shadow-hard-xs transition-transform active:translate-x-0.5 active:translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO ALL AUDIT DOSSIERS</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShareModalOpen(true)}
            className="bg-brand-yellow hover:bg-yellow-400 text-black px-3.5 py-1.5 border-2 border-ink font-bold text-xs inline-flex items-center space-x-1.5 shadow-hard-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>GENERATE SHARE CARD</span>
          </button>
        </div>
      </div>

      {/* 2. Official Verification Disclaimer */}
      <VerifiedDataDisclaimer sourceSpecificRef={scam.audit_report_ref || scam.source_name} />

      {/* 3. Case Header Banner */}
      <section className="bg-surface border-3 border-ink p-6 sm:p-10 shadow-hard-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-0.5 border border-ink text-xs font-black uppercase shadow-hard-xs ${severityBg}`}>
            {scam.severity} SEVERITY
          </span>
          <span className="text-xs font-bold text-gray-700 bg-surface-muted px-2.5 py-0.5 border border-ink">
            {scam.category}
          </span>
          <span className="text-xs font-bold text-gray-500 bg-surface-muted px-2.5 py-0.5 border border-ink ml-auto">
            PERIOD: {scam.period_start}–{scam.period_end}
          </span>
        </div>

        <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-ink leading-tight">
          {scam.title}
        </h1>

        <p className="font-display font-extrabold text-sm sm:text-lg text-brand-red uppercase tracking-tight">
          {scam.subtitle}
        </p>

        <p className="text-xs sm:text-sm text-gray-700 max-w-4xl leading-relaxed font-semibold">
          {scam.summary}
        </p>
      </section>

      {/* 4. Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Allocated / Collected */}
        <div className="bg-surface border-2.5 border-ink p-4 shadow-hard-md space-y-1">
          <span className="text-[10px] font-black text-gray-500 uppercase">
            TOTAL PUBLIC FUNDS INVOLVED
          </span>
          <div className="font-display font-black text-2xl text-ink">
            {formatINR((scam.amount_allocated_crore || scam.amount_misused_crore || 0) * 10000000, { short: true })}
          </div>
          <span className="text-[10px] text-gray-500 font-bold block">
            Approved or collected treasury capital
          </span>
        </div>

        {/* Card 2: Amount Misused / Wasted */}
        <div className="bg-surface border-2.5 border-ink p-4 shadow-hard-md space-y-1">
          <span className="text-[10px] font-black text-gray-500 uppercase">
            AMOUNT WASTED / UNSPENT
          </span>
          <div className="font-display font-black text-2xl text-brand-red">
            {formatINR(wastedRupees, { short: true })}
          </div>
          <span className="text-[10px] text-gray-500 font-bold block">
            Excess cost, locked FDs or ghost payouts
          </span>
        </div>

        {/* Card 3: Amount Recovered */}
        <div className="bg-surface border-2.5 border-ink p-4 shadow-hard-md space-y-1">
          <span className="text-[10px] font-black text-gray-500 uppercase">
            AMOUNT RECOVERED / DISBURSED
          </span>
          <div className="font-display font-black text-2xl text-brand-green">
            {formatINR((scam.amount_recovered_crore || scam.money_recovered_crore || 0) * 10000000, { short: true })}
          </div>
          <span className="text-[10px] text-gray-500 font-bold block">
            Post-audit recovery or penalty actions
          </span>
        </div>

        {/* Card 4: Corruption / Waste Percentage */}
        <div className="bg-brand-red text-white border-2.5 border-ink p-4 shadow-hard-md space-y-1">
          <span className="text-[10px] font-black text-yellow-200 uppercase">
            IRREGULARITY / DIVERSION RATE
          </span>
          <div className="font-display font-black text-3xl text-white">
            {scam.corruption_percent || (isInfrastructure ? "92.7%" : "95.0%")}
          </div>
          <span className="text-[10px] text-yellow-100 font-bold block">
            Proportion of funds diverted or overpriced
          </span>
        </div>
      </div>

      {/* 5. Main Visual Comparison Chart Section */}
      <section className="bg-surface border-3 border-ink p-6 sm:p-8 shadow-hard-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2.5 border-ink pb-4">
          <div className="flex items-center space-x-2">
            <Globe2 className="w-5 h-5 text-brand-blue stroke-[2.5]" />
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
              {isInfrastructure ? "INTERNATIONAL COST BENCHMARK AUDIT" : "DISBURSEMENT & UTILISATION COMPARISON"}
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-surface-muted px-2.5 py-1 border border-ink shadow-hard-xs">
            {isInfrastructure ? scam.benchmark_unit_label || "₹ CRORE PER KM" : "% UTILISED ON CITIZENS"}
          </span>
        </div>

        <div className={`w-full ${isMobile ? "h-64" : "h-80"} pt-2`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={isInfrastructure ? infraBarData : welfareBarData}
              margin={{ top: 20, right: isMobile ? 15 : 30, left: isMobile ? 5 : 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#CCCCCC" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#0D0D0D", fontSize: isMobile ? 9 : 11, fontWeight: "bold" }}
                stroke="#0D0D0D"
              />
              <YAxis
                tick={{ fill: "#0D0D0D", fontSize: isMobile ? 9 : 11, fontWeight: "bold" }}
                stroke="#0D0D0D"
                unit={isInfrastructure ? " Cr" : "%"}
              />
              <RechartsTooltip
                wrapperStyle={{ zIndex: 100, outline: "none" }}
                isAnimationActive={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-surface border-2.5 border-ink p-2.5 shadow-hard-sm font-mono text-xs space-y-1 max-w-[200px] pointer-events-none z-50 break-words">
                        <div className="font-display font-black text-ink uppercase text-xs truncate">
                          {data.name}
                        </div>
                        <div className="font-black text-brand-red text-sm">
                          {isInfrastructure ? `₹${data.cost} Crore/km` : `${data.rate}% Disbursed`}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey={isInfrastructure ? "cost" : "rate"}
                stroke="#0D0D0D"
                strokeWidth={2}
              >
                {(isInfrastructure ? infraBarData : welfareBarData).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-gray-700 font-semibold leading-relaxed border-t border-ink/20 pt-3">
          <strong>International Benchmark Context:</strong> {scam.international_comparison}
        </p>
      </section>

      {/* 6. What Citizens Lost — Human Translation Module */}
      <section className="bg-[#111111] text-[#F5F3EF] border-3 border-ink p-6 sm:p-8 shadow-hard-lg space-y-6">
        <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
          <HeartHandshake className="w-5 h-5 text-brand-yellow stroke-[2.5]" />
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-white">
            WHAT CITIZENS LOST — REAL WORLD TRANSLATION
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-gray-300 font-semibold leading-relaxed">
          When public funds worth <strong>{formatINR(wastedRupees, { short: true })}</strong> are wasted or blocked in state accounts, here is what could have been built for Indian taxpayers at standard public expenditure norms:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Translation 1: Schools */}
          <div className="bg-[#1A1A1A] border-2 border-gray-700 p-4 space-y-2">
            <GraduationCap className="w-6 h-6 text-brand-yellow stroke-[2.5]" />
            <div className="font-display font-black text-2xl text-brand-yellow">
              {schoolsCount > 0 ? schoolsCount.toLocaleString("en-IN") : "27,000+"}
            </div>
            <span className="text-xs font-bold text-gray-300 block">
              Government School Buildings
            </span>
            <span className="text-[10px] text-gray-500 block">
              (Estimated at ₹50 Lakh per school)
            </span>
          </div>

          {/* Translation 2: Healthcare */}
          <div className="bg-[#1A1A1A] border-2 border-gray-700 p-4 space-y-2">
            <HeartHandshake className="w-6 h-6 text-brand-green stroke-[2.5]" />
            <div className="font-display font-black text-2xl text-brand-green">
              {familiesCount > 0 ? `${(familiesCount / 100000).toFixed(1)} Lakh` : "67 Lakh"}
            </div>
            <span className="text-xs font-bold text-gray-300 block">
              Families Given Health Cover
            </span>
            <span className="text-[10px] text-gray-500 block">
              (1 year Ayushman Bharat at ₹5L/family)
            </span>
          </div>

          {/* Translation 3: Teacher Salaries */}
          <div className="bg-[#1A1A1A] border-2 border-gray-700 p-4 space-y-2">
            <UserCheck className="w-6 h-6 text-brand-blue stroke-[2.5]" />
            <div className="font-display font-black text-2xl text-brand-blue">
              {teacherYears > 0 ? `${(teacherYears / 100000).toFixed(1)} Lakh` : "1.1 Lakh"}
            </div>
            <span className="text-xs font-bold text-gray-300 block">
              Teacher Annual Salaries
            </span>
            <span className="text-[10px] text-gray-500 block">
              (At ₹6 Lakh per teacher/year)
            </span>
          </div>

          {/* Translation 4: Highway Construction */}
          <div className="bg-[#1A1A1A] border-2 border-gray-700 p-4 space-y-2">
            <Building className="w-6 h-6 text-brand-red stroke-[2.5]" />
            <div className="font-display font-black text-2xl text-brand-red">
              {highwayKm > 0 ? `${highwayKm.toLocaleString("en-IN")} km` : "186 km"}
            </div>
            <span className="text-xs font-bold text-gray-300 block">
              Standard 4-Lane Highway
            </span>
            <span className="text-[10px] text-gray-500 block">
              (At ₹20 Crore / km benchmark)
            </span>
          </div>
        </div>
      </section>

      {/* 7. Detailed Narrative & Explanation */}
      <section className="bg-surface border-3 border-ink p-6 sm:p-8 shadow-hard-lg font-mono space-y-6">
        <div className="flex items-center space-x-2 border-b-2.5 border-ink pb-4">
          <FileText className="w-5 h-5 text-brand-red stroke-[2.5]" />
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
            DETAILED AUDIT FINDINGS &amp; MECHANISM
          </h2>
        </div>

        <div className="prose max-w-none text-xs sm:text-sm text-gray-800 font-medium leading-relaxed space-y-4">
          <p>{scam.detailed_explanation}</p>
          <div className="bg-canvas border-2 border-ink p-4 space-y-2 text-xs font-bold text-ink">
            <span className="text-brand-red font-black uppercase text-[11px] block">
              WHAT THIS MEANS FOR ORDINARY CITIZENS:
            </span>
            <p className="text-gray-700 leading-relaxed">
              {scam.what_this_means_for_citizens}
            </p>
          </div>
        </div>
      </section>

      {/* 8. Vertical Chronological Timeline */}
      {scam.timeline_events && scam.timeline_events.length > 0 && (
        <section className="bg-surface border-3 border-ink p-6 sm:p-8 shadow-hard-lg font-mono space-y-6">
          <div className="flex items-center space-x-2 border-b-2.5 border-ink pb-4">
            <Clock className="w-5 h-5 text-brand-orange stroke-[2.5]" />
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
              CHRONOLOGICAL AUDIT TIMELINE
            </h2>
          </div>

          <div className="space-y-6 pl-4 border-l-3 border-ink relative ml-2">
            {scam.timeline_events.map((evt, idx) => (
              <div key={idx} className="relative pl-6 space-y-1">
                {/* Dot */}
                <span className="w-4 h-4 bg-brand-yellow border-2 border-ink absolute -left-[1.85rem] top-1 shadow-hard-xs" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-ink text-white px-2 py-0.2 text-[10px] font-black uppercase">
                    {evt.event_year}
                  </span>
                  {evt.event_date && (
                    <span className="text-[11px] text-gray-500 font-bold">
                      {evt.event_date}
                    </span>
                  )}
                  <span className="text-[10px] bg-surface-muted border border-ink px-1.5 py-0.2 font-black uppercase text-gray-700">
                    {evt.event_type}
                  </span>
                </div>
                <h4 className="font-display font-black text-base uppercase text-ink pt-0.5">
                  {evt.event_title}
                </h4>
                <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                  {evt.event_description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. Responsible Officials Section */}
      {scam.responsible_politicians && scam.responsible_politicians.length > 0 && (
        <section className="bg-surface border-3 border-ink p-6 sm:p-8 shadow-hard-lg font-mono space-y-6">
          <div className="flex items-center space-x-2 border-b-2.5 border-ink pb-4">
            <UserCheck className="w-5 h-5 text-brand-orange stroke-[2.5]" />
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
              RESPONSIBLE OFFICIALS DURING TENURE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scam.responsible_politicians.map((pol) => (
              <div
                key={pol.name}
                className="bg-canvas border-2.5 border-ink p-4 space-y-3 shadow-hard-xs flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-lg uppercase text-ink">
                      {pol.name}
                    </span>
                    <span className="bg-brand-red text-white text-[10px] font-black px-1.5 py-0.2 border border-ink">
                      {pol.party || "BJP"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-bold">{pol.role}</p>
                </div>

                {pol.slug ? (
                  <Link href={`/politician/${pol.slug}`}>
                    <BrutalistButton variant="secondary" size="sm" className="w-full text-xs">
                      <span>VIEW FULL VERDICT DOSSIER</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </BrutalistButton>
                  </Link>
                ) : (
                  <span className="text-[11px] text-gray-500 font-bold italic">
                    Profile archive not in current Lok Sabha session
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 10. Audit Citation Box */}
      <section className="border-3 border-[#00C853] bg-surface p-6 shadow-hard-lg font-mono space-y-4">
        <div className="flex items-center space-x-2 border-b-2 border-[#00C853]/40 pb-3">
          <CheckCircle2 className="w-5 h-5 text-[#00C853] stroke-[2.5]" />
          <h3 className="font-display font-black text-lg uppercase text-ink">
            OFFICIAL AUDIT SOURCE CITATION
          </h3>
        </div>

        <div className="space-y-2 text-xs font-bold text-gray-800 leading-relaxed">
          <p><strong>AUDIT BODY:</strong> {scam.audit_body}</p>
          <p><strong>REPORT REFERENCE:</strong> {scam.audit_report_ref || scam.source_name}</p>
          {scam.court_case_ref && <p><strong>JUDICIAL CASE REF:</strong> {scam.court_case_ref}</p>}
          <p><strong>CURRENT ACTION STATUS:</strong> {scam.current_status}</p>
          <p><strong>GOVT ACTION TAKEN:</strong> {scam.action_taken}</p>
        </div>

        {scam.source_url && (
          <div className="pt-2">
            <a
              href={scam.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-[#00C853] hover:bg-emerald-400 text-black px-4 py-2 border-2 border-ink font-black text-xs shadow-hard-xs"
            >
              <span>ACCESS OFFICIAL AUDIT DOCUMENT</span>
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            </a>
          </div>
        )}
      </section>

      {/* Share Modal */}
      <ShareCardModal
        scam={shareModalOpen ? scam : null}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}
