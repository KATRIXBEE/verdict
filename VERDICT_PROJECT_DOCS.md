# VERDICT — Complete Project Documentation
## Generated: August 23, 2026

---

## 1. PROJECT OVERVIEW
- **What VERDICT is**: VERDICT is a high-performance, tamper-resistant civic-tech accountability platform for Indian democracy. It bridges raw government disclosures—ECI election affidavits, eCourts judicial records, Sansad parliamentary performance, and PRS legislative tracking—into an intuitive, transparent public interface. It computes an algorithmic **VERDICT Score (0.0 – 10.0)** for every Member of Parliament (MP), rendering financial trajectories, criminal dossiers, education credentials, party-switching timelines, and citizen trust ratings in a brutalist, editorial design system.
- **Tech Stack**:
  - **Framework**: Next.js 15.1.7 (App Router), React 19, TypeScript
  - **Styling**: Tailwind CSS v3, PostCSS, Custom Brutalist Design Tokens (Neo-Brutalist 3px solid ink borders, `#FF4336` red, `#FFD028` yellow, `#70D6FF` cyan, `#00F5D4` mint)
  - **Database & Data Pipeline**: SQLite 3 (`verdict_pipeline.db`), SQLAlchemy 2.0 (Async), Python 3.12, Supabase / Postgres compatible schema
  - **PWA**: `next-pwa`, Service Workers, Web App Manifest (`/manifest.json`), Offline Fallback
  - **Visualizations & Charts**: Recharts, Lucide React icons, Canvas/Sharp asset generators
  - **Linting & Code Quality**: Flat ESLint 9 (`eslint.config.mjs`)
- **Repository Structure**:
  ```text
  verdict/
  ├── src/
  │   ├── app/                      # Next.js App Router pages and API routes
  │   │   ├── api/                  # API endpoints (/api/politicians, /api/proxy-image)
  │   │   ├── compare/              # Politician comparison matrix page
  │   │   ├── ground-truth/         # Ground truth news, map, and investigative dossier
  │   │   ├── method/               # Civic scoring methodology & mathematical transparency
  │   │   ├── offline/              # PWA offline fallback page
  │   │   ├── politician/[slug]/    # Individual MP dossier & analytics pages
  │   │   ├── tax-money/            # Union budget allocation & fiscal breakdown
  │   │   ├── globals.css           # Brutalist CSS tokens, animations & font variables
  │   │   ├── layout.tsx            # Global layout with PWA meta, fonts & header/footer
  │   │   └── page.tsx              # Homepage with MP directory, search, filters & stats
  │   ├── components/
  │   │   ├── layout/               # Header, Footer, Live Ticker
  │   │   ├── pwa/                  # InstallBanner PWA prompt
  │   │   └── ui/                   # BrutalistButton, BrutalistBadge, BrutalistCard, StatBox
  │   ├── data/                     # Static verified JSON datasets (all-mps.json, news, constituencies)
  │   ├── features/                 # Modular domain features (profile, asset-timeline, criminal-dossier, etc.)
  │   ├── lib/                      # Utilities, image helpers (getImageSrc, HARDCODED_PHOTOS), score calculator
  │   └── types/                    # Comprehensive TypeScript interfaces & domain types
  ├── data-pipeline/                # Python backend data ingestion, scrapers, models & enrichers
  │   ├── enrichers/                # ScoreCalculator, EducationVerifier, Disambiguator
  │   ├── scrapers/                 # ECourts, ECI, Sansad, Wikipedia, PRS scrapers
  │   ├── utils/                    # SQLAlchemy async DB session, models & logger
  │   └── verdict_pipeline.db       # Primary SQLite database
  ├── public/                       # Static public assets, icons, manifest.json, sw.js
  │   ├── icons/                    # PWA icons (72x72, 96x96, 128x128, 144x144, 192x192, 384x384, 512x512)
  │   ├── images/                   # SVG default avatars, logos, placeholder graphics
  │   └── static/data/              # 776+ local high-res MP official Parliament photos
  │       ├── leaders/              # Verified leader portraits (Rahul Gandhi, Modi, Kejriwal, etc.)
  │       ├── ls-photos/            # 540 Lok Sabha official MP portraits
  │       └── rs-photos/            # 236 Rajya Sabha official MP portraits
  └── scripts/                      # Operational automation & data ingestion scripts
  ```

