import { Controversy } from "@/types";

export const MOCK_CONTROVERSIES: Controversy[] = [
  // ----------------------------------------------------
  // 1. Dr. Arvind Shrivastava (neta-1 / dr-arvind-shrivastava)
  // ----------------------------------------------------
  {
    id: "cont-1-1",
    politicianId: "neta-1",
    title: "Civil Disobedience During COVID-19 Yamuna Cleanup Rally",
    date: "2021-03-12",
    status: "Resolved",
    summary:
      "Dr. Shrivastava led a gathering of 150 volunteers and environmental researchers along the Wazirabad Yamuna bank during active Disaster Management Act movement restrictions. Delhi Police registered an FIR under Section 188 citing failure to obtain requisite rally permissions during pandemic containment phases.",
    categories: ["Public Order", "Environment", "Protest"],
    severity: "Minor",
    sources: [
      {
        url: "https://thehindu.com",
        sourceName: "The Hindu",
        type: "News",
      },
      {
        url: "https://services.ecourts.gov.in",
        sourceName: "Patiala House Court Record",
        type: "Court",
      },
    ],
    officialResponse:
      "Clarified that the gathering adhered to social distancing norms and was an emergency ecological sampling drive following reports of untreated industrial effluent dumping.",
    resolution:
      "Acquitted of all charges by the ACMM Patiala House Court in November 2023, which noted the non-violent scientific nature of the civic activity.",
  },
  {
    id: "cont-1-2",
    politicianId: "neta-1",
    title: "Allegations of Selective MPLADS Allocation for Digital Labs",
    date: "2023-08-14",
    status: "Resolved",
    summary:
      "Local opposition municipal councillors alleged that ₹1.8 Crore of MPLADS funds were disproportionately sanctioned for computer hardware and internet infrastructure in select government schools, bypassing municipal ward committee consultations.",
    categories: ["MPLADS", "Education", "Fund Allocation"],
    severity: "Minor",
    sources: [
      {
        url: "https://indianexpress.com",
        sourceName: "Indian Express Delhi Bureau",
        type: "News",
      },
      {
        url: "https://cag.gov.in",
        sourceName: "CAG State Audit Review",
        type: "CAG",
      },
    ],
    officialResponse:
      "Published a public open-source Git repository detailing all 42 school application dockets, objective student-to-computer deficit metrics, and competitive GeM tender purchase receipts.",
    resolution:
      "District Urban Development Agency (DUDA) cleared the sanctions, confirming full compliance with revised Central MPLADS e-Sakshi guidelines.",
  },
  {
    id: "cont-1-3",
    politicianId: "neta-1",
    title: "Critique Over Municipal EV Feeder Bus Route Optimization",
    date: "2025-02-10",
    status: "Ongoing",
    summary:
      "Resident Welfare Associations in Central Delhi contested the rerouting of feeder e-buses connecting metro stations to government quarters, claiming higher-density residential pockets were underserved.",
    categories: ["Urban Transport", "Civic Grievance"],
    severity: "Minor",
    sources: [
      {
        url: "https://timesofindia.indiatimes.com",
        sourceName: "Times City Delhi",
        type: "News",
      },
    ],
    officialResponse:
      "Initiated a 30-day public commuter feedback portal and promised route adjustments based on real-time transit telemetry data.",
    resolution: null,
  },

  // ----------------------------------------------------
  // 2. Rameshwar 'Bahubali' Singh (neta-2 / rameshwar-singh)
  // ----------------------------------------------------
  {
    id: "cont-2-1",
    politicianId: "neta-2",
    title: "Alleged Extortion & Highway Toll Plaza Gunfire Incident",
    date: "2018-09-14",
    status: "Under Investigation",
    summary:
      "An altercation over commercial sand transport toll evasion at the Varanasi-Jaunpur bypass resulted in alleged armed firing and physical assault on NHAI toll booth operators. Named as key conspirator alongside 6 associates under charges of attempt to murder (IPC 307).",
    categories: ["Violent Crime", "Toll Contracts", "Armed Assault"],
    severity: "Severe",
    sources: [
      {
        url: "https://jagran.com",
        sourceName: "Dainik Jagran Crime Desk",
        type: "News",
      },
      {
        url: "https://services.ecourts.gov.in",
        sourceName: "Varanasi Sessions Court Dockets",
        type: "Court",
      },
      {
        url: "https://youtube.com",
        sourceName: "CCTV Toll Plaza Archive",
        type: "Video",
      },
    ],
    officialResponse:
      "Claimed political vendetta by rival transport cartels and asserted he was attending a wedding in Lucknow at the time of the incident.",
    resolution:
      "Bail granted by Allahabad High Court with conditional travel restrictions; trial ongoing at Special MP/MLA Sessions Court.",
  },
  {
    id: "cont-2-2",
    politicianId: "neta-2",
    title: "Benami Highway Embankment Tender Allotment to Family Trust",
    date: "2020-11-03",
    status: "Ongoing",
    summary:
      "State vigilance audit flagged irregularities in a ₹42 Crore rural highway widening contract awarded to a partnership firm registered under the names of domestic staff and distant kin. State anti-corruption branch registered an FIR under PC Act Section 13.",
    categories: ["Financial Fraud", "Corruption", "Contractor Nexus"],
    severity: "Serious",
    sources: [
      {
        url: "https://timesofindia.indiatimes.com",
        sourceName: "Times of India Lucknow",
        type: "News",
      },
      {
        url: "https://cag.gov.in",
        sourceName: "State PWD Special Audit Report",
        type: "CAG",
      },
    ],
    officialResponse:
      "Denied any legal ownership or operational control of the contracted firm, asserting all tenders complied with electronic reverse bidding.",
    resolution: null,
  },
  {
    id: "cont-2-3",
    politicianId: "neta-2",
    title: "Intimidation & Verbal Abuse of Local RTI Whistleblower",
    date: "2022-04-19",
    status: "Ongoing",
    summary:
      "A local civil rights activist inquiring into municipal riverbed sand leases lodged an audio recording alleging explicit verbal death threats and coercion from the lawmaker's official residential landline number.",
    categories: ["Whistleblower Intimidation", "Threats", "Public Conduct"],
    severity: "Moderate",
    sources: [
      {
        url: "https://thewire.in",
        sourceName: "The Wire Investigation",
        type: "News",
      },
      {
        url: "https://services.ecourts.gov.in",
        sourceName: "CJM Varanasi Criminal Complaint",
        type: "Court",
      },
    ],
    officialResponse:
      "Spokesperson alleged the audio recording was fabricated using AI voice cloning tools to tarnish the MP's election campaign.",
    resolution: "High Court stayed further coercive proceedings pending forensic audio authentication.",
  },

  // ----------------------------------------------------
  // 3. Digvijay 'Chameleon' Rathore (neta-3 / digvijay-rathore)
  // ----------------------------------------------------
  {
    id: "cont-3-1",
    politicianId: "neta-3",
    title: "Midnight Resort Defection & 22 MLA Cross-Over Operation",
    date: "2020-03-09",
    status: "Resolved",
    summary:
      "Orchestrated the sudden resignation and chartered flight transfer of 22 state MLAs to a luxury resort in Bengaluru, directly triggering the collapse of the sitting state government and his immediate defection to the opposition party within 48 hours.",
    categories: ["Party Defection", "Aaya Ram Gaya Ram", "Electoral Ethics"],
    severity: "Serious",
    sources: [
      {
        url: "https://ndtv.com",
        sourceName: "NDTV Special Assembly Coverage",
        type: "News",
      },
      {
        url: "https://youtube.com",
        sourceName: "Press Conference Archive",
        type: "Video",
      },
    ],
    officialResponse:
      "Stated the political realignment was driven by non-fulfillment of agrarian farmer loan waivers and systemic negligence of the Gwalior-Chambal regional development charter.",
    resolution:
      "Re-elected under new party symbol in subsequent assembly by-elections and subsequently inducted into the Union Council of Ministers.",
  },
  {
    id: "cont-3-2",
    politicianId: "neta-3",
    title: "Heritage Royal Trust Land Allocation Discrepancy",
    date: "2019-06-11",
    status: "Under Investigation",
    summary:
      "Public interest litigation challenged the lease renewal of 14 acres of prime ancestral trust property in Gwalior at nominal rates, alleging conversion of cultural heritage land for a luxury boutique resort venture.",
    categories: ["Land Lease", "Trust Governance", "Conflict of Interest"],
    severity: "Moderate",
    sources: [
      {
        url: "https://thehindu.com",
        sourceName: "The Hindu Legal Correspondent",
        type: "News",
      },
      {
        url: "https://services.ecourts.gov.in",
        sourceName: "Gwalior Bench High Court Orders",
        type: "Court",
      },
    ],
    officialResponse:
      "Argued the lease was legally granted in 1974 and all commercial hospitality revenue is channeled into free Vedic and vocational charitable schools.",
    resolution: "High Court ordered status quo and constituted an independent commissioner survey.",
  },
  {
    id: "cont-3-3",
    politicianId: "neta-3",
    title: "Controversy Over Unaccredited Foreign University Degree Listing",
    date: "2024-04-20",
    status: "Unverified",
    summary:
      "Election watchdog ADR flagged the candidate's Form 26 declaration of an international management diploma, noting absence of Association of Indian Universities (AIU) equivalency certification in official higher education databases.",
    categories: ["Degree Authenticity", "ECI Declaration"],
    severity: "Moderate",
    sources: [
      {
        url: "https://adrindia.org",
        sourceName: "Association for Democratic Reforms (ADR)",
        type: "News",
      },
    ],
    officialResponse:
      "Legal counsel stated the credential was an executive certification and did not claim statutory university degree status under UGC rules.",
    resolution: null,
  },

  // ----------------------------------------------------
  // 4. Smt. Jayashree Venkataraman (neta-4 / jayashree-venkataraman)
  // ----------------------------------------------------
  {
    id: "cont-4-1",
    politicianId: "neta-4",
    title: "Verbal Clash with Lok Sabha Speaker Over Zero Hour Cut-Off",
    date: "2025-07-22",
    status: "Resolved",
    summary:
      "During a heated debate on algorithmic bias in biometric welfare distribution, MP Venkataraman refused to yield the floor when her allotted speaking time expired, leading to a temporary 24-hour suspension from the house proceedings.",
    categories: ["Parliamentary Conduct", "Welfare Debate"],
    severity: "Minor",
    sources: [
      {
        url: "https://sansad.in",
        sourceName: "Lok Sabha Official Verbatim Debates",
        type: "News",
      },
      {
        url: "https://youtube.com",
        sourceName: "Sansad TV Live Broadcast",
        type: "Video",
      },
    ],
    officialResponse:
      "Expressed utmost respect for the Chair but highlighted that denying time on rural food ration biometric failure was an injustice to vulnerable constituents.",
    resolution:
      "House leaders brokered a resolution next morning and the suspension was rescinded unanimously.",
  },
  {
    id: "cont-4-2",
    politicianId: "neta-4",
    title: "Allegations of Corporate Law Firm Retainership Pre-Election",
    date: "2024-03-10",
    status: "Resolved",
    summary:
      "Political opponents claimed her prior senior counsel retainership with global telecom conglomerates created a potential conflict of interest regarding Parliamentary Standing Committee on IT deliberations.",
    categories: ["Conflict of Interest", "Legal Practice"],
    severity: "Minor",
    sources: [
      {
        url: "https://deccanherald.com",
        sourceName: "Deccan Herald Bengaluru",
        type: "News",
      },
    ],
    officialResponse:
      "Voluntarily published full Bar Council surrender of active litigation practice and recused herself from specific telecom spectrum oversight sub-committees.",
    resolution: "Ethics Committee dismissed the complaint citing proactive disclosure and full compliance with Parliamentary Code of Conduct.",
  },

  // ----------------------------------------------------
  // 5. Ramesh Kumar (Bihar - Patliputra) (neta-5-bihar)
  // ----------------------------------------------------
  {
    id: "cont-5-1",
    politicianId: "neta-5-bihar",
    title: "Sugar Mill Cooperative Election Physical Altercation",
    date: "2021-08-19",
    status: "Ongoing",
    summary:
      "A clash broke out between rival dairy and sugarcane farmer factions during cooperative board voting in Bihta. An FIR was registered alleging unlawful assembly (IPC 147) and voluntarily causing hurt (IPC 323).",
    categories: ["Cooperative Politics", "Public Order", "Agrarian"],
    severity: "Moderate",
    sources: [
      {
        url: "https://prabhatkhabar.com",
        sourceName: "Prabhat Khabar Patna",
        type: "News",
      },
      {
        url: "https://services.ecourts.gov.in",
        sourceName: "Patna Civil Court Docket",
        type: "Court",
      },
    ],
    officialResponse:
      "Maintained that he was peacemaking between agitating cane growers and private mill management who defaulted on crushing dues.",
    resolution: "Bail granted; regular court appearances recorded.",
  },

  // ----------------------------------------------------
  // 6. Ramesh Kumar (Karnataka - Bangalore Central) (neta-6-karnataka)
  // ----------------------------------------------------
  {
    id: "cont-6-1",
    politicianId: "neta-6-karnataka",
    title: "Trust Hospital Encroachment Notice by Municipal Corporation",
    date: "2022-11-15",
    status: "Resolved",
    summary:
      "BBMP issued a provisional encroachment notice regarding 1,200 sq ft of secondary stormwater drain buffer zone during hospital charity wing construction in Central Bengaluru.",
    categories: ["Urban Land", "Civic Compliance", "Healthcare Trust"],
    severity: "Minor",
    sources: [
      {
        url: "https://deccanherald.com",
        sourceName: "Deccan Herald Civic Beat",
        type: "News",
      },
    ],
    officialResponse:
      "Hospital trust submitted original 1998 survey maps and volunteered to realign boundary walls at personal expense to ensure zero storm runoff blockage.",
    resolution:
      "BBMP joint inspection committee certified the voluntary setback correction and closed the notice.",
  },

  // ----------------------------------------------------
  // 7. Anandita Banerjee (neta-7 / anandita-banerjee)
  // ----------------------------------------------------
  {
    id: "cont-7-1",
    politicianId: "neta-7",
    title: "Coastal Fisherfolk Blockade at Chemical Effluent Outlet",
    date: "2022-09-08",
    status: "Ongoing",
    summary:
      "Organized a 72-hour marine boat blockade protesting untreated chemical discharge into the Diamond Harbour delta by an industrial park. The industrial association filed a complaint alleging economic disruption and unlawful assembly.",
    categories: ["Environmental Activism", "Industrial Discharge", "Protest"],
    severity: "Minor",
    sources: [
      {
        url: "https://telegraphindia.com",
        sourceName: "The Telegraph Kolkata",
        type: "News",
      },
      {
        url: "https://services.ecourts.gov.in",
        sourceName: "Calcutta High Court PIL Record",
        type: "Court",
      },
    ],
    officialResponse:
      "Stated that public civil resistance was necessary after state pollution control boards failed to act on five consecutive water toxicity laboratory reports.",
    resolution: "Calcutta High Court stayed punitive action against protesters and ordered the State Pollution Control Board to install real-time effluent sensors.",
  },

  // ----------------------------------------------------
  // 8. Col. Vikramjeet Ranawat (Retd.) (neta-8 / vikramjeet-ranawat)
  // ----------------------------------------------------
  {
    id: "cont-8-1",
    politicianId: "neta-8",
    title: "Defense Tech Cluster Land Acquisition Compensation Dispute",
    date: "2024-01-18",
    status: "Resolved",
    summary:
      "Displaced farmland owners staged a demonstration demanding revised market rate compensation for 80 hectares acquired for the Gandhinagar aerospace manufacturing hub under central defense corridor schemes.",
    categories: ["Land Acquisition", "Defense Corridor", "Farmer Compensation"],
    severity: "Moderate",
    sources: [
      {
        url: "https://timesofindia.indiatimes.com",
        sourceName: "Times of India Ahmedabad",
        type: "News",
      },
    ],
    officialResponse:
      "Held tripartite consultations with district collectors and farmer representatives, sanctioning an additional 25% ex-gratia rehabilitation package and guaranteed apprenticeship seats for local youth.",
    resolution: "Farmer associations signed the revised compensation accord and withdrew the agitation.",
  },
];

export function getControversiesByPoliticianId(politicianId?: string): Controversy[] {
  if (!politicianId) return [];
  const target = politicianId.toLowerCase();
  return MOCK_CONTROVERSIES.filter(
    (c) => (c.politicianId || "").toLowerCase() === target
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
