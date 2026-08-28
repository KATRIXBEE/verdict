import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SCAM_CASES_DATA, getScamBySlug } from "@/data/mock-scams";
import ScamDetailClient from "./ScamDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SCAM_CASES_DATA.map((scam) => ({
    slug: scam.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const scam = getScamBySlug(slug);

  if (!scam) {
    return {
      title: "Case Dossier Not Found | VERDICT Money Trail",
    };
  }

  return {
    title: `${scam.title} | VERDICT Money Trail`,
    description: scam.summary,
    openGraph: {
      title: `${scam.title} | VERDICT Money Trail`,
      description: scam.subtitle || scam.summary,
      type: "article",
    },
  };
}

export default async function ScamDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const scam = getScamBySlug(slug);

  if (!scam) {
    notFound();
  }

  return <ScamDetailClient scam={scam} />;
}
