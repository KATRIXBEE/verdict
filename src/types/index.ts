export type EducationStatus = 'verified' | 'unverified' | 'suspicious';
export type SeverityTier = 'minor' | 'moderate' | 'serious' | 'severe';
export type CaseStatus = 'active' | 'bail_granted' | 'stayed' | 'acquitted' | 'convicted';
export type ConstituencyType = 'lok_sabha' | 'vidhan_sabha';
export type ScoreBand = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'VERY POOR';

export interface Constituency {
  id: string;
  name: string;
  state: string;
  type: ConstituencyType;
  code: string;
  registeredVoters?: number;
}

export interface PartyTenure {
  id: string;
  politicianId: string;
  partyName: string;
  partyAbbr: string;
  partyColor: string;
  startYear: number;
  endYear: number | null; // null if current
  isCurrent: boolean;
  switchReason?: string;
  constituencyContested?: string;
}

export interface CriminalCase {
  id: string;
  politicianId: string;
  cnrNumber?: string;
  caseNumber: string;
  courtName: string;
  ipcSections: string[];
  plainEnglishSummary: string;
  severityTier: SeverityTier;
  status: CaseStatus;
  filingDate: string;
  lastHearingDate?: string;
  nextHearingDate?: string;
  presidingJudge?: string;
  sourceAffidavitUrl: string;
  ecourtsVerified: boolean;
  courtState: string;
}

export interface AssetDeclaration {
  id: string;
  politicianId: string;
  electionYear: number;
  movableAssets: number; // in INR
  immovableAssets: number; // in INR
  totalAssets: number; // in INR
  totalLiabilities: number; // in INR
  declaredAnnualIncome?: number; // in INR
  isOutlierGrowth: boolean;
  growthCagr?: number; // percentage
  affidavitPdfUrl?: string;
}

export interface CitizenRating {
  id: string;
  politicianId: string;
  userId: string;
  userName: string;
  userConstituency?: string;
  rating: number; // 1 - 5
  feedbackTag?: 'responsive' | 'absentee' | 'infrastructure' | 'integrity' | 'reformist' | 'communal' | 'accessible';
  comment?: string;
  isLocalVoter: boolean;
  digilockerVerified: boolean;
  createdAt: string;
}

export interface NewsSentimentItem {
  id: string;
  headline: string;
  source: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'critical';
  url: string;
  summary: string;
}

export interface Politician {
  id: string;
  fullName: string;
  slug: string;
  photoUrl: string;
  currentParty: string;
  partyAbbr: string;
  partyColor: string;
  currentConstituency: Constituency;
  age: number;
  gender: 'male' | 'female' | 'other';
  professionDeclared: string;
  educationDegree: string;
  educationInstitution: string;
  educationStatus: EducationStatus;
  educationDetails?: string;
  
  // Legislative metrics
  attendancePercentage: number;
  debatesParticipated: number;
  questionsAsked: number;
  privateMemberBills: number;
  nationalAttendanceAvg: number;
  stateAttendanceAvg: number;

  // Parliamentary role
  termsServed: number;
  isMinister: boolean;
  portfolio?: string;
  house: 'Lok Sabha' | 'Rajya Sabha' | 'Vidhan Sabha';

  // Sub-modules
  partyHistory: PartyTenure[];
  criminalCases: CriminalCase[];
  assetDeclarations: AssetDeclaration[];
  citizenRatings: CitizenRating[];
  newsItems: NewsSentimentItem[];

  // Computed & audit
  calculatedVerdictScore: number;
  scoreBand: ScoreBand;
  lastSyncedAt: string;
  sourceAffidavitDate: string;
}

export interface ScoreBreakdown {
  attendanceScore: number; // max 2.0
  assetGrowthScore: number; // max 2.0
  citizenRatingScore: number; // max 2.5
  newsSentimentScore: number; // max 1.0
  educationScore: number; // max 0.5
  partyLoyaltyScore: number; // max 0.5
  criminalDeduction: number; // up to 4.0
  finalScore: number; // clamped 0.0 - 10.0
  scoreBand: ScoreBand;
  details: {
    attendanceText: string;
    assetText: string;
    criminalText: string;
    educationText: string;
    citizenText: string;
    partyText: string;
    newsText: string;
  };
}

export interface IPCDictionaryEntry {
  section: string;
  title: string;
  plainEnglish: string;
  severityTier: SeverityTier;
  deductionPoints: number;
  maxSentence: string;
  bailable: boolean;
  category: string;
  landmarkCase?: string;
}