---

## 2. ALL PAGES & ROUTES

| Route URL | File Path | What It Does | Key Components Used |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Main directory & landing page. Displays live statistics (MPs indexed, criminal cases, net worth, avg score), national leader spotlights, comprehensive search & filtering (by state, party, house, score band, crime severity), full MP card grid, and party-hopper watchlist. | `SearchBar`, `BrutalistButton`, `BrutalistBadge`, `ScoreBreakdownModal`, `DisambiguationModal` |
| `/politician/[slug]` | `src/app/politician/[slug]/page.tsx` | Deep-dive politician investigative dossier. Shows verified portraits, VERDICT score gauge, attendance & parliamentary stats, criminal case breakdown with IPC sections, asset growth CAGRs, party switching history, citizen ratings, and related news. | `ProfileHeader`, `ParliamentaryTabs`, `ScoreGauge`, `CriminalDossier`, `AssetGrowthChart`, `PartySwitchTimeline`, `ControversyTimeline`, `CitizenRatingSection` |
| `/compare` | `src/app/compare/page.tsx` | Side-by-side Neta Face-Off matrix. Compares two politicians across overall scores, criminal cases, asset growth, parliamentary attendance, questions asked, and educational verification status. | `CompareMatrix`, `ScoreGauge`, `BrutalistButton`, `BrutalistCard` |
| `/tax-money` | `src/app/tax-money/page.tsx` | Union Budget & fiscal tracking dashboard. Breaks down government budget allocations across ministries (Defence, Road Transport, Railways, Agriculture, Rural Development), tracks major infrastructure projects, and analyses bills. | `BrutalistCard`, `StatBox`, Recharts Bar & Pie charts |
| `/ground-truth` | `src/app/ground-truth/page.tsx` | Interactive investigative civic intelligence feed. Displays live news items, interactive regional map of political controversies, RTI application request helpers, and citizen impact trackers. | `DailyNewsFeed`, `GroundTruthMap`, `GroundTruthWidget`, `ImpactTracker`, `RTIModal` |
| `/ground-truth/[slug]` | `src/app/ground-truth/[slug]/page.tsx` | Individual investigative article / controversy deep-dive with impact tracking, source verification citations, and related politicians. | `ArticleCard`, `ImpactTracker`, `RTIModal`, `BrutalistBadge` |
| `/method` | `src/app/method/page.tsx` | Mathematical transparency and civic scoring methodology documentation. Explains base score, attendance formula, criminal case severity deductions, asset growth thresholds, and UGC verification criteria. | `BrutalistCard`, `BrutalistBadge` |
| `/offline` | `src/app/offline/page.tsx` | Progressive Web App offline fallback page shown when device loses internet connectivity. | `BrutalistCard`, `BrutalistButton` |

---

## 3. ALL COMPONENTS

### Layout & Global Components
- `src/components/layout/Header.tsx`: Navigation bar with VERDICT brutalist branding, active route indicators, quick search trigger, comparison launcher, and live badge.
- `src/components/layout/Footer.tsx`: Editorial footer with platform data sources disclaimer, methodology link, GitHub open-source repository link, and privacy/terms links.
- `src/components/layout/Ticker.tsx`: Breaking live civic ticker scrolling party-switch updates, court hearings, and attendance milestones.
- `src/components/pwa/InstallBanner.tsx`: Floating Progressive Web App install prompt notifying mobile and desktop users to install VERDICT to their home screen.

### UI Primitives
- `src/components/ui/BrutalistButton.tsx`: High-contrast, thick-bordered action button with interactive 3D box-shadow hover/active states. Variants: `red`, `yellow`, `cyan`, `mint`, `ink`, `surface`.
- `src/components/ui/BrutalistBadge.tsx`: Pill and rectangular tag component for score bands, party tags, case severity, and education verification flags.
- `src/components/ui/BrutalistCard.tsx`: Neo-brutalist container with customizable hard drop-shadows (`sm`, `md`, `lg`), solid ink borders, and title bars.
- `src/components/ui/StatBox.tsx`: Compact metric box displaying key numbers, trends, and labels.

