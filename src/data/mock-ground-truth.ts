import { GroundTruthArticle } from "@/types";

export const MOCK_GROUND_TRUTH_ARTICLES: GroundTruthArticle[] = [
  // ----------------------------------------------------------------------
  // 1. Environmental Investigation: Vapi Chemical Effluent Toxic Discharge
  // ----------------------------------------------------------------------
  {
    id: "gt-1",
    slug: "vapi-chemical-effluent-toxic-discharge",
    headline: "Unfiltered Chemical Effluents Poisoning Damanganga River: 40,000 Coastal Villagers Face Chronic Groundwater Contamination",
    tagline: "Industrial CETP bypass channels dump untreated azo dyes and heavy metals under the cover of monsoon night surges.",
    author: {
      name: "Rohitashwa Chakraborty",
      badge: "Verified Journalist",
      publication: "Civic Watch Gujarat & Down to Earth Contributor",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    },
    date: "2026-07-28",
    location: {
      state: "Gujarat",
      district: "Valsad",
      block: "Vapi Industrial Belt",
      coordinates: [20.3893, 72.9106],
    },
    category: "Industrial & Environmental",
    affectedPeopleCount: 42000,
    status: "Ongoing",
    summary:
      "A 6-month investigative probe reveals midnight valve dumping by chemical dye units directly bypassing Common Effluent Treatment Plants into the Damanganga estuary, causing extreme cadmium and lead spikes in village borewells.",
    thumbnailUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80",
    readTimeMinutes: 7,
    body: `### The Midnight Bypass Valves of GIDC Vapi

For over three decades, the Vapi industrial cluster in Southern Gujarat has stood as one of South Asia's densest chemical manufacturing hubs. However, laboratory test reports obtained through Right to Information (RTI) petitions and clandestine drone water sampling along the Damanganga tidal estuary uncover a catastrophic regulatory evasion.

During high tide and heavy monsoon rainfall, automated bypass valves at three intermediary pump stations are routinely opened between 01:00 AM and 04:30 AM. Untreated effluents containing heavy concentrations of **Cadmium, Chromium (VI), Azo Dyes, and aromatic amines** discharge directly into natural drainage nullahs rather than routing through the mandatory Central Effluent Treatment Plant (CETP).

\`\`\`
Sample Point: Nullah-4 Discharge Estuary (Bypassing CETP Stage 3)
Chemical Oxygen Demand (COD): 4,820 mg/L (Permissible: 250 mg/L) — 1,928% over limit
Total Dissolved Solids (TDS): 14,200 mg/L (Permissible: 2,100 mg/L)
Lead (Pb) Concentration: 0.84 mg/L (Permissible: 0.1 mg/L)
\`\`\`

### Health Catastrophe in Downstream Fishing Settlements

In the downstream fishing hamlets of Salvav, Chanod, and Morai, local health clinics record alarming surges in chronic kidney disease (CKD), severe dermatological lesions, and miscarriages among women consuming handpump groundwater.

> *"We can no longer use the well water even to wash our fishing nets. The water smells like rotten sulphur and turns white clothes yellowish-brown in twenty minutes."*
> — **Rameshbhai Tandel**, Chairperson, Damanganga Fisherfolk Welfare Cooperative.

### Regulatory Complicity & Missing Sensor Logs

Despite Central Pollution Control Board (CPCB) mandates ordering continuous online effluent monitoring systems (OCEMS), inspection dockets reveal that telemetry data transmission from 18 high-polluting chemical units was offline for 114 days during the preceding financial year without attracting closure notices or penalty recovery.`,
    evidence: [
      {
        id: "ev-1-1",
        title: "Gujarat Pollution Control Board RTI Audit (Ref: GPCB/RTI/2026/VAL-882)",
        type: "RTI Response",
        url: "https://gpcb.gujarat.gov.in",
        fileSize: "4.2 MB",
        date: "2026-06-14",
        summary: "Reveals 114 days of telemetry blackout from 18 chemical industrial units without inspection notices.",
      },
      {
        id: "ev-1-2",
        title: "Drone Infrared Imagery: Midnight Effluent Discharge at Morai Outfall",
        type: "Satellite Image",
        url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
        fileSize: "8.5 MB",
        date: "2026-07-02",
        summary: "Thermal heat mapping showing hot untreated chemical discharge entering tidal creek at 02:40 AM.",
      },
      {
        id: "ev-1-3",
        title: "Independent NABL Accredited Water Toxicity Analysis Report",
        type: "Official Document",
        url: "https://nabl-india.org",
        fileSize: "2.1 MB",
        date: "2026-07-15",
        summary: "Confirms heavy metal lead and cadmium levels 800% above BIS drinking water standards.",
      },
    ],
    responsiblePoliticianIds: ["vikramjeet-ranawat", "neta-8"],
    responsibleOfficialNames: [
      "Regional Environmental Engineer, GPCB Valsad",
      "Executive Engineer, GIDC Infrastructure Water Supply",
    ],
    responsibleDepartments: [
      "Gujarat Pollution Control Board (GPCB)",
      "Department of Environment and Forest, Govt of Gujarat",
      "Ministry of Environment, Forest and Climate Change (MoEFCC)",
    ],
    impactTimeline: [
      {
        id: "imp-1-1",
        date: "2026-07-29",
        description: "Story published by Ground Truth investigation desk; shared over 14,000 times across regional civic networks.",
        sourceName: "Ground Truth Editorial",
      },
      {
        id: "imp-1-2",
        date: "2026-08-04",
        description: "National Green Tribunal (NGT) Principal Bench took suo motu cognizance and issued show-cause notices to GPCB.",
        sourceLink: "https://greentribunal.gov.in",
        sourceName: "NGT Official Cause List",
      },
      {
        id: "imp-1-3",
        date: "2026-08-11",
        description: "GPCB raided 6 industrial units in Morai and sealed 2 illegal bypass discharge pumps.",
        sourceName: "Gujarat Samachar",
      },
    ],
    demands:
      "1. Immediate 24/7 biometric locking and sealing of all clandestine bypass gates.\n2. Independent CPCB surveillance team stationed in Vapi for 60 consecutive days.\n3. Supply of piped municipal reverse osmosis drinking water to Salvav, Chanod, and Morai villages funded by polluter penalties.\n4. Criminal prosecution under the Water (Prevention and Control of Pollution) Act against factory directors.",
    upvotes: 1842,
    affectedVotes: 641,
    rtiTemplate: {
      subject: "Application under RTI Act 2005 seeking OCEMS sensor logs and inspection records for Vapi CETP",
      publicAuthority: "Public Information Officer, Gujarat Pollution Control Board, Gandhinagar",
      pioAddress: "Paryavaran Bhavan, Sector 10-A, Gandhinagar - 382010, Gujarat",
      queries: [
        "Provide daily log files of Chemical Oxygen Demand (COD) and Total Dissolved Solids (TDS) recorded at Vapi CETP inlet and outlet between Jan 1, 2026 and June 30, 2026.",
        "Provide certified copies of all surprise inspection reports and closure notices issued to chemical units in GIDC Vapi Stage I & II during the same period.",
        "Provide the total penalty amount levied under Section 33A of the Water Act and the actual amount collected to date.",
      ],
    },
    is_interesting: true,
    unsolved_status: "hearing_scheduled",
    days_since_first_reported: 39,
    last_checked_at: "2026-09-04T10:00:00Z",
    case_reference: "NGT/PB/O.A. 412/2026",
    source_name: "The Reporters' Collective",
    source_url: "https://www.reporters-collective.in/stories/vapi-effluents",
  },

  // ----------------------------------------------------------------------
  // 2. Contractor Nexus & Infrastructure Fraud: Bundelkhand Highway Cracks
  // ----------------------------------------------------------------------
  {
    id: "gt-2",
    slug: "bundelkhand-highway-embankment-collapse",
    headline: "₹450 Crore Embankment Washed Away in First Monsoon: The Benami Contractor Web in Bundelkhand",
    tagline: "Substandard bituminous layering and ghost soil compaction tenders awarded to political front companies collapse within 60 days of inauguration.",
    author: {
      name: "Prabhat Ranjan",
      badge: "Independent Reporter",
      publication: "UP Accountability Project",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    },
    date: "2026-08-02",
    location: {
      state: "Uttar Pradesh",
      district: "Varanasi",
      block: "Jaunpur-Varanasi Link",
      coordinates: [25.3176, 82.9739],
    },
    category: "Infrastructure & Contractor Fraud",
    affectedPeopleCount: 180000,
    status: "Government Action Pending",
    summary:
      "Field inspections and soil engineering core drills reveal that ₹42 Crore allocated for geotextile slope stabilization was pocketed through sub-contracts awarded to domestic staff of sitting lawmaker Rameshwar Singh.",
    thumbnailUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80",
    readTimeMinutes: 6,
    body: `### The Disappearing Highway Embankments of Eastern UP

Constructed at a budget of ₹14.8 Crore per kilometer, the newly widened four-lane corridor connecting agricultural mandis in Jaunpur to the Varanasi cargo terminal was advertised as a flagship infrastructure marvel.

However, less than 60 days after its ceremonial opening, a 400-meter stretch of the bridge approach road caved in following a moderate 45mm rainfall event, exposing hollow gravel sub-bases and complete absence of mandatory geosynthetic slope reinforcement mats.

### The Shell Contractor Network

Corporate registration dockets accessed from the Ministry of Corporate Affairs (MCA) uncover that the primary geotechnical sub-contract was awarded to *M/s Maa Vindhyavasini Earthworks*, an entity incorporated in 2021 with paid-up capital of only ₹1 Lakh.

The registered directors of the firm are domestic helpers and drivers employed at the rural estate of sitting Member of Parliament **Rameshwar Singh**, directly violating Section 13(1)(d) of the Prevention of Corruption Act.`,
    evidence: [
      {
        id: "ev-2-1",
        title: "Ministry of Corporate Affairs (MCA) Shareholding Pattern Dockets",
        type: "Official Document",
        url: "https://mca.gov.in",
        fileSize: "3.1 MB",
        date: "2026-07-20",
        summary: "Proves benami ownership link connecting highway sub-contractors to political residence staff.",
      },
      {
        id: "ev-2-2",
        title: "Site Core Drilling Geotechnical Failure Photos",
        type: "Photo",
        url: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80",
        fileSize: "6.4 MB",
        date: "2026-07-25",
        summary: "Photographic proof showing zero bituminous foundation depth and hollow gravel fill.",
      },
    ],
    responsiblePoliticianIds: ["rameshwar-singh", "neta-2"],
    responsibleOfficialNames: [
      "Chief Engineer, National Highways Division, PWD Varanasi",
      "Executive Quality Control Auditor, State Road Development Corporation",
    ],
    responsibleDepartments: [
      "Public Works Department (PWD), Uttar Pradesh",
      "State Vigilance Commission, Lucknow",
    ],
    impactTimeline: [
      {
        id: "imp-2-1",
        date: "2026-08-03",
        description: "Ground Truth report presented to UP Assembly Public Accounts Committee (PAC).",
        sourceName: "PAC Assembly Secretariat",
      },
      {
        id: "imp-2-2",
        date: "2026-08-09",
        description: "PWD Minister ordered an independent structural inquiry by IIT BHU Civil Engineering Dept.",
        sourceName: "Hindustan Times",
      },
    ],
    demands:
      "1. IIT BHU independent core testing across all 48 km of the highway corridor.\n2. CBI investigation into benami company incorporation and money laundering under PMLA.\n3. Blacklisting of all contractor entities associated with the shell network.",
    upvotes: 2410,
    affectedVotes: 912,
    rtiTemplate: {
      subject: "RTI seeking technical inspection reports and contractor payment vouchers for Jaunpur-Varanasi Link Corridor",
      publicAuthority: "Public Information Officer, Office of the Chief Engineer, PWD Varanasi",
      pioAddress: "PWD Campus, Kachehri Road, Varanasi - 221002, Uttar Pradesh",
      queries: [
        "Provide certified copies of all Quality Control test certificates for bituminous concrete layer thickness submitted by third-party inspection agencies.",
        "Provide certified copies of all running bill payment vouchers released to M/s Maa Vindhyavasini Earthworks between Jan 2024 and June 2026.",
      ],
    },
    is_interesting: true,
    unsolved_status: "under_investigation",
    days_since_first_reported: 44,
    last_checked_at: "2026-09-04T11:30:00Z",
    case_reference: "UP-LOK/INV/2026/89",
    source_name: "Indian Express",
    source_url: "https://indianexpress.com/article/india/bundelkhand-highway-cracks-probe-89211/",
  },

  // ----------------------------------------------------------------------
  // 3. Healthcare & Public Health: Ghost Doctors in Tribal Primary Clinics
  // ----------------------------------------------------------------------
  {
    id: "gt-3",
    slug: "ghost-doctors-tribal-health-clinics-guna",
    headline: "Zero Doctors for 72,000 Forest Dwellers: Biometric Fraud and Ghost Staff in Guna Primary Health Centres",
    tagline: "Doctors on government payrolls operate lucrative private nursing homes 180 km away in Bhopal while rural clinics remain locked with rusted chains.",
    author: {
      name: "Swati Sengupta",
      badge: "Citizen Reporter",
      publication: "Madhya Pradesh Rural Health Watch",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    },
    date: "2026-08-06",
    location: {
      state: "Madhya Pradesh",
      district: "Guna",
      block: "Chhabra-Raghogarh Forest Belt",
      coordinates: [24.6324, 77.3002],
    },
    category: "Healthcare & Public Health",
    affectedPeopleCount: 72000,
    status: "Partially Resolved",
    summary:
      "Surprise visits across 9 Primary Health Centres in the Gwalior-Guna tribal belt reveal silicone dummy finger biometric punch-ins, expired antivenom stocks, and zero MBBS doctors on duty for 14 straight months.",
    thumbnailUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
    readTimeMinutes: 5,
    body: `### The Locked Clinics of the Sahariya Tribal Settlements

The Sahariya indigenous tribe across Guna and Shivpuri districts faces some of India's highest rates of maternal anemia, childhood malnutrition, and seasonal snakebite fatalities.

Under the National Health Mission (NHM), nine Primary Health Centres (PHCs) and twenty-four sub-centres are officially funded with an annual recurring allocation of ₹18.4 Crore for medical officers, free generic pharmaceuticals, and 24/7 delivery room staff.

When citizen investigators conducted unannounced inspections with village panchayat sarpanches, **eight out of nine PHCs were locked from the outside**. At the Aaron tribal health centre, a local sweeper was found dispensing schedule-H antibiotics to pregnant women.`,
    evidence: [
      {
        id: "ev-3-1",
        title: "Video Inspection: Locked PHC Gates & Abandoned Labor Rooms in Guna",
        type: "Video",
        url: "https://youtube.com",
        fileSize: "14.2 MB",
        date: "2026-07-18",
        summary: "Verified video footage documenting locked consultation rooms and expired antivenom vials.",
      },
      {
        id: "ev-3-2",
        title: "NHM Biometric Attendance Log Discrepancy Sheet",
        type: "RTI Response",
        url: "https://nhm.mp.gov.in",
        fileSize: "1.8 MB",
        date: "2026-07-28",
        summary: "Shows perfect 100% biometric attendance on days doctors were physically seeing patients in Bhopal.",
      },
    ],
    responsiblePoliticianIds: ["digvijay-rathore", "neta-3"],
    responsibleOfficialNames: [
      "Chief Medical and Health Officer (CMHO), Guna",
      "District Program Manager, National Health Mission MP",
    ],
    responsibleDepartments: [
      "Department of Public Health and Family Welfare, Madhya Pradesh",
      "National Health Mission (NHM), Ministry of Health & Family Welfare",
    ],
    impactTimeline: [
      {
        id: "imp-3-1",
        date: "2026-08-07",
        description: "Investigation trended on national civic tech dashboards; MP Health Commissioner ordered immediate inspection.",
        sourceName: "Ground Truth Feed",
      },
      {
        id: "imp-3-2",
        date: "2026-08-14",
        description: "Four medical officers suspended and salaries of absentee staff frozen pending disciplinary tribunal.",
        sourceLink: "https://mp.gov.in",
        sourceName: "MP State Directorate of Health Services Order",
      },
    ],
    demands:
      "1. Deployment of permanent live GPS-enabled video attendance verification in all tribal PHCs.\n2. Compulsory rural service bond enforcement with immediate license cancellation for defaulting doctors.\n3. Emergency replenishment of antivenom and pediatric nutrition kits.",
    upvotes: 3120,
    affectedVotes: 1420,
    rtiTemplate: {
      subject: "RTI seeking attendance logs, salary disbursement vouchers, and drug inventory for Guna District PHCs",
      publicAuthority: "Public Information Officer, Office of the Chief Medical and Health Officer, Guna",
      pioAddress: "District Hospital Campus, Guna - 473001, Madhya Pradesh",
      queries: [
        "Provide daily attendance registers and salary withdrawal receipts for all medical officers posted at Aaron, Raghogarh, and Bamori PHCs for FY 2025-26.",
        "Provide the stock ledger of life-saving snake antivenom vials received and utilized across the district.",
      ],
    },
    is_interesting: false,
    unsolved_status: "no_action_taken",
    days_since_first_reported: 61,
    last_checked_at: "2026-09-03T09:00:00Z",
    case_reference: "FRA/MP/GUNA/2026/014",
    source_name: "The Hindu",
    source_url: "https://www.thehindu.com/news/national/other-states/guna-tribal-health-clinics-empty-phc/article682219.ece",
  },

  // ----------------------------------------------------------------------
  // 4. Water & Sanitation: Sinking Embankments in Sundarbans Delta
  // ----------------------------------------------------------------------
  {
    id: "gt-4",
    slug: "sundarbans-earthen-embankment-breach-sand-theft",
    headline: "Saline Inundation Destroys 12,000 Paddy Acres: Illegal Riverbed Sand Mining Weakens Sundarbans Climate Dykes",
    tagline: "Mechanized suction sand barges operating under political patronage hollow out river bottoms, causing catastrophic saline dyke breaches during cyclone tides.",
    author: {
      name: "Debabrata Majumdar",
      badge: "Verified Journalist",
      publication: "Bengal Delta Climate Investigation Bureau",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    },
    date: "2026-07-19",
    location: {
      state: "West Bengal",
      district: "South 24 Parganas",
      block: "Diamond Harbour & Kakdwip Delta",
      coordinates: [22.1965, 88.1906],
    },
    category: "Water & Sanitation",
    affectedPeopleCount: 65000,
    status: "Ongoing",
    summary:
      "Satellite riverbed bathymetry and ground surveys expose illegal mechanized sand mining within 100 meters of critical cyclone embankments, threatening 14 island panchayats with permanent saline land degradation.",
    thumbnailUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    readTimeMinutes: 6,
    body: `### The Eroding Lifelines of the Coastal Delta

In the low-lying estuaries of South 24 Parganas, earthen dykes constructed by the Irrigation and Waterways Department represent the sole barrier between saline tidal surges and freshwater paddy fields that sustain hundreds of thousands of islanders.

Under coastal regulation zone (CRZ) rules and National Green Tribunal directives, mechanized riverbed dredging is strictly prohibited within 500 meters of any flood embankment.

However, satellite imagery cross-verified with drone surveys reveals active nocturnal operations by over 40 mechanized suction dredgers pumping sand directly from the base of the Kakdwip embankment to supply urban Kolkata high-rise construction projects.`,
    evidence: [
      {
        id: "ev-4-1",
        title: "High-Resolution Satellite Bathymetry Diff Map (2023 vs 2026)",
        type: "Satellite Image",
        url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
        fileSize: "11.2 MB",
        date: "2026-06-30",
        summary: "Shows 8.4-meter river bottom depression within 60 meters of flood barrier footing.",
      },
      {
        id: "ev-4-2",
        title: "State Irrigation Department Official Safety Warning Memorandum",
        type: "Official Document",
        url: "https://wbiwd.gov.in",
        fileSize: "2.4 MB",
        date: "2026-07-04",
        summary: "Internal engineers memo warning that embankments could collapse during next tropical storm.",
      },
    ],
    responsiblePoliticianIds: ["anandita-banerjee", "neta-7"],
    responsibleOfficialNames: [
      "Executive Engineer, Irrigation and Waterways Division, Kakdwip",
      "District Land and Land Reforms Officer (DLLRO), Alipore",
    ],
    responsibleDepartments: [
      "Irrigation and Waterways Department, Govt of West Bengal",
      "Sundarban Affairs Department",
      "West Bengal Coastal Zone Management Authority (WBCZMA)",
    ],
    impactTimeline: [
      {
        id: "imp-4-1",
        date: "2026-07-20",
        description: "Report published; local MP Anandita Banerjee raised delta protection fund demand in Lok Sabha.",
        sourceName: "Parliament Transcripts",
      },
      {
        id: "imp-4-2",
        date: "2026-08-01",
        description: "District administration impounded 12 illegal sand barges in joint police-coast guard operation.",
        sourceName: "The Telegraph",
      },
    ],
    demands:
      "1. Permanent radar and drone night surveillance along the Hooghly-Damanganga estuary.\n2. Scientific concrete geotube armoring of 24 vulnerable embankment breach points.\n3. Immediate disaster compensation fund for farmers whose fertile soil suffered irreversible saline contamination.",
    upvotes: 1950,
    affectedVotes: 810,
    is_interesting: true,
    unsolved_status: "chargesheeted",
    days_since_first_reported: 52,
    last_checked_at: "2026-09-04T15:45:00Z",
    case_reference: "CBI/EOU-IV/RC-07/2026",
    source_name: "The Wire",
    source_url: "https://thewire.in/environment/sundarbans-embankment-breach-sand-mining",
  },

  // ----------------------------------------------------------------------
  // 5. Education: Fake Degree Printing & Accreditation Mill in Delhi NCR
  // ----------------------------------------------------------------------
  {
    id: "gt-5",
    slug: "fake-distance-degree-racket-delhi-ncr",
    headline: "The ₹120 Crore Unaccredited Degree Empire: How Fake Distance Learning Universities Sell PhDs to Aspiring Politicians",
    tagline: "Underground diploma mills operate in nondescript commercial basements, printing counterfeit doctoral and law degrees backdated by 15 years.",
    author: {
      name: "Vikramjit Rao",
      badge: "Video Investigation",
      publication: "Academic Integrity Watch India",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
    },
    date: "2026-08-10",
    location: {
      state: "Delhi",
      district: "New Delhi",
      block: "Connaught Place / Laxmi Nagar",
      coordinates: [28.6139, 77.209],
    },
    category: "Education",
    affectedPeopleCount: 15000,
    status: "Ongoing",
    summary:
      "Undercover sting operations expose how unaccredited shell institutes issue backdated doctoral degrees for ₹4.5 Lakhs, which are subsequently listed on official ECI election affidavits without verification.",
    thumbnailUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    readTimeMinutes: 5,
    body: `### The Lucrative Industry of Political Credentials

In contemporary Indian elections, higher academic credentials confer significant credibility among first-time voters and party screening committees.

However, an extensive 4-month undercover sting operation reveals a thriving syndicate operating across East Delhi and NCR commercial hubs that manufactures backdated degrees from non-existent foreign universities or unaccredited offshore distance education institutions.`,
    evidence: [
      {
        id: "ev-5-1",
        title: "Undercover Video Recording: Fake Degree Rate Card Negotiation",
        type: "Video",
        url: "https://youtube.com",
        fileSize: "22.5 MB",
        date: "2026-08-02",
        summary: "Documents syndicate agent offering backdated 2012 Doctorate diploma for cash payment.",
      },
      {
        id: "ev-5-2",
        title: "UGC Official List of 21 Fake Universities (Ref: UGC/Fake-Univ/2026)",
        type: "Official Document",
        url: "https://ugc.ac.in",
        fileSize: "1.2 MB",
        date: "2026-08-05",
        summary: "UGC circular validating non-recognition status of the targeted institutions.",
      },
    ],
    responsiblePoliticianIds: ["dr-arvind-shrivastava", "neta-1"],
    responsibleOfficialNames: [
      "Secretary, University Grants Commission (UGC)",
      "Special Commissioner of Police, Delhi Crime Branch",
    ],
    responsibleDepartments: [
      "University Grants Commission (UGC)",
      "Ministry of Education, Govt of India",
      "Delhi Police Economic Offences Wing (EOW)",
    ],
    impactTimeline: [
      {
        id: "imp-5-1",
        date: "2026-08-12",
        description: "Delhi Police EOW registered formal FIR and raided 3 commercial centers in Laxmi Nagar.",
        sourceName: "Press Trust of India (PTI)",
      },
    ],
    demands:
      "1. Mandatory integration of Election Commission candidate portal with the National Academic Depository (NAD).\n2. Disqualification under RPA 1951 for candidates submitting unaccredited or counterfeit degree affidavits.\n3. Nationwide shutdown of all unauthorized diploma printing centres.",
    upvotes: 4210,
    affectedVotes: 512,
    is_interesting: false,
    unsolved_status: "under_investigation",
    days_since_first_reported: 70,
    last_checked_at: "2026-09-02T14:10:00Z",
    case_reference: "EOW/DEL/FIR-442/2026",
    source_name: "Scroll.in",
    source_url: "https://scroll.in/article/fake-degrees-syndicate-delhi-election-affidavits",
  },

  // ----------------------------------------------------------------------
  // 6. Agriculture & Farmers: Groundwater Depletion by Illegal Bottling Plants
  // ----------------------------------------------------------------------
  {
    id: "gt-6",
    slug: "illegal-commercial-groundwater-extraction-patna",
    headline: "Patna Peri-Urban Water Table Drops 35 Feet: Unregistered Commercial Tanker Mafia Sucks Aquifers Dry",
    tagline: "Over 200 illegal packaging units pump 15 million liters daily without Central Ground Water Authority (CGWA) clearance while tube wells run dry.",
    author: {
      name: "Anand Kumar Jha",
      badge: "Independent Reporter",
      publication: "Bihar Groundwater Forum",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    },
    date: "2026-08-14",
    location: {
      state: "Bihar",
      district: "Patna",
      block: "Phulwari Sharif & Danapur",
      coordinates: [25.5941, 85.1376],
    },
    category: "Agriculture & Farmers",
    affectedPeopleCount: 110000,
    status: "Ongoing",
    summary:
      "Hydrogeological telemetry shows unprecedented 35-foot aquifer drop in Danapur as commercial water tankers extract millions of liters daily with unmetered heavy industrial submersible pumps.",
    thumbnailUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80",
    readTimeMinutes: 5,
    body: `### The Vanishing Groundwater of Magadh Plains

In the peri-urban belts of Danapur and Phulwari Sharif, over 30,000 smallholder farmer families who cultivate seasonal vegetables and wheat rely exclusively on shallow agricultural borewells.

In the past 24 months, more than 60% of village handpumps have completely dried up, forcing farming households to buy back their own groundwater from commercial tanker mafias at ₹40 per 20-liter canister.`,
    evidence: [
      {
        id: "ev-6-1",
        title: "Central Ground Water Authority (CGWA) Aquifer Telemetry Log",
        type: "Official Document",
        url: "https://cgwa-noc.gov.in",
        fileSize: "3.8 MB",
        date: "2026-08-01",
        summary: "Proves critical over-exploited status of Danapur aquifer.",
      },
      {
        id: "ev-6-2",
        title: "Drone Imagery: 28 Unregistered Tanker Depots Operating Without Meters",
        type: "Photo",
        url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80",
        fileSize: "7.1 MB",
        date: "2026-08-08",
        summary: "Visual mapping of commercial tanker queue extracting groundwater with high-voltage industrial pumps.",
      },
    ],
    responsiblePoliticianIds: ["ramesh-kumar-patliputra", "neta-5-bihar"],
    responsibleOfficialNames: [
      "Regional Director, CGWA Mid-Eastern Region Patna",
      "Sub-Divisional Magistrate, Danapur",
    ],
    responsibleDepartments: [
      "Public Health Engineering Department (PHED), Bihar",
      "Minor Water Resources Department, Govt of Bihar",
      "Central Ground Water Authority (CGWA)",
    ],
    impactTimeline: [
      {
        id: "imp-6-1",
        date: "2026-08-15",
        description: "Investigation published; Bihar Farmers Union submitted memorandum to District Magistrate.",
        sourceName: "Prabhat Khabar",
      },
    ],
    demands:
      "1. Immediate power disconnection to all commercial borewells lacking valid CGWA NOC.\n2. Installation of smart digital water flow meters on all industrial bottling units.\n3. Construction of 50 rainwater percolation recharging shafts across Danapur block.",
    upvotes: 1680,
    affectedVotes: 740,
    is_interesting: true,
    unsolved_status: "under_investigation",
    days_since_first_reported: 28,
    last_checked_at: "2026-09-04T18:00:00Z",
    case_reference: "CGWA/BIH/PAT/2026/08",
    source_name: "Newslaundry",
    source_url: "https://www.newslaundry.com/2026/08/14/patna-groundwater-tanker-mafia-investigation",
  },
];

