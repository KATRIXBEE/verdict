"use client";

import React from "react";
import Link from "next/link";
import { Newspaper, ArrowRight, ShieldCheck, CheckCircle2, FileSearch } from "lucide-react";
import { GroundTruthArticle } from "@/types";
import { getGroundTruthArticlesByPolitician } from "@/data/mock-ground-truth";
import BrutalistCard from "@/components/ui/BrutalistCard";
import BrutalistButton from "@/components/ui/BrutalistButton";
import ArticleCard from "./ArticleCard";

interface GroundTruthWidgetProps {
  politicianId: string;
  politicianSlug: string;
  politicianName: string;
}

export default function GroundTruthWidget({
  politicianId,
  politicianSlug,
  politicianName,
}: GroundTruthWidgetProps) {
  // Find articles naming this politician
  const namedArticles = getGroundTruthArticlesByPolitician(politicianSlug);
  const displayedArticles = namedArticles.slice(0, 3);
  const hasReports = displayedArticles.length > 0;

  return (
    <BrutalistCard
      title="GROUND TRUTH INVESTIGATIVE REPORTS"
      badge={
        hasReports
          ? `${namedArticles.length} REPORTS NAMING THIS LAWMAKER`
          : "ZERO ADVERSE INVESTIGATIONS"
      }
      badgeColor={hasReports ? "red" : "green"}
      statusLight={hasReports ? "red" : "green"}
      statusLightLabel={hasReports ? "CITIZEN REPORTS" : "CLEAN AUDIT"}
    >
      <div className="space-y-6 font-mono text-xs">
        {/* Top Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-muted border-2 border-ink p-3">
          <div className="flex items-center space-x-2">
            <Newspaper className="w-4 h-4 text-brand-red shrink-0" />
            <span className="font-bold text-ink">
              GRASSROOTS CIVIC JOURNALISM & RTI INVESTIGATION ARCHIVE
            </span>
          </div>

          <Link href={`/ground-truth?politician=${politicianSlug}`}>
            <span className="font-bold text-brand-red hover:underline flex items-center space-x-1">
              <span>SEE ALL REPORTS NAMING {politicianName.toUpperCase()}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        {/* Content */}
        {!hasReports ? (
          <div className="bg-canvas border-2.5 border-ink p-8 text-center space-y-3 shadow-hard-xs">
            <div className="w-10 h-10 bg-brand-green border-2 border-ink rounded-full flex items-center justify-center mx-auto shadow-hard-xs">
              <CheckCircle2 className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <h4 className="font-display font-black text-base text-ink uppercase">
              NO ADVERSE GROUND TRUTH INVESTIGATIONS LOGGED
            </h4>
            <p className="text-xs text-gray-700 max-w-md mx-auto leading-relaxed">
              No citizen investigations, environmental breaches, or contractor fraud reports have been verified naming {politicianName}.
            </p>
            <div className="pt-2">
              <Link href="/ground-truth">
                <BrutalistButton variant="outline" size="sm">
                  BROWSE ALL GROUND TRUTH INVESTIGATIONS
                </BrutalistButton>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayedArticles.map((art) => (
              <ArticleCard key={art.id} article={art} compact={false} />
            ))}
          </div>
        )}
      </div>
    </BrutalistCard>
  );
}
