// CORS POLICY: This endpoint is same-origin only.
// Cross-origin access is intentionally blocked.
// If external API access is needed in future, add explicit CORS headers.

import { NextResponse } from "next/server";

export interface CrimeCategoryStats {
  key: string;
  name: string;
  total_reported: number;
  chargesheeting_rate: number;
  conviction_rate: number;
  unsolved_pct: number;
  pending_cases_count: number;
  rate_interval_desc: string;
  unsolved_reality_desc: string;
}

const NCRB_CATEGORIES: CrimeCategoryStats[] = [
  {
    key: "murder",
    name: "Murder & Homicide",
    total_reported: 28522,
    chargesheeting_rate: 81.5,
    conviction_rate: 43.8,
    unsolved_pct: 56.2,
    pending_cases_count: 16029,
    rate_interval_desc: "1 murder every 18.4 minutes",
    unsolved_reality_desc: "56.2% end without conviction",
  },
  {
    key: "kidnapping",
    name: "Kidnapping & Abduction",
    total_reported: 107588,
    chargesheeting_rate: 37.1,
    conviction_rate: 28.5,
    unsolved_pct: 71.5,
    pending_cases_count: 76925,
    rate_interval_desc: "1 incident every 4.9 minutes",
    unsolved_reality_desc: "71.5% end without conviction",
  },
  {
    key: "crimes_against_women",
    name: "Crimes Against Women",
    total_reported: 445256,
    chargesheeting_rate: 75.8,
    conviction_rate: 25.1,
    unsolved_pct: 74.9,
    pending_cases_count: 333497,
    rate_interval_desc: "1 incident every 71 seconds",
    unsolved_reality_desc: "74.9% end without conviction",
  },
  {
    key: "crimes_against_children",
    name: "Crimes Against Children",
    total_reported: 162449,
    chargesheeting_rate: 75.6,
    conviction_rate: 34.2,
    unsolved_pct: 65.8,
    pending_cases_count: 106891,
    rate_interval_desc: "1 incident every 3.2 minutes",
    unsolved_reality_desc: "65.8% end without conviction",
  },
  {
    key: "economic_offences",
    name: "Economic Offences",
    total_reported: 193885,
    chargesheeting_rate: 47.7,
    conviction_rate: 24.8,
    unsolved_pct: 75.2,
    pending_cases_count: 145802,
    rate_interval_desc: "1 fraud every 2.7 minutes",
    unsolved_reality_desc: "75.2% end without conviction",
  },
  {
    key: "corruption",
    name: "Corruption (PCA Cases)",
    total_reported: 4139,
    chargesheeting_rate: 61.2,
    conviction_rate: 39.9,
    unsolved_pct: 60.1,
    pending_cases_count: 2488,
    rate_interval_desc: "1 case every 2.1 hours",
    unsolved_reality_desc: "60.1% end without conviction",
  },
  {
    key: "cyber_crimes",
    name: "Cyber Crimes",
    total_reported: 65893,
    chargesheeting_rate: 31.4,
    conviction_rate: 22.8,
    unsolved_pct: 77.2,
    pending_cases_count: 50870,
    rate_interval_desc: "1 attack every 8.0 minutes",
    unsolved_reality_desc: "77.2% end without conviction",
  },
];

const NCRB_DATA = {
  source: "National Crime Records Bureau (NCRB), Crime in India 2022 Report, Ministry of Home Affairs",
  source_url: "https://ncrb.gov.in/en/crime-in-india-table-addtional-table-and-chapter-contents",
  last_updated: "2023-12-01",
  disposal_statistics: {
    total_ipc_crimes: 3561379,
    chargesheeting_rate: 71.3,
    conviction_rate: 57.0,
    cases_pending_trial_pct: 89.5,
    total_court_pendency: "3.12 crore cases",
  },
  categories: NCRB_CATEGORIES,
  annual: {
    year: 2022,
    rape_cases: 31516,
    murder_cases: 28522,
    kidnapping_cases: 107588,
    robbery_cases: 24393,
    crimes_against_women: 445256,
    crimes_against_children: 162449,
    cybercrime_cases: 65893,
    total_ipc_crimes: 3561379,
  },
  daily_average: {
    rape_cases: Math.round(31516 / 365),
    murder_cases: Math.round(28522 / 365),
    crimes_against_women: Math.round(445256 / 365),
    cybercrime_cases: Math.round(65893 / 365),
  },
  by_state: [
    { state: "Uttar Pradesh", total_crimes: 682000, rape: 3690 },
    { state: "Maharashtra", total_crimes: 445000, rape: 3083 },
    { state: "Rajasthan", total_crimes: 333000, rape: 5399 },
    { state: "Madhya Pradesh", total_crimes: 308000, rape: 3009 },
    { state: "West Bengal", total_crimes: 229000, rape: 1521 },
    { state: "Kerala", total_crimes: 203000, rape: 2208 },
    { state: "Bihar", total_crimes: 161000, rape: 1300 },
    { state: "Delhi", total_crimes: 291000, rape: 2200 },
    { state: "Karnataka", total_crimes: 208000, rape: 1834 },
    { state: "Telangana", total_crimes: 207000, rape: 1521 },
  ],
};

export async function GET() {
  return NextResponse.json(NCRB_DATA, {
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