### Feature Components
- `src/features/politician-profile/ProfileHeader.tsx`: Politician header card showing photo portrait, party badge, age, constituency, term count, and minister portfolio badge.
- `src/features/politician-profile/ParliamentaryTabs.tsx`: Tabbed navigation switcher between Overview, Financial Disclosures, Criminal Record, Parliamentary Performance, and Citizen Ratings.
- `src/features/verdict-score/ScoreGauge.tsx`: Radial and tabular score gauge displaying 0.0–10.0 score with dynamic color gradient, score band badge, and modal trigger.
- `src/features/verdict-score/ScoreBreakdownModal.tsx`: Comprehensive modal itemizing the exact additions/deductions (Attendance, Crime, Assets, Education, Citizen sentiment) that formed the score.
- `src/features/criminal-dossier/CriminalDossier.tsx`: Tabular criminal record view listing declared cases from ECI affidavits and eCourts.
- `src/features/criminal-dossier/CaseCard.tsx`: Expandable card for an individual criminal case showing court name, CNR number, filing date, and status.
- `src/features/criminal-dossier/ChargeDetailsModal.tsx`: Modal displaying full IPC section descriptions, plain-English legal explanations, and maximum statutory penalties.
- `src/features/asset-timeline/AssetGrowthChart.tsx`: Historical election asset chart (movable vs immovable vs liabilities) over multi-election timelines with CAGR calculation.
- `src/features/asset-timeline/OutlierGrowthFlag.tsx`: Disproportionate asset growth alert banner highlighted when CAGR exceeds 300% without business income justification.
- `src/features/party-switch/PartySwitchTimeline.tsx`: Historical political party journey tracking switches, coalitions, and ideological consistency.
- `src/features/party-switch/IdeologyShiftIndicator.tsx`: Visual compass quantifying left-center-right ideological shifts across party hops.
- `src/features/controversies/ControversyTimeline.tsx`: Chronological timeline of public record controversies, investigative reports, and regulatory findings.
- `src/features/controversies/ControversyCard.tsx`: Compact controversy card with severity indicator, source links, and impact badges.
- `src/features/citizen-rating/CitizenRatingSection.tsx`: Verified voter review and star-rating module with DigiLocker verification badge support.
- `src/features/citizen-rating/RatingModal.tsx`: Modal form for submitting verified feedback, ratings, and issue tags.
- `src/features/search/SearchBar.tsx`: Live fuzzy search bar with multi-criteria dropdowns (State, Party, House, Crime, Score).
- `src/features/search/DisambiguationModal.tsx`: Resolves ambiguous search queries when multiple MPs share the same or similar names.
- `src/features/compare/CompareMatrix.tsx`: Interactive two-politician comparator rendering side-by-side metric tables and radar attributes.
- `src/features/ground-truth/DailyNewsFeed.tsx`: Curated news feed categorized by State, Crime, Economy, Infrastructure, and Agriculture.
- `src/features/ground-truth/ArticleCard.tsx`: News card with sentiment tag, source citation, and affected politician tags.
- `src/features/ground-truth/GroundTruthMap.tsx`: Interactive SVG map of Indian states highlighting active controversies and regional civic investigations.
- `src/features/ground-truth/GroundTruthWidget.tsx`: Compact homepage widget displaying the latest 3 investigative ground truth stories.
- `src/features/ground-truth/ImpactTracker.tsx`: Status tracker showing policy impact, inquiry stages, and public responses.
- `src/features/ground-truth/RTIModal.tsx`: Automated Right to Information (RTI) application draft generator for citizen inquiries.

---

## 4. DATABASE SCHEMA

