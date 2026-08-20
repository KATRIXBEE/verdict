"use client";

import React, { useState } from "react";
import { FileText, Copy, Check, ExternalLink, Printer, ShieldCheck } from "lucide-react";
import { GroundTruthArticle } from "@/types";
import Modal from "@/components/ui/Modal";
import BrutalistButton from "@/components/ui/BrutalistButton";

interface RTIModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: GroundTruthArticle;
}

export default function RTIModal({ isOpen, onClose, article }: RTIModalProps) {
  const [copied, setCopied] = useState(false);

  const defaultRTI = {
    subject: `Application under Section 6(1) of the Right to Information Act, 2005 regarding ${article.headline.substring(0, 80)}...`,
    publicAuthority: `Public Information Officer, ${article.responsibleDepartments[0] || "District Collectorate"}`,
    pioAddress: `Office of the Public Information Officer, District ${article.location.district}, State of ${article.location.state}, India`,
    queries: [
      `Provide certified copies of all inspection reports, water/infrastructure quality test certificates, and compliance audits conducted for ${article.location.district} (${article.location.block || "District Central"}) during the period Jan 2024 to present.`,
      `Provide certified copies of all correspondence, show-cause notices, and closure/penalty orders issued to the responsible contractors or industrial units operating in this jurisdiction.`,
      `Provide the name, designation, and official contact details of the designated appellate authority under Section 19(1) of the RTI Act.`,
    ],
  };

  const rti = article.rtiTemplate || defaultRTI;

  const fullText = `TO:
${rti.publicAuthority}
${rti.pioAddress}

SUBJECT:
${rti.subject}

RESPECTED SIR/MADAM,

I, a citizen of India, hereby request the following information under the provisions of the Right to Information Act, 2005:

PARTICULAR INFORMATION SOUGHT:
${rti.queries.map((q, i) => `${i + 1}. ${q}`).join("\n\n")}

APPLICATION FEE:
An initial application fee of ₹10/- is enclosed via IPO/e-RTI portal payment.

APPLICANT:
[Your Full Name]
[Your Address / Phone / Email]
Date: ${new Date().toLocaleDateString("en-IN")}`;

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>RTI Application Template - ${article.headline}</title>
              <style>
                body { font-family: monospace; padding: 40px; line-height: 1.6; font-size: 13px; }
                h2 { border-bottom: 2px solid black; padding-bottom: 8px; }
                pre { white-space: pre-wrap; font-family: inherit; }
              </style>
            </head>
            <body>
              <h2>FORM 'A' - RIGHT TO INFORMATION ACT 2005 APPLICATION</h2>
              <pre>${fullText}</pre>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="PRE-FILLED RTI APPLICATION GENERATOR"
      badge="SECTION 6(1) RTI ACT 2005"
      badgeColor="green"
      maxWidth="2xl"
    >
      <div className="space-y-4 font-mono text-xs">
        {/* Intro notice */}
        <div className="bg-canvas border-2 border-ink p-3 leading-relaxed">
          <span className="font-bold text-brand-red">⚖️ CITIZEN ACTION PROTOCOL:</span> This statutory RTI application has been pre-configured with the exact Public Information Officer (PIO) address, departmental jurisdiction, and targeted evidentiary questions derived from this investigation.
        </div>

        {/* Pre-filled Preview */}
        <div className="bg-surface border-2.5 border-ink p-4 space-y-3 shadow-hard-xs max-h-80 overflow-y-auto">
          <div className="border-b border-gray-300 pb-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">
              DESIGNATED PUBLIC INFORMATION OFFICER:
            </span>
            <div className="font-bold text-ink">{rti.publicAuthority}</div>
            <div className="text-gray-600 text-[11px]">{rti.pioAddress}</div>
          </div>

          <div className="border-b border-gray-300 pb-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">SUBJECT:</span>
            <div className="font-bold text-ink">{rti.subject}</div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">
              SPECIFIC INFORMATION QUERIES ({rti.queries.length}):
            </span>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-800 font-medium">
              {rti.queries.map((q, idx) => (
                <li key={idx} className="leading-relaxed">
                  {q}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t-2 border-ink">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 bg-surface hover:bg-surface-muted px-3 py-1.5 border-2 border-ink font-bold shadow-hard-xs text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-brand-green" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "COPIED TO CLIPBOARD!" : "COPY RTI TEXT"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 bg-surface hover:bg-surface-muted px-3 py-1.5 border-2 border-ink font-bold shadow-hard-xs text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT / SAVE PDF</span>
            </button>
          </div>

          <a
            href="https://rtionline.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 bg-brand-green text-black px-3 py-1.5 border-2 border-ink font-black shadow-hard-xs text-xs hover:bg-[#20ff78]"
          >
            <span>SUBMIT AT RTIONLINE.GOV.IN</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </Modal>
  );
}
