export interface BudgetAllocation {
  ministry: string;
  amount_crore: number;
  percent: number;
  color: string;
  perPersonInr: number;
  description: string;
  keySchemes: string[];
}

export const BUDGET_2024 = {
  total_budget_crore: 4794492, // Rs 47.94 lakh crore
  total_budget_usd_billion: 578,
  india_population: 1400000000,
  budget_per_person_inr: 34246, // ~Rs 34,246 per citizen
  budget_per_person_usd: 413,

  top_allocations: [
    {
      ministry: "Interest Payments",
      amount_crore: 1061205,
      percent: 22.1,
      color: "#FF4336",
      perPersonInr: 7580,
      description: "Servicing past sovereign debts and borrowing costs accumulated over decades.",
      keySchemes: ["Internal Debt Interest", "Small Savings Interest", "Market Loans"]
    },
    {
      ministry: "Defence",
      amount_crore: 621541,
      percent: 13.0,
      color: "#FF9933",
      perPersonInr: 4439,
      description: "Modernisation of Armed Forces (Army, Navy, Air Force), pensions, border infrastructure.",
      keySchemes: ["Capital Outlay for Defence", "Defence Pensions", "Border Roads Development"]
    },
    {
      ministry: "Road Transport & Highways",
      amount_crore: 278000,
      percent: 5.8,
      color: "#00E5FF",
      perPersonInr: 1985,
      description: "National highways expansion, Bharatmala expressway network, bridges, tunneling.",
      keySchemes: ["National Highway Authority of India (NHAI)", "Bharatmala Pariyojana"]
    },
    {
      ministry: "Rural Development",
      amount_crore: 265808,
      percent: 5.5,
      color: "#FFD028",
      perPersonInr: 1898,
      description: "Rural employment guarantee, rural housing (PM Awas), rural roads (PMGSY).",
      keySchemes: ["MGNREGA Guarantee", "Pradhan Mantri Awas Yojana (Rural)", "PMGSY Roads"]
    },
    {
      ministry: "Railways",
      amount_crore: 255393,
      percent: 5.3,
      color: "#00FF66",
      perPersonInr: 1824,
      description: "Vande Bharat trainsets, track doubling, electrification, station redevelopment.",
      keySchemes: ["Amrit Bharat Stations", "Kavach Safety System", "Dedicated Freight Corridors"]
    },
    {
      ministry: "Agriculture & Farmers' Welfare",
      amount_crore: 151851,
      percent: 3.2,
      color: "#70D6FF",
      perPersonInr: 1084,
      description: "Direct income support, crop insurance, fertilizer subsidy distribution.",
      keySchemes: ["PM-KISAN (₹6000/yr direct transfer)", "PM Fasal Bima Yojana", "Interest Subvention"]
    },
    {
      ministry: "Home Affairs & Police",
      amount_crore: 144102,
      percent: 3.0,
      color: "#FF70A6",
      perPersonInr: 1029,
      description: "Central Armed Police Forces (CRPF, BSF, CISF), intelligence, disaster management.",
      keySchemes: ["Central Armed Police Forces", "Police Modernisation", "Disaster Response (NDRF)"]
    },
    {
      ministry: "Education",
      amount_crore: 120627,
      percent: 2.5,
      color: "#B892FF",
      perPersonInr: 861,
      description: "School education, IITs, NITs, central universities, PM-SHRI exemplar schools.",
      keySchemes: ["Samagra Shiksha Abhiyan", "PM-SHRI Schools", "Higher Education Grants (UGC)"]
    },
    {
      ministry: "Health & Family Welfare",
      amount_crore: 89155,
      percent: 1.9,
      color: "#80FF72",
      perPersonInr: 636,
      description: "Ayushman Bharat health cover, AIIMS network expansion, National Health Mission.",
      keySchemes: ["Ayushman Bharat PM-JAY", "National Health Mission", "AIIMS Infrastructure"]
    },
    {
      ministry: "Other Departments & Subsidies",
      amount_crore: 807808,
      percent: 16.8,
      color: "#E0E0E0",
      perPersonInr: 5770,
      description: "Food subsidy (PMGKAY free rations), petroleum subsidies, atomic energy, science & tech.",
      keySchemes: ["Food Security PMGKAY", "Fertilizer Subsidy Pool", "Space Exploration (ISRO)"]
    },
  ]
};

