"use client";

import React from "react";
import { ShieldCheck, CheckCircle2, FileText, Scale } from "lucide-react";

interface VerifiedDataDisclaimerProps {
  className?: string;
  sourceSpecificRef?: string;
}

export default function VerifiedDataDisclaimer({
  className = "",
  sourceSpecificRef,
}: VerifiedDataDisclaimerProps) {
  return (
    <div
      className={`border-3 border-[#00C853] bg-surface p-5 sm:p-6 shadow-hard-md font-mono text-ink relative overflow-hidden ${className}`}
    >
      {/* Top Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#00C853]/40 pb-3">
        <div className="inline-flex items-center space-x-2 bg-[#00C853] text-black px-2.5 py-0.5 border border-ink text-xs font-black uppercase shadow-hard-xs">
          <ShieldCheck className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span>ALL DATA VERIFIED FROM OFFICIAL SOURCES</span>
        </div>
        <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
          CONSTITUTIONAL & JUDICIAL FINDINGS
        </span>
      </div>

      {/* Main Body Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3.5 text-xs">
        <div className="space-y-2">
          <p className="font-bold text-ink leading-relaxed">
            Every figure and finding on this page is sourced directly from:
          </p>
          <ul className="space-y-1.5 text-gray-800 font-semibold">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853] shrink-0 mt-0.5 stroke-[2.5]" />
              <span><strong>CAG of India Audit Reports</strong> (Constitutional Supreme Audit Institution)</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853] shrink-0 mt-0.5 stroke-[2.5]" />
              <span><strong>Supreme Court of India Orders &amp; Judgements</strong></span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853] shrink-0 mt-0.5 stroke-[2.5]" />
              <span><strong>Parliamentary Standing &amp; Public Accounts Committee Reports</strong></span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853] shrink-0 mt-0.5 stroke-[2.5]" />
              <span><strong>RTI Disclosures &amp; Official Ministry Responses</strong></span>
            </li>
          </ul>
        </div>

        <div className="bg-canvas border-2 border-ink p-3.5 space-y-2 text-[11px] leading-relaxed shadow-hard-xs">
          <p className="font-bold text-ink uppercase text-[10px] text-gray-500 tracking-wider">
            EDITORIAL INTEGRITY POLICY
          </p>
          <p className="text-gray-700">
            This is <strong>not investigative journalism, rumor, or partisan allegation</strong>. These are official findings compiled by India&apos;s own constitutional audit bodies and tabled in Parliament.
          </p>
          <p className="text-gray-700">
            VERDICT does not add editorial bias or assess guilt. We render government data public, accessible, and transparent for every citizen.
          </p>
          {sourceSpecificRef && (
            <div className="pt-2 border-t border-ink/20 text-[10px] font-black text-brand-red truncate">
              PRIMARY CITATION: {sourceSpecificRef}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
