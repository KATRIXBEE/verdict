import fs from "fs";
import path from "path";
import * as lockfile from "proper-lockfile";
import { MOCK_POLITICIANS, getPoliticianBySlug } from "@/data/mock-politicians";
import { Politician, CitizenRating, FeedbackCategory } from "@/types";

const RATINGS_DB_FILE = path.join(process.cwd(), "scripts", "data", "citizen_ratings.json");
const MAX_RATINGS_PER_POLITICIAN = 500;
const RATINGS_FILE_MAX_SIZE_MB = 10;

export interface StoredCitizenRating extends CitizenRating {
  clientIp?: string;
}

// Persistent storage loader (survives container restarts, zero heap memory leak)
export function loadPersistentRatings(): Record<string, StoredCitizenRating[]> {
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

// Sanitization: strip clientIp before sending to client / UI
export function sanitizeRatingsForClient(
  ratings: StoredCitizenRating[]
): CitizenRating[] {
  return ratings.map(({ clientIp: _clientIp, ...rest }) => rest);
}

/**
 * Hardened atomic ratings persistence with proper-lockfile mutex locking,
 * file-size bounding, deduplication window, and capacity capping.
 */
export async function saveRating(
  politicianId: string,
  rating: CitizenRating,
  clientIp: string = "127.0.0.1"
): Promise<{ success: boolean; error?: string; data?: CitizenRating }> {
  // 1. File size ceiling check
  try {
    if (fs.existsSync(RATINGS_DB_FILE)) {
      const stats = fs.statSync(RATINGS_DB_FILE);
      const sizeMB = stats.size / (1024 * 1024);
      if (sizeMB > RATINGS_FILE_MAX_SIZE_MB) {
        console.error("[RATINGS] Storage limit reached:", sizeMB, "MB");
        return { success: false, error: "Storage limit reached. Rating cannot be saved." };
      }
    }
  } catch (err) {
    console.error("[RATINGS_STAT_ERROR]", err);
  }

  const dir = path.dirname(RATINGS_DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(RATINGS_DB_FILE)) {
    fs.writeFileSync(RATINGS_DB_FILE, "{}", "utf-8");
  }

  // 2. Acquire cross-process file lock
  let release: (() => Promise<void>) | null = null;
  try {
    release = await lockfile.lock(RATINGS_DB_FILE, {
      retries: { retries: 5, minTimeout: 100, maxTimeout: 500 },
    });

    const raw = fs.readFileSync(RATINGS_DB_FILE, "utf-8");
    const data: Record<string, StoredCitizenRating[]> = JSON.parse(raw || "{}");

    const existing = data[politicianId] || [];

    // 3. Deduplication: Check if same IP submitted in the last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentFromIp = existing.filter(
      (r) => r.clientIp === clientIp && new Date(r.createdAt).getTime() > oneDayAgo
    );

    if (recentFromIp.length > 0) {
      return {
        success: false,
        error: "You have already submitted a rating for this representative in the last 24 hours.",
      };
    }

    const storedRating: StoredCitizenRating = {
      ...rating,
      clientIp,
    };

    // 4. Capacity Cap: Max 500 ratings per politician
    if (existing.length >= MAX_RATINGS_PER_POLITICIAN) {
      data[politicianId] = [storedRating, ...existing.slice(0, MAX_RATINGS_PER_POLITICIAN - 1)];
    } else {
      data[politicianId] = [storedRating, ...existing];
    }

    // 5. Atomic Write: write to temp file then rename
    const tempFile = RATINGS_DB_FILE + ".tmp";
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, RATINGS_DB_FILE);

    return { success: true, data: rating };
  } catch (error) {
    console.error("[RATINGS_LOCK_WRITE_ERROR]", error);
    return { success: false, error: "Internal storage error while persisting citizen rating." };
  } finally {
    if (release) {
      try {
        await release();
      } catch (unlockErr) {
        console.error("[RATINGS_UNLOCK_ERROR]", unlockErr);
      }
    }
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
      citizenRatings: [...sanitizeRatingsForClient(persistentRatings[neta.id]), ...neta.citizenRatings],
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
  clientIp?: string;
}): Promise<CitizenRating> {
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

  const result = await saveRating(data.politicianId, newRating, data.clientIp || "127.0.0.1");
  if (!result.success && result.error) {
    throw new Error(result.error);
  }

  return newRating;
}
