export type EducationStatus = 'verified' | 'unverified' | 'suspicious';
export type SeverityTier = 'minor' | 'moderate' | 'serious' | 'severe';
export type CaseStatus = 'active' | 'bail_granted' | 'stayed' | 'acquitted' | 'convicted';
export type ConstituencyType = 'lok_sabha' | 'vidhan_sabha';
export type ScoreBand = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'VERY POOR';

// Controversy domain types
export type ControversyStatus = 'Ongoing' | 'Resolved' | 'Unverified' | 'Under Investigation';
export type ControversySeverity = 'Minor' | 'Moderate' | 'Serious' | 'Severe';
export type SourceLinkType = 'News' | 'Court' | 'CAG' | 'Video';

export interface ControversySource {
  url: string;
  sourceName: string;
  type: SourceLinkType;
}

export interface Controversy {
  id: string;
  politicianId: string;
  title: string;
  date: string; // YYYY-MM-DD
  status: ControversyStatus;
  summary: string;
  categories: string[];
  severity: ControversySeverity;
  sources: ControversySource[];
  officialResponse?: string | null;
  resolution?: string | null;
}

// Ground Truth Blog domain types
export type GroundTruthCategory =
  | 'Industrial & Environmental'
  | 'Infrastructure & Contractor Fraud'
  | 'Healthcare & Public Health'
  | 'Education'
  | 'Water & Sanitation'
  | 'Agriculture & Farmers'
  | 'Housing & Displacement'
  | 'Electoral Malpractice'
  | 'Financial Corruption'
  | 'Police & Justice'
  | 'Media Blackout Stories';

export type AuthorBadgeType =
  | 'Verified Journalist'
  | 'Independent Reporter'
  | 'Citizen Reporter'
  | 'Video Investigation';

export type GroundTruthStatus =
  | 'Ongoing'
  | 'Partially Resolved'
  | 'Resolved'
  | 'Government Action Pending';

export type EvidenceType =
  | 'RTI Response'
  | 'Photo'
  | 'Video'
  | 'Official Document'
  | 'Satellite Image';

export interface EvidenceItem {
  id: string;
  title: string;
  type: EvidenceType;
  url: string;
  previewUrl?: string;
  fileSize?: string;
  date?: string;
  summary?: string;
}

export interface ImpactTimelineItem {
  id: string;
  date: string;
  description: string;
  sourceLink?: string;
  sourceName?: string;
}

export interface RTITemplate {
  subject: string;
  publicAuthority: string;
  pioAddress: string;
  queries: string[];
}

export interface GroundTruthArticle {
  id: string;
  slug: string;
  headline: string;
  tagline?: string;
  author: {
    name: string;
    avatarUrl?: string;
    badge: AuthorBadgeType;
    publication?: string;
  };
  date: string; // YYYY-MM-DD
  location: {
    state: string;
    district: string;
    block?: string;
    coordinates?: [number, number]; // [lat, lng]
  };
  category: GroundTruthCategory;
  affectedPeopleCount: number;
  status: GroundTruthStatus;
  summary: string;
  thumbnailUrl?: string;
  readTimeMinutes: number;
  body: string; // Markdown / rich text
  evidence: EvidenceItem[];
  responsiblePoliticianIds: string[]; // Slug or ID matching Politician
  responsibleOfficialNames: string[];
  responsibleDepartments: string[];
  impactTimeline: ImpactTimelineItem[];
  demands: string; // "What needs to happen"
  upvotes: number;
  affectedVotes: number;
  rtiTemplate?: RTITemplate;
  is_interesting?: boolean;
  unsolved_status?: 'under_investigation' | 'chargesheeted' | 'hearing_scheduled' | 'no_action_taken' | 'closed';
  last_checked_at?: string;
  days_since_first_reported?: number;
  case_reference?: string;
  source_name?: string;
  source_url?: string;
}

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

export type FeedbackCategory = 'responsive' | 'absentee' | 'infrastructure' | 'integrity' | 'reformist' | 'communal' | 'accessible';

export interface CitizenRating {
  id: string;
  politicianId: string;
  userId: string;
  userName: string;
  userConstituency?: string;
  rating: number; // 1 - 5
  feedbackTag?: FeedbackCategory;
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
  attendancePercentage?: number | null;
  debatesParticipated?: number | null;
  questionsAsked?: number | null;
  privateMemberBills?: number | null;
  nationalAttendanceAvg?: number | null;
  stateAttendanceAvg?: number | null;

  // Parliamentary role
  termsServed: number;
  isMinister: boolean;
  portfolio?: string;
  portfolioHistory?: PortfolioEntry[];
  house: 'Lok Sabha' | 'Rajya Sabha' | 'Vidhan Sabha';

  // Sub-modules
  partyHistory: PartyTenure[];
  criminalCases?: CriminalCase[] | null;
  criminalCaseCount?: number | null;
  worstCaseSeverity?: string | null;
  partySwitchCount?: number | null;
  assetGrowthPercent?: number | null;
  mpladsAllocated?: number | null;
  mpladsUtilised?: number | null;
  mpladsUtilisationPercent?: number | null;
  assetDeclarations: AssetDeclaration[];
  citizenRatings: CitizenRating[];
  newsItems: NewsSentimentItem[];

  // Computed & audit
  calculatedVerdictScore: number;
  scoreBand: ScoreBand;
  lastSyncedAt: string;
  sourceAffidavitDate: string;
}

export interface PortfolioEntry {
  role: string;
  ministry: string | null;
  from_date: string;
  to_date: string | null; // null = current / Present
  government: string;
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
