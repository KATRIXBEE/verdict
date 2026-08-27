import { Controversy } from "@/types";

export const MOCK_CONTROVERSIES: Controversy[] = [
  // ----------------------------------------------------
  // 1. Narendra Modi (narendra-modi-varanasi)
  // ----------------------------------------------------
  {
    id: "cont-modi-1",
    politicianId: "narendra-modi-varanasi",
    title: "Electoral Bonds Scheme — Supreme Court Struck Down",
    date: "2024-02-15",
    status: "Resolved",
    summary:
      "The Electoral Bonds scheme, introduced by the Modi government in 2018, was unanimously struck down by the Supreme Court in February 2024 as unconstitutional. The court said it violated the right to information. SBI data revealed ₹16,000 crore in bonds — BJP received 57% of all bonds.",
    categories: ["Financial Irregularity", "Electoral Finance", "Constitutional Law"],
    severity: "Severe",
    sources: [
      {
        url: "https://www.thehindu.com",
        sourceName: "The Hindu",
        type: "News",
      },
      {
        url: "https://services.ecourts.gov.in",
        sourceName: "Supreme Court Constitution Bench",
        type: "Court",
      },
    ],
    officialResponse:
      "Government said the scheme was meant to reduce black money in elections. Accepted SC judgment.",
    resolution: "Supreme Court unanimously struck down scheme; SBI disclosed entire donor and recipient database.",
  },
  {
    id: "cont-modi-2",
    politicianId: "narendra-modi-varanasi",
    title: "2002 Gujarat Riots",
    date: "2002-02-28",
    status: "Resolved",
    summary:
      "As Chief Minister of Gujarat, Modi faced allegations of allowing or facilitating the 2002 riots which killed over 1,000 people, mostly Muslims. He was investigated by the Supreme Court-appointed Special Investigation Team (SIT).",
    categories: ["Police & Justice", "Communal Harmony", "Public Order"],
    severity: "Severe",
    sources: [
      {
        url: "https://www.thehindu.com",
        sourceName: "The Hindu",
        type: "News",
      },
      {
        url: "https://services.ecourts.gov.in",
        sourceName: "Supreme Court SIT Record",
        type: "Court",
      },
    ],
    officialResponse:
      "Modi denied any conspiracy or inaction. Supreme Court upheld SIT's clean chit in 2022.",
    resolution: "SIT gave clean chit — upheld by Supreme Court of India in 2022.",
  },

  // ----------------------------------------------------
  // 2. Nitin Gadkari (nitin-jairam-gadkari-nagpur / nitin-gadkari-nagpur)
  // ----------------------------------------------------
  {
    id: "cont-gadkari-1",
    politicianId: "nitin-jairam-gadkari-nagpur",
    title: "Ethanol Plant Air Pollution Controversy",
    date: "2023-08-15",
    status: "Under Investigation",
    summary:
      "An ethanol manufacturing plant linked to associates of Gadkari was alleged to be causing severe air pollution affecting nearby villages in Nagpur district. Local residents reported respiratory issues and contamination of water bodies.",
    categories: ["Environmental Violation", "Pollution", "Industrial Oversight"],
    severity: "Serious",
    sources: [
      {
        url: "https://www.thehindu.com",
        sourceName: "The Hindu",
        type: "News",
      },
    ],
    officialResponse:
      "Ministry denied direct involvement; stated regulatory bodies are examining the plant.",
    resolution: null,
  },
  {
    id: "cont-gadkari-2",
    politicianId: "nitin-jairam-gadkari-nagpur",
    title: "Purti Group Financial Irregularities",
    date: "2013-12-20",
    status: "Resolved",
    summary:
      "Questions were raised about financial dealings of Purti Group, a conglomerate associated with Gadkari, regarding loan defaults and restructuring during his tenure as BJP President.",
    categories: ["Financial Irregularity", "Corporate Governance"],
    severity: "Serious",
    sources: [
      {
        url: "https://www.ndtv.com",
        sourceName: "NDTV",
        type: "News",
      },
    ],
    officialResponse:
      "Gadkari denied any wrongdoing. Loans were restructured as per standard banking practice.",
    resolution: "Cleared after standard banking audit and debt restructuring review.",
  },

  // ----------------------------------------------------
  // 3. Dharmendra Pradhan (dharmendra-pradhan-sambalpur)
  // ----------------------------------------------------
  {
    id: "cont-pradhan-1",
    politicianId: "dharmendra-pradhan-sambalpur",
    title: "NCERT Textbook Controversy",
    date: "2023-04-10",
    status: "Ongoing",
    summary:
      "As Education Minister, Pradhan faced criticism over NCERT textbook revisions that deleted chapters on the Mughal Empire, the Emergency period, and altered historical narratives. Historians and academics called the deletions politically motivated.",
    categories: ["Education Policy", "Academic Freedom", "Curriculum"],
    severity: "Moderate",
    sources: [
      {
        url: "https://www.thehindu.com",
        sourceName: "The Hindu",
        type: "News",
      },
    ],
    officialResponse:
      "Ministry stated curriculum was rationalized post-COVID to reduce student burden. Changes follow NEP 2020 guidelines.",
    resolution: null,
  },
  {
    id: "cont-pradhan-2",
    politicianId: "dharmendra-pradhan-sambalpur",
    title: "NEET-UG Exam Paper Leak Controversy",
    date: "2024-06-13",
    status: "Resolved",
    summary:
      "The NEET-UG 2024 examination faced allegations of widespread paper leak and irregularities affecting 2.4 million medical aspirants. As Education Minister, Pradhan came under pressure to resign.",
    categories: ["Education", "Exam Security", "Administrative Oversight"],
    severity: "Severe",
    sources: [
      {
        url: "https://indianexpress.com",
        sourceName: "Indian Express",
        type: "News",
      },
    ],
    officialResponse:
      "Minister acknowledged systemic lapses, NTA was dissolved and reconstituted. CBI investigation ordered.",
    resolution: "Investigation completed — NTA restructured, high-level reform panel appointed.",
  },

  // ----------------------------------------------------
  // 4. Amit Shah (amit-shah-gandhinagar)
  // ----------------------------------------------------
  {
    id: "cont-shah-1",
    politicianId: "amit-shah-gandhinagar",
    title: "CAA-NRC Implementation Controversy",
    date: "2019-12-15",
    status: "Ongoing",
    summary:
      "The Citizenship Amendment Act (CAA) and proposed National Register of Citizens (NRC) triggered nationwide protests. Critics alleged the law discriminated against Muslims. Over 100 deaths reported in protests across India.",
    categories: ["Electoral Malpractice", "Public Order", "Legislation"],
    severity: "Severe",
    sources: [
      {
        url: "https://www.thehindu.com",
        sourceName: "The Hindu",
        type: "News",
      },
    ],
    officialResponse:
      "Shah maintained the law protects persecuted minorities from neighbouring countries and does not affect Indian Muslims.",
    resolution: "CAA rules notified in March 2024; nationwide NRC deferred.",
  },
  {
    id: "cont-shah-2",
    politicianId: "amit-shah-gandhinagar",
    title: "Sohrabuddin Sheikh Fake Encounter Case",
    date: "2010-07-25",
    status: "Resolved",
    summary:
      "Amit Shah was arrested in 2010 in connection with the alleged fake encounter killing of gangster Sohrabuddin Sheikh and his wife Kausar Bi in 2005. He was in jail for 3 months before getting bail from Supreme Court.",
    categories: ["Criminal Case", "Police & Justice", "Encounter Probe"],
    severity: "Severe",
    sources: [
      {
        url: "https://www.ndtv.com",
        sourceName: "NDTV",
        type: "News",
      },
    ],
    officialResponse:
      "Shah denied any involvement. Was acquitted by CBI court citing lack of evidence.",
    resolution: "Acquitted by Special CBI Court in December 2014 citing absence of prosecutable evidence.",
  },

  // ----------------------------------------------------
  // 5. Nirmala Sitharaman (nirmala-sitharaman-rajya-sabha / nirmala-sitharaman)
  // ----------------------------------------------------
  {
    id: "cont-sitharaman-1",
    politicianId: "nirmala-sitharaman-rajya-sabha",
    title: "Economic Slowdown 2019 — Automobile Sector Comments",
    date: "2019-09-10",
    status: "Resolved",
    summary:
      "During India's 2019 economic slowdown, Sitharaman attributed declining car sales partly to millennials preferring Ola/Uber and EMI mindsets, sparking widespread criticism from economists and the automobile industry.",
    categories: ["Financial Irregularity", "Economic Policy", "Public Statements"],
    severity: "Minor",
    sources: [
      {
        url: "https://indianexpress.com",
        sourceName: "Indian Express",
        type: "News",
      },
    ],
    officialResponse:
      "Ministry later rolled out stimulus packages and structural tax reforms for the automobile sector.",
    resolution: "Stimulus package rolled out; corporate tax reduced to 22% in Sept 2019.",
  },
  {
    id: "cont-sitharaman-2",
    politicianId: "nirmala-sitharaman-rajya-sabha",
    title: "Rafael Deal Pricing Controversy",
    date: "2018-09-21",
    status: "Resolved",
    summary:
      "As Defence Minister (2017-19), Sitharaman was in charge when the Rafale fighter jet deal with France was finalized. Opposition alleged the deal was overpriced and favoured Anil Ambani's company for offsets.",
    categories: ["Contractor/Tender Scam", "Defense Procurement", "Offset Policy"],
    severity: "Serious",
    sources: [
      {
        url: "https://www.thehindu.com",
        sourceName: "The Hindu",
        type: "News",
      },
    ],
    officialResponse:
      "Government denied wrongdoing. Supreme Court found no ground for CBI investigation.",
    resolution: "Supreme Court upheld inter-governmental deal in Dec 2018 and dismissed review petitions.",
  },

  // ----------------------------------------------------
  // 6. Smriti Irani (smriti-irani-amethi)
  // ----------------------------------------------------
  {
    id: "cont-irani-1",
    politicianId: "smriti-irani-amethi",
    title: "Education Qualification Controversy",
    date: "2014-06-01",
    status: "Ongoing",
    summary:
      "Smriti Irani's declared educational qualifications varied across election affidavits — from B.A. Part 1 (2004) to B.Com Part 1 (2011). As HRD Minister overseeing education, critics called this hypocritical.",
    categories: ["False Qualification", "Affidavit Disclosure", "Higher Education"],
    severity: "Moderate",
    sources: [
      {
        url: "https://www.ndtv.com",
        sourceName: "NDTV",
        type: "News",
      },
    ],
    officialResponse:
      "Irani stated the affidavit was correctly filed and the controversy was politically motivated.",
    resolution: null,
  },
  {
    id: "cont-irani-2",
    politicianId: "smriti-irani-amethi",
    title: "Goa Bar-Restaurant Licence Controversy",
    date: "2022-07-25",
    status: "Ongoing",
    summary:
      "A restaurant in Goa allegedly linked to Smriti Irani's daughter was found to be operating without a valid liquor licence during an excise department raid. The matter became political in 2022.",
    categories: ["Administrative", "Conflict of Interest", "Excise Licensing"],
    severity: "Minor",
    sources: [
      {
        url: "https://thewire.in",
        sourceName: "The Wire",
        type: "News",
      },
    ],
    officialResponse:
      "Irani denied her family owns the restaurant. Legal proceedings ongoing.",
    resolution: "Delhi High Court issued ad-interim injunction against defamatory statements.",
  },

  // ----------------------------------------------------
  // 7. Rahul Gandhi (rahul-gandhi-rae-bareli / rahul-gandhi-raebareli / rahul-gandhi-wayanad)
  // ----------------------------------------------------
  {
    id: "cont-gandhi-1",
    politicianId: "rahul-gandhi-rae-bareli",
    title: "Criminal Defamation Conviction — Modi Surname Remark",
    date: "2023-03-23",
    status: "Resolved",
    summary:
      "Rahul Gandhi was convicted of criminal defamation in March 2023 by a Surat court for a 2019 speech where he said 'all thieves have Modi as surname'. He was sentenced to 2 years, briefly losing his MP seat before Supreme Court stayed the conviction.",
    categories: ["Criminal Case", "Defamation", "Freedom of Speech"],
    severity: "Serious",
    sources: [
      {
        url: "https://indianexpress.com",
        sourceName: "Indian Express",
        type: "News",
      },
      {
        url: "https://services.ecourts.gov.in",
        sourceName: "Supreme Court Stay Order",
        type: "Court",
      },
    ],
    officialResponse:
      "Gandhi called it political vendetta. SC stayed conviction and restored his MP status.",
    resolution: "Conviction stayed by Supreme Court of India in August 2023; MP credentials fully restored.",
  },

  // ----------------------------------------------------
  // 8. Arvind Kejriwal (arvind-kejriwal-new-delhi)
  // ----------------------------------------------------
  {
    id: "cont-kejriwal-1",
    politicianId: "arvind-kejriwal-new-delhi",
    title: "Delhi Liquor Policy Scam",
    date: "2022-08-19",
    status: "Ongoing",
    summary:
      "The Delhi Excise Policy 2021-22 was scrapped by the LG following allegations of massive irregularities favouring private liquor businesses. CBI and ED arrested Kejriwal, making him the first sitting CM to be arrested. He resigned from CM post in September 2024.",
    categories: ["Financial Irregularity", "Excise Policy", "CBI Probe"],
    severity: "Severe",
    sources: [
      {
        url: "https://www.ndtv.com",
        sourceName: "NDTV",
        type: "News",
      },
    ],
    officialResponse:
      "Kejriwal denied wrongdoing, called it political conspiracy. Resigned as CM to seek people's mandate.",
    resolution: "Bail granted by Supreme Court in Sept 2024; resigned as CM.",
  },

  // ----------------------------------------------------
  // 9. Dr. Arvind Shrivastava (dr-arvind-shrivastava / neta-1)
  // ----------------------------------------------------
  {
    id: "cont-1-1",
    politicianId: "dr-arvind-shrivastava",
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
    ],
    officialResponse:
      "Clarified that the gathering adhered to social distancing norms and was an emergency ecological sampling drive following reports of untreated industrial effluent dumping.",
    resolution:
      "Acquitted of all charges by the ACMM Patiala House Court in November 2023, which noted the non-violent scientific nature of the civic activity.",
  },

  // ----------------------------------------------------
  // 10. Rameshwar 'Bahubali' Singh (rameshwar-singh / neta-2)
  // ----------------------------------------------------
  {
    id: "cont-2-1",
    politicianId: "rameshwar-singh",
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
    ],
    officialResponse:
      "Claimed political vendetta by rival transport cartels and asserted he was attending a wedding in Lucknow at the time of the incident.",
    resolution:
      "Bail granted by Allahabad High Court with conditional travel restrictions; trial ongoing at Special MP/MLA Sessions Court.",
  },

  // ----------------------------------------------------
  // 11. Digvijay 'Chameleon' Rathore (digvijay-rathore / neta-3)
  // ----------------------------------------------------
  {
    id: "cont-3-1",
    politicianId: "digvijay-rathore",
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
    ],
    officialResponse:
      "Stated the political realignment was driven by non-fulfillment of agrarian farmer loan waivers and systemic negligence of the Gwalior-Chambal regional development charter.",
    resolution:
      "Re-elected under new party symbol in subsequent assembly by-elections and subsequently inducted into the Union Council of Ministers.",
  },
];

/**
 * Normalizes input identifier and searches controversies by either slug or internal ID.
 */
export function getControversiesByPoliticianId(politicianIdOrSlug?: string): Controversy[] {
  if (!politicianIdOrSlug) return [];
  const target = politicianIdOrSlug.toLowerCase().trim();

  return MOCK_CONTROVERSIES.filter((c) => {
    const pId = (c.politicianId || "").toLowerCase();
    return (
      pId === target ||
      target.includes(pId) ||
      pId.includes(target) ||
      // Handle known alias mappings
      (target.includes("modi") && pId.includes("modi")) ||
      (target.includes("gadkari") && pId.includes("gadkari")) ||
      (target.includes("pradhan") && pId.includes("pradhan")) ||
      (target.includes("amit-shah") && pId.includes("shah")) ||
      (target.includes("sitharaman") && pId.includes("sitharaman")) ||
      (target.includes("irani") && pId.includes("irani")) ||
      (target.includes("rahul-gandhi") && pId.includes("gandhi")) ||
      (target.includes("kejriwal") && pId.includes("kejriwal"))
    );
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const getControversiesByPoliticianSlug = getControversiesByPoliticianId;
