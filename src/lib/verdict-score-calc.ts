import { Politician, ScoreBreakdown, ScoreBand } from "@/types";
import { getScoreBand } from "@/lib/utils";

export function calculateVerdictScore(politician: {
  attendancePercentage: number;
  debatesParticipated?: number;
  questionsAsked?: number;
  privateMemberBills?: number;
  nationalAttendanceAvg?: number;
  assetDeclarations: {
    electionYear: number;
    totalAssets: number;
    isOutlierGrowth?: boolean;
    growthCagr?: number;
  }[];
  criminalCases: {
    severityTier: "minor" | "moderate" | "serious" | "severe";
    status: "active" | "bail_granted" | "stayed" | "acquitted" | "convicted";
  }[];
  educationStatus: "verified" | "unverified" | "suspicious";
  partyHistory: {
    isCurrent: boolean;
  }[];
  citizenRatings: {
    rating: number;
    isLocalVoter: boolean;
  }[];
  newsItems?: {
    sentiment: "positive" | "neutral" | "critical";
  }[];
}): ScoreBreakdown {
  // 1. Attendance & Parliamentary Activity (Max 2.0 pts)
  let attendanceScore = 0.5;
  const att = politician.attendancePercentage || 0;
  if (att >= 90) {
    attendanceScore = 2.0;
  } else if (att >= 75) {
    attendanceScore = 1.5;
  } else if (att >= 50) {
    attendanceScore = 1.0;
  } else {
    attendanceScore = 0.5;
  }

  // 2. Asset Growth Trajectory (Max 2.0 pts)
  let assetGrowthScore = 2.0;
  const sortedAssets = [...(politician.assetDeclarations || [])].sort((a, b) => a.electionYear - b.electionYear);
  let hasOutlier = false;
  let growthRatio = 1.0;

  if (sortedAssets.length >= 2) {
    const oldest = sortedAssets[0].totalAssets;
    const latest = sortedAssets[sortedAssets.length - 1].totalAssets;
    if (oldest > 0) {
      growthRatio = (latest - oldest) / oldest;
    }
    hasOutlier = sortedAssets.some((a) => a.isOutlierGrowth) || growthRatio > 5.0; // >500%
  }

  if (hasOutlier) {
    assetGrowthScore = 0.0;
  } else if (growthRatio > 2.0) { // 200% - 500%
    assetGrowthScore = 1.0;
  } else {
    assetGrowthScore = 2.0;
  }

  // 3. Education UGC Verification (Max 0.5 pts)
  let educationScore = 0.2;
  if (politician.educationStatus === "verified") {
    educationScore = 0.5;
  } else if (politician.educationStatus === "suspicious") {
    educationScore = 0.0;
  } else {
    educationScore = 0.2;
  }

  // 4. Citizen Ratings (Max 2.5 pts) - Anti-Brigading Weighted
  let citizenRatingScore = 1.75; // baseline default for no ratings
  if (politician.citizenRatings && politician.citizenRatings.length > 0) {
    const localRatings = politician.citizenRatings.filter((r) => r.isLocalVoter);
    const nationalRatings = politician.citizenRatings.filter((r) => !r.isLocalVoter);

    let weightedAvg = 3.5;
    if (localRatings.length > 0 && nationalRatings.length > 0) {
      const localAvg = localRatings.reduce((acc, r) => acc + r.rating, 0) / localRatings.length;
      const nationalAvg = nationalRatings.reduce((acc, r) => acc + r.rating, 0) / nationalRatings.length;
      // 70% weight to verified local constituency residents, 30% national
      weightedAvg = localAvg * 0.7 + nationalAvg * 0.3;
    } else if (localRatings.length > 0) {
      weightedAvg = localRatings.reduce((acc, r) => acc + r.rating, 0) / localRatings.length;
    } else if (nationalRatings.length > 0) {
      weightedAvg = nationalRatings.reduce((acc, r) => acc + r.rating, 0) / nationalRatings.length;
    }
    citizenRatingScore = Number(((weightedAvg / 5.0) * 2.5).toFixed(2));
  }

  // 5. AI News Sentiment (Max 1.0 pts)
  let newsSentimentScore = 0.5;
  if (politician.newsItems && politician.newsItems.length > 0) {
    const pos = politician.newsItems.filter((n) => n.sentiment === "positive").length;
    const crit = politician.newsItems.filter((n) => n.sentiment === "critical").length;
    if (pos > crit) {
      newsSentimentScore = 1.0;
    } else if (crit > pos) {
      newsSentimentScore = 0.0;
    } else {
      newsSentimentScore = 0.5;
    }
  }

  // 6. Party Loyalty / Switch Penalty (Max 0.5 pts)
  let partyLoyaltyScore = 0.5;
  const partySwitches = (politician.partyHistory?.length || 1) - 1;
  if (partySwitches === 0) {
    partyLoyaltyScore = 0.5;
  } else if (partySwitches === 1) {
    partyLoyaltyScore = 0.3;
  } else {
    partyLoyaltyScore = 0.0;
  }

  // 7. Legislative Engagement Bonus (Max 1.0 pts)
  let legislativeBonus = 0.0;
  const debates = politician.debatesParticipated || 0;
  const questions = politician.questionsAsked || 0;
  if (debates >= 40 || questions >= 100) {
    legislativeBonus = 1.0;
  } else if (debates >= 15 || questions >= 30) {
    legislativeBonus = 0.5;
  }

  // 8. Criminal Deductions (Max deduction -4.0 pts)
  let criminalDeduction = 0.0;
  if (politician.criminalCases && politician.criminalCases.length > 0) {
    for (const c of politician.criminalCases) {
      if (c.status === "acquitted") {
        continue; // Acquitted cases carry 0 deduction
      }
      
      let baseDeduction = 0;
      switch (c.severityTier) {
        case "minor":
          baseDeduction = 0.5;
          break;
        case "moderate":
          baseDeduction = 1.0;
          break;
        case "serious":
          baseDeduction = 2.0;
          break;
        case "severe":
          baseDeduction = 3.5;
          break;
      }

      // Conviction doubles the penalty
      if (c.status === "convicted") {
        baseDeduction *= 2.0;
      }

      criminalDeduction += baseDeduction;
    }
  }
  // Clamp criminal deduction to max 4.0 pts
  criminalDeduction = Math.min(4.0, Number(criminalDeduction.toFixed(2)));

  // Calculate final score
  const rawScore =
    attendanceScore +
    assetGrowthScore +
    educationScore +
    citizenRatingScore +
    newsSentimentScore +
    partyLoyaltyScore +
    legislativeBonus -
    criminalDeduction;

  const finalScore = Number(Math.max(0.0, Math.min(10.0, rawScore)).toFixed(1));
  const scoreBand: ScoreBand = getScoreBand(finalScore);

  return {
    attendanceScore: Number(attendanceScore.toFixed(2)),
    assetGrowthScore: Number(assetGrowthScore.toFixed(2)),
    citizenRatingScore: Number(citizenRatingScore.toFixed(2)),
    newsSentimentScore: Number(newsSentimentScore.toFixed(2)),
    educationScore: Number(educationScore.toFixed(2)),
    partyLoyaltyScore: Number(partyLoyaltyScore.toFixed(2)),
    criminalDeduction: Number(criminalDeduction.toFixed(2)),
    finalScore,
    scoreBand,
    details: {
      attendanceText: `${att}% attendance in Parliament (${attendanceScore}/2.0 pts)`,
      assetText: hasOutlier
        ? "Unusual multi-term asset spike >500% (0.0/2.0 pts)"
        : `Normal growth within lawful limits (${assetGrowthScore}/2.0 pts)`,
      criminalText:
        criminalDeduction > 0
          ? `-${criminalDeduction} pts deduction across active/declared penal cases`
          : "Clean record / Zero active criminal deductions (0.0 deduction)",
      educationText:
        politician.educationStatus === "verified"
          ? "Degree verified against UGC database (+0.5 pts)"
          : politician.educationStatus === "suspicious"
          ? "Unaccredited / Suspicious declaration (0.0 pts)"
          : "Unverified digital archive (+0.2 pts)",
      citizenText: `DigiLocker verified community trust score (${citizenRatingScore}/2.5 pts)`,
      partyText: `${partySwitches} party switch(es) recorded (${partyLoyaltyScore}/0.5 pts)`,
      newsText: `90-day AI media coverage sentiment index (${newsSentimentScore}/1.0 pts)`,
    },
  };
}
