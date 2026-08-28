export interface ScamTimelineEvent {
  id?: string;
  scam_id?: string;
  event_date?: string;
  event_year?: number;
  event_title: string;
  event_description: string;
  event_type: "approval" | "audit" | "court" | "parliament" | "action" | "diversion";
  source_url?: string;
}

export interface ResponsiblePolitician {
  name: string;
  role: string;
  slug?: string | null;
  party?: string;
}

export interface ScamCase {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  category: "Infrastructure Overpricing" | "Welfare Fund Misuse" | "Environmental Fund Misuse" | "Healthcare Fraud" | "Public Revenue Fraud" | "Financial Irregularity" | "Scheme Fraud" | "State Government Fraud";
  severity: "Severe" | "Serious" | "Moderate";

  // Financial metrics in Crore INR
  amount_allocated_crore?: number;
  amount_misused_crore?: number;
  amount_unspent_crore?: number;
  amount_diverted_crore?: number;
  amount_recovered_crore?: number;
  corruption_percent?: number;

  // Benchmark comparison
  benchmark_cost_unit?: string;
  benchmark_cost_india_normal?: number;
  benchmark_cost_actual?: number;
  benchmark_cost_usa?: number;
  benchmark_cost_china?: number;
  benchmark_cost_germany?: number;
  benchmark_cost_uk?: number;
  benchmark_cost_australia?: number;
  benchmark_unit_label?: string;
  cost_inflation_multiple?: number;

  // Scheme details
  scheme_name?: string;
  ministry?: string;
  total_beneficiaries_claimed?: number;
  actual_beneficiaries?: number;
  ghost_beneficiaries?: number;
  period_start?: number;
  period_end?: number;

  // Source & Legal citations
  audit_body?: string;
  audit_report_ref?: string;
  audit_year?: number;
  court_case_ref?: string;
  parliament_ref?: string;
  source_url: string;
  source_name: string;

  // Minister accountability
  responsible_minister_slug?: string;
  responsible_ministry?: string;
  responsible_politicians: ResponsiblePolitician[];

  // Status & Actions
  current_status: string;
  action_taken: string;
  money_recovered_crore?: number;

  // Narratives
  summary: string;
  detailed_explanation: string;
  what_this_means_for_citizens: string;
  international_comparison: string;

  // Timeline
  timeline_events?: ScamTimelineEvent[];
}

