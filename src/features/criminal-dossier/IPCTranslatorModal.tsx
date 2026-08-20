"use client";

import React, { useState } from "react";
import { BookOpen, Search, Scale, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import BrutalistButton from "@/components/ui/BrutalistButton";
import { IPC_DICTIONARY, lookupIPC } from "@/data/ipc-dictionary";
import { getSeverityBadge } from "@/lib/utils";

interface IPCTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
}

export default function IPCTranslatorModal({
  isOpen,
  onClose,
  initialSection = "IPC 420",
}: IPCTranslatorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState(initialSection);

  const entry = lookupIPC(selectedSection);
  const severityBadge = getSeverityBadge(entry.severityTier);

  const allSections = Object.keys(IPC_DICTIONARY).filter((key) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const e = IPC_DICTIONARY[key];
    return (
      e.section.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.plainEnglish.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="PLAIN-ENGLISH IPC TRANSLATOR DICTIONARY"
      badge="LEGAL INTELLIGENCE"
      badgeColor="cyan"
      maxWidth="3xl"
    >
      <div className="space-y-6 font-mono">
        {/* Intro notice */}
        <div className="bg-canvas border-2 border-ink p-3 text-xs leading-relaxed">
          <span className="font-bold text-brand-red">⚖️ TRANSPARENCY NOTICE:</span> Indian Penal Code (IPC) sections in affidavits are often complex legal jargon. VERDICT translates statutory penal sections into verified layman English with objective severity tiers derived from statutory maximum sentences.
        </div>

        {/* Section Search Bar */}
        <div className="flex items-center bg-surface border-2.5 border-ink shadow-hard-xs">
          <div className="p-2.5 bg-brand-yellow border-r-2 border-ink">
            <Search className="w-4 h-4 text-black" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search IPC section or crime (e.g. 420, Cheating, Rioting, Murder, POCSO)..."
            className="w-full bg-transparent px-3 py-2 text-xs font-bold text-ink focus:outline-none"
          />
        </div>

        {/* Two column layout: Section selector & Inspector card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left: Section list */}
          <div className="md:col-span-5 border-2 border-ink bg-surface max-h-72 overflow-y-auto divide-y-1.5 divide-ink shadow-hard-xs">
            {allSections.map((secKey) => {
              const item = IPC_DICTIONARY[secKey];
              const isSelected = selectedSection === secKey;
              const sev = getSeverityBadge(item.severityTier);
              return (
                <div
                  key={secKey}
                  onClick={() => setSelectedSection(secKey)}
                  className={`p-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected ? "bg-brand-yellow font-black" : "hover:bg-surface-muted"
                  }`}
                >
                  <div>
                    <div className="font-extrabold text-xs text-ink">{item.section}</div>
                    <div className="text-[10px] text-gray-600 truncate max-w-[160px]">{item.category}</div>
                  </div>
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold border ${sev.classNames}`}>
                    {sev.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Definition Card */}
          <div className="md:col-span-7 bg-surface border-2.5 border-ink p-4 shadow-hard-sm space-y-4">
            <div className="flex items-start justify-between gap-2 border-b-2 border-ink pb-3">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  {entry.category}
                </span>
                <h3 className="font-display font-black text-xl text-ink uppercase">
                  {entry.section}
                </h3>
                <h4 className="font-bold text-xs text-gray-800 mt-0.5">
                  {entry.title}
                </h4>
              </div>

              <span className={`px-2 py-1 text-xs font-black border uppercase shrink-0 ${severityBadge.classNames}`}>
                {severityBadge.label}
              </span>
            </div>

            {/* Plain English Explanation */}
            <div className="bg-canvas border-2 border-ink p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase text-brand-red flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>WHAT IT ACTUALLY MEANS (PLAIN ENGLISH):</span>
              </span>
              <p className="text-xs text-ink font-medium leading-relaxed">
                {entry.plainEnglish}
              </p>
            </div>

            {/* Legal Parameters Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-surface-muted p-2 border border-ink space-y-0.5">
                <span className="text-[10px] text-gray-500 font-bold uppercase">MAX STATUTORY SENTENCE:</span>
                <p className="font-bold text-ink text-[11px]">{entry.maxSentence}</p>
              </div>

              <div className="bg-surface-muted p-2 border border-ink space-y-0.5">
                <span className="text-[10px] text-gray-500 font-bold uppercase">BAIL STATUS:</span>
                <p className="font-bold text-ink text-[11px]">
                  {entry.bailable ? "Bailable Offense" : "Non-Bailable Offense"}
                </p>
              </div>
            </div>

            {/* Score Impact pill */}
            <div className="flex items-center justify-between bg-ink text-white p-2.5 border border-ink text-xs">
              <span className="font-bold">VERDICT SCORE PENALTY:</span>
              <span className="font-mono font-black text-brand-red bg-white/10 px-2 py-0.5 border border-brand-red">
                -{entry.deductionPoints.toFixed(1)} pts / charge
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end pt-2 border-t-2 border-ink">
          <BrutalistButton variant="primary" size="sm" onClick={onClose}>
            CLOSE TRANSLATOR
          </BrutalistButton>
        </div>
      </div>
    </Modal>
  );
}