### `politicians` (563 rows)
Primary entity table representing all elected MPs and key leaders.
| Column | Type | Nullable | Primary Key | Description |
|---|---|---|---|---|
| `id` | VARCHAR(36) | No | Yes | Unique UUID / identifier |
| `name` | VARCHAR(255) | No | No | Full official name |
| `name_variants` | JSON | Yes | No | Alias names, Hindi spellings, alternative transliterations |
| `slug` | VARCHAR(255) | No | No | Unique URL slug |
| `photo_url` | TEXT | Yes | No | Local path (`/static/data/...`) or external URL |
| `date_of_birth` | DATE | Yes | No | Date of birth |
| `gender` | VARCHAR(50) | Yes | No | Gender (male, female, other) |
| `current_party` | VARCHAR(100) | Yes | No | Current political party name |
| `current_constituency` | VARCHAR(150) | Yes | No | Lok Sabha / Rajya Sabha constituency |
| `current_state` | VARCHAR(100) | Yes | No | State or Union Territory |
| `current_house` | VARCHAR(50) | Yes | No | Lok Sabha or Rajya Sabha |
| `profession` | TEXT | Yes | No | Declared profession / occupation |
| `education` | TEXT | Yes | No | Declared degree & institution |
| `education_verification_status` | VARCHAR(50) | Yes | No | `Verified`, `Unverified`, `Not Checked`, `Suspicious` |
| `wikipedia_url` | TEXT | Yes | No | Official English Wikipedia biography link |
| `wikipedia_summary` | TEXT | Yes | No | Short biographical abstract |
| `official_website` | TEXT | Yes | No | Official website link |
| `social_twitter` | VARCHAR(255) | Yes | No | Verified X/Twitter handle |
| `social_facebook` | VARCHAR(255) | Yes | No | Verified Facebook URL |
| `verdict_score` | NUMERIC(4, 2) | Yes | No | Algorithmic score (0.0 – 10.0) |
| `data_completeness_percent` | INTEGER | Yes | No | Percentage of populated fields (0-100) |
| `data_sources` | JSON | Yes | No | Ingestion source audit list |
| `needs_review` | BOOLEAN | Yes | No | Manual moderation flag |
| `portfolio_history` | JSON | Yes | No | Historical union / state cabinet portfolios |
| `email` | VARCHAR(255) | Yes | No | Official parliamentary email address |
| `mp_code` | VARCHAR(100) | Yes | No | Official Parliament Sansad P-code (e.g. `P4589`) |
| `created_at` | DATETIME | Yes | No | Creation timestamp |
| `last_updated` | DATETIME | Yes | No | Last update timestamp |

### `criminal_cases` (184 rows)
Court records, FIRs, and declared criminal cases indexed from ECI affidavits and eCourts.
| Column | Type | Nullable | Primary Key | Description |
|---|---|---|---|---|
| `id` | VARCHAR(36) | No | Yes | Case UUID |
| `politician_id` | VARCHAR(36) | No | No | Foreign key -> `politicians.id` |
| `case_number` | VARCHAR(150) | Yes | No | Formal court case number / FIR number |
| `court_name` | VARCHAR(255) | Yes | No | Presiding court name and district |
| `court_state` | VARCHAR(100) | Yes | No | Jurisdiction state |
| `ipc_sections` | JSON | Yes | No | Array of IPC / BNS sections (e.g. `["IPC 420", "IPC 120B"]`) |
| `ipc_plain_english` | JSON | Yes | No | Plain-English summary of each charge |
| `nature_of_offence` | TEXT | Yes | No | Summary of allegations |
| `date_filed` | DATE | Yes | No | Date case was registered |
| `current_status` | VARCHAR(100) | Yes | No | `charges_framed`, `under_trial`, `cognizance_taken`, `acquitted` |
| `next_hearing_date` | DATE | Yes | No | Next scheduled court date |
| `severity` | VARCHAR(50) | Yes | No | `Minor`, `Moderate`, `Serious`, `Severe` |
| `score_impact` | NUMERIC(4, 2) | Yes | No | Point deduction applied to VERDICT Score |
| `election_year_declared` | INTEGER | Yes | No | Election affidavit year |
| `ecourts_case_id` | VARCHAR(150) | Yes | No | eCourts CNR Number |
| `source` | VARCHAR(100) | No | No | Source (e.g. `ECI Form 26`, `eCourts India`) |
| `created_at` | DATETIME | Yes | No | Timestamp |

