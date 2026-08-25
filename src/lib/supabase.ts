import fs from "fs";
import path from "path";
import { MOCK_POLITICIANS, getPoliticianBySlug } from "@/data/mock-politicians";
import { Politician, CitizenRating, FeedbackCategory } from "@/types";

const RATINGS_DB_FILE = path.join(process.cwd(), "scripts", "data", "citizen_ratings.json");

// Persistent storage loader (survives container restarts, zero heap memory leak)
function loadPersistentRatings(): Record<string, CitizenRating[]> {
  try {
    if (fs.existsSync(RATINGS_DB_FILE)) {
      const data = fs.readFileSync(RATINGS_DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("[RATINGS_DB_LOAD_ERROR]", e);
  }
  return {};
}

// Persistent storage writer
function savePersistentRatings(ratings: Record<string, CitizenRating[]>): void {
  try {
    const dir = path.dirname(RATINGS_DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(RATINGS_DB_FILE, JSON.stringify(ratings, null, 2), "utf-8");
  } catch (e) {
    console.error("[RATINGS_DB_SAVE_ERROR]", e);
  }
}

export async function fetchPoliticiansList(): Promise<Politician[]> {
  return MOCK_POLITICIANS;
}

export async function fetchPoliticianBySlug(slug: string): Promise<Politician | null> {
  const neta = getPoliticianBySlug(slug);
  if (!neta) return null;

  const persistentRatings = loadPersistentRatings();
  if (persistentRatings[neta.id]) {
    return {
      ...neta,
      citizenRatings: [...persistentRatings[neta.id], ...neta.citizenRatings],
    };
  }

  return neta;
}

export async function addCitizenRating(data: {
  politicianId: string;
  rating: number;
  userName?: string;
  userConstituency?: string;
  feedbackTag?: FeedbackCategory;
  comment?: string;
  isLocalVoter?: boolean;
  digilockerVerified?: boolean;
  userId?: string;
}): Promise<CitizenRating> {
  const persistentRatings = loadPersistentRatings();
  if (!persistentRatings[data.politicianId]) {
    persistentRatings[data.politicianId] = [];
  }

  const newRating: CitizenRating = {
    id: `cr-db-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    politicianId: data.politicianId,
    userId: data.userId || `user-anon-${Math.random().toString(36).substring(2, 8)}`,
    userName: data.userName?.trim() || "Citizen Voter",
    userConstituency: data.userConstituency?.trim() || "Constituency Resident",
    rating: data.rating,
    feedbackTag: data.feedbackTag || "infrastructure",
    comment: data.comment?.trim(),
    isLocalVoter: Boolean(data.isLocalVoter),
    digilockerVerified: Boolean(data.digilockerVerified),
    createdAt: new Date().toISOString(),
  };

  persistentRatings[data.politicianId].unshift(newRating);
  savePersistentRatings(persistentRatings);

  return newRating;
}

