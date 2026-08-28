"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserCheck, ArrowRight, AlertTriangle, Briefcase } from "lucide-react";
import { SCAM_CASES_DATA, ScamCase } from "@/data/mock-scams";
import { formatINR } from "@/lib/utils";

interface MinisterGroup {
  name: string;
  role: string;
  slug?: string | null;
  party?: string;
  totalCrore: number;
  cases: ScamCase[];
}

export default function MinisterAccountabilityMap() {
  // Aggregate cases by minister
  const ministerMap: Record<string, MinisterGroup> = {};

  SCAM_CASES_DATA.forEach((scam) => {
    scam.responsible_politicians?.forEach((pol) => {
      if (!ministerMap[pol.name]) {
        ministerMap[pol.name] = {
          name: pol.name,
          role: pol.role,
          slug: pol.slug,
          party: pol.party || "BJP",
          totalCrore: 0,
          cases: [],
        };
      }
      ministerMap[pol.name].totalCrore += scam.amount_allocated_crore || scam.amount_misused_crore || 0;
      if (!ministerMap[pol.name].cases.some((c) => c.slug === scam.slug)) {
        ministerMap[pol.name].cases.push(scam);
      }
    });
  });

  const ministers = Object.values(ministerMap).sort((a, b) => b.totalCrore - a.totalCrore);
  const [selectedMinisterName, setSelectedMinisterName] = useState<string>(ministers[0]?.name || "");

  const activeMinister = ministerMap[selectedMinisterName] || ministers[0];

  return (
    <section className="bg-surface border-3 border-ink p-6 sm:p-8 shadow-hard-lg font-mono space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2.5 border-ink pb-4">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-brand-orange stroke-[2.5]" />
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
            WHICH MINISTER WAS IN CHARGE?
          </h2>
        </div>
        <span className="text-xs font-bold text-gray-500 bg-surface-muted px-2.5 py-1 border border-ink shadow-hard-xs">
          EXECUTIVE PORTFOLIO ACCOUNTABILITY
        </span>
      </div>

      <p className="text-xs sm:text-sm text-gray-700 font-semibold leading-relaxed">
        Explore public audit findings organized by the constitutional minister holding ministerial charge during the audit review period.
      </p>

      {/* Minister Selector Pill Tabs */}
      <div className="flex flex-wrap gap-2 pt-1">
        {ministers.map((m) => {
          const isSelected = selectedMinisterName === m.name;
          return (
            <button
              key={m.name}
              onClick={() => setSelectedMinisterName(m.name)}
              className={`px-3 py-1.5 border-2 border-ink text-xs font-bold transition-all shadow-hard-xs ${
                isSelected
                  ? "bg-brand-yellow text-black -translate-x-0.5 -translate-y-0.5 shadow-hard-sm font-black"
                  : "bg-surface hover:bg-surface-muted text-ink"
              }`}
            >
              {m.name} ({m.cases.length})
            </button>
          );
        })}
      </div>

      {/* Active Minister Dossier Box */}
      {activeMinister && (
        <div className="bg-canvas border-2.5 border-ink p-5 space-y-5 shadow-hard-md text-xs">
          {/* Minister Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-ink/30 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
                  {activeMinister.name}
                </h3>
                <span className="bg-brand-red text-white px-2 py-0.2 border border-ink text-[10px] font-black uppercase">
                  {activeMinister.party}
                </span>
              </div>
              <p className="text-gray-600 font-bold text-xs flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{activeMinister.role}</span>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">FUNDS UNDER WATCH</span>
                <span className="font-display font-black text-lg sm:text-xl text-brand-red">
                  {formatINR(activeMinister.totalCrore * 10000000, { short: true })}
                </span>
              </div>
              {activeMinister.slug && (
                <Link
                  href={`/politician/${activeMinister.slug}`}
                  className="bg-brand-yellow hover:bg-yellow-400 text-black px-3 py-1.5 border-2 border-ink font-bold text-xs inline-flex items-center space-x-1 shadow-hard-xs"
                >
                  <span>VIEW VERDICT DOSSIER</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              )}
            </div>
          </div>

          {/* Associated Cases Grid */}
          <div className="space-y-3">
            <span className="font-black text-ink uppercase text-[11px] block">
              CAG &amp; JUDICIAL AUDIT CASES DURING TENURE ({activeMinister.cases.length}):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeMinister.cases.map((c) => (
                <div
                  key={c.slug}
                  className="bg-surface border-2 border-ink p-3 space-y-2 shadow-hard-xs flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500">
                      <span>{c.category}</span>
                      <span className="text-brand-red">
                        {formatINR((c.amount_allocated_crore || c.amount_misused_crore || 0) * 10000000, { short: true })}
                      </span>
                    </div>
                    <Link
                      href={`/money-trail/${c.slug}`}
                      className="font-bold text-ink hover:text-brand-red text-xs line-clamp-2"
                    >
                      {c.title}
                    </Link>
                  </div>
                  <div className="pt-2 border-t border-ink/10 flex justify-between items-center text-[10px]">
                    <span className="text-gray-500 font-bold truncate">
                      {c.audit_body} ({c.audit_year})
                    </span>
                    <Link
                      href={`/money-trail/${c.slug}`}
                      className="text-brand-red font-black inline-flex items-center hover:underline"
                    >
                      <span>DETAILS</span>
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Fair Notice Disclaimer */}
          <div className="bg-surface border-2 border-ink p-3.5 space-y-1 text-[11px] leading-relaxed text-gray-700 shadow-hard-xs">
            <div className="flex items-center space-x-1.5 text-brand-red font-black uppercase text-[10px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>LEGAL TRANSPARENCY NOTICE:</span>
            </div>
            <p>
              Being listed here signifies that the Comptroller and Auditor General (CAG) or Supreme Court proceedings recorded policy violations, cost escalations, or unspent welfare allocations during this individual&apos;s ministerial tenure. This does not constitute a criminal charge or judicial conviction unless specifically indicated in individual court registries.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
