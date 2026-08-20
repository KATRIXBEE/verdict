"use client";

import React from "react";
import Link from "next/link";
import { 
  MapPin, 
  Users, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText,
  UserCheck
} from "lucide-react";
import { GroundTruthArticle, AuthorBadgeType, GroundTruthStatus } from "@/types";
import { cn } from "@/lib/utils";
import BrutalistButton from "@/components/ui/BrutalistButton";

interface ArticleCardProps {
  article: GroundTruthArticle;
  compact?: boolean;
}

export default function ArticleCard({ article, compact = false }: ArticleCardProps) {
  // Author badge style helper
  const getAuthorBadgeStyle = (badge: AuthorBadgeType) => {
    switch (badge) {
      case "Verified Journalist":
        return "bg-brand-green text-black border-black";
      case "Independent Reporter":
        return "bg-brand-cyan text-black border-black";
      case "Citizen Reporter":
        return "bg-brand-yellow text-black border-black";
      case "Video Investigation":
        return "bg-brand-pink text-black border-black";
    }
  };

  // Status style helper
  const getStatusStyle = (status: GroundTruthStatus) => {
    switch (status) {
      case "Ongoing":
        return "bg-brand-red text-white border-black";
      case "Government Action Pending":
        return "bg-brand-orange text-white border-black";
      case "Partially Resolved":
        return "bg-brand-yellow text-black border-black";
      case "Resolved":
        return "bg-brand-green text-black border-black";
    }
  };

  return (
    <div className="bg-surface border-2.5 border-ink shadow-hard-md hover:shadow-hard-lg hover:-translate-y-0.5 transition-all font-mono text-xs flex flex-col justify-between overflow-hidden group">
      {/* Optional Thumbnail Image */}
      {article.thumbnailUrl && !compact && (
        <div className="h-44 sm:h-48 w-full bg-gray-200 border-b-2.5 border-ink relative overflow-hidden shrink-0">
          <img
            src={article.thumbnailUrl}
            alt={article.headline}
            className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-300"
          />
          {/* Category Pill on image */}
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-brand-yellow text-black font-extrabold text-[10px] px-2 py-0.5 border border-black shadow-hard-xs uppercase">
              {article.category}
            </span>
          </div>

          {/* Status Pill on image */}
          <div className="absolute top-2.5 right-2.5">
            <span
              className={cn(
                "font-extrabold text-[10px] px-2 py-0.5 border border-black shadow-hard-xs uppercase",
                getStatusStyle(article.status)
              )}
            >
              {article.status}
            </span>
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Header Row if no thumbnail or compact */}
          {(!article.thumbnailUrl || compact) && (
            <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-gray-300 pb-2">
              <span className="bg-brand-yellow text-black font-extrabold text-[10px] px-2 py-0.5 border border-black uppercase">
                {article.category}
              </span>
              <span
                className={cn(
                  "font-extrabold text-[10px] px-2 py-0.5 border border-black uppercase",
                  getStatusStyle(article.status)
                )}
              >
                {article.status}
              </span>
            </div>
          )}

          {/* Location Breadcrumb & Date */}
          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-gray-700 font-bold">
            <div className="flex items-center space-x-1 text-brand-red truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {article.location.state} &gt; {article.location.district}
                {article.location.block ? ` &gt; ${article.location.block}` : ""}
              </span>
            </div>

            <div className="flex items-center space-x-1 text-gray-500 shrink-0">
              <Calendar className="w-3 h-3" />
              <span>{new Date(article.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>

          {/* Headline */}
          <Link href={`/ground-truth/${article.slug}`}>
            <h3 className="font-display font-black text-base sm:text-lg text-ink uppercase leading-snug hover:text-brand-red transition-colors line-clamp-2">
              {article.headline}
            </h3>
          </Link>

          {/* 2-line Summary */}
          <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        </div>

        {/* Bottom Metadata & Metrics */}
        <div className="pt-3 border-t border-gray-200 space-y-2.5">
          {/* Affected People Counter & Read Time */}
          <div className="flex items-center justify-between text-[11px] font-bold">
            <div className="flex items-center space-x-1 text-ink bg-surface-muted px-2 py-0.5 border border-ink">
              <Users className="w-3.5 h-3.5 text-brand-red shrink-0" />
              <span>{article.affectedPeopleCount.toLocaleString("en-IN")} CITIZENS AFFECTED</span>
            </div>

            <span className="text-gray-500">{article.readTimeMinutes} MIN READ</span>
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2 truncate">
              <div className="w-6 h-6 rounded-full border border-black bg-gray-300 overflow-hidden shrink-0">
                {article.author.avatarUrl ? (
                  <img
                    src={article.author.avatarUrl}
                    alt={article.author.name}
                    className="w-full h-full object-cover grayscale"
                  />
                ) : (
                  <UserCheck className="w-4 h-4 text-black m-auto" />
                )}
              </div>
              <div className="truncate">
                <span className="font-bold text-xs text-ink block truncate">
                  {article.author.name}
                </span>
              </div>
            </div>

            <span
              className={cn(
                "px-1.5 py-0.2 text-[9px] font-bold uppercase border shrink-0",
                getAuthorBadgeStyle(article.author.badge)
              )}
            >
              {article.author.badge}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-canvas border-t-2 border-ink">
        <Link href={`/ground-truth/${article.slug}`}>
          <BrutalistButton variant="primary" size="sm" className="w-full justify-between">
            <span>READ FULL INVESTIGATION</span>
            <ArrowRight className="w-4 h-4" />
          </BrutalistButton>
        </Link>
      </div>
    </div>
  );
}
