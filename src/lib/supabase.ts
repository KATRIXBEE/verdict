import { MOCK_POLITICIANS, getPoliticianBySlug, searchPoliticians } from "@/data/mock-politicians";
import { Politician } from "@/types";

// In-memory ratings store to support real-time user ratings in demo session
const inMemoryRatings: Record<string, any[]> = {};

export async function fetchPoliticiansList(): Promise<Politician[]> {
  // If Supabase credentials exist, we can fetch from Supabase.
  // Otherwise, return comprehensive mock politicians.
  return MOCK_POLITICIANS;
}

export async function fetchPoliticianBySlug(slug: string): Promise<Politician | null> {
  const neta = getPoliticianBySlug(slug);
  if (!neta) return null;

  // Merge any session ratings
  if (inMemoryRatings[neta.id]) {
    return {
      ...neta,
      citizenRatings: [...inMemoryRatings[neta.id], ...neta.citizenRatings],
    };
  }

  return neta;
}

export async function addCitizenRating(data: {
  politicianId: string;
  rating: number;
  userName: string;
  userConstituency?: string;
  feedbackTag?: any;
  comment?: string;
  isLocalVoter: boolean;
  digilockerVerified: boolean;
}) {
  if (!inMemoryRatings[data.politicianId]) {
    inMemoryRatings[data.politicianId] = [];
  }

  const newRating = {
    id: `cr-session-${Date.now()}`,
    politicianId: data.politicianId,
    userId: `user-session-${Math.random().toString(36).substring(2, 8)}`,
    userName: data.userName || "Verified Citizen",
    userConstituency: data.userConstituency || "Constituency Voter",
    rating: data.rating,
    feedbackTag: data.feedbackTag,
    comment: data.comment,
    isLocalVoter: data.isLocalVoter,
    digilockerVerified: data.digilockerVerified,
    createdAt: new Date().toISOString(),
  };

  inMemoryRatings[data.politicianId].unshift(newRating);
  return newRating;
}
