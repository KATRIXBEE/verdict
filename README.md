# 🏛️ VERDICT — India's Politician Accountability Platform
### *Civic-Tech Transparency Dashboard | Democratic Accountability Engine*

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)
![PostgreSQL / Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 🌟 About VERDICT

**VERDICT** is a high-impact, Gen-Z friendly civic-tech web platform designed to bring radical transparency to Indian democracy. By transforming millions of legally mandated, labyrinthine **Election Commission of India (ECI) Form 26 affidavits**, **eCourts (NJDG) live judicial dockets**, and **parliamentary roll-call transcripts** into an engaging, Neo-Brutalist "IMDb for Indian Politicians", VERDICT equips citizens, investigative journalists, and first-time voters with verifiable, unbiased data.

Every elected representative (MP/MLA) receives an algorithmic, tamper-proof **VERDICT Score (0.0 – 10.0)** derived entirely from public records—eliminating editorial bias and safeguarding against defamation risks.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              VERDICT                                   │
│            [ Search: Politician / Constituency / Party ]               │
├───────────────────┬────────────────────────────┬───────────────────────┤
│  NETA PROFILE     │  VERDICT SCORE: 9.7 / 10   │  CRIMINAL DOSSIER     │
│  - ECI Affidavits │  ■ Attendance:  2.0 / 2.0  │  - eCourts Live Sync  │
│  - UGC Degree Flag│  ■ Asset Growth:2.0 / 2.0  │  - Plain-English IPC  │
│  - Party Switches │  ■ Criminal:   -0.0 pts    │  - Active/Bail/Acquit │
│  - Asset Growth   │  ■ Citizen Rate:2.5 / 2.5  │  - Source Linking     │
└───────────────────┴────────────────────────────┴───────────────────────┘
```

---

## 🚀 Key Features

1. **🔍 Intelligent Search & Disambiguation Engine**: Instant autocomplete across candidate names, constituencies (Lok Sabha / Vidhan Sabha), political parties, and states with keyboard hotkey `[ / ]`. Includes automated disambiguation for name collisions (e.g. *Ramesh Kumar from Bihar* vs *Ramesh Kumar from Karnataka*).
2. **⚖️ Algorithmic VERDICT Score (0.0 – 10.0)**: Transparent scoring engine with mathematical breakdown drawers and an interactive **What-If Simulator** for testing hypothetical adjustments in real time.
3. **🔀 "Aaya Ram Gaya Ram" Party-Hopper Subway Map**: Interactive chronological track showing multi-term party jump histories, switch frequencies, and turncoat penalties.
4. **📜 Live Criminal Dossier & Plain-English IPC Translator**: eCourts-synchronized case dockets with CNR numbers, court names, hearing dates, and an interactive **IPC Dictionary** translating 30+ legal codes into layman English with severity ratings.
5. **📈 Multi-Year Asset Growth Timeline (Recharts)**: Visualizes declared Movable Assets, Immovable Assets, and Liabilities across 2014, 2019, and 2024 Form 26 filings, with statistical anomaly detection for surges $>500\%$.
6. **🛡️ Anti-Brigading DigiLocker Citizen Ratings**: 1-Citizen-1-Vote authentication mock sandbox segregating local constituency residents (70% weight) from national voters (30% weight) to prevent bot raids.
7. **⚔️ Neta Face-Off (Compare Mode)**: Side-by-side head-to-head comparison matrix between any two elected representatives.
8. **📰 90-Day AI News Sentiment Stream**: NLP media coverage stream categorized into Positive, Neutral, and Critical coverage with verified source citations.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion.
- **Database & Security**: PostgreSQL / Supabase with Row Level Security (RLS) policies per operation.
- **Validation**: Zod schema validation for API route handlers.

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/KATRIXBEE/verdict.git
cd verdict
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production
```bash
npm run build
npm run start
```

---

## 📜 Statutory Legal Disclaimer & Defamation Immunity

> *All data displayed on VERDICT is verbatim public record sourced from Election Commission of India affidavits (Form 26), official eCourts/NJDG judicial portals, and Lok Sabha parliamentary transcripts. We provide factual algorithmic aggregation, not editorial judgment, and link every line item directly to its original government source document under citizens' fundamental right to information (Article 19(1)(a)).*

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