export const MINISTER_SALARIES = {
  india: {
    prime_minister_monthly_inr: 160000,
    cabinet_minister_monthly_inr: 100000,
    mp_monthly_inr: 100000,
    mp_allowances_monthly_inr: 270000,
    mp_total_monthly_inr: 370000,
    source: "MPs' Salaries Act 1954, amended 2023",
    perks: [
      "Rent-free Type VII/VIII bungalow in Central Delhi / Lutyens' zone",
      "34 single domestic flights per year with spouse + unlimited train travel (1st AC)",
      "₹50,000 / month office expense allowance + ₹45,000 constituency allowance",
      "50,000 units free electricity + 4,000 kilolitres free water per year",
      "Free medical treatment under Central Government Health Scheme (CGHS)"
    ]
  },
  comparison: [
    { country: "Singapore", role: "Prime Minister", annual_usd: 1700000, gdp_per_capita_usd: 66000 },
    { country: "Australia", role: "Prime Minister", annual_usd: 420000, gdp_per_capita_usd: 65000 },
    { country: "USA", role: "President", annual_usd: 400000, gdp_per_capita_usd: 80000 },
    { country: "Germany", role: "Chancellor", annual_usd: 370000, gdp_per_capita_usd: 54000 },
    { country: "Canada", role: "Prime Minister", annual_usd: 290000, gdp_per_capita_usd: 52000 },
    { country: "Japan", role: "Prime Minister", annual_usd: 250000, gdp_per_capita_usd: 35000 },
    { country: "France", role: "President", annual_usd: 194000, gdp_per_capita_usd: 44000 },
    { country: "UK", role: "Prime Minister", annual_usd: 190000, gdp_per_capita_usd: 47000 },
    { country: "China", role: "Premier", annual_usd: 32000, gdp_per_capita_usd: 12700 },
    { country: "India", role: "Prime Minister", annual_usd: 24000, gdp_per_capita_usd: 2500 },
  ]
};

export const SAMPLE_BUDGET_BILLS = [
  {
    bill_number: "28/2024",
    bill_name: "THE FINANCE (NO. 2) ACT, 2024",
    year: "2024",
    ministry: "FINANCE",
    category: "Money Bill",
    status: "Passed & Assented",
    allocation: "Union Budget Allocation Framework (₹47.94 Lakh Cr)",
    link: "https://sansad.in"
  },
  {
    bill_number: "35/2024",
    bill_name: "THE APPROPRIATION (NO. 2) ACT, 2024",
    year: "2024",
    ministry: "FINANCE",
    category: "Money Bill",
    status: "Passed & Assented",
    allocation: "Authorises Consolidated Fund of India withdrawals",
    link: "https://sansad.in"
  },
  {
    bill_number: "44/2024",
    bill_name: "THE RAILWAYS (AMENDMENT) ACT, 2024",
    year: "2024",
    ministry: "RAILWAYS",
    category: "Ordinary Bill",
    status: "Passed & Assented",
    allocation: "₹2.55 Lakh Cr Railway Modernisation & Safety Kavach",
    link: "https://sansad.in"
  },
  {
    bill_number: "19/2024",
    bill_name: "THE NATIONAL HIGHWAYS EXPANSION BILL, 2024",
    year: "2024",
    ministry: "ROAD TRANSPORT",
    category: "Ordinary Bill",
    status: "Pending",
    allocation: "₹2.78 Lakh Cr Expressway & Border Arteries Expansion",
    link: "https://sansad.in"
  },
  {
    bill_number: "12/2024",
    bill_name: "THE AYUSHMAN BHARAT EXPANSION PROVISION",
    year: "2024",
    ministry: "HEALTH AND FAMILY WELFARE",
    category: "Financial Bill",
    status: "Active Implementation",
    allocation: "₹89,155 Cr Universal Geriatric Senior Citizen Healthcare",
    link: "https://sansad.in"
  }
];