### `assets` (560 rows)
Financial declarations, movable/immovable assets, and liabilities.
| Column | Type | Nullable | Primary Key | Description |
|---|---|---|---|---|
| `id` | VARCHAR(36) | No | Yes | Record UUID |
| `politician_id` | VARCHAR(36) | No | No | Foreign key -> `politicians.id` |
| `election_year` | INTEGER | No | No | Election year (e.g. 2014, 2019, 2024) |
| `movable_assets` | BIGINT | Yes | No | Cash, bank deposits, jewelry, vehicles (in INR) |
| `immovable_assets` | BIGINT | Yes | No | Agricultural land, commercial/residential buildings (in INR) |
| `total_assets` | BIGINT | Yes | No | Sum of movable + immovable assets |
| `total_liabilities` | BIGINT | Yes | No | Outstanding loans, bank dues, government dues |
| `net_assets` | BIGINT | Yes | No | Total assets minus liabilities |
| `spouse_assets` | BIGINT | Yes | No | Declared assets of spouse |
| `dependent_assets` | BIGINT | Yes | No | Declared assets of dependents |
| `income_sources` | TEXT | Yes | No | Declared primary sources of livelihood |
| `pan_number_declared` | BOOLEAN | Yes | No | Whether PAN was declared in affidavit |
| `source` | VARCHAR(100) | No | No | Data source |
| `created_at` | DATETIME | Yes | No | Timestamp |

### `election_history` (689 rows)
Contested elections, vote counts, margins, and electoral results.
| Column | Type | Nullable | Primary Key | Description |
|---|---|---|---|---|
| `id` | VARCHAR(36) | No | Yes | Record UUID |
| `politician_id` | VARCHAR(36) | No | No | Foreign key -> `politicians.id` |
| `election_year` | INTEGER | No | No | Year of election |
| `house` | VARCHAR(50) | No | No | Lok Sabha or Rajya Sabha |
| `constituency` | VARCHAR(150) | No | No | Constituency name |
| `state` | VARCHAR(100) | No | No | State |
| `party` | VARCHAR(100) | No | No | Contesting party name |
| `votes_received` | INTEGER | Yes | No | Votes polled for candidate |
| `vote_share_percent` | NUMERIC(5, 2) | Yes | No | Percentage of total valid votes |
| `result` | VARCHAR(50) | No | No | `Won` or `Lost` |
| `total_candidates` | INTEGER | Yes | No | Total candidates on ballot |
| `runner_up_votes` | INTEGER | Yes | No | Votes polled by nearest competitor |
| `margin` | INTEGER | Yes | No | Victory margin in votes |
| `source` | VARCHAR(100) | No | No | Data source |
| `created_at` | DATETIME | Yes | No | Timestamp |

### `ipc_lookup` (20 rows)
Static legal reference table explaining common Indian Penal Code sections in plain English with severity tiers.

---

## 5. API ROUTES

### `GET /api/politicians`
- **File**: `src/app/api/politicians/route.ts`
- **Method**: `GET`
- **Query Parameters**:
  - `query` (optional): Free text search matching MP name, constituency, or party.
  - `state` (optional): Filter by state/UT name.
  - `party` (optional): Filter by political party.
  - `house` (optional): Filter by `Lok Sabha` or `Rajya Sabha`.
  - `scoreBand` (optional): Filter by `EXCELLENT`, `GOOD`, `AVERAGE`, `POOR`, `VERY_POOR`.
  - `hasCriminalCases` (optional): `true` / `false`.
  - `page` (optional): Page number (default: 1).
  - `limit` (optional): Records per page (default: 50).
- **Returns**: JSON object containing paginated politicians list, total counts, and filters applied.

### `GET /api/politicians/[slug]`
- **File**: `src/app/api/politicians/[slug]/route.ts`
- **Method**: `GET`
- **Parameters**: `slug` path parameter (e.g. `narendra-modi-varanasi`, `rahul-gandhi-raebareli`).
- **Returns**: Complete individual politician dossier including asset timeline, criminal cases, education status, parliamentary records, and calculated VERDICT score breakdown.

### `GET /api/proxy-image`
- **File**: `src/app/api/proxy-image/route.ts`
- **Method**: `GET`
- **Query Parameters**: `url` (URL-encoded external image target).
- **Returns**: Image binary with valid caching headers (`public, max-age=604800, stale-while-revalidate=86400`) and safe fallback to default SVG in case of upstream timeouts.

