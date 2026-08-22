import { NextResponse } from "next/server";

const NCRB_DATA = {
  source: "National Crime Records Bureau (NCRB) 2022",
  source_url: "https://ncrb.gov.in/en/crime-in-india-table-addtional-table-and-chapter-contents",
  last_updated: "2023-12-01",
  annual: {
    year: 2022,
    rape_cases: 31516,
    murder_cases: 28522,
    kidnapping_cases: 100545,
    robbery_cases: 24393,
    crimes_against_women: 445256,
    crimes_against_children: 162449,
    cybercrime_cases: 65893,
    total_ipc_crimes: 4461679,
  },
  monthly_average: {
    rape_cases: Math.round(31516 / 12),       // 2626/month
    murder_cases: Math.round(28522 / 12),      // 2377/month
    crimes_against_women: Math.round(445256 / 12), // 37104/month
    cybercrime_cases: Math.round(65893 / 12),  // 5491/month
  },
  daily_average: {
    rape_cases: Math.round(31516 / 365),       // 86/day
    murder_cases: Math.round(28522 / 365),     // 78/day
    crimes_against_women: Math.round(445256 / 365), // 1220/day
    cybercrime_cases: Math.round(65893 / 365), // 181/day
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
  ]
};

export async function GET() {
  return NextResponse.json(NCRB_DATA, {
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
    }
  });
}