export const SCAM_CASES_DATA: ScamCase[] = [
  // ===============================================
  // SCAM 1: DWARKA EXPRESSWAY — THE ₹250 CRORE/KM ROAD
  // ===============================================
  {
    slug: "dwarka-expressway-cost-inflation",
    title: "Dwarka Expressway: Highway That Cost 14x The Benchmark",
    subtitle: "₹250 crore per km for a road meant to cost ₹18 crore per km",
    category: "Infrastructure Overpricing",
    severity: "Severe",

    amount_allocated_crore: 7287.29,
    amount_misused_crore: 6760.0,
    amount_recovered_crore: 0,
    corruption_percent: 92.77,

    benchmark_cost_unit: "Per Kilometre of 8-Lane Elevated Highway",
    benchmark_cost_india_normal: 18.20,
    benchmark_cost_actual: 250.77,
    benchmark_cost_usa: 65.0,
    benchmark_cost_china: 28.0,
    benchmark_cost_germany: 95.0,
    benchmark_cost_uk: 80.0,
    benchmark_cost_australia: 70.0,
    benchmark_unit_label: "₹ Crore per km",
    cost_inflation_multiple: 13.78,

    scheme_name: "Dwarka Expressway (NH-48 Elevated Corridor)",
    ministry: "Ministry of Road Transport and Highways",
    period_start: 2007,
    period_end: 2023,

    audit_body: "Comptroller and Auditor General of India (CAG)",
    audit_report_ref: "CAG Performance Audit Report on Bharatmala Pariyojana Phase-I — Tabled in Parliament August 2023",
    audit_year: 2023,
    source_url: "https://cag.gov.in/uploads/download_audit_report/2023/Report_No_16_of_2023_PA_on_Bharatmala_Pariyojana_Phase_1.pdf",
    source_name: "CAG Report No. 16 of 2023",

    responsible_ministry: "Ministry of Road Transport and Highways",
    responsible_politicians: [
      {
        name: "Nitin Gadkari",
        role: "Minister of Road Transport & Highways 2014-present",
        slug: "nitin-jairam-gadkari-nagpur",
        party: "BJP"
      },
    ],

    current_status: "Under Parliamentary Scrutiny — No minister held accountable",
    action_taken: "CAG report tabled. NHAI issued clarification. No criminal proceedings initiated as of August 2026.",
    money_recovered_crore: 0,

    summary: "The Dwarka Expressway in Delhi-NCR was built at ₹250.77 crore per km — nearly 14 times the Cabinet Committee on Economic Affairs (CCEA) approved benchmark of ₹18.20 crore per km. The CAG found the NHAI Board approved packages without prior Detailed Project Reports (DPRs). An 8-lane elevated structure was built for 55,000 vehicles per day — less than half the 1,30,000 vehicles per day that Indian Road Congress norms require to justify such a structure.",

    detailed_explanation: "The CCEA-approved baseline corridor estimate was ₹18.20 crore per km. The actual sanctioned cost reached ₹250.77 crore per km for 29.06 km of elevated highway — total ₹7,287.29 crore. Key CAG findings: (1) No Detailed Project Report existed before approval. (2) Traffic count of 55,000 vehicles per day is less than half the IRC norm of 1,30,000 required for 8-lane elevated structures. (3) The structure will be underutilised for decades. (4) Decision-making bypassed standard appraisal processes.",

    what_this_means_for_citizens: "₹6,760 crore of taxpayer money appears to have been spent above the internationally benchmarked fair cost for this project. That money could have built 186 km of 4-lane highway at normal costs, or funded 27,000 government schools, or provided healthcare to 67 lakh citizens under Ayushman Bharat.",

    international_comparison: "Germany's Autobahn (8-lane, elevated, world-class): ~₹95 crore/km. USA Interstate Highway (8-lane elevated, urban): ~₹65 crore/km. China National Expressway (8-lane): ~₹28 crore/km. India benchmark (CCEA approved): ₹18.20 crore/km. Actual Dwarka cost: ₹250.77 crore/km. India paid MORE per km than Germany — for a road with half the traffic density.",

    timeline_events: [
      {
        event_year: 2017,
        event_date: "2017-10-24",
        event_title: "CCEA Approves Bharatmala Phase-I",
        event_description: "CCEA approves baseline cost norm of ₹18.20 crore per km across all Bharatmala highway projects.",
        event_type: "approval",
        source_url: "https://pib.gov.in"
      },
      {
        event_year: 2018,
        event_date: "2018-09-15",
        event_title: "NHAI Approves Massive Cost Escalation",
        event_description: "NHAI board sanctions Dwarka Expressway packages at ₹250.77 crore per km without final Detailed Project Reports.",
        event_type: "diversion"
      },
      {
        event_year: 2023,
        event_date: "2023-08-10",
        event_title: "CAG Tables Damning Audit in Parliament",
        event_description: "CAG Report No. 16 reveals 14x cost explosion and flags violation of Indian Road Congress traffic threshold norms.",
        event_type: "audit",
        source_url: "https://cag.gov.in"
      }
    ]
  },

  // ===============================================
  // SCAM 2: BOCW CESS FUND — WORKERS' MONEY STOLEN
  // ===============================================
  {
    slug: "bocw-cess-fund-misuse",
    title: "BOCW Workers' Welfare Fund: ₹40,000 Crore Collected, 2% Spent on Workers",
    subtitle: "Construction workers' cess money sitting in FDs while workers have no healthcare",
    category: "Welfare Fund Misuse",
    severity: "Severe",

    amount_allocated_crore: 40000.0,
    amount_misused_crore: 39200.0,
    amount_unspent_crore: 38000.0,
    amount_recovered_crore: 800.0,
    corruption_percent: 98.0,

    scheme_name: "Building and Other Construction Workers (BOCW) Welfare Fund",
    ministry: "Ministry of Labour and Employment",
    total_beneficiaries_claimed: 56000000,
    period_start: 1996,
    period_end: 2024,

    audit_body: "Supreme Court of India + CAG",
    audit_report_ref: "Supreme Court in Writ Petition (C) No. 318/2006 — In Re: Employers liability towards BOCW. Court described situation as 'appalling state of affairs'",
    court_case_ref: "WP(C) 318/2006 — Supreme Court of India",
    audit_year: 2023,
    source_url: "https://main.sci.gov.in",
    source_name: "Supreme Court of India Orders",

    responsible_ministry: "Ministry of Labour and Employment",
    responsible_politicians: [
      {
        name: "Bhupender Yadav",
        role: "Minister of Labour & Employment 2021-present",
        slug: "bhupender-yadav-alwar",
        party: "BJP"
      },
      {
        name: "Santosh Kumar Gangwar",
        role: "Minister of Labour 2019-2021",
        slug: "chhatra-pal-singh-gangwar-bareilly",
        party: "BJP"
      },
    ],

    current_status: "Supreme Court monitoring. States ordered to disburse funds. Partial compliance.",
    action_taken: "Supreme Court issued contempt notices to multiple state governments. Some states disbursed partial amounts after court orders.",
    money_recovered_crore: 800,

    summary: "A 1% cess is levied on every construction project in India to fund healthcare, pensions, and welfare for 5.6 crore registered construction workers. Over ₹40,000 crore has been collected. Yet in multiple states, less than 2% to 5% was actually spent on workers. The Supreme Court termed this an 'appalling state of affairs' and found that crores were diverted to buy office cars, laptops, and furnishings for the welfare boards — while workers had no healthcare access.",

    detailed_explanation: "State-level Building and Other Construction Workers Welfare Boards collect the cess but have historically parked money in Fixed Deposits rather than disbursing welfare. Audit findings: Maharashtra collected ₹4,800 crore, spent under 3% on workers. Uttar Pradesh collected ₹3,200 crore, spent 1.8% on workers. Delhi collected ₹800 crore, spent 4.2%. Funds were used for: board office renovations, staff vehicles, laptop purchases, overseas 'study tours' by board officials. The Supreme Court in 2018 issued guidelines mandating disbursement but compliance remained poor.",

    what_this_means_for_citizens: "5.6 crore construction workers — who build India's highways, metro systems, airports and stadiums — are legally entitled to healthcare, accident insurance, children's education scholarships, and pension. This money was collected from their employers but never reached them. Many workers who died on construction sites had families that received no compensation despite the fund existing for exactly that purpose.",

    international_comparison: "Germany's Sozialkassen (construction worker welfare system) disburses 98% of collected funds within 60 days. UK's CITB levy: 94% disbursement rate. Singapore's MediShield for foreign workers: 100% utilisation mandated by law. India: 2-5% utilisation across most states.",

    timeline_events: [
      {
        event_year: 1996,
        event_date: "1996-08-19",
        event_title: "BOCW Act Enacted by Parliament",
        event_description: "Parliament mandates 1% statutory cess on construction projects to create worker welfare treasuries.",
        event_type: "approval"
      },
      {
        event_year: 2006,
        event_date: "2006-05-12",
        event_title: "Supreme Court PIL Filed on Fund Non-Disbursement",
        event_description: "National Campaign Committee for Construction Labour files WP(C) 318/2006 highlighting unspent billions.",
        event_type: "court"
      },
      {
        event_year: 2018,
        event_date: "2018-03-19",
        event_title: "Supreme Court Slams 'Appalling' Diversion",
        event_description: "SC judgment issues 31-point directions and notes money was spent on luxury cars, laptops, and administrative perks.",
        event_type: "court",
        source_url: "https://main.sci.gov.in"
      }
    ]
  },

  // ===============================================
  // SCAM 3: NIRBHAYA FUND — WOMEN'S SAFETY MONEY LOCKED
  // ===============================================
  {
    slug: "nirbhaya-fund-underutilisation",
    title: "Nirbhaya Fund: ₹6,000 Crore for Women's Safety — States Spent Under 20%",
    subtitle: "Money for CCTV cameras, SOS systems and fast track courts sitting in state treasuries",
    category: "Welfare Fund Misuse",
    severity: "Serious",

    amount_allocated_crore: 6212.85,
    amount_unspent_crore: 4500.0,
    amount_misused_crore: 4500.0,
    amount_recovered_crore: 0,
    corruption_percent: 72.4,

    scheme_name: "Nirbhaya Fund — Central Victim Compensation Fund",
    ministry: "Ministry of Women and Child Development / Ministry of Home Affairs",
    period_start: 2013,
    period_end: 2024,

    audit_body: "Parliamentary Standing Committee + CAG",
    audit_report_ref: "Parliamentary Standing Committee on Home Affairs Report 2023; CAG Compliance Audit on Nirbhaya Fund 2021",
    audit_year: 2023,
    source_url: "https://cag.gov.in",
    source_name: "CAG Report + Parliamentary Committee",

    responsible_ministry: "Ministry of Women and Child Development",
    responsible_politicians: [
      {
        name: "Smriti Irani",
        role: "Minister of Women & Child Development 2019-2024",
        slug: "smriti-irani",
        party: "BJP"
      },
      {
        name: "Annpurna Devi",
        role: "Minister of Women & Child Development 2024-present",
        slug: "annpurna-devi-kodarma",
        party: "BJP"
      },
    ],

    current_status: "Fund continues to be underutilised. States cite procedural delays.",
    action_taken: "Ministry issued revised guidelines in 2021. Marginal improvement in some states.",
    money_recovered_crore: 0,

    summary: "Created in 2013 after the December 16 Delhi gang rape to fund women's safety infrastructure — emergency response systems, CCTV networks, fast track courts, and forensic labs. ₹6,212 crore allocated. States utilised between 10%-20% in the first five years. The rest sat locked in state treasuries. The very fund meant to prevent the next Nirbhaya was being blocked by bureaucratic inaction.",

    detailed_explanation: "Under Nirbhaya Fund: Emergency Response System (112) — fully deployed. One Stop Centres for violence survivors — underutilised in 11 states. Fast Track Special Courts for rape/POCSO cases — CAG found 63% of allocated funds unspent in several states. Safe City Projects in 8 cities — Rs 2,919 crore allocated, Rs 900 crore spent as of 2023. CCTV surveillance in public spaces — delayed in 14 states. The money that existed to build fast-track courts for rape survivors was sitting in government bank accounts earning interest while cases piled up.",

    what_this_means_for_citizens: "India has 4.5 lakh pending sexual assault cases in courts. Fast track courts funded by Nirbhaya Fund could have cleared these. Instead survivors wait 5-10 years for justice. Every ₹100 of Nirbhaya Fund unspent is ₹100 that did not go toward preventing or responding to violence against women.",

    international_comparison: "UK Violence Against Women fund: 97% annual disbursement. USA VAWA (Violence Against Women Act) funding: 95%+ utilisation. South Africa GBV Emergency Response: 88% disbursement. India Nirbhaya Fund: 20-28% utilisation across states.",

    timeline_events: [
      {
        event_year: 2013,
        event_date: "2013-02-28",
        event_title: "Nirbhaya Corpus Created with ₹1,000 Cr",
        event_description: "Non-lapsable corpus announced in Union Budget following nationwide outrage.",
        event_type: "approval"
      },
      {
        event_year: 2019,
        event_date: "2019-11-20",
        event_title: "Parliamentary Panel Flags Low State Drawdown",
        event_description: "Standing Committee notes only ₹1,656 crore disbursed out of ₹4,357 crore total allocation.",
        event_type: "parliament"
      },
      {
        event_year: 2023,
        event_date: "2023-03-21",
        event_title: "CAG Compliance Audit Tabled",
        event_description: "Audit reveals over ₹4,500 crore remains blocked across state finance treasuries.",
        event_type: "audit",
        source_url: "https://cag.gov.in"
      }
    ]
  },

  // ===============================================
  // SCAM 4: NATIONAL CLEAN ENERGY FUND DIVERTED
  // ===============================================
  {
    slug: "national-clean-energy-fund-diversion",
    title: "Clean Energy Fund: ₹86,000 Crore Collected From Coal Tax — ₹47,000 Crore Diverted",
    subtitle: "Money meant for pollution control used to compensate states for GST revenue loss",
    category: "Environmental Fund Misuse",
    severity: "Severe",

    amount_allocated_crore: 86000.0,
    amount_diverted_crore: 47000.0,
    amount_misused_crore: 47000.0,
    amount_recovered_crore: 0,
    corruption_percent: 54.65,

    scheme_name: "National Clean Energy and Environment Fund (NCEEF)",
    ministry: "Ministry of Finance / Ministry of New and Renewable Energy",
    period_start: 2010,
    period_end: 2024,

    audit_body: "CAG",
    audit_report_ref: "CAG Report No. 34 of 2017 — National Clean Energy Fund; Subsequent Finance Committee Reports 2021-2023",
    audit_year: 2023,
    source_url: "https://cag.gov.in/uploads/download_audit_report/2017/Report_No_34_of_2017_National_Clean_Energy_Fund.pdf",
    source_name: "CAG Report No. 34 of 2017 + Finance Committee Reports",

    responsible_ministry: "Ministry of Finance",
    responsible_politicians: [
      {
        name: "Nirmala Sitharaman",
        role: "Finance Minister 2019-present",
        slug: "nirmala-sitharaman",
        party: "BJP"
      },
    ],

    current_status: "Fund merged with Consolidated Fund of India via Finance Act. Clean energy earmarking effectively ended.",
    action_taken: "Fund was restructured. No criminal action. CAG recommendations partially accepted.",
    money_recovered_crore: 0,

    summary: "A cess of ₹400 per tonne on coal was collected specifically to fund clean energy research, renewable energy projects, and pollution control. Over ₹86,000 crore was collected. But ₹47,000 crore — more than half — was diverted by the Finance Ministry to compensate states for revenue lost during GST transition. India was burning coal, collecting an environment tax on it, and then using that environment tax for something completely unrelated to the environment.",

    detailed_explanation: "The National Clean Energy Fund was created in 2010 to collect cess from coal production and use it for clean energy R&D, renewable energy projects, and pollution abatement. Coal cess increased from ₹50/tonne (2010) to ₹400/tonne (2016). Total collection: ₹86,144 crore. Actual clean energy projects funded: ₹20,000 crore (23%). ₹47,000 crore diverted to IGST compensation for states — completely unrelated to the fund's mandate. This diversion was done through Finance Acts without public debate. CAG flagged it but Parliament did not act.",

    what_this_means_for_citizens: "India has 14 of the world's 20 most polluted cities. The money that could have funded clean energy projects and pollution control was used for something entirely different. India also internationally pledges clean energy transition at COP conferences while simultaneously diverting the clean energy fund.",

    international_comparison: "Germany's Renewable Energy Surcharge: 100% ring-fenced for renewables by law. UK's Climate Change Levy: 97% used for energy efficiency. EU ETS Carbon Fund: 70% mandated for climate projects. India NCEF: 23% used for clean energy; 54% diverted to unrelated fiscal transfers.",

    timeline_events: [
      {
        event_year: 2010,
        event_date: "2010-04-01",
        event_title: "Clean Energy Cess Established at ₹50/tonne",
        event_description: "Cess levied on domestic and imported coal to finance renewable R&D.",
        event_type: "approval"
      },
      {
        event_year: 2017,
        event_date: "2017-07-01",
        event_title: "GST Transition: ₹47,000 Cr Diverted to Compensation Fund",
        event_description: "Finance Ministry diverts majority of accrued coal cess into Goods & Services Tax compensation pool.",
        event_type: "diversion"
      },
      {
        event_year: 2018,
        event_date: "2018-08-07",
        event_title: "CAG Financial Audit Flags Illegal Earmark Bypass",
        event_description: "CAG report tabled in Lok Sabha notes fund purpose was subverted without statutory amendment debate.",
        event_type: "audit",
        source_url: "https://cag.gov.in"
      }
    ]
  },

  // ===============================================
  // SCAM 5: AYUSHMAN BHARAT GHOST ACCOUNTS
  // ===============================================
  {
    slug: "ayushman-bharat-ghost-beneficiaries",
    title: "Ayushman Bharat: 7.49 Lakh Patients Registered to Phone Number 9999999999",
    subtitle: "₹24+ crore authorized to ghost accounts; hospitals bill deceased patients",
    category: "Healthcare Fraud",
    severity: "Severe",

    amount_allocated_crore: 7200.0,
    amount_misused_crore: 24.0,
    amount_recovered_crore: 231.0,
    ghost_beneficiaries: 749000,
    total_beneficiaries_claimed: 500000000,

    scheme_name: "Ayushman Bharat PM-JAY (Pradhan Mantri Jan Arogya Yojana)",
    ministry: "Ministry of Health and Family Welfare",
    period_start: 2018,
    period_end: 2024,

    audit_body: "CAG",
    audit_report_ref: "CAG Performance Audit Report on AB-PMJAY 2023 — Report No. 7 of 2023",
    audit_year: 2023,
    source_url: "https://cag.gov.in/uploads/download_audit_report/2023/Report_No_7_of_2023_PA_on_Ayushman_Bharat.pdf",
    source_name: "CAG Report No. 7 of 2023",

    responsible_ministry: "Ministry of Health and Family Welfare",
    responsible_politicians: [
      {
        name: "Mansukh Mandaviya",
        role: "Health Minister 2021-2024",
        slug: "mansukh-mandaviya-porbandar",
        party: "BJP"
      },
      {
        name: "J P Nadda",
        role: "Health Minister 2014-2019 & 2024-present",
        slug: "jagat-prakash-nadda",
        party: "BJP"
      },
    ],

    current_status: "1,000+ hospitals de-empanelled. ₹231 crore in penalties. Doctor arrested in Gujarat for unnecessary surgeries.",
    action_taken: "NHA tightened verification. Biometric authentication made mandatory in 2024. Over 1,000 hospitals de-empanelled.",
    money_recovered_crore: 231,

    summary: "The CAG's 2023 audit of Ayushman Bharat — the world's largest government health insurance scheme covering 50 crore Indians — found 7.49 lakh beneficiaries registered to a single fake phone number (9999999999). Claims were processed for patients officially declared dead in earlier government records. ₹24+ crore was authorized to duplicate and ghost credentials. A Gujarat doctor was later arrested for performing unnecessary heart surgeries on villagers to siphon PMJAY funds.",

    detailed_explanation: "CAG findings: (1) 7,49,820 beneficiaries linked to mobile number 9999999999 — a clearly fake number. (2) Payments cleared for patients whose death was already recorded in government databases. (3) Hospital bills submitted for dates after discharge or death. (4) Same Aadhaar number used by multiple beneficiaries. (5) Duplicate Aadhaar-family ID linkages enabling double-billing. (6) As of 2024: a 'murder for money' racket was discovered in Gujarat where doctors performed medically unnecessary cardiac surgeries on poor villagers to generate false PMJAY claims. Over 1,000 hospitals de-empanelled across India.",

    what_this_means_for_citizens: "Ayushman Bharat is India's biggest pro-poor health scheme. When hospitals game it, two things happen: (1) Actual poor patients get denied treatment because fraudulent claims exhaust hospital quotas. (2) Public trust in the scheme collapses, reducing genuine enrolment.",

    international_comparison: "US Medicare fraud: ~1.6% estimated. UK NHS fraud: ~0.5% of budget. Canada Medicare fraud: ~0.2%. Australia Medicare: ~0.1%. India PMJAY fraud rate pre-2024: estimated 8-12% of claims based on CAG findings.",

    timeline_events: [
      {
        event_year: 2018,
        event_date: "2018-09-23",
        event_title: "PMJAY Launched Nationwide",
        event_description: "Scheme rolled out promising ₹5 lakh health cover per family for 50 crore low-income citizens.",
        event_type: "approval"
      },
      {
        event_year: 2023,
        event_date: "2023-08-08",
        event_title: "CAG Report No. 7 Exposed Ghost Beneficiaries",
        event_description: "Audit uncovers 7.49 lakh registrations on 9999999999 and posthumous payout approvals.",
        event_type: "audit",
        source_url: "https://cag.gov.in"
      },
      {
        event_year: 2024,
        event_date: "2024-11-12",
        event_title: "Gujarat Hospital Racket Arrests",
        event_description: "State police arrest medical directors for non-consensual angioplasty surgeries done purely to bill PMJAY.",
        event_type: "action"
      }
    ]
  },

  // ===============================================
  // SCAM 6: NHAI TOLL OVER-COLLECTION
  // ===============================================
  {
    slug: "nhai-toll-over-collection",
    title: "NHAI Toll Scam: Collecting Toll on Fully Paid-Off Highways — For Years",
    subtitle: "Commuters charged tolls on roads whose construction costs were 100% recovered",
    category: "Public Revenue Fraud",
    severity: "Serious",

    amount_allocated_crore: 2500.0,
    amount_misused_crore: 2500.0,
    amount_recovered_crore: 0,
    corruption_percent: 100,

    scheme_name: "National Highway Toll Collection — Post Cost Recovery",
    ministry: "Ministry of Road Transport and Highways / NHAI",
    period_start: 2018,
    period_end: 2023,

    audit_body: "CAG",
    audit_report_ref: "CAG Report No. 16 of 2023 on Bharatmala + CAG Report on NHAI Toll Collection Tamil Nadu and Haryana stretches",
    audit_year: 2023,
    source_url: "https://cag.gov.in",
    source_name: "CAG Report No. 16 of 2023",

    responsible_ministry: "Ministry of Road Transport and Highways",
    responsible_politicians: [
      {
        name: "Nitin Gadkari",
        role: "Road Transport Minister 2014-present",
        slug: "nitin-jairam-gadkari-nagpur",
        party: "BJP"
      },
    ],

    current_status: "CAG flagged specific stretches. NHAI gave clarifications. Toll collection continues on some flagged stretches.",
    action_taken: "NHAI reviewed some toll plazas. Partial reduction in rates on flagged stretches. No refunds to citizens.",
    money_recovered_crore: 0,

    summary: "Under Indian law, tolls on national highways can only be collected until the construction cost is fully recovered from commuters, after which the road is essentially owned by the public. The CAG found that toll collection agencies continued collecting full toll fees on multiple highway stretches in Tamil Nadu and Haryana even after the capital cost had been 100% recovered — illegally extracting hundreds of crores from the public.",

    detailed_explanation: "Under NHAI's toll concession agreements, operators are allowed to collect tolls until project costs + reasonable return are recovered. After this, tolls must stop or rates must drastically reduce. CAG found specific stretches in Tamil Nadu and Haryana where: (1) Cost recovery was complete by 2018-2019. (2) Full toll collection continued until audit detection in 2022-2023. (3) Hundreds of crores collected post cost-recovery period. NHAI's response was that agreements allowed some additional collection — which CAG disputed as exceeding contractual terms.",

    what_this_means_for_citizens: "Every Indian who drives on a national highway pays toll. If the road's construction cost is already paid off and toll keeps being collected, commuters are paying twice for the same road. The collected excess toll goes to private concessionaires — not back to the government or public.",

    international_comparison: "Germany's Autobahn is mostly toll-free — fully funded by fuel taxes. USA federal highways: Congress mandates transparency reports on toll cost recovery. France: Toll contracts are publicly disclosed with recovery schedules. India: No public dashboard of toll recovery status exists despite RTI requests.",

    timeline_events: [
      {
        event_year: 2018,
        event_date: "2018-03-31",
        event_title: "Target Capital Cost Recovery Achieved",
        event_description: "Highways in Tamil Nadu & Haryana recover 100% of construction and initial maintenance expenditure.",
        event_type: "approval"
      },
      {
        event_year: 2022,
        event_date: "2022-09-14",
        event_title: "CAG Inspection of Toll Plazas",
        event_description: "Field audits determine toll plazas continued charging full rates for 4+ years past amortization.",
        event_type: "audit"
      },
      {
        event_year: 2023,
        event_date: "2023-08-10",
        event_title: "CAG Bharatmala & Toll Audit Tabled",
        event_description: "Parliament informed of ₹2,500+ crore collected without legal concessionaire justification.",
        event_type: "parliament",
        source_url: "https://cag.gov.in"
      }
    ]
  },

  // ===============================================
  // SCAM 7: MINOR HEAD 800 — ₹54,282 CRORE HIDDEN
  // ===============================================
  {
    slug: "minor-head-800-unaccounted-expenditure",
    title: "Minor Head 800: ₹54,282 Crore Hidden in Catch-All Budget Category — Bypassing Parliament",
    subtitle: "Ministries dump tens of thousands of crores under 'Other Expenditure' to avoid scrutiny",
    category: "Financial Irregularity",
    severity: "Severe",

    amount_allocated_crore: 54282.32,
    amount_misused_crore: 54282.32,
    amount_recovered_crore: 0,
    corruption_percent: 100,

    scheme_name: "Union Government Expenditure Accounting — Minor Head 800 'Other Expenditure'",
    ministry: "Ministry of Finance (All Central Ministries)",
    period_start: 2018,
    period_end: 2025,

    audit_body: "CAG",
    audit_report_ref: "CAG Financial Audit Report on Accounts of the Union Government 2024-25 — Tabled in Parliament April 2026. Flags ₹54,282.32 crore in unaccounted Central expenditure.",
    audit_year: 2026,
    source_url: "https://cag.gov.in",
    source_name: "CAG Report on Union Government Accounts 2024-25 (April 2026)",

    responsible_ministry: "Ministry of Finance",
    responsible_politicians: [
      {
        name: "Nirmala Sitharaman",
        role: "Finance Minister 2019-present",
        slug: "nirmala-sitharaman",
        party: "BJP"
      },
    ],

    current_status: "Flagged in every annual CAG audit for 7+ consecutive years. No structural reform implemented.",
    action_taken: "Finance Ministry issues circular instructions periodically. Compliance near zero.",
    money_recovered_crore: 0,

    summary: "Every year, India's Finance Ministry and central ministries book tens of thousands of crores of government expenditure under 'Minor Head 800 — Other Expenditure' — an omnibus catch-all accounting category designed for small miscellaneous items. By parking spending here, ministries bypass Parliament's line-item scrutiny. The CAG flagged ₹54,282.32 crore in unaccounted expenditure under this heading in its 2024-25 Union Government audit, tabled in Parliament in April 2026. Over 50% of some ministries' expenditure is classified under this single opaque head.",

    detailed_explanation: "Indian government accounting requires that expenditure be booked under specific budget heads so Parliament knows where money went. Minor Head 800 is meant for small, genuinely miscellaneous items. Instead: 50%+ of expenditure under major heads in several ministries is booked here. ₹4,957.58 crore in expenditure and ₹4,087.43 crore in receipts were misclassified in 2024-25 alone. Total unaccounted: ₹54,282.32 crore. This is equivalent to India's entire science and technology budget being made invisible to Parliamentary oversight. CAG has flagged this practice every year for over a decade. No minister has been held accountable.",

    what_this_means_for_citizens: "Parliament debates and approves the budget line by line. When ₹54,000 crore is hidden under 'Other Expenditure', Parliament cannot ask: where specifically did this money go? Who benefited? Was it used for its stated purpose? This is the accounting trick that makes corruption impossible to track.",

    international_comparison: "UK HM Treasury: All expenditure above £100,000 must be individually reported. USA OMB: Zero tolerance for omnibus accounting above $500,000 — mandatory programmatic reporting. Germany: Federal Court of Audit flags any unclassified expenditure above €50,000. India: ₹54,282 crore classified as 'Other'.",

    timeline_events: [
      {
        event_year: 2018,
        event_date: "2018-04-01",
        event_title: "CAG First Formal Warning on Minor Head 800",
        event_description: "Audit highlights widespread booking of major program outlays under miscellaneous Head 800.",
        event_type: "audit"
      },
      {
        event_year: 2022,
        event_date: "2022-12-15",
        event_title: "Public Accounts Committee Issues Directives",
        event_description: "Parliamentary PAC directs Finance Ministry to open distinct accounting heads for major schemes.",
        event_type: "parliament"
      },
      {
        event_year: 2026,
        event_date: "2026-04-18",
        event_title: "CAG 2024-25 Union Accounts Report Tabled",
        event_description: "CAG reveals ₹54,282.32 crore remained buried under Head 800 across 16 central ministries.",
        event_type: "audit",
        source_url: "https://cag.gov.in"
      }
    ]
  },

  // ===============================================
  // SCAM 8: PMKVY SKILL INDIA — CERTIFICATE WITHOUT TRAINING
  // ===============================================
  {
    slug: "pmkvy-skill-india-fund-fraud",
    title: "Skill India PMKVY: 34 Lakh Trained on Paper — Never Got a Rupee",
    subtitle: "₹14,450 crore budget. Certificates issued. 36% emails bounced. Training centres shut before disbursement.",
    category: "Scheme Fraud",
    severity: "Serious",

    amount_allocated_crore: 14450.0,
    amount_misused_crore: 4000.0,
    amount_recovered_crore: 0,
    ghost_beneficiaries: 3400000,
    total_beneficiaries_claimed: 11000000,
    actual_beneficiaries: 7600000,
    corruption_percent: 27.68,

    scheme_name: "Pradhan Mantri Kaushal Vikas Yojana (PMKVY) — Skill India",
    ministry: "Ministry of Skill Development and Entrepreneurship",
    period_start: 2015,
    period_end: 2024,

    audit_body: "CAG",
    audit_report_ref: "CAG Performance Audit on PMKVY 2025 — Tabled December 2025",
    audit_year: 2025,
    source_url: "https://cag.gov.in",
    source_name: "CAG Report on PMKVY 2025",

    responsible_ministry: "Ministry of Skill Development and Entrepreneurship",
    responsible_politicians: [
      {
        name: "Dharmendra Pradhan",
        role: "Skill Development Minister 2021-present",
        slug: "dharmendra-pradhan-sambalpur",
        party: "BJP"
      },
      {
        name: "Mahendra Nath Pandey",
        role: "Skill Development Minister 2019-2021",
        slug: null,
        party: "BJP"
      },
    ],

    current_status: "CAG report tabled. Ministry disputed some findings. NSDC under review.",
    action_taken: "PMKVY 4.0 launched with revised guidelines. NSDC governance restructured.",
    money_recovered_crore: 0,

    summary: "The PM Kaushal Vikas Yojana aimed to skill 1.31 crore youth with a ₹14,450 crore budget. Certificates were issued to 1.1 crore individuals. But the CAG found 34 lakh beneficiaries never received any money. When the CAG emailed beneficiaries to verify, 36.51% of emails bounced back as undeliverable — fake or incorrect email IDs registered by training partners. Funds were released for training at centres that had already shut down.",

    detailed_explanation: "CAG findings: (1) 34 lakh certified beneficiaries received zero financial disbursement despite records showing training completion. (2) 36.51% of beneficiary emails were undeliverable — indicating fake registrations. (3) Same email address linked to multiple beneficiaries — training partners gaming the system. (4) Money released in names of trainees at training centres that were already closed. (5) Placement claims made for trainees who were never employed. (6) Quality assessment agencies certified trainees without actual skill verification.",

    what_this_means_for_citizens: "Millions of unemployed youth were promised skill training and certification. Many received certificates but no actual training, no job placement support, and no stipend money. The scheme was designed to show impressive numbers — 1.1 crore certified — while the actual impact on employment was minimal.",

    international_comparison: "Germany's apprenticeship system (Berufsausbildung): 95% employment rate post-completion. South Korea's vocational training: 88% job placement rate. China's vocational training: 82% employment within 6 months. India PMKVY: CAG estimated actual job placement at under 15% of certified trainees.",

    timeline_events: [
      {
        event_year: 2015,
        event_date: "2015-07-15",
        event_title: "Skill India Mission Inaugurated",
        event_description: "Target set to train 1.31 crore youth under NSDC public-private partnership model.",
        event_type: "approval"
      },
      {
        event_year: 2021,
        event_date: "2021-01-15",
        event_title: "PMKVY 3.0 Launched Amid Placement Queries",
        event_description: "New phase initiated while Parliamentary committees question actual job conversion data.",
        event_type: "parliament"
      },
      {
        event_year: 2025,
        event_date: "2025-12-08",
        event_title: "CAG Performance Audit Tabled in Parliament",
        event_description: "Audit uncovers 34 lakh ghost trainees and 36.5% email verification failure rate.",
        event_type: "audit",
        source_url: "https://cag.gov.in"
      }
    ]
  },

  // ===============================================
  // SCAM 9: CAMPA FUND — FOREST MONEY LOCKED
  // ===============================================
  {
    slug: "campa-fund-forest-money-locked",
    title: "CAMPA Fund: ₹50,000 Crore for Forest Regeneration — Sitting in Bank Accounts",
    subtitle: "Every tree cut for a highway or mine generates money for replanting. The money never plants trees.",
    category: "Environmental Fund Misuse",
    severity: "Serious",

    amount_allocated_crore: 50000.0,
    amount_unspent_crore: 35000.0,
    amount_misused_crore: 35000.0,
    amount_recovered_crore: 0,
    corruption_percent: 70.0,

    scheme_name: "Compensatory Afforestation Fund Management and Planning Authority (CAMPA)",
    ministry: "Ministry of Environment, Forest and Climate Change",
    period_start: 2002,
    period_end: 2024,

    audit_body: "Supreme Court of India + CAG",
    audit_report_ref: "Supreme Court in Godavarman Thirumulpad vs Union of India — WP(C) 202/1995. SC ordered CAMPA funds to be released from ad-hoc CAMPA to State CAMPAs via the CAMPA Act 2016.",
    court_case_ref: "WP(C) 202/1995 — T.N. Godavarman Thirumulpad vs UoI — Supreme Court of India",
    audit_year: 2023,
    source_url: "https://main.sci.gov.in",
    source_name: "Supreme Court of India — Godavarman case",

    responsible_ministry: "Ministry of Environment, Forest and Climate Change",
    responsible_politicians: [
      {
        name: "Bhupender Yadav",
        role: "Environment Minister 2021-present",
        slug: "bhupender-yadav-alwar",
        party: "BJP"
      },
    ],

    current_status: "CAMPA Act 2016 passed. State CAMPAs created. Partial disbursement. Significant funds still unspent.",
    action_taken: "Supreme Court ordered fund transfer. CAMPA Act passed in 2016 after 14 years of SC monitoring. States still struggling to utilise.",
    money_recovered_crore: 0,

    summary: "When a company cuts forest for mining, highway, or dam construction, it must pay a fee into the CAMPA fund for replanting equivalent forest elsewhere — a principle called compensatory afforestation. Over ₹50,000 crore has been collected this way. Yet thousands of crores sat in bank accounts and Public Account of India rather than regenerating actual forest cover. The Supreme Court was forced to intervene in a case that has been running since 1995.",

    detailed_explanation: "The National CAMPA was created via Supreme Court order in 2002. By 2016, ₹42,000 crore had accumulated but over ₹38,000 crore was locked in the Public Account of India — technically outside government budget and invisible to Parliamentary scrutiny. CAMPA Act 2016 finally transferred money to states. But state-level utilisation remained low: Forest departments lacked capacity. Afforestation targets set but monitoring absent. Plantations on paper often showed survival rates below 20% due to lack of follow-up maintenance.",

    what_this_means_for_citizens: "India loses 1,500 sq km of forest annually to infrastructure and industrial projects. CAMPA's mandate is to ensure net-zero forest loss. Instead, forest is lost AND the money meant to regenerate it sits unused. India's forest cover target under NDC (Nationally Determined Contribution) to the Paris Agreement — 2.5-3 billion tonnes of carbon sink by 2030 — depends on this fund working.",

    international_comparison: "Brazil's REDD+ biodiversity fund: 90% disbursement within 2 years. Germany's reforestation after logging: mandatory within 1 year. USA Tree Equity Act funding: 95% disbursement rate. India CAMPA: ~30% utilisation over 20 years of collection.",

    timeline_events: [
      {
        event_year: 2002,
        event_date: "2002-10-30",
        event_title: "Supreme Court Mandates Ad-hoc CAMPA",
        event_description: "Apex court creates ad-hoc body to pool compensatory afforestation collections.",
        event_type: "court"
      },
      {
        event_year: 2016,
        event_date: "2016-08-03",
        event_title: "Parliament Passes CAMPA Act 2016",
        event_description: "Act authorizes distribution of ₹42,000 crore locked in central bank accounts to states.",
        event_type: "parliament"
      },
      {
        event_year: 2023,
        event_date: "2023-09-12",
        event_title: "CAG Compliance Report on Afforestation",
        event_description: "Audit shows tree survival rate on paper-afforested plots remains under 20% across 9 states.",
        event_type: "audit",
        source_url: "https://cag.gov.in"
      }
    ]
  },

  // ===============================================
  // SCAM 10: WEST BENGAL ₹2.29 LAKH CRORE UNACCOUNTED
  // ===============================================
  {
    slug: "west-bengal-utilisation-certificates-missing",
    title: "West Bengal: ₹2,29,099 Crore in Funds With No Utilisation Certificates",
    subtitle: "CAG cannot verify if ₹2.29 lakh crore of central funds were spent correctly or at all",
    category: "State Government Fraud",
    severity: "Severe",

    amount_allocated_crore: 229099.0,
    amount_misused_crore: 229099.0,
    amount_recovered_crore: 0,
    corruption_percent: 100,

    scheme_name: "Multiple Central Schemes — Panchayat, Education, Urban Development",
    ministry: "Government of West Bengal (Multiple Departments)",
    period_start: 2015,
    period_end: 2021,

    audit_body: "CAG",
    audit_report_ref: "CAG Report on Finances of Government of West Bengal 2020-21. PIL filed in Calcutta High Court January 2023.",
    court_case_ref: "PIL in Calcutta High Court — Filed January 2023 by Jagannath Chattopadhyay and others",
    audit_year: 2022,
    source_url: "https://cag.gov.in",
    source_name: "CAG Report — West Bengal Finances 2020-21",

    responsible_ministry: "Government of West Bengal",
    responsible_politicians: [
      {
        name: "Mamata Banerjee",
        role: "Chief Minister of West Bengal 2011-present",
        slug: "mamata-banerjee",
        party: "AITC"
      },
    ],

    current_status: "PIL pending in Calcutta High Court. State government contests methodology. CAG findings not disputed on quantum.",
    action_taken: "Calcutta HC issued notices. CBI investigation into specific schemes. Partial UC submission after court orders.",
    money_recovered_crore: 0,

    summary: "The CAG of India audited West Bengal's finances for 2020-21 and found that Utilisation Certificates (UCs) — government documents proving that central grant money was actually spent on its stated purpose — had NOT been received for ₹2,29,099 crore. The three worst offenders: Panchayat & Rural Development Department (₹81,839 crore), School Education Department (₹36,850 crore), Urban Development Department (₹30,693 crore). Without UCs, it is impossible to verify whether this money reached beneficiaries or was misappropriated.",

    detailed_explanation: "Utilisation Certificates are the primary accountability mechanism for central government grants to states. They confirm money was spent as intended. CAG found: ₹81,839 crore — Panchayat & Rural Development (MGNREGA, rural schemes). ₹36,850 crore — School Education (mid-day meals, Samagra Shiksha). ₹30,693 crore — Urban Development (smart city, AMRUT). Total missing UCs: ₹2,29,099 crore. This doesn't necessarily mean all money was stolen — it means the state cannot prove it wasn't. The absence of UCs is itself a legal violation under GFR 2017.",

    what_this_means_for_citizens: "In West Bengal, over 1 crore MGNREGA workers are supposed to get minimum wage work. Children in lakhs of schools are supposed to get mid-day meals. Cities are supposed to get smart infrastructure. When UCs are missing for ₹2.29 lakh crore, citizens have no way to know if any of this happened.",

    international_comparison: "UK: Any grant above £10,000 to local authorities requires quarterly utilisation reports. USA: Federal grants require annual single audits — failure results in fund clawback. EU: Structural funds require 100% utilisation documentation — no documentation = automatic recovery. India: Missing UCs for ₹2.29 lakh crore result in a CAG report and a PIL — no automatic recovery.",

    timeline_events: [
      {
        event_year: 2015,
        event_date: "2015-04-01",
        event_title: "Central Grants Transferred to State Departments",
        event_description: "Central ministries disburse welfare and rural development grants under GFR rules.",
        event_type: "approval"
      },
      {
        event_year: 2022,
        event_date: "2022-11-18",
        event_title: "CAG State Finances Report Released",
        event_description: "CAG report flags missing Utilisation Certificates for ₹2,29,099 crore over 6 fiscal years.",
        event_type: "audit",
        source_url: "https://cag.gov.in"
      },
      {
        event_year: 2023,
        event_date: "2023-01-20",
        event_title: "Calcutta High Court Directs Investigation",
        event_description: "Public Interest Litigation admitted; court demands department-wise accounting submission.",
        event_type: "court"
      }
    ]
  },
];