---

## 6. DATA SOURCES

| Source Name | URL | Data Provided | Update Frequency | Ingestion Script |
|---|---|---|---|---|
| **Right To Information (RTI) Wiki** | `https://righttoinformation.wiki` | Official 540 Lok Sabha + 243 Rajya Sabha MP roster, high-res Sansad portrait photos, constituencies, birth dates, education | Quarterly / Post-Election | `scripts/import_rti_wiki.py` |
| **Sansad / Parliament of India** | `https://sansad.in` | MP official profile pages, P-codes, ministry portfolios, parliamentary session attendance, questions | Per Parliamentary Session | `scripts/download_photos_final.py` |
| **Election Commission of India (ECI)** | `https://affidavit.eci.gov.in` | Form 26 affidavits, declared criminal cases, movable/immovable assets, educational degrees | Per General / State Election | `scripts/import_csv_data.py` |
| **eCourts Services India** | `https://services.ecourts.gov.in` | Live CNR case tracking, hearing dates, court names, active status | Weekly / Monthly | `data-pipeline/scrapers/ecourts_scraper.py` |
| **PRS Legislative Research** | `https://prsindia.org` | MP attendance percentages, debate participation counts, private member bills introduced | Per Parliamentary Session | `data-pipeline/scrapers/prs_scraper.py` |
| **UGC / AICTE University Portal** | `https://www.ugc.gov.in` | Recognized universities & degree verification registries | Annual | `data-pipeline/enrichers/education_verifier.py` |
| **Wikipedia & Wikimedia Commons** | `https://en.wikipedia.org` | Biographical abstracts, Wikipedia links, official portraits for national leaders | Real-time | `src/lib/utils.ts` (`HARDCODED_PHOTOS`) |

---

## 7. SCRIPTS

| Script | Purpose | How to Run | Dependencies |
|---|---|---|---|
| `scripts/download_photos_final.py` | Downloads all official MP Parliament photos directly to `public/static/data/ls-photos` and `rs-photos`. | `python scripts/download_photos_final.py` | `requests`, `sqlite3` |
| `scripts/fix_database_and_scores.py` | Fixes duplicate IDs in database and JSON, links 184 criminal cases to MPs, resets education to unverified, and sets hardcoded photos. | `python scripts/fix_database_and_scores.py` | `sqlite3`, `json` |
| `scripts/clean_and_recalc.py` | Recalculates all VERDICT scores in DB and JSON, auditing score bands and distribution. | `python scripts/clean_and_recalc.py` | `sqlalchemy`, `asyncio` |
| `scripts/fetch_ground_truth_news.py` | Fetches verified ground truth news articles from news APIs and writes them to `src/data/ground-truth-news.json`. | `python scripts/fetch_ground_truth_news.py` | `requests`, `json` |
| `scripts/import_rti_wiki.py` | Imports Lok Sabha and Rajya Sabha CSV datasets from RTI Wiki. | `python scripts/import_rti_wiki.py` | `requests`, `csv`, `sqlite3` |
| `scripts/import_mps.js` | Synchronizes SQLite database MP records into Next.js `src/data/all-mps.json`. | `node scripts/import_mps.js` | `better-sqlite3` / `sqlite3` |
| `scripts/generate_icons.js` | Generates high-contrast PNG PWA icons for all required resolutions (72px to 512px). | `node scripts/generate_icons.js` | `canvas` / `sharp` |

---

## 8. SCORING ALGORITHM

The VERDICT Civic Scoring Algorithm computes a single score between **0.0 and 10.0** using deterministic civic rules:

$$\text{VERDICT Score} = \text{Base} (5.0) + \Delta_{\text{Attendance}} + \Delta_{\text{Criminal}} + \Delta_{\text{Assets}} + \Delta_{\text{Education}}$$

### 1. Base Score: `5.0`
Every politician starts at a neutral score of 5.0.

### 2. Parliamentary Attendance ($\Delta_{\text{Attendance}}$):
- $\ge 80\%$: **+2.0 pts**
- $60\% - 79\%$: **+1.0 pt**
- $40\% - 59\%$: **0.0 pts** (neutral)
- $< 40\%$: **-1.0 pt**
- *No official attendance records on file / missing*: **0.0 pts** (neutral, no penalty)

