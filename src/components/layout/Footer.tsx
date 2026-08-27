import React from "react";
import Link from "next/link";
import { ShieldCheck, Scale, FileText, ExternalLink, Database, CheckCircle2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface border-t-3 border-ink mt-12 sm:mt-16 font-mono text-xs">
      {/* Top Legal Shield Bar */}
      <div className="bg-brand-yellow border-b-2.5 border-ink px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center space-x-2 font-bold text-black text-xs sm:text-sm">
            <ShieldCheck className="w-5 h-5 text-black shrink-0" />
            <span>LEGAL DEFENSE & DEFAMATION IMMUNITY ARCHITECTURE</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-semibold text-black/80">
            <span className="w-2 h-2 rounded-full bg-brand-green border border-black inline-block" />
            <span>VERBATIM PUBLIC RECORD COMPLIANT (ARTICLE 19(1)(a))</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Mission & Legal Stance */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="bg-brand-red text-white p-1 border-2 border-ink shadow-hard-xs">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-display text-xl font-black tracking-tight text-ink uppercase">
                VERDICT
              </span>
            </div>
            <p className="text-gray-700 text-xs leading-relaxed">
              India&apos;s open-source politician accountability engine. Transforming legally mandated affidavits, court dockets, and parliamentary roll-calls into an unbiased, tamper-proof transparency dashboard for first-time voters and investigative journalists.
            </p>
            <div className="pt-2 text-[11px] text-gray-500 font-bold">
              SIH 2026 CIVIC-TECH WINNER ARCHITECTURE
            </div>
          </div>

          {/* Column 2: Verifiable Government Sources */}
          <div className="space-y-3">
            <div className="font-bold text-ink uppercase tracking-wider text-sm border-b-2 border-ink pb-1">
              DATA SOURCES & AUDIT TRAILS
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://affidavit.eci.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-gray-800 hover:text-brand-red underline decoration-1"
                >
                  <span>Election Commission of India (Form 26)</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a
                  href="https://services.ecourts.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-gray-800 hover:text-brand-red underline decoration-1"
                >
                  <span>National Judicial Data Grid (eCourts)</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a
                  href="https://sansad.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-gray-800 hover:text-brand-red underline decoration-1"
                >
                  <span>Parliament of India (Sansad / PRS)</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ugc.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-gray-800 hover:text-brand-red underline decoration-1"
                >
                  <span>UGC & National Academic Depository</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal Disclaimer Notice */}
          <div className="space-y-3 bg-surface-muted p-4 border-2 border-ink shadow-hard-sm">
            <div className="font-bold text-ink uppercase tracking-wider text-xs flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-brand-red" />
              <span>STATUTORY LEGAL DISCLAIMER</span>
            </div>
            <p className="text-[11px] text-gray-700 leading-relaxed">
              All data displayed on VERDICT is verbatim public record sourced from Election Commission of India affidavits, official eCourts portals, and parliamentary transcripts. We provide neutral algorithmic aggregation, not editorial judgment, and link every line item directly to its government source document.
            </p>
          </div>
        </div>

        {/* Bottom copyright and timestamp */}
        <div className="border-t-2 border-ink mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-600 text-[11px]">
          <div>
            © 2026 VERDICT Civic-Tech Foundation. Public Domain Civic Data under India Open Data Initiative.
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link href="/india-rankings" className="hover:text-ink underline">
              India Rankings
            </Link>
            <span>•</span>
            <Link href="/method" className="hover:text-ink underline">
              Algorithm Methodology
            </Link>
            <span>•</span>
            <Link href="/compare" className="hover:text-ink underline">
              Head-to-Head Compare
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
