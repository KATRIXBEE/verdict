export interface RupeeYearPoint {
  year: number;
  rate: number;
  annotation?: string;
}

export interface CurrencyData {
  name: string;
  flag: string;
  symbol: string;
  data: RupeeYearPoint[];
  change_pct: string;
  context: string;
  rbi_url: string;
  sample2005Rate?: number;
}

export const RUPEE_HISTORICAL_DATA: Record<string, CurrencyData> = {
  usd: {
    name: "US Dollar",
    flag: "US",
    symbol: "$",
    data: [
      { year: 2000, rate: 44.94 },
      { year: 2005, rate: 44.27 },
      { year: 2008, rate: 43.97, annotation: "Global Financial Crisis" },
      { year: 2009, rate: 48.35 },
      { year: 2010, rate: 45.73 },
      { year: 2012, rate: 53.44 },
      { year: 2013, rate: 58.60, annotation: "Taper Tantrum" },
      { year: 2014, rate: 61.03 },
      { year: 2015, rate: 64.15 },
      { year: 2016, rate: 67.21, annotation: "Demonetisation" },
      { year: 2018, rate: 68.40 },
      { year: 2020, rate: 74.10, annotation: "COVID-19 Pandemic" },
      { year: 2022, rate: 80.05, annotation: "Russia-Ukraine / USD Surge" },
      { year: 2023, rate: 82.50 },
      { year: 2024, rate: 83.90, annotation: "Election Year" },
      { year: 2026, rate: 95.70, annotation: "Current Rate" },
    ],
    change_pct: "+116% depreciation since 2005",
    context: "Rupee has weakened 116% vs USD in 20 years",
    rbi_url: "https://www.rbi.org.in",
    sample2005Rate: 44.27,
  },

  gbp: {
    name: "British Pound Sterling",
    flag: "UK",
    symbol: "£",
    data: [
      { year: 2000, rate: 70.0 },
      { year: 2005, rate: 79.05 },
      { year: 2007, rate: 90.0, annotation: "Pre-Crisis Peak" },
      { year: 2009, rate: 75.89 },
      { year: 2014, rate: 100.0, annotation: "Crossed ₹100 Barrier" },
      { year: 2016, rate: 87.0, annotation: "Brexit Shock" },
      { year: 2018, rate: 91.0 },
      { year: 2020, rate: 97.0 },
      { year: 2022, rate: 100.0 },
      { year: 2024, rate: 106.0 },
      { year: 2026, rate: 129.5, annotation: "Current Rate" },
    ],
    change_pct: "+64% depreciation since 2005",
    context: "1 GBP bought ₹79 in 2005 — now buys ₹130",
    rbi_url: "https://www.rbi.org.in",
    sample2005Rate: 79.05,
  },

  eur: {
    name: "Euro",
    flag: "EU",
    symbol: "€",
    data: [
      { year: 2002, rate: 46.0, annotation: "Euro Physical Launch" },
      { year: 2005, rate: 53.91 },
      { year: 2008, rate: 63.97 },
      { year: 2012, rate: 68.60, annotation: "Eurozone Debt Crisis" },
      { year: 2014, rate: 81.04 },
      { year: 2016, rate: 74.0 },
      { year: 2018, rate: 80.96 },
      { year: 2020, rate: 84.0 },
      { year: 2022, rate: 83.50, annotation: "Energy Shock & Parity" },
      { year: 2024, rate: 91.0 },
      { year: 2026, rate: 106.0, annotation: "Current Rate" },
    ],
    change_pct: "+97% depreciation since 2005",
    context: "Euro has nearly doubled vs rupee in 20 years",
    rbi_url: "https://www.rbi.org.in",
    sample2005Rate: 53.91,
  },

  jpy: {
    name: "Japanese Yen (per 100 JPY)",
    flag: "JP",
    symbol: "¥",
    data: [
      { year: 2005, rate: 39.14 },
      { year: 2008, rate: 43.85 },
      { year: 2012, rate: 65.68, annotation: "Abenomics Policy" },
      { year: 2015, rate: 52.0 },
      { year: 2018, rate: 62.0 },
      { year: 2020, rate: 70.0 },
      { year: 2022, rate: 60.0, annotation: "Yen Policy Divergence" },
      { year: 2024, rate: 54.0 },
      { year: 2026, rate: 64.0, annotation: "Current Rate" },
    ],
    change_pct: "Yen weakened too — complex relationship",
    context: "Both rupee and yen have weakened vs USD — making INR/JPY complex",
    rbi_url: "https://www.rbi.org.in",
    sample2005Rate: 39.14,
  },

  cny: {
    name: "Chinese Yuan (Renminbi)",
    flag: "CN",
    symbol: "¥",
    data: [
      { year: 2005, rate: 5.5 },
      { year: 2010, rate: 6.8 },
      { year: 2015, rate: 9.8, annotation: "Yuan Devaluation" },
      { year: 2018, rate: 10.2 },
      { year: 2020, rate: 10.9 },
      { year: 2022, rate: 12.0 },
      { year: 2024, rate: 11.5 },
      { year: 2026, rate: 13.1, annotation: "Current Rate" },
    ],
    change_pct: "+138% depreciation since 2005",
    context: "1 CNY bought ₹5.5 in 2005 — now buys ₹13.1",
    rbi_url: "https://www.rbi.org.in",
    sample2005Rate: 5.5,
  },

  aed: {
    name: "UAE Dirham",
    flag: "AE",
    symbol: "د.إ",
    data: [
      { year: 2005, rate: 12.1 },
      { year: 2010, rate: 12.5 },
      { year: 2015, rate: 17.5 },
      { year: 2020, rate: 20.2 },
      { year: 2022, rate: 21.8 },
      { year: 2024, rate: 22.8 },
      { year: 2026, rate: 26.0, annotation: "Current Rate" },
    ],
    change_pct: "+115% depreciation since 2005",
    context: "Gulf rupee remittance value has halved in 20 years",
    rbi_url: "https://www.rbi.org.in",
    sample2005Rate: 12.1,
  },

  sar: {
    name: "Saudi Riyal",
    flag: "SA",
    symbol: "SAR",
    data: [
      { year: 2005, rate: 11.8 },
      { year: 2010, rate: 12.2 },
      { year: 2015, rate: 17.1 },
      { year: 2020, rate: 19.7 },
      { year: 2022, rate: 21.4 },
      { year: 2024, rate: 22.4 },
      { year: 2026, rate: 25.5, annotation: "Current Rate" },
    ],
    change_pct: "+116% depreciation since 2005",
    context: "Saudi workers sending money home get fewer rupees now",
    rbi_url: "https://www.rbi.org.in",
    sample2005Rate: 11.8,
  },

  cad: {
    name: "Canadian Dollar",
    flag: "CA",
    symbol: "CA$",
    data: [
      { year: 2005, rate: 36.6 },
      { year: 2010, rate: 44.8 },
      { year: 2015, rate: 47.0, annotation: "Commodity Slump" },
      { year: 2020, rate: 55.0 },
      { year: 2022, rate: 61.0 },
      { year: 2024, rate: 61.5 },
      { year: 2026, rate: 70.0, annotation: "Current Rate" },
    ],
    change_pct: "+91% depreciation since 2005",
    context: "Canada Indian diaspora remittances buy fewer rupees each year",
    rbi_url: "https://www.rbi.org.in",
    sample2005Rate: 36.6,
  },

  sgd: {
    name: "Singapore Dollar",
    flag: "SG",
    symbol: "S$",
    data: [
      { year: 2005, rate: 26.4 },
      { year: 2010, rate: 33.8 },
      { year: 2015, rate: 46.5 },
      { year: 2018, rate: 50.0 },
      { year: 2020, rate: 54.5 },
      { year: 2022, rate: 59.0 },
      { year: 2024, rate: 62.0 },
      { year: 2026, rate: 71.0, annotation: "Current Rate" },
    ],
    change_pct: "+169% depreciation since 2005",
    context: "Singapore-India corridor — rupee has weakened most here",
    rbi_url: "https://www.rbi.org.in",
    sample2005Rate: 26.4,
  },
};
