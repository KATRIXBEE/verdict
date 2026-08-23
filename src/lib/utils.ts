import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ScoreBand, SeverityTier, CaseStatus, EducationStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format Indian Rupee currency (INR) into clean Crores / Lakhs representation
 */
export function formatINR(amount: number, options: { short?: boolean; showSymbol?: boolean } = {}): string {
  const { short = true, showSymbol = true } = options;
  const prefix = showSymbol ? "₹" : "";
  
  if (amount === 0) return `${prefix}0`;
  
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (short) {
    if (abs >= 10000000) {
      const crores = abs / 10000000;
      return `${sign}${prefix}${crores >= 100 ? crores.toFixed(0) : crores.toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      const lakhs = abs / 100000;
      return `${sign}${prefix}${lakhs.toFixed(2)} L`;
    }
    if (abs >= 1000) {
      const thousands = abs / 1000;
      return `${sign}${prefix}${thousands.toFixed(1)}k`;
    }
  }

  // Full Indian numbering comma format (e.g. 12,34,567)
  return `${sign}${prefix}${abs.toLocaleString("en-IN")}`;
}

export function formatPercentage(val: number): string {
  return `${val.toFixed(1)}%`;
}

export function getScoreBand(score: number): ScoreBand {
  if (score >= 8.0) return "EXCELLENT";
  if (score >= 6.0) return "GOOD";
  if (score >= 4.0) return "AVERAGE";
  if (score >= 2.0) return "POOR";
  return "VERY POOR";
}

export function getScoreColor(score: number): {
  bg: string;
  text: string;
  border: string;
  fill: string;
  tag: string;
} {
  if (score >= 8.0) {
    return {
      bg: "bg-[#00FF66]",
      text: "text-black",
      border: "border-black",
      fill: "#00FF66",
      tag: "bg-[#00FF66] text-black border-black",
    };
  }
  if (score >= 6.0) {
    return {
      bg: "bg-[#80FF72]",
      text: "text-black",
      border: "border-black",
      fill: "#80FF72",
      tag: "bg-[#80FF72] text-black border-black",
    };
  }
  if (score >= 4.0) {
    return {
      bg: "bg-[#FFD028]",
      text: "text-black",
      border: "border-black",
      fill: "#FFD028",
      tag: "bg-[#FFD028] text-black border-black",
    };
  }
  if (score >= 2.0) {
    return {
      bg: "bg-[#FF8A00]",
      text: "text-white",
      border: "border-black",
      fill: "#FF8A00",
      tag: "bg-[#FF8A00] text-white border-black",
    };
  }
  return {
    bg: "bg-[#FF4336]",
    text: "text-white",
    border: "border-black",
    fill: "#FF4336",
    tag: "bg-[#FF4336] text-white border-black",
  };
}

export function getSeverityBadge(tier?: string | SeverityTier): { label: string; classNames: string } {
  const normalized = (tier || "minor").toLowerCase();
  switch (normalized) {
    case "minor":
      return { label: "MINOR", classNames: "bg-blue-100 text-blue-900 border-blue-900" };
    case "moderate":
      return { label: "MODERATE", classNames: "bg-yellow-200 text-yellow-950 border-black" };
    case "serious":
      return { label: "SERIOUS", classNames: "bg-orange-300 text-orange-950 border-black" };
    case "severe":
      return { label: "SEVERE", classNames: "bg-[#FF4336] text-white border-black font-bold" };
    default:
      return { label: (tier || "MODERATE").toUpperCase(), classNames: "bg-gray-200 text-gray-900 border-black" };
  }
}

export function getCaseStatusBadge(status?: string | CaseStatus): { label: string; classNames: string } {
  const normalized = (status || "active").toLowerCase();
  switch (normalized) {
    case "active":
      return { label: "ACTIVE CHARGES", classNames: "bg-[#FF4336] text-white border-black" };
    case "bail_granted":
      return { label: "BAIL GRANTED", classNames: "bg-[#FF8A00] text-white border-black" };
    case "stayed":
      return { label: "STAYED BY HC/SC", classNames: "bg-[#FFD028] text-black border-black" };
    case "acquitted":
      return { label: "ACQUITTED", classNames: "bg-[#00FF66] text-black border-black" };
    case "convicted":
      return { label: "CONVICTED", classNames: "bg-black text-white border-black underline decoration-[#FF4336]" };
    default:
      return { label: (status || "ACTIVE CHARGES").toUpperCase(), classNames: "bg-[#FF4336] text-white border-black" };
  }
}

export function getEducationBadge(status?: string | EducationStatus): { label: string; classNames: string; symbol: string } {
  const normalized = (status || "unverified").toLowerCase();
  switch (normalized) {
    case "verified":
      return { label: "UGC / AICTE VERIFIED", classNames: "bg-[#00FF66] text-black border-black", symbol: "■" };
    case "unverified":
      return { label: "UNVERIFIED ARCHIVE", classNames: "bg-[#FFD028] text-black border-black", symbol: "▲" };
    case "suspicious":
      return { label: "FLAGGED / SUSPICIOUS", classNames: "bg-[#FF4336] text-white border-black animate-pulse", symbol: "✕" };
    default:
      return { label: "UNVERIFIED ARCHIVE", classNames: "bg-[#FFD028] text-black border-black", symbol: "▲" };
  }
}

/**
 * Resolves the image source for a politician photo:
 * - Local static files (/static/ or /public/): served directly by Next.js (no proxy)
 * - External URLs (http/https): proxied through /api/proxy-image
 * - Null / empty: default brutalist SVG avatar (/images/default-politician.svg)
 */
export function getImageSrc(photoUrl?: string | null): string {
  if (!photoUrl) return "/images/default-politician.svg";
  if (photoUrl.startsWith("/") || photoUrl.startsWith("data:")) return photoUrl;
  return `/api/proxy-image?url=${encodeURIComponent(photoUrl)}`;
}

export const getProxiedImageUrl = getImageSrc;


