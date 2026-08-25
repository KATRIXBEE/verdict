import { ScoreBreakdown, ScoreBand } from "@/types";
import { getScoreBand } from "@/lib/utils";

export function calculateVerdictScore(politician: {
  attendancePercentage?: number | null;
  debatesParticipated?: number | null;
  questionsAsked?: number | null;
  privateMemberBills?: number | null;
  nationalAttendanceAvg?: number | null;
  assetDeclarations?: {
    electionYear: number;
    totalAssets: number;
    isOutlierGrowth?: boolean;
    growthCagr?: number;
  }[];
  criminalCases?: {
    severityTier?: string;
    status?: string;
  }[];
  educationStatus?: "verified" | "unverified" | "suspicious" | string;
  partyHistory?: {
    isCurrent: boolean;
  }[];
  partySwitchCount?: number | null;
  mpladsUtilisationPercent?: number | null;
  citizenRatings?: {
    rating: number;
    isLocalVoter: boolean;
  }[];
  newsItems?: {
    sentiment: "positive" | "neutral" | "critical";
  }[];
}): ScoreBreakdown {
  // BASE SCORE: 5.0
  const baseScore = 5.0;

  // 1. ATTENDANCE (only if attendancePercentage is NOT null / undefined)
  let attendanceScore = 0.0;
  const att = politician.attendancePercentage;
  if (att === null || att === undefined) {
    attendanceScore = 0.0; // null = neutral
  } else if (att >= 80.0) {
    attendanceScore = 2.0;
  } else if (att >= 60.0) {
    attendanceScore = 1.0;
  } else if (att >= 40.0) {
    attendanceScore = 0.0;
  } else {
    attendanceScore = -1.0;
  }

  // 2. CRIMINAL CASES (strict null vs zero distinction)
  let crimeImpact = 0.0;
  let criminalDeduction = 0.0;
  if (politician.criminalCases === null || politician.criminalCases === undefined) {
    crimeImpact = 0.0; // null / no data imported yet = neutral (0.0 impact)
  } else if (Array.isArray(politician.criminalCases)) {
    const activeCases = politician.criminalCases.filter(
      (c) => !["acquit", "dismiss", "withdrawn"].some((k) => (c.status || "").toLowerCase().includes(k))
    );
    if (activeCases.length === 0) {
      crimeImpact = 1.0; // Confirmed 0 cases = +1.0 bonus
    } else {
      const severities = activeCases.map((c) => (c.severityTier || "moderate").toLowerCase());
      if (severities.includes("severe")) {
        crimeImpact = -4.0;
      } else if (severities.includes("serious")) {
        crimeImpact = -2.5;
      } else if (severities.includes("moderate")) {
        crimeImpact = -1.5;
      } else if (severities.every((s) => s === "minor")) {
        crimeImpact = activeCases.length <= 2 ? -0.5 : -1.5;
      } else {
        crimeImpact = -1.5;
      }
      criminalDeduction = Math.abs(crimeImpact);
    }
  } else {
    crimeImpact = 0.0;
  }

  // 3. ASSET GROWTH (only if 2+ years of data exist)
  let assetGrowthScore = 0.0;
  const sortedAssets = [...(politician.assetDeclarations || [])]
    .filter((a) => a.totalAssets !== undefined && a.totalAssets > 0)
    .sort((a, b) => a.electionYear - b.electionYear);

  if (sortedAssets.length >= 2) {
    const oldest = sortedAssets[0].totalAssets;
    const latest = sortedAssets[sortedAssets.length - 1].totalAssets;
    if (oldest > 0) {
      const growthPct = ((latest - oldest) / oldest) * 100.0;
      if (growthPct < 200.0) {
        assetGrowthScore = 1.0;
      } else if (growthPct <= 400.0) {
        assetGrowthScore = 0.0;
      } else {
        assetGrowthScore = -2.0;
      }
    }
  } else {
    assetGrowthScore = 0.0; // Insufficient data -> +0.0
  }

  // 4. EDUCATION (only verified gets bonus, null / unverified = 0.0)
  let educationScore = 0.0;
  const edu = (politician.educationStatus || "").toLowerCase();
  if (edu === "verified") {
    educationScore = 0.5;
  } else if (edu === "suspicious") {
    educationScore = -0.5;
  } else {
    educationScore = 0.0; // Unverified / not checked / null -> +0.0 (neutral)
  }

  // 5. PARTY SWITCHES
  let partyLoyaltyScore = 0.0;
  const switches = politician.partySwitchCount;
  if (switches !== undefined && switches !== null) {
    if (switches === 0) {
      partyLoyaltyScore = 0.5;
    } else if (switches === 1) {
      partyLoyaltyScore = 0.0;
    } else {
      partyLoyaltyScore = -0.5;
    }
  }

  // 6. MPLADS UTILISATION
  let mpladsScore = 0.0;
  const mpladsUtil = politician.mpladsUtilisationPercent;
  if (mpladsUtil !== undefined && mpladsUtil !== null) {
    if (mpladsUtil > 80.0) {
      mpladsScore = 0.5;
    } else if (mpladsUtil < 30.0) {
      mpladsScore = -0.5;
    }
  }

  // Final score summation & clamping
  const rawScore = baseScore + attendanceScore + crimeImpact + assetGrowthScore + educationScore + partyLoyaltyScore + mpladsScore;
  const finalScore = Number(Math.max(0.0, Math.min(10.0, rawScore)).toFixed(1));
  const scoreBand: ScoreBand = getScoreBand(finalScore);

  return {
    attendanceScore: Number(attendanceScore.toFixed(2)),
    assetGrowthScore: Number(assetGrowthScore.toFixed(2)),
    citizenRatingScore: 0.0,
    newsSentimentScore: 0.0,
    educationScore: Number(educationScore.toFixed(2)),
    partyLoyaltyScore: Number((partyLoyaltyScore + mpladsScore).toFixed(2)),
    criminalDeduction: Number(criminalDeduction.toFixed(2)),
    finalScore,
    scoreBand,
    details: {
      attendanceText: att !== undefined && att !== null
        ? `${att}% attendance in Parliament (${attendanceScore >= 0 ? "+" : ""}${attendanceScore.toFixed(1)} pts)`
        : "No official attendance records on file (0.0 pts neutral)",
      assetText: sortedAssets.length >= 2
        ? `Multi-term asset growth (${assetGrowthScore >= 0 ? "+" : ""}${assetGrowthScore.toFixed(1)} pts)`
        : "Single term / baseline asset declaration (0.0 pts neutral)",
      criminalText: crimeImpact < 0
        ? `${crimeImpact.toFixed(1)} pts deduction across declared criminal cases`
        : crimeImpact > 0
        ? "Confirmed 0 criminal cases declared (+1.0 pt bonus)"
        : "No criminal records on file (0.0 pts neutral)",
      educationText: edu === "verified"
        ? "Degree verified against UGC / AICTE records (+0.5 pts)"
        : edu === "suspicious"
        ? "Unaccredited institution flag (-0.5 pts)"
        : "Unverified educational declaration (0.0 pts neutral)",
      citizenText: "Verified citizen trust index (0.0 pts neutral)",
      partyText: switches !== undefined && switches !== null
        ? `${switches} party switch(es) recorded (${partyLoyaltyScore >= 0 ? "+" : ""}${partyLoyaltyScore.toFixed(1)} pts)`
        : "Party loyalty index (0.0 pts neutral)",
      newsText: mpladsUtil !== undefined && mpladsUtil !== null
        ? `MPLADS fund utilisation ${mpladsUtil}% (${mpladsScore >= 0 ? "+" : ""}${mpladsScore.toFixed(1)} pts)`
        : "Media coverage sentiment audit index (0.0 pts neutral)",
    },
  };
}
