"use client";

import React, { useState } from "react";
import { 
  ThumbsUp, 
  Users, 
  Share2, 
  Download, 
  FileText, 
  Check, 
  MessageCircle, 
  Twitter, 
  Copy,
  Sparkles
} from "lucide-react";
import { GroundTruthArticle } from "@/types";
import BrutalistButton from "@/components/ui/BrutalistButton";
import RTIModal from "./RTIModal";

interface EngagementBarProps {
  article: GroundTruthArticle;
}

export default function EngagementBar({ article }: EngagementBarProps) {
  const [upvotes, setUpvotes] = useState(article.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [affectedCount, setAffectedCount] = useState(article.affectedVotes);
  const [hasMarkedAffected, setHasMarkedAffected] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [rtiModalOpen, setRtiModalOpen] = useState(false);

  const handleUpvote = () => {
    if (!hasUpvoted) {
      setUpvotes(upvotes + 1);
      setHasUpvoted(true);
    } else {
      setUpvotes(upvotes - 1);
      setHasUpvoted(false);
    }
  };

  const handleMarkAffected = () => {
    if (!hasMarkedAffected) {
      setAffectedCount(affectedCount + 1);
      setHasMarkedAffected(true);
    } else {
      setAffectedCount(affectedCount - 1);
      setHasMarkedAffected(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    if (typeof window !== "undefined") {
      const text = encodeURIComponent(
        `🚨 GROUND TRUTH INVESTIGATION: ${article.headline}\n\nRead the full report with verified RTI and satellite evidence on VERDICT:\n${window.location.href}`
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  };

  const handleTwitterShare = () => {
    if (typeof window !== "undefined") {
      const text = encodeURIComponent(
        `🚨 ${article.headline.substring(0, 140)}...\n\nVerified civic investigation via @VerdictIndia:`
      );
      const url = encodeURIComponent(window.location.href);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    }
  };

  const handleDownloadPackage = () => {
    if (typeof window !== "undefined") {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>EVIDENCE PACKAGE - ${article.headline}</title>
              <style>
                body { font-family: monospace; padding: 40px; line-height: 1.6; font-size: 12px; }
                h1 { border-bottom: 3px solid black; padding-bottom: 8px; font-size: 20px; text-transform: uppercase; }
                .meta { background: #eee; padding: 12px; margin-bottom: 20px; border: 1px solid black; }
                .section { margin-top: 24px; }
                h3 { border-bottom: 1px solid black; padding-bottom: 4px; }
              </style>
            </head>
            <body>
              <h1>VERDICT GROUND TRUTH INVESTIGATION DOSSIER</h1>
              <div class="meta">
                <strong>Headline:</strong> ${article.headline}<br/>
                <strong>Location:</strong> ${article.location.district}, ${article.location.state}<br/>
                <strong>Author:</strong> ${article.author.name} (${article.author.badge})<br/>
                <strong>Date:</strong> ${article.date}<br/>
                <strong>Affected Citizens:</strong> ${article.affectedPeopleCount.toLocaleString("en-IN")}<br/>
                <strong>Status:</strong> ${article.status}
              </div>
              <div class="section">
                <h3>EXECUTIVE SUMMARY</h3>
                <p>${article.summary}</p>
              </div>
              <div class="section">
                <h3>VERIFIED EVIDENCE DOCKETS</h3>
                <ul>
                  ${article.evidence.map((e) => `<li><strong>${e.type}:</strong> ${e.title} (${e.fileSize || "Verified Document"})</li>`).join("")}
                </ul>
              </div>
              <div class="section">
                <h3>ACTIONABLE DEMANDS</h3>
                <p>${article.demands}</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <>
      <div className="bg-surface border-3 border-ink p-4 sm:p-6 shadow-hard-lg font-mono text-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-ink pb-4">
          <div>
            <h4 className="font-display font-black text-lg uppercase text-ink">
              CIVIC ACTION & ENGAGEMENT HUB
            </h4>
            <p className="text-gray-600 text-xs mt-0.5">
              Elevate this investigation, register affected status, or file a pre-filled RTI petition.
            </p>
          </div>

          {/* Action: RTI Trigger */}
          <BrutalistButton
            variant="primary"
            size="md"
            onClick={() => setRtiModalOpen(true)}
            className="flex items-center space-x-2 shrink-0"
          >
            <FileText className="w-4 h-4 stroke-[2.5]" />
            <span>FILE STATUTORY RTI</span>
          </BrutalistButton>
        </div>

        {/* Interaction Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Upvote */}
          <button
            type="button"
            onClick={handleUpvote}
            className={`p-3 border-2 border-ink flex items-center justify-between font-bold shadow-hard-xs transition-all cursor-pointer ${
              hasUpvoted ? "bg-brand-green text-black" : "bg-surface hover:bg-surface-muted text-ink"
            }`}
          >
            <div className="flex items-center space-x-2">
              <ThumbsUp className="w-4 h-4" />
              <span>THIS MATTERS</span>
            </div>
            <span className="font-black text-xs px-2 py-0.5 bg-black text-white rounded-xs">
              {upvotes}
            </span>
          </button>

          {/* I am affected */}
          <button
            type="button"
            onClick={handleMarkAffected}
            className={`p-3 border-2 border-ink flex items-center justify-between font-bold shadow-hard-xs transition-all cursor-pointer ${
              hasMarkedAffected ? "bg-brand-red text-white" : "bg-surface hover:bg-surface-muted text-ink"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>I AM AFFECTED</span>
            </div>
            <span
              className={`font-black text-xs px-2 py-0.5 rounded-xs ${
                hasMarkedAffected ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              {affectedCount}
            </span>
          </button>

          {/* Share Menu */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex-1 p-3 bg-[#25D366] text-black font-extrabold border-2 border-ink flex items-center justify-center space-x-1.5 shadow-hard-xs hover:opacity-90"
              title="Share on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              <span>WHATSAPP</span>
            </button>

            <button
              type="button"
              onClick={handleTwitterShare}
              className="p-3 bg-surface hover:bg-surface-muted border-2 border-ink shadow-hard-xs text-ink"
              title="Share on Twitter / X"
            >
              <Twitter className="w-4 h-4 fill-current" />
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="p-3 bg-surface hover:bg-surface-muted border-2 border-ink shadow-hard-xs text-ink"
              title="Copy Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-brand-green" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Download Evidence Package */}
          <button
            type="button"
            onClick={handleDownloadPackage}
            className="p-3 bg-brand-yellow hover:bg-[#ffe16b] text-black font-extrabold border-2 border-ink flex items-center justify-center space-x-1.5 shadow-hard-xs cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>DOWNLOAD EVIDENCE PDF</span>
          </button>
        </div>
      </div>

      {/* RTI Modal */}
      <RTIModal
        isOpen={rtiModalOpen}
        onClose={() => setRtiModalOpen(false)}
        article={article}
      />
    </>
  );
}
