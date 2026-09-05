import { Politician } from "@/types";
import { calculateVerdictScore } from "@/lib/verdict-score-calc";
import allMpsData from "./all-mps.json";
import { getPoliticianPhoto } from "@/lib/utils";

// VERIFIED DATA ENGINE:
// All fabricated prototype politicians (Bahubali, Chameleon, Dr. Arvind Shrivastava,
// Vikramjeet Ranawat) have been permanently removed.
// Data is strictly loaded from official ECI Form 26 records in all-mps.json.

const seenIds = new Set<string>();
const seenSlugs = new Set<string>();

const uniquePoliticians: Omit<Politician, "calculatedVerdictScore" | "scoreBand">[] = [];

// Populate exclusively from verified 2024 Lok Sabha MP dataset
for (const p of ((allMpsData as unknown) as Omit<Politician, "calculatedVerdictScore" | "scoreBand">[])) {
  let finalId = p.id || `mp-${p.slug}`;
  if (seenIds.has(finalId)) {
    finalId = `mp-${p.slug}-${p.currentConstituency?.name?.toLowerCase().replace(/\s+/g, "-") || "const"}`;
  }
  if (!seenSlugs.has(p.slug) && !seenIds.has(finalId)) {
    seenIds.add(finalId);
    seenSlugs.add(p.slug);
    uniquePoliticians.push({
      ...p,
      id: finalId,
      photoUrl: getPoliticianPhoto(p.fullName, p.photoUrl),
    });
  }
}

// Enrich politicians with automatically computed algorithmic VERDICT score and score bands
export const MOCK_POLITICIANS: Politician[] = uniquePoliticians.map((p) => {
  const breakdown = calculateVerdictScore({
    attendancePercentage: p.attendancePercentage,
    debatesParticipated: p.debatesParticipated,
    questionsAsked: p.questionsAsked,
    privateMemberBills: p.privateMemberBills,
    assetDeclarations: p.assetDeclarations,
    criminalCases: p.criminalCases,
    educationStatus: p.educationStatus,
    partyHistory: p.partyHistory,
    partySwitchCount: p.partySwitchCount,
    mpladsUtilisationPercent: p.mpladsUtilisationPercent,
    citizenRatings: p.citizenRatings,
    newsItems: p.newsItems,
  });

  return {
    ...p,
    id: p.id,
    photoUrl: getPoliticianPhoto(p.fullName, p.photoUrl),
    calculatedVerdictScore: breakdown.finalScore,
    scoreBand: breakdown.scoreBand,
  };
});

export function getPoliticianBySlug(slug: string): Politician | undefined {
  return MOCK_POLITICIANS.find((p) => p.slug === slug);
}

export function getPoliticianById(id: string): Politician | undefined {
  return MOCK_POLITICIANS.find((p) => p.id === id);
}

export function searchPoliticians(query: string): Politician[] {
  if (!query || query.trim() === "") return MOCK_POLITICIANS;
  const q = query.toLowerCase().trim();
  return MOCK_POLITICIANS.filter((p) => {
    return (
      (p.fullName && p.fullName.toLowerCase().includes(q)) ||
      (p.currentParty && p.currentParty.toLowerCase().includes(q)) ||
      (p.partyAbbr && p.partyAbbr.toLowerCase().includes(q)) ||
      (p.currentConstituency?.name && p.currentConstituency.name.toLowerCase().includes(q)) ||
      (p.currentConstituency?.state && p.currentConstituency.state.toLowerCase().includes(q))
    );
  });
}
