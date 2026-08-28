"use client";

import React, { useRef, useState } from "react";
import { X, Download, Share2, Copy, Check } from "lucide-react";
import { ScamCase } from "@/data/mock-scams";
import { formatINR } from "@/lib/utils";
import BrutalistButton from "@/components/ui/BrutalistButton";

interface ShareCardModalProps {
  scam: ScamCase | null;
  onClose: () => void;
}

export default function ShareCardModal({ scam, onClose }: ShareCardModalProps) {
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  if (!scam) return null;

  const keyStat = scam.benchmark_cost_actual
    ? `₹${scam.benchmark_cost_actual} Cr/km vs ₹${scam.benchmark_cost_india_normal} Cr Baseline`
    : scam.amount_misused_crore
    ? `${formatINR(scam.amount_misused_crore * 10000000, { short: true })} Flagged in Audit`
    : `${formatINR((scam.amount_allocated_crore || 0) * 10000000, { short: true })} Under Review`;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/money-trail/${scam.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `VERDICT-CAG-AUDIT-${scam.slug}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm font-mono overflow-y-auto">
      <div className="bg-surface border-3 border-ink max-w-xl w-full p-4 sm:p-6 shadow-hard-xl space-y-5 relative max-h-[90vh] overflow-y-auto my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2.5 border-ink pb-3">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-brand-red stroke-[2.5]" />
            <h3 className="font-display font-black text-base sm:text-xl uppercase text-ink">
              GENERATE CITIZEN AUDIT SHARE CARD
            </h3>
          </div>
          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center p-1 border-2 border-ink bg-canvas hover:bg-brand-red hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal dialog"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Live Vector SVG Share Card Preview */}
        <div className="border-2.5 border-ink bg-[#111111] p-2 sm:p-3 shadow-hard-md flex justify-center overflow-x-auto">
          <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 600 380"
            className="w-full h-auto max-h-[320px] select-none"
          >
            {/* Dark Card Base */}
            <rect width="600" height="380" fill="#111111" />
            <rect x="10" y="10" width="580" height="360" fill="#1A1A1A" stroke="#FFD028" strokeWidth="3" />

            {/* Top Brand Bar */}
            <rect x="25" y="25" width="120" height="28" fill="#FF4336" />
            <text x="35" y="44" fill="#FFFFFF" fontFamily="monospace" fontWeight="900" fontSize="14">
              VERDICT v1.0
            </text>

            <rect x="155" y="25" width="180" height="28" fill="#00C853" />
            <text x="165" y="44" fill="#000000" fontFamily="monospace" fontWeight="900" fontSize="12">
              VERIFIED CAG AUDIT
            </text>

            {/* Category Pill */}
            <text x="25" y="85" fill="#70D6FF" fontFamily="monospace" fontWeight="700" fontSize="13" letterSpacing="1">
              CATEGORY: {scam.category.toUpperCase()}
            </text>

            {/* Title */}
            <text x="25" y="125" fill="#FFFFFF" fontFamily="sans-serif" fontWeight="900" fontSize="22">
              {scam.title.length > 36 ? scam.title.substring(0, 36) + "..." : scam.title}
            </text>

            {/* Key Metric Highlight Box */}
            <rect x="25" y="150" width="550" height="75" fill="#222222" stroke="#FF4336" strokeWidth="2" />
            <text x="40" y="178" fill="#AAAAAA" fontFamily="monospace" fontWeight="700" fontSize="11">
              OFFICIAL AUDIT FINDING:
            </text>
            <text x="40" y="210" fill="#FFD028" fontFamily="monospace" fontWeight="900" fontSize="20">
              {keyStat}
            </text>

            {/* Responsible Minister Tag */}
            {scam.responsible_politicians?.[0] && (
              <text x="25" y="255" fill="#CCCCCC" fontFamily="monospace" fontWeight="700" fontSize="13">
                Portfolio In-Charge: {scam.responsible_politicians[0].name} ({scam.responsible_politicians[0].role.split("20")[0]})
              </text>
            )}

            {/* Citation & Watermark Footer */}
            <line x1="25" y1="285" x2="575" y2="285" stroke="#333333" strokeWidth="1.5" />
            <text x="25" y="315" fill="#00C853" fontFamily="monospace" fontWeight="900" fontSize="12">
              SOURCE: {scam.source_name}
            </text>
            <text x="25" y="340" fill="#777777" fontFamily="monospace" fontWeight="600" fontSize="10">
              Tabled in Parliament • Constitutional Audit Finding
            </text>

            <text x="430" y="340" fill="#FFD028" fontFamily="monospace" fontWeight="900" fontSize="11">
              verdict-india.org
            </text>
          </svg>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <button
            onClick={handleCopyLink}
            className="min-h-[42px] bg-surface hover:bg-gray-100 text-ink px-4 py-2 border-2 border-ink font-bold text-xs inline-flex items-center justify-center space-x-1.5 shadow-hard-xs cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            {copied ? <Check className="w-4 h-4 text-brand-green stroke-[2.5]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
            <span>{copied ? "LINK COPIED!" : "COPY DOSSIER LINK"}</span>
          </button>

          <BrutalistButton variant="primary" size="sm" onClick={handleDownloadSVG} className="min-h-[42px] text-xs">
            <Download className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            <span>DOWNLOAD CARD (SVG)</span>
          </BrutalistButton>
        </div>
      </div>
    </div>
  );
}
