"use client";

import React, { useState } from "react";
import { 
  Scale, 
  AlertOctagon, 
  CheckCircle2, 
  ExternalLink, 
  Calendar, 
  UserCheck, 
  Building2, 
  BookOpen,
  HelpCircle,
  FileText
} from "lucide-react";
import { CriminalCase } from "@/types";
import { getCaseStatusBadge, getSeverityBadge } from "@/lib/utils";
import BrutalistCard from "@/components/ui/BrutalistCard";
import BrutalistButton from "@/components/ui/BrutalistButton";
import IPCTranslatorModal from "./IPCTranslatorModal";

interface CriminalDossierProps {
  cases?: CriminalCase[] | null;
  politicianName: string;
}

export default function CriminalDossier({ cases, politicianName }: CriminalDossierProps) {
  const [selectedIPC, setSelectedIPC] = useState<string>("IPC 420");
  const [translatorOpen, setTranslatorOpen] = useState(false);

  const safeCases = cases || [];
  const activeCases = safeCases.filter((c) => c.status !== "acquitted");
  const severeCases = safeCases.filter((c) => c.severityTier === "severe" && c.status !== "acquitted");
  const hasCases = safeCases.length > 0;

  const handleOpenIPC = (ipc: string) => {
    setSelectedIPC(ipc);
    setTranslatorOpen(true);
  };

  return (
    <>
      <BrutalistCard
        title="LIVE CRIMINAL DOSSIER & eCOURTS SYNC"
        badge={
          !hasCases
            ? "CLEAN RECORD (0 CASES)"
            : `${cases.length} DECLARED CASES (${activeCases.length} ACTIVE)`
        }
        badgeColor={!hasCases ? "green" : severeCases.length > 0 ? "red" : "orange"}
        statusLight={hasCases ? "red" : "green"}
        statusLightLabel={hasCases ? "eCOURTS MONITORED" : "NO ACTIVE CHARGES"}
      >
        <div className="space-y-6 font-mono">
          {/* Top disclaimer bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-muted border-2 border-ink p-3 text-xs">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-brand-red" />
              <span className="font-bold text-ink">
                SOURCE: ECI FORM 26 DISCLOSURES + eCOURTS (NJDG) LIVE FEED
              </span>
            </div>

            <BrutalistButton
              variant="outline"
              size="sm"
              shadow="sm"
              onClick={() => {
                setSelectedIPC("IPC 420");
                setTranslatorOpen(true);
              }}
              className="flex items-center space-x-1 text-[11px]"
            >
              <BookOpen className="w-3.5 h-3.5 text-brand-red" />
              <span>OPEN IPC DICTIONARY</span>
            </BrutalistButton>
          </div>

          {/* Clean record state */}
          {!hasCases ? (
            <div className="bg-canvas border-2.5 border-ink p-8 text-center space-y-3 shadow-hard-sm">
              <div className="w-12 h-12 bg-brand-green border-2 border-ink rounded-full flex items-center justify-center mx-auto shadow-hard-xs">
                <CheckCircle2 className="w-7 h-7 text-black stroke-[2.5]" />
              </div>
              <h3 className="font-display font-black text-xl text-ink uppercase">
                ZERO CRIMINAL CASES DECLARED
              </h3>
              <p className="text-xs text-gray-700 max-w-md mx-auto leading-relaxed">
                Candidate has declared zero pending or convicted criminal charges under sworn Form 26 affidavit and verified eCourts public database.
              </p>
            </div>
          ) : (
            /* Case List */
            <div className="space-y-4">
              {cases.map((c) => {
                const statusBadge = getCaseStatusBadge(c.status);
                const severityBadge = getSeverityBadge(c.severityTier);

                return (
                  <div
                    key={c.id}
                    className="bg-surface border-2.5 border-ink p-4 sm:p-5 shadow-hard-md hover:shadow-hard-lg transition-all space-y-3"
                  >
                    {/* Header Row: Court & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-ink pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-display font-black text-sm sm:text-base text-ink uppercase">
                            {c.caseNumber}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold border uppercase ${severityBadge.classNames}`}>
                            {severityBadge.label}
                          </span>
                        </div>
                        <div className="text-xs text-gray-700 font-bold flex items-center space-x-1">
                          <Building2 className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                          <span>{c.courtName} ({c.courtState})</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2.5 py-1 text-xs font-black border uppercase shadow-hard-xs self-start sm:self-auto ${statusBadge.classNames}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* IPC Sections Pill Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-gray-500 uppercase mr-1">
                        PENAL CODES (CLICK TO TRANSLATE):
                      </span>
                      {c.ipcSections.map((sec, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleOpenIPC(sec)}
                          className="bg-brand-yellow/30 hover:bg-brand-yellow text-ink border-1.5 border-ink px-2 py-0.5 text-xs font-black flex items-center space-x-1 shadow-hard-xs transition-colors cursor-pointer"
                          title="Click to translate into plain English"
                        >
                          <span>{sec}</span>
                          <HelpCircle className="w-3 h-3 text-brand-red" />
                        </button>
                      ))}
                    </div>

                    {/* Plain English Layman Summary Box */}
                    <div className="bg-canvas border-2 border-ink p-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-brand-red flex items-center space-x-1">
                        <FileText className="w-3 h-3" />
                        <span>PLAIN-ENGLISH CASE SUMMARY:</span>
                      </span>
                      <p className="text-xs text-ink font-medium leading-relaxed">
                        {c.plainEnglishSummary}
                      </p>
                    </div>

                    {/* Case Metadata Footer */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-700 bg-surface-muted p-2.5 border border-ink">
                      <div>
                        <strong>Filing Date:</strong> {new Date(c.filingDate).toLocaleDateString("en-IN")}
                      </div>
                      <div>
                        <strong>Next Hearing:</strong>{" "}
                        {c.nextHearingDate
                          ? new Date(c.nextHearingDate).toLocaleDateString("en-IN")
                          : "Awaiting Schedule"}
                      </div>
                      <div className="sm:text-right">
                        <strong>Presiding:</strong> {c.presidingJudge || "Special MP/MLA Bench"}
                      </div>
                    </div>

                    {/* Source Link */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-gray-500">
                        CNR: <code>{c.cnrNumber || "NOT-DECLARED"}</code>
                      </span>
                      <a
                        href={c.sourceAffidavitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 font-bold text-ink hover:text-brand-red underline decoration-1"
                      >
                        <span>OFFICIAL eCOURTS PORTAL</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </BrutalistCard>

      {/* IPC Translator Modal */}
      <IPCTranslatorModal
        isOpen={translatorOpen}
        onClose={() => setTranslatorOpen(false)}
        initialSection={selectedIPC}
      />
    </>
  );
}
