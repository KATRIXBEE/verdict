"use client";

import React from "react";
import Link from "next/link";
import { FileText, ExternalLink, Search, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import BrutalistButton from "@/components/ui/BrutalistButton";

export default function CitizenActionSection() {
  return (
    <section className="bg-surface border-3 border-ink p-6 sm:p-8 shadow-hard-lg font-mono space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2.5 border-ink pb-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-brand-green stroke-[2.5]" />
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-ink">
            THIS IS YOUR MONEY. HERE&apos;S WHAT TO DO.
          </h2>
        </div>
        <span className="text-xs font-bold text-gray-500 bg-surface-muted px-2.5 py-1 border border-ink shadow-hard-xs">
          CITIZEN DIRECT ACTION TOOLKIT
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Action 1: File an RTI */}
        <div className="bg-canvas border-2.5 border-ink p-5 shadow-hard-md flex flex-col justify-between space-y-4 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
          <div className="space-y-2">
            <div className="w-9 h-9 bg-brand-green text-black border-2 border-ink flex items-center justify-center font-black shadow-hard-xs">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-display font-black text-lg uppercase text-ink">
              1. FILE AN RTI APPLICATION
            </h3>
            <p className="text-xs text-gray-700 font-semibold leading-relaxed">
              Exercise your constitutional right under the RTI Act 2005 to demand expenditure records, contractor invoices, and utilisation status for schemes in your district.
            </p>
          </div>
          <Link href="/ground-truth">
            <BrutalistButton variant="primary" size="sm" className="w-full text-xs">
              <span>OPEN RTI GENERATOR</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </BrutalistButton>
          </Link>
        </div>

        {/* Action 2: Read Official CAG Reports */}
        <div className="bg-canvas border-2.5 border-ink p-5 shadow-hard-md flex flex-col justify-between space-y-4 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
          <div className="space-y-2">
            <div className="w-9 h-9 bg-brand-blue text-white border-2 border-ink flex items-center justify-center font-black shadow-hard-xs">
              <ExternalLink className="w-5 h-5" />
            </div>
            <h3 className="font-display font-black text-lg uppercase text-ink">
              2. READ CAG AUDIT REPORTS
            </h3>
            <p className="text-xs text-gray-700 font-semibold leading-relaxed">
              Every audit report tabled in Parliament is a public document. Access official PDF downloads, union accounts, and state performance audits directly on the CAG portal.
            </p>
          </div>
          <a
            href="https://cag.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <BrutalistButton variant="secondary" size="sm" className="w-full text-xs">
              <span>OFFICIAL CAG PORTAL</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </BrutalistButton>
          </a>
        </div>

        {/* Action 3: Track Your MP */}
        <div className="bg-canvas border-2.5 border-ink p-5 shadow-hard-md flex flex-col justify-between space-y-4 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
          <div className="space-y-2">
            <div className="w-9 h-9 bg-brand-yellow text-black border-2 border-ink flex items-center justify-center font-black shadow-hard-xs">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-display font-black text-lg uppercase text-ink">
              3. TRACK YOUR MP&apos;S QUESTIONS
            </h3>
            <p className="text-xs text-gray-700 font-semibold leading-relaxed">
              Did your Lok Sabha MP or Rajya Sabha representative raise parliamentary questions about unspent funds, toll overcharges, or highway inflation? Check their record.
            </p>
          </div>
          <Link href="/search">
            <BrutalistButton variant="outline" size="sm" className="w-full text-xs">
              <span>SEARCH YOUR MP</span>
              <Search className="w-3.5 h-3.5 ml-1" />
            </BrutalistButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