### 3. Criminal Cases ($\Delta_{\text{Criminal}}$):
Active cases are filtered to exclude acquitted, dismissed, or withdrawn cases.
- **Confirmed 0 active criminal cases**: **+1.0 pt** (clean record bonus)
- **1–2 Minor Cases** (e.g. peaceful protest, IPC 188 / 143): **-0.5 pts**
- **Moderate Cases** (e.g. defamation, unlawful assembly): **-1.5 pts**
- **Serious Cases** (e.g. financial fraud, corruption, cheating IPC 420): **-2.5 pts**
- **Severe Cases** (e.g. heinous crimes, murder attempt IPC 307, extortion): **-4.0 pts**
- *No criminal case data available*: **0.0 pts** (neutral)

### 4. Multi-Term Asset Growth ($\Delta_{\text{Assets}}$):
Evaluated only when 2 or more election declarations exist:
- **Normal CAGR / Growth $< 200\%$**: **+1.0 pt**
- **Moderate Growth $200\% - 400\%$**: **0.0 pts**
- **Disproportionate Outlier Growth $> 400\%$**: **-2.0 pts**
- *Single term / baseline declaration*: **0.0 pts** (neutral)

### 5. Educational Verification ($\Delta_{\text{Education}}$):
- **Verified against UGC / AICTE accredited university database**: **+0.5 pts**
- **Unverified / Not Checked (standard self-declaration)**: **0.0 pts** (neutral)
- **Suspicious / Unaccredited diploma mill flag**: **-0.5 pts**

### Score Bands
| Band Name | Score Range | Color Token | Meaning |
|---|---|---|---|
| **EXCELLENT** | `8.0 – 10.0` | `#00F5D4` (Mint) | Exemplary civic record, high attendance, verified degree, clean legal standing. |
| **GOOD** | `6.0 – 7.9` | `#70D6FF` (Cyan) | Clean criminal record, regular attendance, standard verified disclosures. |
| **AVERAGE** | `4.0 – 5.9` | `#FFD028` (Yellow) | Minor infractions, moderate attendance, or average multi-term growth. |
| **POOR** | `2.0 – 3.9` | `#FF4336` (Red) | Serious declared criminal charges or flagged asset discrepancies. |
| **VERY POOR** | `0.0 – 1.9` | `#0D0D0D` (Ink/Black) | Severe criminal charges and critical civic violations. |

---

## 9. KNOWN ISSUES
1. **Attendance Data Availability**: Official Parliament attendance records are currently being aggregated from Sansad session records for 2024–2026. Until full session counts are published by the Lok Sabha secretariat, attendance scores for newly elected MPs evaluate as neutral (`0.0 pts`), preventing artificial score distortion.
2. **eCourts Live Scraping Rate Limits**: Live eCourts captcha challenge occasionally delays automated weekly status checks for CNR numbers. The system uses the last confirmed hearing date from the local SQLite cache.

---

## 10. FUTURE FEATURES
1. **DigiLocker Citizen Voting Verification**: Enable voters to link their DigiLocker constituency badge for verified, tamper-proof constituency ratings.
2. **Interactive 3D Parliament Chamber Visualizer**: A 3D Lok Sabha seating visualizer built in React Three Fiber highlighting MPs by score band and active bill sponsorship.
3. **AI Legislative Speech Analyzer**: Real-time sentiment and topic extraction across parliamentary transcripts to track how often MPs speak on their local constituency issues.

---

## 11. HOW TO RUN

### Development Server
```bash
# 1. Install Node.js dependencies
npm install

# 2. Run local Next.js development server
npm run dev

# App will be accessible at http://localhost:3000
```

### Production Build
```bash
npm run build
npm run start
```

### Refreshing Data Pipeline
```bash
# Fix database duplicates and recalculate all VERDICT scores
python scripts/fix_database_and_scores.py
python scripts/clean_and_recalc.py

# Download / verify official MP photos
python scripts/download_photos_final.py
```

### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=sqlite:///data-pipeline/verdict_pipeline.db
NODE_ENV=development
```
