"use client";

import React from "react";
import { Landmark, MessageSquare, HelpCircle, FileCheck, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { Politician } from "@/types";
import BrutalistCard from "@/components/ui/BrutalistCard";

interface ParliamentStatsProps {
  politician: Politician;
}

export default function ParliamentStats({ politician }: ParliamentStatsProps) {
  const att = politician.attendancePercentage;
  const natAvg = politician.nationalAttendanceAvg || 78.2;
  const stateAvg = politician.stateAttendanceAvg || 75.0;

  const hasAttendance = att !== undefined && att !== null;
  const isAboveNat = hasAttendance ? att >= natAvg : false;

  return (
    <BrutalistCard
      title="PARLIAMENTARY PERFORMANCE & ATTENDANCE"
      badge="SANSAD.IN / PRS DATA"
      badgeColor="cyan"
      statusLight="green"
      statusLightLabel="18TH LOK SABHA"
    >
      <div className="space-y-6 font-mono">
        {/* Attendance Main Gauge */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Landmark className="w-4 h-4 text-brand-cyan" />
              <span className="font-bold text-xs uppercase text-ink">
                SESSION ATTENDANCE RATE
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-black text-2xl text-ink">
                {hasAttendance ? `${att.toFixed(1)}%` : "N/A"}
              </span>
              {hasAttendance ? (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 border border-ink flex items-center space-x-1 ${
                    isAboveNat ? "bg-brand-green text-black" : "bg-brand-orange text-white"
                  }`}
                >
                  {isAboveNat ? (
                    <>
                      <TrendingUp className="w-3 h-3" />
                      <span>+{(att - natAvg).toFixed(1)}% vs NAT</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3" />
                      <span>-{(natAvg - att).toFixed(1)}% vs NAT</span>
                    </>
                  )}
                </span>
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.5 border border-ink bg-gray-200 text-gray-700">
                  OFFICIAL LOG PENDING
                </span>
              )}
            </div>
          </div>

          {/* Custom Dual Progress Bar with Benchmark Indicators */}
          <div className="relative h-6 bg-surface-muted border-2 border-ink overflow-hidden">
            <div
              className={`h-full border-r-2 border-ink transition-all duration-500 ${
                !hasAttendance ? "bg-gray-300" : att >= 85 ? "bg-brand-green" : att >= 65 ? "bg-brand-yellow" : "bg-brand-red"
              }`}
              style={{ width: `${hasAttendance ? Math.min(100, Math.max(0, att)) : 0}%` }}
            />
            {/* National Benchmark Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-black border-l border-dashed border-white z-10"
              style={{ left: `${natAvg}%` }}
              title={`National Average: ${natAvg}%`}
            />
          </div>

          {/* Benchmark Legend */}
          <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-ink inline-block" />
              <span>National Avg: <strong>{natAvg}%</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-brand-yellow border border-ink inline-block" />
              <span>State Avg: <strong>{stateAvg}%</strong></span>
            </div>
          </div>
        </div>

        {/* 3 Metric Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Debates */}
          <div className="bg-canvas border-2 border-ink p-3 shadow-hard-xs space-y-1">
            <div className="flex items-center justify-between text-[10px] text-gray-600 font-bold uppercase">
              <span className="flex items-center space-x-1">
                <MessageSquare className="w-3.5 h-3.5 text-brand-green" />
                <span>DEBATES</span>
              </span>
              <span className="text-gray-400">Avg: 32</span>
            </div>
            <div className="font-display font-black text-2xl text-ink">
              {politician.debatesParticipated ?? 0}
            </div>
            <p className="text-[10px] text-gray-500">
              {(politician.debatesParticipated ?? 0) >= 32 ? "Above House Average" : "Below House Average"}
            </p>
          </div>

          {/* Questions Asked */}
          <div className="bg-canvas border-2 border-ink p-3 shadow-hard-xs space-y-1">
            <div className="flex items-center justify-between text-[10px] text-gray-600 font-bold uppercase">
              <span className="flex items-center space-x-1">
                <HelpCircle className="w-3.5 h-3.5 text-brand-yellow" />
                <span>QUESTIONS</span>
              </span>
              <span className="text-gray-400">Avg: 65</span>
            </div>
            <div className="font-display font-black text-2xl text-ink">
              {politician.questionsAsked ?? 0}
            </div>
            <p className="text-[10px] text-gray-500">
              {(politician.questionsAsked ?? 0) >= 65 ? "High Legislative Activity" : "Moderate Activity"}
            </p>
          </div>

          {/* Private Member Bills */}
          <div className="bg-canvas border-2 border-ink p-3 shadow-hard-xs space-y-1">
            <div className="flex items-center justify-between text-[10px] text-gray-600 font-bold uppercase">
              <span className="flex items-center space-x-1">
                <FileCheck className="w-3.5 h-3.5 text-brand-purple" />
                <span>PM BILLS</span>
              </span>
              <span className="text-gray-400">Avg: 1.2</span>
            </div>
            <div className="font-display font-black text-2xl text-ink">
              {politician.privateMemberBills ?? 0}
            </div>
            <p className="text-[10px] text-gray-500">
              {(politician.privateMemberBills ?? 0) > 0 ? "Policy Innovation Tabled" : "No Independent Bills"}
            </p>
          </div>
        </div>

        {/* Source citation */}
        <div className="flex items-center justify-between text-[10px] text-gray-500 border-t border-gray-300 pt-2">
          <span>SOURCE: Lok Sabha Secretariat / PRS Legislative Research</span>
          <a
            href="https://sansad.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-ink font-bold hover:underline"
          >
            <span>SANSAD.IN DOCKET</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </BrutalistCard>
  );
}