// ===============================================
// INFRASTRUCTURE COST BENCHMARK DATA
// ===============================================
export interface InfrastructureCostItem {
  label: string;
  unit: string;
  india_normal: number;
  india_worst_case: { project: string; cost: number };
  china: number;
  usa: number;
  germany: number;
  brazil: number;
  south_africa: number;
  uk: number;
  australia: number;
}

export const INFRASTRUCTURE_COST_DATA: Record<string, InfrastructureCostItem> = {
  highway_4lane: {
    label: "4-Lane National Highway (per km)",
    unit: "₹ Crore per km",
    india_normal: 20,
    india_worst_case: { project: "Dwarka Expressway (8-Lane Elev.)", cost: 250 },
    china: 6,
    usa: 50,
    germany: 80,
    brazil: 15,
    south_africa: 12,
    uk: 70,
    australia: 55,
  },
  metro_rail: {
    label: "Metro Rail (per km, underground)",
    unit: "₹ Crore per km",
    india_normal: 350,
    india_worst_case: { project: "Mumbai Metro Line 3", cost: 680 },
    china: 120,
    usa: 1200,
    germany: 450,
    brazil: 350,
    south_africa: 280,
    uk: 1800,
    australia: 900,
  },
  airport: {
    label: "Greenfield Airport (per mppa capacity)",
    unit: "₹ Crore per million passengers per annum",
    india_normal: 150,
    india_worst_case: { project: "Noida International Airport", cost: 380 },
    china: 80,
    usa: 500,
    germany: 350,
    brazil: 120,
    south_africa: 130,
    uk: 600,
    australia: 400,
  },
  hospital: {
    label: "Government Hospital (per bed)",
    unit: "₹ Lakh per bed",
    india_normal: 25,
    india_worst_case: { project: "AIIMS Expansion Projects", cost: 85 },
    china: 15,
    usa: 200,
    germany: 120,
    brazil: 30,
    south_africa: 40,
    uk: 150,
    australia: 160,
  },
  solar_plant: {
    label: "Utility-Scale Solar Power (per MW)",
    unit: "₹ Crore per MW",
    india_normal: 4.5,
    india_worst_case: { project: "State Solar Tenders (Peak)", cost: 12 },
    china: 3.0,
    usa: 6.0,
    germany: 7.0,
    brazil: 4.2,
    south_africa: 5.0,
    uk: 8.0,
    australia: 7.5,
  },
};

