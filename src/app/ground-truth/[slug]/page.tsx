import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  Building2, 
  UserX, 
  ShieldAlert, 
  CheckCircle2, 
  FileText,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Flame,
  Scale
} from "lucide-react";
import { 
  MOCK_GROUND_TRUTH_ARTICLES, 
  getGroundTruthArticleBySlug 
} from "@/data/mock-ground-truth";
import { MOCK_POLITICIANS } from "@/data/mock-politicians";
import EvidenceSection from "@/features/ground-truth/EvidenceSection";
import ImpactTracker from "@/features/ground-truth/ImpactTracker";
import EngagementBar from "@/features/ground-truth/EngagementBar";
import ArticleCard from "@/features/ground-truth/ArticleCard";
import BrutalistCard from "@/components/ui/BrutalistCard";
import BrutalistButton from "@/components/ui/BrutalistButton";
import { WhatHappenedNext } from "@/components/WhatHappenedNext";
import { cn, getProxiedImageUrl } from "@/lib/utils";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MOCK_GROUND_TRUTH_ARTICLES.map((a) => ({
    slug: a.slug,
  }));
}

export default async function GroundTruthDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = getGroundTruthArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Find linked indexed politicians
  const linkedPoliticians = article.responsiblePoliticianIds
    .map((pId) =>
      MOCK_POLITICIANS.find(
        (p) => p.slug.toLowerCase() === pId.toLowerCase() || p.id.toLowerCase() === pId.toLowerCase()
      )
    )
    .filter(Boolean);

  // Find related articles (same category or state, excluding current)
  const relatedArticles = MOCK_GROUND_TRUTH_ARTICLES.filter(
    (a) =>
      a.id !== article.id &&
      (a.category === article.category || a.location.state === article.location.state)
  ).slice(0, 3);

  // Status style helper
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Ongoing":
        return "bg-brand-red text-white border-black";
      case "Government Action Pending":
        return "bg-brand-orange text-white border-black";
      case "Partially Resolved":
        return "bg-brand-yellow text-black border-black";
      case "Resolved":
        return "bg-brand-green text-black border-black";
      default:
        return "bg-surface-muted text-ink border-black";
    }
  };

  return (
    <div className="space-y-10 font-mono">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border-2.5 border-ink p-3 shadow-hard-sm text-xs">
        <Link
          href="/ground-truth"
          className="inline-flex items-center space-x-2 font-bold text-ink hover:text-brand-red"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>BACK TO ALL GROUND TRUTH INVESTIGATIONS</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="bg-brand-yellow px-2 py-0.5 border border-ink text-black">
            {article.category}
          </span>
          <span className="bg-brand-cyan px-2 py-0.5 border border-ink text-black">
            {article.location.state}
          </span>
        </div>
      </div>

      {/* Article Header Card */}
      <article className="bg-surface border-3 border-ink p-6 sm:p-8 lg:p-10 shadow-hard-xl space-y-6">
        {/* Category & Status Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink pb-4">
          <div className="flex items-center space-x-2">
            <span className="bg-brand-yellow text-black font-extrabold text-xs px-2.5 py-1 border-2 border-black shadow-hard-xs uppercase">
              {article.category}
            </span>
            <span
              className={cn(
                "font-extrabold text-xs px-2.5 py-1 border-2 border-black shadow-hard-xs uppercase",
                getStatusStyle(article.status)
              )}
            >
              {article.status}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-600 font-bold">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(article.date).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span>•</span>
            <Clock className="w-3.5 h-3.5" />
            <span>{article.readTimeMinutes} MIN READ</span>
          </div>
        </div>

        {/* Location Breadcrumb */}
        <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-brand-red bg-canvas border border-ink p-2.5 shadow-hard-xs">
          <MapPin className="w-4 h-4 shrink-0" />
          <span>
            LOCATION: {article.location.state} &gt; {article.location.district}
            {article.location.block ? ` &gt; ${article.location.block}` : ""}
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-ink leading-tight">
          {article.headline}
        </h1>

        {/* Tagline */}
        {article.tagline && (
          <p className="font-display font-extrabold text-sm sm:text-lg text-gray-800 border-l-4 border-brand-red pl-4 leading-relaxed">
            {article.tagline}
          </p>
        )}

        {/* Author Meta & Affected Metric Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-muted border-2 border-ink p-4 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full border-2 border-black bg-gray-300 overflow-hidden shrink-0">
              <img
                src={article.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                alt={article.author.name}
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-ink">{article.author.name}</span>
                <span className="bg-brand-green text-black text-[9px] font-black px-1.5 py-0.2 border border-black">
                  {article.author.badge}
                </span>
              </div>
              <span className="text-[11px] text-gray-600 font-medium">
                {article.author.publication || "Independent Civic Desk"}
              </span>
            </div>
          </div>

          <div className="bg-surface border-2 border-ink p-2.5 shadow-hard-xs flex items-center space-x-2 font-bold text-ink">
            <Users className="w-4 h-4 text-brand-red shrink-0" />
            <span>{article.affectedPeopleCount.toLocaleString("en-IN")} CITIZENS DIRECTLY AFFECTED</span>
          </div>
        </div>

        {/* Featured Image if available */}
        {article.thumbnailUrl && (
          <div className="w-full h-64 sm:h-96 border-3 border-ink overflow-hidden relative shadow-hard-md">
            <img
              src={article.thumbnailUrl}
              alt={article.headline}
              className="w-full h-full object-cover grayscale contrast-125"
            />
            <div className="absolute bottom-0 inset-x-0 bg-ink/90 text-white text-[10px] p-2 border-t-2 border-ink">
              INVESTIGATIVE FIELD PHOTOGRAPH: {article.location.district}, {article.location.state}
            </div>
          </div>
        )}

        {/* Article Body */}
        <div className="text-xs sm:text-sm text-gray-900 leading-relaxed font-sans space-y-4 pt-4 border-t-2 border-ink whitespace-pre-line">
          {article.body}
        </div>
      </article>

      {/* Post-Investigation Docket / Unsolved Status Tracker */}
      <WhatHappenedNext storyId={article.id} compact={true} />

      {/* 2. Evidence Section */}
      {article.evidence.length > 0 && (
        <EvidenceSection evidence={article.evidence} />
      )}

      {/* 3. Accountable Officials & Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accountable Lawmakers / Politicians */}
        <BrutalistCard
          title="ELECTED OFFICIALS / POLITICIANS NAMED"
          badge={`${article.responsiblePoliticianIds.length} NAMED`}
          badgeColor="red"
          statusLight="red"
          statusLightLabel="CONSTITUENCY ACCOUNTABILITY"
        >
          <div className="space-y-4 font-mono text-xs">
            <p className="text-gray-700">
              Elected representatives exercising constitutional jurisdiction over the affected jurisdiction:
            </p>

            {linkedPoliticians.length > 0 ? (
              <div className="space-y-3">
                {linkedPoliticians.map((p: any) => (
                  <div
                    key={p.id}
                    className="bg-surface border-2 border-ink p-3.5 shadow-hard-xs flex items-center justify-between gap-3 hover:bg-surface-muted transition-colors"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-10 h-10 border border-black bg-gray-200 overflow-hidden shrink-0">
                        <img
                          src={getProxiedImageUrl(p.photoUrl)}
                          alt={p.fullName}
                          className="w-full h-full object-cover grayscale"
                        />
                      </div>
                      <div className="truncate">
                        <h5 className="font-display font-black text-sm text-ink uppercase truncate">
                          {p.fullName}
                        </h5>
                        <span className="text-[10px] font-bold text-gray-600 block">
                          {p.currentParty} • {p.currentConstituency.name} ({p.house})
                        </span>
                      </div>
                    </div>

                    <Link href={`/politician/${p.slug}`} className="shrink-0">
                      <BrutalistButton variant="primary" size="sm" shadow="sm">
                        <span>AUDIT DOSSIER</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </BrutalistButton>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-canvas border border-ink p-3 space-y-1">
                <span className="font-bold text-ink">Named Administrative Officials:</span>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {article.responsibleOfficialNames.map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </BrutalistCard>

        {/* Responsible Government Departments */}
        <BrutalistCard
          title="GOVERNMENT DEPARTMENTS RESPONSIBLE"
          badge={`${article.responsibleDepartments.length} AGENCIES`}
          badgeColor="cyan"
        >
          <div className="space-y-4 font-mono text-xs">
            <p className="text-gray-700">
              Statutory executive bodies with supervisory and regulatory enforcement obligations:
            </p>

            <div className="space-y-2">
              {article.responsibleDepartments.map((dept, idx) => (
                <div
                  key={idx}
                  className="bg-surface border border-ink p-2.5 shadow-hard-xs flex items-center space-x-2 font-bold text-ink"
                >
                  <Building2 className="w-4 h-4 text-brand-cyan shrink-0" />
                  <span>{dept}</span>
                </div>
              ))}
            </div>
          </div>
        </BrutalistCard>
      </div>

      {/* 4. Impact Tracker Timeline */}
      {article.impactTimeline.length > 0 && (
        <ImpactTracker
          timeline={article.impactTimeline}
          articleTitle={article.headline}
        />
      )}

      {/* 5. "What Needs To Happen" (Actionable Demands) */}
      <BrutalistCard
        title="WHAT NEEDS TO HAPPEN (STATED DEMANDS)"
        badge="ACTIONABLE REMEDIES"
        badgeColor="yellow"
      >
        <div className="space-y-3 font-mono text-xs">
          <div className="bg-canvas border-2 border-ink p-4 space-y-2 shadow-hard-xs">
            <span className="font-bold text-xs uppercase text-brand-red flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>THE JOURNALIST &amp; CITIZEN COMMITTEE CHARTER OF DEMANDS:</span>
            </span>
            <div className="text-xs text-ink leading-relaxed whitespace-pre-line font-medium pl-2">
              {article.demands}
            </div>
          </div>
        </div>
      </BrutalistCard>

      {/* 6. Engagement & RTI Action Bar */}
      <EngagementBar article={article} />

      {/* 7. Related Ground Truth Articles */}
      {relatedArticles.length > 0 && (
        <div className="space-y-4 pt-6">
          <div className="border-b-3 border-ink pb-3 flex items-center justify-between">
            <h3 className="font-display font-black text-xl uppercase text-ink">
              RELATED INVESTIGATIVE REPORTS ({article.location.state} / {article.category})
            </h3>
            <Link href="/ground-truth">
              <span className="text-xs font-bold text-brand-red hover:underline flex items-center space-x-1">
                <span>VIEW ALL REPORTS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((rel) => (
              <ArticleCard key={rel.id} article={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
