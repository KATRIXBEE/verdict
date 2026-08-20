import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Scale, ShieldCheck, FileText, AlertTriangle } from "lucide-react";
import { getPoliticianBySlug, MOCK_POLITICIANS } from "@/data/mock-politicians";
import { getControversiesByPoliticianId } from "@/data/mock-controversies";
import ProfileHeader from "@/features/politician-profile/ProfileHeader";
import ParliamentStats from "@/features/politician-profile/ParliamentStats";
import VerdictScoreGauge from "@/features/verdict-score/VerdictScoreGauge";
import PartyHopperTimeline from "@/features/party-hopper/PartyHopperTimeline";
import CriminalDossier from "@/features/criminal-dossier/CriminalDossier";
import AssetGrowthChart from "@/features/asset-timeline/AssetGrowthChart";
import ControversyTimeline from "@/features/controversies/ControversyTimeline";
import GroundTruthWidget from "@/features/ground-truth/GroundTruthWidget";
import CitizenRatingSection from "@/features/citizen-rating/CitizenRatingSection";
import NewsSentimentStream from "@/features/news-sentiment/NewsSentimentStream";
import BrutalistButton from "@/components/ui/BrutalistButton";

interface PoliticianPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MOCK_POLITICIANS.map((p) => ({
    slug: p.slug,
  }));
}

export default async function PoliticianPage({ params }: PoliticianPageProps) {
  const { slug } = await params;
  const politician = getPoliticianBySlug(slug);

  if (!politician) {
    notFound();
  }

  const controversies = getControversiesByPoliticianId(politician.id);

  return (
    <div className="space-y-8 font-mono">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border-2.5 border-ink p-3 shadow-hard-sm">
        <Link href="/" className="inline-flex items-center space-x-2 text-xs font-bold text-ink hover:text-brand-red">
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>BACK TO ALL REPRESENTATIVES</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="text-gray-500">INDEX:</span>
          <span className="bg-brand-yellow px-2 py-0.5 border border-ink text-black">
            {politician.house}
          </span>
          <span className="bg-brand-cyan px-2 py-0.5 border border-ink text-black">
            {politician.currentConstituency.state}
          </span>
        </div>
      </div>

      {/* 1. Profile Bio Header */}
      <ProfileHeader politician={politician} />

      {/* 2. Top Two-Column Grid: VERDICT Score Engine & Parliamentary Attendance Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <VerdictScoreGauge politician={politician} />
        </div>
        <div className="lg:col-span-5">
          <ParliamentStats politician={politician} />
        </div>
      </div>

      {/* 3. "Aaya Ram Gaya Ram" Party-Hopper Subway Map */}
      <PartyHopperTimeline
        partyHistory={politician.partyHistory}
        politicianName={politician.fullName}
      />

      {/* 4. Live Criminal Dossier & Plain-English IPC Translator */}
      <CriminalDossier
        cases={politician.criminalCases}
        politicianName={politician.fullName}
      />

      {/* 5. Multi-Year Asset Growth Timeline & Outlier Analysis */}
      <AssetGrowthChart
        declarations={politician.assetDeclarations}
        politicianName={politician.fullName}
      />

      {/* 6. Recent Controversies & Public Audits Timeline */}
      <ControversyTimeline
        controversies={controversies}
        politicianName={politician.fullName}
      />

      {/* 7. Ground Truth Investigative Reports Widget */}
      <GroundTruthWidget
        politicianId={politician.id}
        politicianSlug={politician.slug}
        politicianName={politician.fullName}
      />

      {/* 8. Anti-Brigading DigiLocker Citizen Ratings & News Sentiment Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <CitizenRatingSection
            politicianId={politician.id}
            politicianName={politician.fullName}
            constituencyName={politician.currentConstituency.name}
            ratings={politician.citizenRatings}
          />
        </div>
        <div className="lg:col-span-5">
          <NewsSentimentStream
            newsItems={politician.newsItems}
            politicianName={politician.fullName}
          />
        </div>
      </div>

      {/* Bottom Face-Off CTA */}
      <div className="bg-ink text-white border-3 border-ink p-6 shadow-hard-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-display font-black text-xl uppercase">
            COMPARE {politician.fullName.toUpperCase()} HEAD-TO-HEAD
          </h3>
          <p className="text-xs text-gray-300">
            Audit this representative side-by-side against any rival MP or regional leader.
          </p>
        </div>

        <Link href={`/compare?p1=${politician.slug}`}>
          <BrutalistButton variant="primary" size="md">
            LAUNCH NETA FACE-OFF
          </BrutalistButton>
        </Link>
      </div>
    </div>
  );
}
