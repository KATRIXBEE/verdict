"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Share2, 
  FileText, 
  UserCheck 
} from "lucide-react";
import { ScamCase } from "@/data/mock-scams";
import { formatINR } from "@/lib/utils";
import BrutalistButton from "@/components/ui/BrutalistButton";

interface ScamCardProps {
  scam: ScamCase;
  onOpenShareModal?: (scam: ScamCase) => void;
}

export default function ScamCard({ scam, onOpenShareModal }: ScamCardProps) {
  const isInfrastructure = scam.category === "Infrastructure Overpricing" || Boolean(scam.benchmark_cost_actual);
  const isWelfare = scam.category === "Welfare Fund Misuse" || scam.category === "Environmental Fund Misuse";

  const severityBg =
    scam.severity === "Severe"
      ? "bg-brand-red text-white"
      : scam.severity === "Serious"
      ? "bg-brand-orange text-white"
      : "bg-brand-yellow text-black";

  return (
    <article className="bg-surface border-3 border-ink p-5 sm:p-7 shadow-hard-lg font-mono space-y-5 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink/30 pb-3">
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 border border-ink text-xs font-black uppercase shadow-hard-xs ${severityBg}`}>
            {scam.severity}
          </span>
          <span className="text-xs font-bold text-gray-700 bg-surface-muted px-2 py-0.5 border border-ink">
            {scam.category}
          </span>
        </div>
        <span className="text-[11px] font-bold text-gray-500 uppercase">
          AUDIT YEAR: {scam.audit_year || "2023"}
        </span>
      </div>

      {/* Case Header */}
      <div className="space-y-1.5">
        <Link href={`/money-trail/${scam.slug}`} className="group block">
          <h3 className="font-display font-black text-xl sm:text-2xl uppercase text-ink group-hover:text-brand-red transition-colors leading-tight">
            {scam.title}
          </h3>
        </Link>
        <p className="text-xs sm:text-sm text-gray-700 font-semibold leading-relaxed">
          {scam.subtitle}
        </p>
      </div>

      {/* Visual Mode A: Infrastructure Cost Comparison */}
      {isInfrastructure && scam.benchmark_cost_actual && (
        <div className="bg-canvas border-2 border-ink p-4 space-y-3 shadow-hard-xs text-xs">
          <div className="font-black text-ink uppercase text-[11px] flex items-center justify-between">
            <span>COST BENCHMARK COMPARISON ({scam.benchmark_cost_unit || "Per km"})</span>
            <span className="text-brand-red font-black text-xs">
              {scam.cost_inflation_multiple ? `${scam.cost_inflation_multiple}x INFLATION` : "EXCESS EXPENDITURE"}
            </span>
          </div>

          {/* Should Cost vs Actual Cost */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                <span>GOVT APPROVED BASELINE:</span>
                <span className="text-brand-green font-black">
                  ₹{scam.benchmark_cost_india_normal} Cr/km
                </span>
              </div>
              <div className="w-full bg-gray-200 border border-ink h-4 relative overflow-hidden">
                <div
                  className="bg-brand-green h-full border-r border-ink"
                  style={{
                    width: `${Math.min(100, ((scam.benchmark_cost_india_normal || 18) / (scam.benchmark_cost_actual || 250)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                <span>ACTUAL SANCTIONED COST:</span>
                <span className="text-brand-red font-black">
                  ₹{scam.benchmark_cost_actual} Cr/km
                </span>
              </div>
              <div className="w-full bg-gray-200 border border-ink h-4 relative overflow-hidden">
                <div className="bg-brand-red h-full" style={{ width: "100%" }} />
              </div>
            </div>
          </div>

          {/* Global Comparison Horizontal Bars */}
          <div className="pt-2 border-t border-ink/20 space-y-1.5 text-[11px]">
            <span className="font-bold text-gray-500 uppercase text-[10px]">
              GLOBAL COMPARISON (8-Lane Elevated / Equivalent):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-bold">
              <div className="bg-surface border border-ink p-1.5">
                <span className="text-gray-500 text-[10px] block">
                  <span className="font-mono font-black text-[9px] bg-black/10 px-1 py-0.2 border border-ink/30 mr-1" aria-hidden="true">CN</span>
                  CHINA
                </span>
                <span className="text-ink font-black">₹{scam.benchmark_cost_china || 28} Cr/km</span>
              </div>
              <div className="bg-surface border border-ink p-1.5">
                <span className="text-gray-500 text-[10px] block">
                  <span className="font-mono font-black text-[9px] bg-black/10 px-1 py-0.2 border border-ink/30 mr-1" aria-hidden="true">US</span>
                  USA
                </span>
                <span className="text-ink font-black">₹{scam.benchmark_cost_usa || 65} Cr/km</span>
              </div>
              <div className="bg-surface border border-ink p-1.5">
                <span className="text-gray-500 text-[10px] block">
                  <span className="font-mono font-black text-[9px] bg-black/10 px-1 py-0.2 border border-ink/30 mr-1" aria-hidden="true">DE</span>
                  GERMANY
                </span>
                <span className="text-ink font-black">₹{scam.benchmark_cost_germany || 95} Cr/km</span>
              </div>
              <div className="bg-brand-red/10 border-2 border-brand-red p-1.5">
                <span className="text-brand-red text-[10px] block font-black">
                  <span className="font-mono font-black text-[9px] bg-brand-red text-white px-1 py-0.2 border border-ink mr-1" aria-hidden="true">IN</span>
                  DWARKA ACTUAL
                </span>
                <span className="text-brand-red font-black">₹{scam.benchmark_cost_actual} Cr/km</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Mode B: Welfare Fund Misuse & Locked Treasuries */}
      {isWelfare && (
        <div className="bg-canvas border-2 border-ink p-4 space-y-3 shadow-hard-xs text-xs">
          <div className="flex items-center justify-between text-[11px] font-black uppercase">
            <span>TOTAL COLLECTED FROM TAXPAYERS/EMPLOYERS:</span>
            <span className="text-ink font-black">
              {formatINR((scam.amount_allocated_crore || 40000) * 10000000, { short: true })}
            </span>
          </div>

          {/* Utilisation Split */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-brand-red">UNSPENT / DIVERTED / IN FIXED DEPOSITS</span>
              <span className="text-brand-red font-black">
                {scam.corruption_percent || 95}%
              </span>
            </div>
            <div className="w-full bg-gray-200 border border-ink h-5 flex overflow-hidden">
              <div
                className="bg-brand-red h-full flex items-center justify-center text-[10px] font-black text-white"
                style={{ width: `${scam.corruption_percent || 95}%` }}
              >
                {scam.corruption_percent || 95}%
              </div>
              <div
                className="bg-brand-green h-full flex items-center justify-center text-[10px] font-black text-black"
                style={{ width: `${100 - (scam.corruption_percent || 95)}%` }}
              >
                {100 - (scam.corruption_percent || 95)}%
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-600">
              <span>Money locked in govt accounts</span>
              <span className="text-brand-green font-black">Actually reached citizens</span>
            </div>
          </div>
        </div>
      )}

      {/* Key Case Summary Narrative */}
      <p className="text-xs text-gray-700 line-clamp-3 leading-relaxed font-medium">
        {scam.summary}
      </p>

      {/* Responsible Politicians Tag */}
      {scam.responsible_politicians && scam.responsible_politicians.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase flex items-center space-x-1">
            <UserCheck className="w-3.5 h-3.5 text-gray-600" />
            <span>PORTFOLIO AT TIME:</span>
          </span>
          {scam.responsible_politicians.map((pol) => {
            if (pol.slug) {
              return (
                <Link
                  key={pol.name}
                  href={`/politician/${pol.slug}`}
                  className="inline-flex items-center space-x-1 bg-surface-muted hover:bg-brand-yellow text-ink px-2 py-0.5 border border-ink text-xs font-bold transition-colors shadow-hard-xs"
                >
                  <span>{pol.name}</span>
                  <ArrowRight className="w-3 h-3 text-ink" />
                </Link>
              );
            }
            return (
              <span
                key={pol.name}
                className="inline-flex items-center bg-gray-100 text-gray-700 px-2 py-0.5 border border-ink text-xs font-bold"
              >
                {pol.name}
              </span>
            );
          })}
        </div>
      )}

      {/* Audit Citation & Action Buttons */}
      <div className="pt-3 border-t-2 border-ink/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-gray-600 truncate">
          <FileText className="w-4 h-4 text-brand-green shrink-0 stroke-[2.5]" />
          <span className="truncate font-bold text-[11px]" title={scam.audit_report_ref || scam.source_name}>
            Source: {scam.source_name}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onOpenShareModal && (
            <button
              onClick={() => onOpenShareModal(scam)}
              className="bg-surface hover:bg-gray-100 text-ink px-3 py-1.5 border-2 border-ink font-bold text-xs flex items-center space-x-1 shadow-hard-xs active:translate-x-0.5 active:translate-y-0.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>SHARE CARD</span>
            </button>
          )}

          <Link href={`/money-trail/${scam.slug}`}>
            <BrutalistButton variant="primary" size="sm" className="text-xs">
              <span>VIEW FULL CASE</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </BrutalistButton>
          </Link>
        </div>
      </div>
    </article>
  );
}