export function getGroundTruthArticleBySlug(slug: string): GroundTruthArticle | undefined {
  return MOCK_GROUND_TRUTH_ARTICLES.find((a) => a.slug === slug);
}

export function getGroundTruthArticlesByPolitician(politicianSlugOrId: string): GroundTruthArticle[] {
  const clean = politicianSlugOrId.toLowerCase().trim();
  return MOCK_GROUND_TRUTH_ARTICLES.filter((a) =>
    a.responsiblePoliticianIds.some((pId) => pId.toLowerCase() === clean || clean.includes(pId.toLowerCase()) || pId.toLowerCase().includes(clean))
  );
}

export function filterGroundTruthArticles(params: {
  state?: string;
  category?: string;
  politicianId?: string;
  sortBy?: "recent" | "read" | "shared" | "impact";
  searchQuery?: string;
}): GroundTruthArticle[] {
  let list = [...MOCK_GROUND_TRUTH_ARTICLES];

  if (params.state && params.state !== "ALL") {
    list = list.filter((a) => a.location.state.toLowerCase() === params.state?.toLowerCase());
  }

  if (params.category && params.category !== "ALL") {
    list = list.filter((a) => a.category.toLowerCase() === params.category?.toLowerCase());
  }

  if (params.politicianId && params.politicianId !== "ALL") {
    const pId = params.politicianId.toLowerCase();
    list = list.filter((a) =>
      a.responsiblePoliticianIds.some((id) => id.toLowerCase() === pId || pId.includes(id.toLowerCase()) || id.toLowerCase().includes(pId))
    );
  }

  if (params.searchQuery && params.searchQuery.trim() !== "") {
    const q = params.searchQuery.toLowerCase().trim();
    list = list.filter(
      (a) =>
        a.headline.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.location.district.toLowerCase().includes(q) ||
        a.location.state.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }

  // Sort
  if (params.sortBy === "impact") {
    list.sort((a, b) => b.affectedPeopleCount - a.affectedPeopleCount);
  } else if (params.sortBy === "read") {
    list.sort((a, b) => b.upvotes - a.upvotes);
  } else if (params.sortBy === "shared") {
    list.sort((a, b) => b.affectedVotes - a.affectedVotes);
  } else {
    // Default: recent
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return list;
}