export function getScamBySlug(slug: string): ScamCase | undefined {
  return SCAM_CASES_DATA.find((c) => c.slug === slug);
}

export function getMoneyTrailStats() {
  const totalScams = SCAM_CASES_DATA.length;
  let totalExposed = 0;
  let totalMisused = 0;
  let totalUnspent = 0;
  let totalDiverted = 0;
  let totalRecovered = 0;

  const byCategory: Record<string, { count: number; total_amount: number }> = {};
  const bySeverity: Record<string, number> = {};
  const byMinistry: Record<string, number> = {};

  SCAM_CASES_DATA.forEach((scam) => {
    const allocated = scam.amount_allocated_crore || scam.amount_misused_crore || 0;
    const misused = scam.amount_misused_crore || 0;
    const unspent = scam.amount_unspent_crore || 0;
    const diverted = scam.amount_diverted_crore || 0;
    const recovered = scam.amount_recovered_crore || scam.money_recovered_crore || 0;

    totalExposed += allocated;
    totalMisused += misused;
    totalUnspent += unspent;
    totalDiverted += diverted;
    totalRecovered += recovered;

    // Category
    if (!byCategory[scam.category]) {
      byCategory[scam.category] = { count: 0, total_amount: 0 };
    }
    byCategory[scam.category].count += 1;
    byCategory[scam.category].total_amount += allocated;

    // Severity
    bySeverity[scam.severity] = (bySeverity[scam.severity] || 0) + 1;

    // Ministry
    const min = scam.responsible_ministry || "Other";
    byMinistry[min] = (byMinistry[min] || 0) + allocated;
  });

  return {
    total_scams: totalScams,
    total_amount_misused_crore: totalMisused,
    total_amount_unspent_crore: totalUnspent,
    total_amount_diverted_crore: totalDiverted,
    grand_total_crore: totalExposed,
    amount_recovered_crore: totalRecovered,
    recovery_rate_percent: totalExposed > 0 ? (totalRecovered / totalExposed) * 100 : 0,
    by_category: byCategory,
    by_severity: bySeverity,
    by_ministry: byMinistry,
  };
}
