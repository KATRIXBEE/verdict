"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Calendar, 
  ShieldCheck, 
  ExternalLink, 
  GitCompare, 
  Share2, 
  Check, 
  AlertTriangle,
  Info,
  Award
} from "lucide-react";
import { Politician } from "@/types";
import { getEducationBadge, getScoreColor, getProxiedImageUrl } from "@/lib/utils";
import BrutalistCard from "@/components/ui/BrutalistCard";
import BrutalistButton from "@/components/ui/BrutalistButton";
import Badge from "@/components/ui/Badge";

interface ProfileHeaderProps {
  politician: Politician;
}

export default function ProfileHeader({ politician }: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);
  const eduBadge = getEducationBadge(politician.educationStatus);
  const scoreColor = getScoreColor(politician.calculatedVerdictScore);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="bg-surface border-3 border-ink shadow-hard-lg font-mono relative overflow-hidden">
      {/* Top Docket Title Bar */}
      <div className="bg-ink text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b-2.5 border-ink select-none">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-red inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-brand-green inline-block" />
          <span className="font-bold text-xs uppercase tracking-widest ml-2">
            NETA DOSSIER FILE: #{politician.slug.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[10px]">
          <div className="bg-white/10 px-2 py-0.5 border border-white/20 text-gray-300">
            ECI AFFIDAVIT DATE: {politician.sourceAffidavitDate}
          </div>
          <div className="bg-brand-green text-black font-bold px-2 py-0.5 border border-black animate-pulse">
            LIVE SYNC: {new Date(politician.lastSyncedAt).toLocaleDateString("en-IN")}
          </div>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-8">
          {/* Left: Official Portrait with Brutalist Frame */}
          <div className="w-full md:w-56 shrink-0 flex flex-col items-center">
            <div className="w-48 sm:w-56 h-56 sm:h-64 border-3 border-ink bg-gray-200 overflow-hidden relative shadow-hard-md group">
              <img
                src={getProxiedImageUrl(politician.photoUrl)}
                alt={politician.fullName}
                className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/default-politician.svg";
                }}
              />
              <div className="absolute bottom-0 inset-x-0 bg-ink/90 text-white text-[10px] font-bold py-1 text-center tracking-widest border-t-2 border-ink">
                ECI VERIFIED PHOTO
              </div>
            </div>

            {/* Political Party Pill */}
            <div
              className="mt-3 w-full border-2.5 border-ink text-center py-2 px-3 shadow-hard-sm font-extrabold text-sm uppercase"
              style={{ backgroundColor: politician.partyColor + "33" }}
            >
              {politician.currentParty} ({politician.partyAbbr})
            </div>

            {/* Ministerial Badge if applicable */}
            {politician.isMinister && (
              <div className="mt-2 w-full bg-brand-yellow text-black border-2 border-ink text-[11px] font-bold text-center py-1 uppercase shadow-hard-xs inline-flex items-center justify-center gap-1.5">
                <Award className="w-3.5 h-3.5 stroke-[2.5] text-black" aria-hidden="true" />
                <span>{politician.portfolio || "UNION MINISTER"}</span>
              </div>
            )}
          </div>

          {/* Middle & Right: Personal Info & Education Flag */}
          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2.5 border-ink pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase text-ink tracking-tight">
                    {politician.fullName}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-xs text-gray-700 font-bold">
                  <span className="inline-flex items-center space-x-1 bg-surface-muted px-2 py-0.5 border border-ink">
                    <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                    <span>{politician.currentConstituency.name} ({politician.currentConstituency.code})</span>
                  </span>
                  <span aria-hidden="true">•</span>
                  <span>{politician.currentConstituency.state}</span>
                  <span aria-hidden="true">•</span>
                  <span>{politician.house}</span>
                  <span aria-hidden="true">•</span>
                  <span>{politician.termsServed} {politician.termsServed > 1 ? "Terms" : "Term"}</span>
                </div>
              </div>

              {/* Share & Compare Buttons */}
              <div className="flex items-center space-x-2 shrink-0 pt-1 sm:pt-0">
                <button
                  onClick={handleShare}
                  className="min-h-[40px] inline-flex items-center space-x-1.5 px-3 py-2 border-2 border-ink bg-surface hover:bg-surface-muted font-bold text-xs shadow-hard-xs cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                  title="Copy Dossier Link"
                >
                  {copied ? <Check className="w-4 h-4 text-brand-green stroke-[2.5]" /> : <Share2 className="w-4 h-4 stroke-[2.5]" />}
                  <span>{copied ? "COPIED!" : "SHARE"}</span>
                </button>

                <Link href={`/compare?p1=${politician.slug}`}>
                  <BrutalistButton variant="cyan" size="sm" shadow="sm" className="min-h-[40px] inline-flex items-center space-x-1.5 px-3 py-2">
                    <GitCompare className="w-4 h-4 stroke-[2.5]" />
                    <span>FACE-OFF</span>
                  </BrutalistButton>
                </Link>
              </div>
            </div>

            {/* Key Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-canvas border-2 border-ink p-3 shadow-hard-xs space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center space-x-1">
                  <Briefcase className="w-3 h-3 text-brand-orange" />
                  <span>DECLARED PROFESSION (FORM 26)</span>
                </span>
                <p className="font-bold text-ink text-xs sm:text-sm">{politician.professionDeclared}</p>
              </div>

              <div className="bg-canvas border-2 border-ink p-3 shadow-hard-xs space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-brand-cyan" />
                  <span>AGE & CONSTITUTIONAL POST</span>
                </span>
                <p className="font-bold text-ink text-xs sm:text-sm">
                  {politician.age} Years Old • Member of Parliament
                </p>
              </div>
            </div>

            {/* Feature 2: Education Authenticity Flag (UGC/AICTE Cross-Check) */}
            <div className="border-2.5 border-ink bg-surface-muted p-4 shadow-hard-sm space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-brand-red shrink-0" />
                  <span className="font-bold text-xs uppercase text-ink tracking-wider">
                    ACADEMIC QUALIFICATION & UGC VERIFICATION
                  </span>
                </div>

                {/* Status Badge */}
                <span className={`px-2 py-0.5 text-xs font-black border uppercase ${eduBadge.classNames}`}>
                  {eduBadge.symbol} {eduBadge.label}
                </span>
              </div>

              <div className="bg-surface border-1.5 border-ink p-2.5 space-y-1">
                <div className="font-bold text-ink text-xs sm:text-sm">
                  {politician.educationDegree}
                </div>
                <div className="text-xs text-gray-700 font-medium">
                  {politician.educationInstitution}
                </div>
                {politician.educationDetails && (
                  <div className="text-[11px] text-gray-600 border-t border-gray-300 pt-1 mt-1 flex items-start space-x-1.5">
                    <Info className="w-3 h-3 text-brand-cyan shrink-0 mt-0.5" />
                    <span>{politician.educationDetails}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Statutory Source Audit Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-600 bg-canvas border border-ink px-3 py-1.5 font-mono">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-green shrink-0" />
                <span className="font-bold text-ink">SOURCE: ECI FORM 26 AFFIDAVIT</span>
                <span>•</span>
                <span>VERIFIED AGAINST UGC ARCHIVES</span>
              </div>

              <a
                href="https://affidavit.eci.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-ink font-bold hover:text-brand-red underline decoration-1"
              >
                <span>OFFICIAL PDF</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
