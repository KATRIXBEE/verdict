"use client";

import React from "react";
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Satellite, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2,
  Paperclip
} from "lucide-react";
import { EvidenceItem, EvidenceType } from "@/types";
import BrutalistCard from "@/components/ui/BrutalistCard";

interface EvidenceSectionProps {
  evidence: EvidenceItem[];
}

export default function EvidenceSection({ evidence }: EvidenceSectionProps) {
  const getEvidenceTypeStyle = (type: EvidenceType) => {
    switch (type) {
      case "RTI Response":
        return {
          badge: "bg-brand-green text-black border-black",
          icon: FileText,
        };
      case "Satellite Image":
        return {
          badge: "bg-brand-cyan text-black border-black",
          icon: Satellite,
        };
      case "Photo":
        return {
          badge: "bg-brand-yellow text-black border-black",
          icon: ImageIcon,
        };
      case "Video":
        return {
          badge: "bg-brand-pink text-black border-black",
          icon: Video,
        };
      case "Official Document":
        return {
          badge: "bg-surface-muted text-ink border-black",
          icon: Paperclip,
        };
    }
  };

  return (
    <BrutalistCard
      title="DOCUMENTARY EVIDENCE & REPOSITORY"
      badge={`${evidence.length} AUDITED PROOF DOCKETS`}
      badgeColor="green"
      statusLight="green"
      statusLightLabel="CHAIN OF CUSTODY"
    >
      <div className="space-y-4 font-mono text-xs">
        <p className="text-gray-700 leading-relaxed">
          All evidence items have been verified against original government registers, official RTI filings, or certified third-party testing laboratories:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidence.map((item) => {
            const typeStyle = getEvidenceTypeStyle(item.type);
            const Icon = typeStyle.icon;

            return (
              <div
                key={item.id}
                className="bg-surface border-2.5 border-ink p-4 shadow-hard-xs space-y-2.5 flex flex-col justify-between hover:bg-surface-muted transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-gray-300 pb-2">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-black uppercase border shadow-hard-xs ${typeStyle.badge}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{item.type}</span>
                    </span>

                    {item.fileSize && (
                      <span className="text-[10px] text-gray-500 font-bold">
                        {item.fileSize}
                      </span>
                    )}
                  </div>

                  <h4 className="font-display font-black text-sm text-ink uppercase leading-snug">
                    {item.title}
                  </h4>

                  {item.summary && (
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {item.summary}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-bold">
                    DATE: {item.date || "2026"}
                  </span>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 bg-ink text-white px-2.5 py-1 text-[11px] font-bold border border-ink hover:bg-brand-red transition-colors shadow-hard-xs"
                  >
                    <span>INSPECT DOCUMENT</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BrutalistCard>
  );
}
