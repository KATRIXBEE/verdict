# VERDICT — Project File Map
**Last generated:** 2026-09-05 14:37:43 IST (Smart India Hackathon 2026)  
**Purpose:** Quick-reference lookup table for every file in this codebase. Use Ctrl+F / Cmd+F to jump to what you need.

---

## 🗺️ QUICK NAVIGATION

- [Pages & Routes](#pages--routes)
- [API Routes](#api-routes)
- [Components](#components)
  - [UI Primitives (`src/components/ui/`)](#ui-primitives-srccomponentsui)
  - [Layout & PWA Components (`src/components/layout/`, `src/components/pwa/`)](#layout--pwa-components-srccomponentslayout-srccomponentspwa)
  - [Root & Shared Components (`src/components/`)](#root--shared-components-srccomponents)
  - [Feature Components (`src/features/`)](#feature-components-srcfeatures)
- [Library / Utilities & Static Datasets](#library--utilities--static-datasets)
  - [Library & Runtime Utilities (`src/lib/`, `src/types/`, `src/hooks/`, `src/`)](#library--runtime-utilities-srclib-srctypes-srchooks-src)
  - [Static Datasets & Reference Dictionaries (`src/data/`)](#static-datasets--reference-dictionaries-srcdata)
- [Database & Schema](#database--schema)
  - [Supabase SQL Migrations (`supabase/migrations/`)](#supabase-sql-migrations-supabasemigrations)
  - [Cached Data Dumps & Checkpoints (`scripts/data/`)](#cached-data-dumps--checkpoints-scriptsdata)
- [Data Pipeline Scripts](#data-pipeline-scripts)
  - [Core Pipeline & Scraper Scripts (`scripts/`)](#core-pipeline--scraper-scripts-scripts)
  - [Automated Backend Data Pipeline (`data-pipeline/`)](#automated-backend-data-pipeline-data-pipeline)
- [Audit & QA Scripts (`scripts/audit/`)](#audit--qa-scripts-scriptsaudit)
  - [Active Test Suites & Security Penetration Scanners](#active-test-suites--security-penetration-scanners)
  - [Generated Audit Reports & Test Output Artifacts](#generated-audit-reports--test-output-artifacts)
- [Tests (`tests/`)](#tests-tests)
- [Configuration Files (Project Root)](#configuration-files-project-root)
- [Documentation](#documentation)
- [Public Assets (`public/`)](#public-assets-public)
- [CI/CD & Deployment](#cicd--deployment)
- [Environment & Secrets](#environment--secrets)
- [📌 Quick Answers to Common Questions](#-quick-answers-to-common-questions)
- [🔢 Project Stats (Auto-Generated)](#-project-stats-auto-generated)
- [⚠️ Uncategorized / Needs Review](#️-uncategorized--needs-review)

---

## Pages & Routes

All routes live under `src/app/` using the Next.js App Router.

| Route URL | File Path | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Homepage — politician directory grid, real-time filters, spotlight banner, and stats |
| `/politician/[slug]` | `src/app/politician/[slug]/page.tsx` | Individual politician profile — 7-factor VERDICT score, criminal dossier, and assets |
| `/politician/[slug]` (loading) | `src/app/politician/[slug]/loading.tsx` | Skeleton loading state placeholder for individual politician profile page |
| `/search` | `src/app/search/page.tsx` | Live search results page for politicians, constituencies, parties, and criminal records |
| `/ground-truth` | `src/app/ground-truth/page.tsx` | Investigative journalism feed — curated corruption reports, FIR trackers, and news |
| `/ground-truth/[slug]` | `src/app/ground-truth/[slug]/page.tsx` | Individual investigative journalism article view with primary evidence documents and timeline |
| `/india-rankings` | `src/app/india-rankings/page.tsx` | 114 global rankings dashboard comparing India against world indices plus historical Rupee tracker |
| `/tax-money` | `src/app/tax-money/page.tsx` | Union Budget breakdown and personal income tax rupee allocation calculator |
| `/where-is-my-tax` | `src/app/where-is-my-tax/page.tsx` | Interactive "Where Did My Tax Go?" tax rupee simulator and public spending visualizer |
| `/money-trail` | `src/app/money-trail/page.tsx` | CAG audit scam case tracker — documented public fund loss cases across sectors |
| `/money-trail/[slug]` | `src/app/money-trail/[slug]/page.tsx` | Individual CAG scam case deep-dive with loss breakdown, timeline, accused ministers, and audits |
| `/compare` | `src/app/compare/page.tsx` | "Neta Face-Off" head-to-head comparison tool matching two politicians on crime, wealth, and scores |
| `/leaderboard` | `src/app/leaderboard/page.tsx` | "Most Wanted" weekly leaderboard displaying worst-scoring politicians, biggest fallers, and party ranks |
| `/method` | `src/app/method/page.tsx` | Methodology documentation explaining the 7-parameter scoring formula and IPC translator |
| `/api-docs` | `src/app/api-docs/page.tsx` | Interactive Swagger UI documentation page serving the OpenAPI 3.0 specification |
| `/offline` | `src/app/offline/page.tsx` | Progressive Web App (PWA) offline fallback screen displayed when internet connection is lost |
| (root layout) | `src/app/layout.tsx` | Root Next.js layout — global fonts, metadata, Navbar, Footer, Ticker, and theme providers |
| (global loading) | `src/app/loading.tsx` | Global route transition loading suspension state with brutalist animated spinner |
| (404) | `src/app/not-found.tsx` | Custom brutalist 404 page not found error screen with quick navigation back to directory |
| *(client container)* | `src/app/money-trail/MoneyTrailClient.tsx` | Client-side interactive container managing filters, search, and categories on Money Trail |
| *(client container)* | `src/app/money-trail/[slug]/ScamDetailClient.tsx` | Client-side interactive view rendering individual scam timelines, loss tools, and share modals |
| *(global styles)* | `src/app/globals.css` | Global CSS styles, Tailwind directives, font definitions, and high-contrast design tokens |

---

## API Routes

All endpoints live under `src/app/api/` using Next.js Route Handlers.

| Endpoint | File Path | Method(s) | Purpose |
|---|---|---|---|
| `/api/auth/[...nextauth]` | `src/app/api/auth/[...nextauth]/route.ts` | GET, POST | NextAuth authentication handler managing login sessions, callbacks, and JWT tokens |
| `/api/crime-stats` | `src/app/api/crime-stats/route.ts` | GET | NCRB crime statistics endpoint returning nationwide and state-wise violent crime benchmarks |
| `/api/ground-truth` | `src/app/api/ground-truth/route.ts` | GET | Fetch paginated investigative journalism articles with search, tag, and status filters |
| `/api/ground-truth/unsolved` | `src/app/api/ground-truth/unsolved/route.ts` | GET, POST | Retrieve unresolved public inquiry cases ("What Happened Next") and submit citizen follow-up tips |
| `/api/ground-truth/[slug]` | `src/app/api/ground-truth/[slug]/route.ts` | GET | Fetch a single investigative article with associated evidence documents and timeline events |
| `/api/health` | `src/app/api/health/route.ts` | GET | System health check validating database latency, Supabase connectivity, uptime, and system status |
| `/api/india-rankings` | `src/app/api/india-rankings/route.ts` | GET | Retrieve 114 international index rankings for India categorized across governance and economy |
| `/api/india-rankings/rupee` | `src/app/api/india-rankings/rupee/route.ts` | GET | Historical USD vs INR exchange rate data points from 1947 to present day for currency tracking |
| `/api/leaderboard` | `src/app/api/leaderboard/route.ts` | GET | Fetch "Most Wanted" leaderboard data: lowest-scoring politicians, biggest score drops, and ranks |
| `/api/politicians` | `src/app/api/politicians/route.ts` | GET | Paginated directory list of politicians with multi-parameter filtering (party, state, score, charges) |
| `/api/politicians/[slug]` | `src/app/api/politicians/[slug]/route.ts` | GET | Single politician complete dossier: personal info, cases, assets, attendance, and score breakdown |
| `/api/politicians/[slug]/controversies` | `src/app/api/politicians/[slug]/controversies/route.ts` | GET | Retrieve verified controversies, scandals, and media investigation timeline for a politician |
| `/api/proxy-image` | `src/app/api/proxy-image/route.ts` | GET | SSRF-protected secure image proxy restricting fetches to whitelisted domains with caching |
| `/api/ratings` | `src/app/api/ratings/route.ts` | GET, POST | Fetch aggregate citizen ratings and submit new rate-limited citizen accountability scores |
| `/api/scams` | `src/app/api/scams/route.ts` | GET | List documented CAG audit scam cases with filtering by sector, era, government, and loss amount |
| `/api/scams/stats` | `src/app/api/scams/stats/route.ts` | GET | Aggregate statistics on public money lost across all documented scam cases and sectors |
| `/api/scams/[slug]` | `src/app/api/scams/[slug]/route.ts` | GET | Single CAG audit scam dossier with financial details, involved ministers, and primary audit reports |
| `/api/search` | `src/app/api/search/route.ts` | GET | High-performance multi-attribute search across politicians by name, constituency, state, and party |
| `/api/spotlight` | `src/app/api/spotlight/route.ts` | GET | Today's Verdict spotlight data: daily featured politician and highest score drop over past 24 hours |

---

## Components

### UI Primitives (`src/components/ui/`)
Reusable design system primitives built with high-contrast brutalist aesthetics and WCAG accessibility.

| File | Purpose |
|---|---|
| `src/components/ui/BackToTop.tsx` | Floating scroll-to-top button with window scroll listener and smooth upward scrolling animation |
| `src/components/ui/Badge.tsx` | Brutalist styled status badge supporting danger, warning, success, info, and neutral color themes |
| `src/components/ui/BrutalistButton.tsx` | Sharp-cornered brutalist button component with tactile hover translate and drop-shadow styling |
| `src/components/ui/BrutalistCard.tsx` | Reusable container card with solid 2px black border, sharp edges, and brutalist drop-shadow |
| `src/components/ui/CookieBanner.tsx` | Cookie consent banner storing user privacy preferences locally with dismiss and accept triggers |
| `src/components/ui/CopyButton.tsx` | Tactile clipboard copy button with visual checkmark confirmation and timeout reset state |
| `src/components/ui/EmptyState.tsx` | Brutalist empty state placeholder container featuring an icon, headline, description, and action button |
| `src/components/ui/Modal.tsx` | Accessible modal dialog wrapper supporting backdrop overlay, Esc key dismissal, and focus trap |
| `src/components/ui/SkeletonCard.tsx` | High-contrast pulsating skeleton loader matching politician card layouts during data fetches |
| `src/components/ui/SkipToContent.tsx` | WCAG accessible skip-to-content navigation link visible upon keyboard focus for screen readers |
| `src/components/ui/Toast.tsx` | Global toast notification system with auto-dismiss timers, queue management, and styled alert variants |

### Layout & PWA Components (`src/components/layout/`, `src/components/pwa/`)

| File | Purpose |
|---|---|
| `src/components/layout/Header.tsx` | Top site navigation bar featuring branding, live ticker integration, navigation links, and search trigger |
| `src/components/layout/Footer.tsx` | Site footer containing SIH hackathon disclaimers, methodology links, ECI data citations, and copyright |
| `src/components/layout/Ticker.tsx` | Animated breaking civic news and critical public alert ticker running horizontally across header |
| `src/components/pwa/InstallBanner.tsx` | Progressive Web App install promotion banner prompting users to install VERDICT locally |

### Root & Shared Components (`src/components/`)

| File | Purpose |
|---|---|
| `src/components/ControversyTimeline.tsx` | Compact chronological timeline component displaying verified politician controversies with severity tags |
| `src/components/CrimeCounter.tsx` | NCRB comparison counter highlighting the ratio of criminal cases among politicians vs normal citizens |
| `src/components/GlobalSearch.tsx` | Site-wide search input modal with debounced query execution and keyboard shortcut navigation |
| `src/components/TodaysVerdictBanner.tsx` | Hero daily spotlight card on homepage showcasing featured leaders and significant score fluctuations |
| `src/components/VerifiedDataDisclaimer.tsx` | Legal disclaimer banner certifying that data is drawn from official ECI affidavits and government audits |
| `src/components/WhatHappenedNext.tsx` | Tracker component highlighting unresolved public interest cases where inquiries stalled without resolution |
| `src/components/YourMPWidget.tsx` | Constituency personalization widget allowing citizens to view and rate their local representative |

### Feature Components (`src/features/`)
Feature-sliced modules co-locating domain-specific UI components and subcomponents.

| Feature Directory | File | Purpose |
|---|---|---|
| `asset-timeline` | `src/features/asset-timeline/AssetGrowthChart.tsx` | Interactive asset timeline chart tracking declared movable and immovable assets across election cycles |
| `citizen-rating` | `src/features/citizen-rating/CitizenRatingSection.tsx` | Interactive citizen accountability voting widget allowing authenticated public sentiment ratings |
| `compare` | `src/features/compare/CompareMatrix.tsx` | Comprehensive side-by-side comparison matrix contrasting two politicians on crimes, wealth, and scores |
| `controversies` | `src/features/controversies/ControversyCard.tsx` | Individual controversy record card displaying title, summary, date, verified badge, and source link |
| `controversies` | `src/features/controversies/ControversyTimeline.tsx` | Interactive chronological controversy stream with tag filtering and source verification status |
| `criminal-dossier` | `src/features/criminal-dossier/CriminalDossier.tsx` | Categorized criminal charge breakdown grouping cases into heinous, financial, serious, and other IPC offenses |
| `criminal-dossier` | `src/features/criminal-dossier/IPCTranslatorModal.tsx` | Interactive legal translator modal explaining complex Indian Penal Code sections in plain conversational English |
| `ground-truth` | `src/features/ground-truth/ArticleCard.tsx` | Investigative news card displaying title, source publication, investigative tags, and read time |
| `ground-truth` | `src/features/ground-truth/DailyNewsFeed.tsx` | Curated investigative news feed with category tabs, search filter, and bookmarking capabilities |
| `ground-truth` | `src/features/ground-truth/EngagementBar.tsx` | Social engagement bar providing share triggers, citizen upvoting, and discussion counters |
| `ground-truth` | `src/features/ground-truth/EvidenceSection.tsx` | Primary documentation viewer displaying attached FIR copies, charge sheets, and CAG audit extracts |
| `ground-truth` | `src/features/ground-truth/GroundTruthMap.tsx` | Geospatial India map plotting corruption cases, pending investigations, and reporting hotspots by state |
| `ground-truth` | `src/features/ground-truth/GroundTruthWidget.tsx` | Homepage summary widget showcasing the latest three high-impact investigative corruption reports |
| `ground-truth` | `src/features/ground-truth/ImpactTracker.tsx` | Accountability impact tracker monitoring real-world consequences (arrests made, money recovered, resignations) |
| `ground-truth` | `src/features/ground-truth/RTIModal.tsx` | Interactive RTI drafting modal generating formal Right to Information application templates for citizens |
| `india-rankings` | `src/features/india-rankings/RupeeTracker.tsx` | Interactive currency valuation chart tracking historical Rupee depreciation and major economic inflection points |
| `money-trail` | `src/features/money-trail/CategoryBreakdownChart.tsx` | Visual breakdown chart analyzing public financial loss across defense, mining, telecomm, and banking scams |
| `money-trail` | `src/features/money-trail/CitizenActionSection.tsx` | Civic mobilization panel providing citizen RTI templates and whistleblower submission links for active scams |
| `money-trail` | `src/features/money-trail/InfrastructureComparisonTool.tsx` | "What This Could Have Built" calculator translating looted crore funds into hospitals, schools, and highways |
| `money-trail` | `src/features/money-trail/MinisterAccountabilityMap.tsx` | Network graph mapping relationships between accused politicians, corporate contractors, and shell companies |
| `money-trail` | `src/features/money-trail/MoneyTrailHero.tsx` | High-impact hero banner displaying cumulative public money lost in major post-independence Indian scams |
| `money-trail` | `src/features/money-trail/ScamCard.tsx` | Scam investigation card showing estimated loss, time period, responsible ministry, and audit status |
| `money-trail` | `src/features/money-trail/ShareCardModal.tsx` | Social card generator creating downloadable high-contrast infographics summarizing scam details for sharing |
| `news-sentiment` | `src/features/news-sentiment/NewsSentimentStream.tsx` | Media sentiment stream analyzing positive, negative, and neutral press coverage trends for politicians |
| `party-hopper` | `src/features/party-hopper/PartyHopperTimeline.tsx` | Political loyalty timeline tracking defections, party switches, coalition realignments, and opportunism |
| `politician-profile` | `src/features/politician-profile/ParliamentStats.tsx` | Parliamentary performance dashboard: Lok Sabha attendance percentage, debates attended, and questions raised |
| `politician-profile` | `src/features/politician-profile/PositionHistory.tsx` | Chronological timeline of cabinet ministries, state executive offices, and committee chairmanships held |
| `politician-profile` | `src/features/politician-profile/ProfileHeader.tsx` | Dossier header card displaying politician portrait, party flag, constituency, age, and composite score gauge |
| `search` | `src/features/search/DisambiguationModal.tsx` | Modal resolving ambiguous queries with multiple matching politicians sharing identical or similar names |
| `search` | `src/features/search/SearchBar.tsx` | Real-time autocomplete search bar with filter chips for Indian states, political parties, and houses of parliament |
| `verdict-score` | `src/features/verdict-score/ScoreBreakdownModal.tsx` | Modal exposing the exact mathematical calculation, penalties, and bonuses across all 7 score parameters |
| `verdict-score` | `src/features/verdict-score/ScoreSimulatorModal.tsx` | Interactive "What-If" simulator allowing citizens to tweak criminal charges or attendance and view score impacts |
| `verdict-score` | `src/features/verdict-score/VerdictScoreGauge.tsx` | Circular radial SVG score gauge animating the 0-10 composite VERDICT score with color-coded risk bands |

---

## Library / Utilities & Static Datasets

### Library & Runtime Utilities (`src/lib/`, `src/types/`, `src/hooks/`, `src/`)

| File | Purpose |
|---|---|
| `src/lib/auth.ts` | NextAuth configuration options, session management, and credential authentication callbacks |
| `src/lib/db.ts` | Primary Supabase client initialization, connection pooling setup, and database health check function |
| `src/lib/logger.ts` | Pino structured JSON logger configured with environment-based log levels for server execution |
| `src/lib/supabase.ts` | Universal Supabase client helper supporting fallback local JSON data loading for offline development |
| `src/lib/utils.ts` | Core utility library providing Tailwind class merging (`cn`), currency formatting, and text sanitizers |
| `src/lib/verdict-score-calc.ts` | Mathematical engine implementing the 7-parameter VERDICT scoring algorithm and score band assignments |
| `src/types/index.ts` | Global TypeScript domain type definitions (Politician, CriminalCase, AssetHistory, Score, Scam, Article) |
| `src/hooks/useDebounce.ts` | Custom React hook for debouncing fast-frequency values such as user input in search boxes |
| `src/env.mjs` | Type-safe environment variable schema validation using `@t3-oss/env-nextjs` and Zod |
| `src/middleware.ts` | Next.js Edge middleware enforcing IP-based rate limiting, CSP security headers, and request tracing |

### Static Datasets & Reference Dictionaries (`src/data/`)

| File | Purpose |
|---|---|
| `src/data/all-mps.json` | Complete static JSON dataset of 543 Lok Sabha MPs elected in the 2024 General Elections |
| `src/data/budget-data.ts` | Union Budget of India expenditure dataset mapping ministry-wise capital and revenue fund allocations |
| `src/data/ground-truth-news.json` | Curated seed and offline fallback dataset of investigative journalism corruption stories |
| `src/data/india-rankings.ts` | 114 global ranking metrics for India covering corruption, hunger, press freedom, and healthcare indices |
| `src/data/ipc-dictionary.ts` | Comprehensive dictionary translating Indian Penal Code (IPC) criminal sections into plain-language definitions |
| `src/data/mock-constituencies.ts` | Mock parliamentary constituency database mapping constituency names to states, zones, and voter counts |
| `src/data/mock-controversies.ts` | Curated database of political scandals and controversies linked to prominent national politicians |
| `src/data/mock-ground-truth.ts` | Rich mock dataset of investigative articles and FIR records used for development and offline testing |
| `src/data/mock-politicians.ts` | Rich mock profiles of prominent national political leaders with complete dossiers and score breakdowns |
| `src/data/mock-scams.ts` | Comprehensive dataset of documented CAG audit scam cases, loss estimates, and chronological timelines |
| `src/data/rupee-data.ts` | Historical Indian Rupee (INR) exchange rate time series against the US Dollar from 1947 through 2026 |

---

## Database & Schema

### Supabase SQL Migrations (`supabase/migrations/`)

| File | Purpose |
|---|---|
| `supabase/migrations/20260820000000_verdict_schema.sql` | Initial master database migration: politicians, criminal cases, assets, ratings, news, RLS policies, and indexes |
| `supabase/migrations/20260828_create_money_trail_scams.sql` | CAG Money Trail schema migration: scams table, accused politicians join table, and category taxonomy |
| `supabase/migrations/20260905000000_score_snapshots.sql` | Score tracking migration: `score_snapshots` table, daily snapshot triggers, and historical trend query functions |

### Cached Data Dumps & Checkpoints (`scripts/data/`)

| File | Purpose |
|---|---|
| `scripts/data/.gitignore` | Gitignore rule preventing local data cache directories and large raw dumps from being committed |
| `scripts/data/bills_data.json` | Parliamentary bills database (2020-2026) tracking legislative status, introduction dates, and debate hours |
| `scripts/data/citizen_ratings.json` | Cached export of verified citizen accountability ratings and feedback submissions |
| `scripts/data/download_checkpoint.json` | Resumable progress checkpoint file for the multi-threaded politician photo downloader |
| `scripts/data/ground_truth_news.json` | Cached investigative news data feed fetched by daily RSS and news scrapers |
| `scripts/data/image_fix_checkpoint.json` | Checkpoint log recording image resolution and Wikipedia thumbnail fallback fixes |
| `scripts/data/MPLADS_raw.csv` | Raw Ministry of Statistics CSV dataset tracking MP Local Area Development Scheme fund utilization |
| `scripts/data/mps_2024_raw.json` | Raw parsed candidate dataset from the 2024 Lok Sabha General Elections |
| `scripts/data/myneta_winners_2024.json` | National Election Watch / ADR candidate affidavit dataset for all 543 elected MPs in 2024 |
| `scripts/data/photo_checkpoint.json` | State tracking checkpoint logging successful and pending politician portrait downloads |
| `scripts/data/photo_log.json` | Audit log recording source image URLs, HTTP response codes, and local storage mappings |
| `scripts/data/prs_mptrack_cache.json` | Cached PRS Legislative Research MP Track attendance, debates, and private member bills data |
| `scripts/data/rti_full_data.json` | Consolidated RTI Wiki repository containing educational, criminal, and financial disclosures |
| `scripts/data/rti_photo_map.json` | Hash map linking verified politician names directly to their canonical RTI Wiki portrait URLs |
| `scripts/data/score_snapshots.json` | Cached snapshot dataset recording historical VERDICT scores for weekly leaderboard delta calculations |
| `scripts/data/checkpoints/progress.json` | Pipeline state machine progress tracker for long-running batch extraction operations |
| `scripts/data/photo_cache/` | Directory containing 1,903 downloaded and optimized politician portrait images (bulk cached) |
| `scripts/data/rti_cache/bills.csv` | Raw CSV export of parliamentary bills and committee reports extracted from RTI Wiki |
| `scripts/data/rti_cache/ls_members.csv` | Raw CSV roster of Lok Sabha members with constituency and party metadata from RTI Wiki |
| `scripts/data/rti_cache/ls_mps.json` | Structured JSON database of Lok Sabha parliamentarians parsed from RTI Wiki records |
| `scripts/data/rti_cache/rs_members.csv` | Raw CSV roster of Rajya Sabha members with state representation metadata from RTI Wiki |
| `scripts/data/rti_cache/rs_mps.json` | Structured JSON database of Rajya Sabha parliamentarians parsed from RTI Wiki records |

---

## Data Pipeline Scripts

### Core Pipeline & Scraper Scripts (`scripts/`)

| File | What It Does | How to Run |
|---|---|---|
| `scripts/scrape_mps.py` | Scrapes candidate affidavits and criminal records from MyNeta / National Election Watch | `python scripts/scrape_mps.py` |
| `scripts/import_rti_wiki.py` | Parses and ingests RTI Wiki CSV dumps into local databases and structured JSON tables | `python scripts/import_rti_wiki.py` |
| `scripts/fetch_all_photos.py` | Multi-threaded photo scraper fetching portraits across Sansad, Lok Sabha, RS, and Wikipedia | `python scripts/fetch_all_photos.py` |
| `scripts/download_photos_final.py` | Resilient batch downloader archiving high-resolution Sansad.in MP portraits locally | `python scripts/download_photos_final.py` |
| `scripts/load_all_photos_fast.py` | High-speed concurrent downloader optimizing portrait assets for web delivery | `python scripts/load_all_photos_fast.py` |
| `scripts/fix_images.py` | Validates image headers, detects broken URLs, and resolves Wikipedia fallback portraits | `python scripts/fix_images.py` |
| `scripts/migrate_to_supabase.py` | Migrates local datasets (MPs, cases, assets, controversies) into remote Supabase database | `python scripts/migrate_to_supabase.py` |
| `scripts/seed_controversies.py` | Seeds verified controversies, news articles, and scandal timelines for top national politicians | `python scripts/seed_controversies.py` |
| `scripts/seed_scam_data.py` | Seeds CAG audit scam records, financial loss figures, and timelines for the Money Trail feature | `python scripts/seed_scam_data.py` |
| `scripts/seed_portfolios.py` | Seeds historical cabinet portfolios and ministerial roles held by Members of Parliament | `python scripts/seed_portfolios.py` |
| `scripts/fetch_ground_truth_daily.py` | Daily RSS news scraper aggregating investigative corruption stories for the Ground Truth section | `python scripts/fetch_ground_truth_daily.py` |
| `scripts/fetch_ground_truth_news.py` | Supplemental news aggregator extracting investigative reports from national journalism outlets | `python scripts/fetch_ground_truth_news.py` |
| `scripts/check_unsolved_status.py` | Automated audit script checking stale public inquiries and updating "What Happened Next" statuses | `python scripts/check_unsolved_status.py` |
| `scripts/take_daily_snapshot.py` | Captures daily politician score snapshots into Supabase to track weekly leaderboard deltas | `python scripts/take_daily_snapshot.py` |
| `scripts/recalculate_all_verdict_scores.py` | Batch recalculates composite VERDICT scores for all 543 MPs using the 7-factor algorithm | `python scripts/recalculate_all_verdict_scores.py` |
| `scripts/clean_and_recalc.py` | Cleans corrupt or missing database records and triggers global score recalculation | `python scripts/clean_and_recalc.py` |
| `scripts/calculate_asset_growth.py` | Computes percentage asset growth across multiple election affidavits to flag disproportionate wealth | `python scripts/calculate_asset_growth.py` |
| `scripts/calculate_party_switches.py` | Calculates political opportunism and defection scores from historical election contesting records | `python scripts/calculate_party_switches.py` |
| `scripts/sync_myneta_cases.py` | Synchronizes IPC criminal case details and court status directly from ADR MyNeta reports | `python scripts/sync_myneta_cases.py` |
| `scripts/import_mps.py` | Python ingestion pipeline importing MP records from local JSON files into database | `python scripts/import_mps.py` |
| `scripts/import_mps.js` | Node.js ingestion script transforming MP records for frontend bundling | `node scripts/import_mps.js` |
| `scripts/import_csv_data.py` | Parses raw Lok Sabha 2024 candidate CSVs and normalizes field schemas | `python scripts/import_csv_data.py` |
| `scripts/import_mplads_data.py` | Ingests MPLADS fund allocation and expenditure CSV files into politician performance records | `python scripts/import_mplads_data.py` |
| `scripts/import_prs_attendance.py` | Imports parliamentary attendance percentages, debates, and questions asked from PRS Legislative Research | `python scripts/import_prs_attendance.py` |
| `scripts/fix_database_and_scores.py` | Integrity repair script resolving null foreign keys, orphaned cases, and broken score references | `python scripts/fix_database_and_scores.py` |
| `scripts/upgrade_db_schema.py` | Automates schema updates and column additions on live Supabase instances | `python scripts/upgrade_db_schema.py` |
| `scripts/inspect_db.py` | CLI utility for inspecting SQLite pipeline database tables and row counts | `python scripts/inspect_db.py` |
| `scripts/generate_icons.js` | Generates full suite of multi-resolution PWA icons (72px-512px) from SVG source | `node scripts/generate_icons.js` |
| `scripts/generate_pdf_report.js` | Headless Chromium script converting HTML project documentation into formatted PDF audit reports | `node scripts/generate_pdf_report.js` |
| `scripts/generate_feature_expansion_report.js` | Compiles and renders the comprehensive feature expansion and UI architecture PDF report | `node scripts/generate_feature_expansion_report.js` |
| `scripts/generate_docs_info.py` | Gathers database metrics and generates statistics for technical documentation markdown files | `python scripts/generate_docs_info.py` |
| `scripts/generate_review_markdown.py` | Creates formatted review markdown tables from database audit scanning scripts | `python scripts/generate_review_markdown.py` |
| `scripts/setup.sh` | Bash script installing all required Python virtualenv packages and Node.js dependencies | `bash scripts/setup.sh` |
| `scripts/test_api.py` | Lightweight HTTP sanity test script validating API endpoint responses | `python scripts/test_api.py` |
| `scripts/test_load.py` | Concurrent Python load generator benchmarking server throughput under simulated traffic | `python scripts/test_load.py` |
| `scripts/lib/data_integrity_guard.py` | Shared verification library detecting fabricated politician patterns and enforcing schema guardrails | *(Library / imported)* |

### Automated Backend Data Pipeline (`data-pipeline/`)
Autonomous Python ETL ingestion pipeline featuring rate limiters, proxy rotation, UGC verification, and cron scheduling.

| File | What It Does | Role |
|---|---|---|
| `data-pipeline/README.md` | Architecture guide, workflow diagram, and CLI operational manual for the data pipeline | Documentation |
| `data-pipeline/config.py` | Configuration settings managing database connection URLs, rate limits, and scraper throttling | Configuration |
| `data-pipeline/main.py` | Central CLI entrypoint for running pipeline tasks (scraping, parsing, enriching, scoring) | CLI Entrypoint |
| `data-pipeline/requirements.txt` | Python package dependencies for the backend pipeline (SQLAlchemy, requests, bs4, etc.) | Dependency Pin |
| `data-pipeline/verdict_pipeline.db` | Local SQLite database caching parsed affidavit data and intermediate enrichment results | Database Cache |
| `data-pipeline/data/lok_dhaba_sample.csv` | Sample dataset of historical Indian election candidates from Ashoka University TCPD | Reference Data |
| `data-pipeline/data/lok_sabha_2024_results.csv` | Official 2024 Lok Sabha constituency-wise election results published by Election Commission | Reference Data |
| `data-pipeline/enrichers/__init__.py` | Package initialization file for data enrichment modules | Package Init |
| `data-pipeline/enrichers/education_verifier.py` | UGC educational institution verification engine cross-checking declared candidate degrees | Enrichment Engine |
| `data-pipeline/enrichers/score_calculator.py` | Pipeline scoring calculator executing 7-factor composite scoring on raw candidate rows | Scoring Engine |
| `data-pipeline/enrichers/wikipedia_enricher.py` | Scrapes biographical summaries, educational institutions, and portrait links from Wikipedia | Enrichment Engine |
| `data-pipeline/importers/__init__.py` | Package initialization file for data import modules | Package Init |
| `data-pipeline/importers/base_importer.py` | Base importer class implementing fuzzy name matching, phonetic deduplication, and DB commits | Core Importer |
| `data-pipeline/importers/lok_dhaba_importer.py` | Ingests and normalizes historical election contesting records from Lok Dhaba CSV archives | Batch Importer |
| `data-pipeline/importers/myneta_importer.py` | Ingests candidate affidavit data, educational qualifications, and wealth disclosures from MyNeta | Batch Importer |
| `data-pipeline/logs/pipeline_2026-08-20.log` | Pipeline execution log recording scraper activity and database ingestion on 2026-08-20 | Pipeline Log |
| `data-pipeline/logs/pipeline_2026-08-21.log` | Pipeline execution log recording scraper activity and database ingestion on 2026-08-21 | Pipeline Log |
| `data-pipeline/logs/pipeline_2026-08-22.log` | Pipeline execution log recording scraper activity and database ingestion on 2026-08-22 | Pipeline Log |
| `data-pipeline/logs/pipeline_2026-08-23.log` | Pipeline execution log recording scraper activity and database ingestion on 2026-08-23 | Pipeline Log |
| `data-pipeline/migrations/001_create_pipeline_tables.sql` | SQL DDL initializing pipeline database tables for raw candidates, cases, and affidavits | Schema DDL |
| `data-pipeline/parsers/__init__.py` | Package initialization file for document parsing modules | Package Init |
| `data-pipeline/parsers/eci_affidavit_pdf.py` | PDF OCR and text extraction engine parsing Form 26 election affidavits from ECI portals | Parser Engine |
| `data-pipeline/parsers/ipc_translator.py` | Legal parser translating raw IPC sections to normalized severity categories and weights | Parser Engine |
| `data-pipeline/scheduler/__init__.py` | Package initialization file for scheduling modules | Package Init |
| `data-pipeline/scheduler/cron_jobs.py` | Cron job schedule definitions for automated nightly scraping, news fetching, and scoring | Cron Job Registry |
| `data-pipeline/scheduler/job_registry.py` | Scheduler daemon managing task execution queues, retries, and error notifications | Daemon Worker |
| `data-pipeline/scrapers/__init__.py` | Package initialization file for external website scrapers | Package Init |
| `data-pipeline/scrapers/ecourts.py` | eCourts India (NJDG) scraper retrieving live case hearings, FIR numbers, and disposition statuses | Web Scraper |
| `data-pipeline/scrapers/google_news.py` | Google News RSS scraper and VADER/TextBlob sentiment classifier for political press coverage | News Scraper |
| `data-pipeline/scrapers/lok_dhaba.py` | Scraper parsing Ashoka University TCPD Lok Dhaba historical political datasets | Dataset Scraper |
| `data-pipeline/scrapers/myneta.py` | Asynchronous scraper extracting candidate affidavits and declared wealth from MyNeta.info | Web Scraper |
| `data-pipeline/scrapers/sansad.py` | Parliament of India (sansad.in) scraper tracking MP attendance, debates, and questions | Portal Scraper |
| `data-pipeline/scrapers/wikipedia_api.py` | Wikipedia REST API client fetching biographies, infobox parameters, and portrait links | API Client |
| `data-pipeline/utils/__init__.py` | Package initialization file for pipeline utility modules | Package Init |
| `data-pipeline/utils/db.py` | SQLAlchemy database engine connection manager and thread-safe session factories | DB Connector |
| `data-pipeline/utils/logger.py` | Custom logging formatter producing structured JSON and ANSI color console output | Logger Utility |
| `data-pipeline/utils/models.py` | SQLAlchemy ORM models defining candidate, criminal case, asset, and attendance schema | ORM Models |
| `data-pipeline/utils/proxy_manager.py` | Rotating HTTP proxy manager with health checking and automatic backoff for resilient scraping | Networking Utility |
| `data-pipeline/utils/rate_limiter.py` | Token-bucket rate limiter preventing IP bans across external government portals | Networking Utility |

---

## Audit & QA Scripts (`scripts/audit/`)

### Active Test Suites & Security Penetration Scanners

| File | Purpose |
|---|---|
| `scripts/audit_fabricated_data.py` | Scans Supabase database for hallucinated/fake politician entries using heuristics and cross-references |
| `scripts/verify_against_myneta.py` | Cross-verifies flagged suspicious entries against official ADR MyNeta winning candidate records |
| `scripts/remove_fabricated_entries.py` | Safely deletes confirmed fabricated politician records after generating an automated pre-deletion JSON backup |
| `scripts/audit/test_all_pages.js` | Automated QA test suite verifying HTTP status 200, SSR markup, CSP headers, and DOM elements across all 19 web routes |
| `scripts/audit/security_tests.js` | Penetration testing suite executing automated SQL injection, XSS payloads, SSRF bypasses, and rate-limit attacks |
| `scripts/audit/data_leak_tests.js` | Static and runtime audit verifying that `SUPABASE_SERVICE_ROLE_KEY` and private secrets never leak to client bundles |
| `scripts/audit/hidden_routes.js` | Web crawler detecting exposed, undocumented, or unauthenticated internal API endpoints |

### Generated Audit Reports & Test Output Artifacts

| File | Purpose |
|---|---|
| `scripts/audit/FABRICATED_DATA_REVIEW.md` | Detailed human review document classifying audited politician records into Confirmed Real vs Hallucinated |
| `scripts/audit/FULL_AUDIT_REPORT.md` | Comprehensive end-to-end audit report documenting penetration testing, leak detection, and QA passes |
| `scripts/audit/audit_results.json` | Machine-readable test execution report logging response latencies, HTTP statuses, and header validations |
| `scripts/audit/data_leak_results.json` | Security audit log certifying zero credential exposures across all compiled client chunks and APIs |
| `scripts/audit/security_results.json` | Penetration test findings logging SQLi, XSS, and SSRF rejection verifications across all endpoints |
| `scripts/audit/hidden_routes_results.json` | Route discovery scan output verifying that all exposed endpoints are intentional and protected |
| `scripts/audit/verification_results.json` | Cross-reference dataset comparing database records against official MyNeta 2024 MP records |
| `scripts/audit/fabricated_data_report.json` | Log of flagged suspicious entities identified during the production data integrity audit |
| `scripts/audit/deleted_backup_20260905_125107.json` | Pre-deletion complete JSON backup of 5 hallucinated politician records removed on 2026-09-05 |

---

## Tests (`tests/`)

All automated unit, integration, and load testing suites.

| File | Tests / Role | Run Command |
|---|---|---|
| `tests/setup.ts` | Vitest global setup file configuring environment variables, test doubles, and console mocks | *(auto-run by runner)* |
| `tests/unit/verdict-score.test.ts` | Unit test suite validating the 7-factor VERDICT scoring formula, penalty weights, and boundary conditions | `npm test` |
| `tests/integration/api-politicians.test.ts` | Integration tests verifying `/api/politicians` response schema, pagination, and multi-filter queries | `npm test` |
| `tests/integration/api-search.test.ts` | Integration tests for `/api/search` verifying query length bounds, sanitization, and matching logic | `npm test` |
| `tests/integration/api-ratings.test.ts` | Integration tests verifying `/api/ratings` rate limiting, rating score constraints (1-5), and anti-tamper checks | `npm test` |
| `tests/integration/api-money-trail.test.ts` | Integration tests verifying `/api/scams` and `/api/scams/stats` endpoints and loss calculations | `npm test` |
| `tests/integration/api-proxy-image.test.ts` | Security integration tests confirming SSRF protections, local IP blocking, and whitelisted host checks | `npm test` |
| `tests/load/k6-traffic-test.js` | k6 stress testing script simulating concurrent users across homepage, politician profiles, and search | `k6 run tests/load/k6-traffic-test.js` |
| `tests/load/k6-summary.json` | Benchmark performance summary reporting throughput, p95 latency, and error rates from k6 load testing | *(benchmark output)* |
| `tests/load/bin/k6.exe` | Standalone k6 load testing engine binary for running high-concurrency benchmarks on Windows | *(executable binary)* |
| `vitest.config.ts` | Vitest configuration file defining test discovery patterns, TypeScript aliases, and coverage thresholds | `npx vitest` |

---

## Configuration Files (Project Root)

| File | Purpose |
|---|---|
| `package.json` | Node.js project manifest defining npm scripts (`dev`, `build`, `test`, `lint`) and runtime/dev dependencies |
| `package-lock.json` | Deterministic dependency lockfile recording exact installed package versions and dependency trees |
| `next.config.js` | Next.js configuration declaring strict CSP headers, image whitelists, PWA settings, and security headers |
| `tsconfig.json` | TypeScript compiler configuration enforcing strict mode, Next.js plugins, and `@/*` module aliases |
| `tsconfig.tsbuildinfo` | TypeScript incremental compilation cache accelerating subsequent type-checking passes |
| `tailwind.config.ts` | Tailwind CSS theme configuration defining brutalist custom colors, border radii, and typography scales |
| `postcss.config.mjs` | PostCSS configuration file managing Tailwind CSS and Autoprefixer build pipeline transforms |
| `eslint.config.mjs` | Flat ESLint configuration enforcing Next.js Core Web Vitals and TypeScript linting rules |
| `.prettierrc` | Prettier configuration specifying code formatting standards (semi, singleQuote, tabWidth) |
| `vercel.json` | Vercel platform deployment configuration specifying routing rules, security headers, and function limits |
| `Dockerfile` | Multi-stage production Docker build recipe packaging the Next.js application into an optimized container |
| `docker-compose.yml` | Docker Compose configuration orchestrating local Postgres and Redis development services |
| `.dockerignore` | Specifies build artifacts, node_modules, and cache files excluded from Docker container images |
| `.gitignore` | Specifies files and directories excluded from git tracking (`.env*.local`, `.next/`, `node_modules/`, etc.) |
| `.vercelignore` | Specifies development files, test scripts, and local caches excluded from Vercel deployment uploads |
| `next-env.d.ts` | Next.js auto-generated TypeScript declarations providing ambient types for image and page modules |
| `sentry.client.config.ts` | Sentry error tracking configuration capturing uncaught exceptions and client-side web vitals in production |
| `sentry.server.config.ts` | Sentry error monitoring configuration capturing unhandled Node.js backend exceptions and API errors |
| `sentry.edge.config.ts` | Sentry configuration instrumenting Next.js Edge Middleware and edge runtime handlers |
| `.env.local` | Local development environment variable definitions (git-ignored, contains credentials) |

---

## Documentation

| File | Purpose |
|---|---|
| `README.md` | Primary project documentation containing architecture overview, quickstart instructions, and live deployment links |
| `PROJECT_FILE_MAP.md` | **This file** — Comprehensive, navigable lookup table cataloging every file across the entire repository |
| `VERDICT_SIH2026_Official.pptx` | Official Smart India Hackathon 2026 slide deck presentation for jury evaluation and pitch competition |
| `docs/openapi.yaml` | Complete OpenAPI 3.0 specification documenting all 19 public REST API endpoints with request/response schemas |
| `docs/PROJECT_REPORT.html` | Interactive HTML project report detailing system architecture, data models, and methodology |
| `docs/COMPLETE_PLATFORM_REPORT.html` | Comprehensive HTML platform evaluation report showcasing features, performance metrics, and security controls |
| `reports/VERDICT_PROJECT_DOCS.md` | Master technical documentation: database schema, scoring algorithms, threat models, and maintenance manuals |
| `reports/PRODUCTION_READINESS_AUDIT_REPORT.pdf` | Engineering audit report assessing production maturity, resilience, performance, and operational health |
| `reports/POST_REMEDIATION_SECURITY_AUDIT_REPORT.pdf` | Security audit report confirming remediation of SEC-01 through SEC-20 vulnerabilities |
| `reports/FULL_SPECTRUM_PRODUCTION_READINESS_AUDIT.pdf` | Comprehensive production readiness evaluation verifying scalability, failover, and compliance |
| `reports/VERDICT_COMPREHENSIVE_FEATURE_REPORT.pdf` | Deep-dive visual report cataloging all platform features, user journeys, and component hierarchies |
| `reports/VERDICT_MASTER_PROJECT_REPORT.pdf` | Master evaluation report compiled for Smart India Hackathon jury reviewing design and engineering rigor |
| `reports/sih_slides/` | Directory containing 6 high-resolution rendered presentation slides (`slide_1.png` through `slide_6.png`) |

---

## Public Assets (`public/`)

| Path | Contents / Purpose |
|---|---|
| `public/manifest.json` | Web App Manifest configuring PWA app name, standalone display mode, theme colors, and icons |
| `public/robots.txt` | Search engine crawler rules allowing public indexing while protecting internal API endpoints |
| `public/og-image.svg` | High-contrast brutalist OpenGraph preview image used for social media link sharing |
| `public/openapi.yaml` | Publicly accessible copy of the OpenAPI 3.0 specification served directly to Swagger UI at `/api-docs` |
| `public/sw.js` | Service worker script handling asset caching, offline fallback routing, and PWA background sync |
| `public/workbox-4754cb34.js` | Workbox service worker runtime library providing caching strategies for offline support |
| `public/fallback-Zb2I8ygUmTMUOYK_CbeF2.js` | Next-PWA offline fallback helper script serving offline routes when disconnected |
| `public/images/default-politician.svg` | Default SVG placeholder silhouette for politicians without an available portrait photo |
| `public/icons/` | PWA icon assets spanning 8 standard dimensions (72x72 through 512x512) plus vector `icon.svg` (9 files) |
| `public/static/data/ls-photos/` | Local optimized portrait directory for 540 Lok Sabha Members of Parliament (540 images) |
| `public/static/data/rs-photos/` | Local optimized portrait directory for 236 Rajya Sabha Members of Parliament (236 images) |
| `public/static/data/leaders/` | High-resolution portraits of 19 prominent national political figures and party leaders (19 images) |

---

## CI/CD & Deployment

| File | Purpose |
|---|---|
| `.github/workflows/ci.yml` | Continuous Integration workflow running linter, type-check, Vitest suite, and production build on every PR |
| `.github/workflows/daily-snapshot.yml` | Scheduled GitHub Actions workflow running `scripts/take_daily_snapshot.py` daily to capture score deltas |
| `vercel.json` | Vercel deployment manifest configuring serverless function durations, headers, and rewrites |
| `Dockerfile` | Container specification defining production Node.js runtime environment for Docker-based deployments |
| `docker-compose.yml` | Multi-container Docker orchestration file for local Postgres and Redis environments |

---

## Environment & Secrets

⚠️ **Never commit actual values. This section lists WHICH variables exist and WHERE they're used — not their values.**

| Variable | Used In | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `src/env.mjs`, `src/lib/db.ts`, `src/lib/supabase.ts` | Public HTTPS endpoint for Supabase PostgreSQL database |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `src/env.mjs`, `src/lib/db.ts`, `src/lib/supabase.ts` | Anonymous public API key subject to Row Level Security (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | `src/env.mjs`, `src/lib/db.ts`, `scripts/*.py` | Full-privilege backend administrative key (server & scripts only) |
| `DATABASE_URL` | `src/env.mjs`, `data-pipeline/config.py` | Direct PostgreSQL connection string for migrations and ORMs |
| `NEXTAUTH_URL` | `src/env.mjs`, `src/lib/auth.ts` | Canonical base URL for NextAuth authentication callbacks |
| `NEXTAUTH_SECRET` | `src/env.mjs`, `src/lib/auth.ts` | Secret key used to encrypt and sign session tokens and cookies |
| `NEXT_PUBLIC_APP_URL` | `src/env.mjs`, `next.config.js` | Canonical public application URL for metadata and OpenGraph tags |
| `NEXT_PUBLIC_APP_NAME` | `src/env.mjs` | Public brand application name (`VERDICT`) |
| `NODE_ENV` | `src/env.mjs`, `next.config.js`, runtime | Current runtime environment (`development`, `test`, `production`) |
| `SKIP_ENV_VALIDATION` | `src/env.mjs` | Flag allowing builds without full environment credentials during CI |
| `LOG_LEVEL` | `src/lib/logger.ts` | Minimum log verbosity level for Pino logger (`debug`, `info`, `warn`) |
| `NEXT_PUBLIC_SENTRY_DSN` | `sentry.client.config.ts` | Sentry Data Source Name for client-side crash telemetry |
| `SENTRY_DSN` | `sentry.server.config.ts`, `sentry.edge.config.ts` | Sentry DSN for backend server and Edge middleware error tracking |
| `PIPELINE_LOG_LEVEL` | `data-pipeline/config.py` | Logging verbosity level for python data engineering pipeline |
| `PROXY_LIST` | `data-pipeline/config.py` | Comma-separated list of HTTP proxy endpoints for resilient web scraping |
| `MYNETA_RPS` | `data-pipeline/config.py` | Rate-limit throttling for MyNeta scraper requests per second |
| `SANSAD_RPS` | `data-pipeline/config.py` | Rate-limit throttling for Sansad.in parliament scraper |
| `ECOURTS_RPS` | `data-pipeline/config.py` | Rate-limit throttling for eCourts NJDG judicial case scraper |
| `GOOGLE_NEWS_RPS` | `data-pipeline/config.py` | Rate-limit throttling for Google News RSS scraper |
| `WIKIPEDIA_RPS` | `data-pipeline/config.py` | Rate-limit throttling for Wikipedia API queries |

*Actual values live in `.env.local` (git-ignored) locally, and in Vercel Dashboard → Settings → Environment Variables for production.*

---

## 📌 QUICK ANSWERS TO COMMON QUESTIONS

**"Where is the scoring formula?"**  
→ `src/lib/verdict-score-calc.ts` (Core 7-parameter algorithm) & `src/features/verdict-score/ScoreBreakdownModal.tsx` (UI explanation)

**"Where do I add a new API route?"**  
→ `src/app/api/[route-name]/route.ts`

**"Where is the database schema defined?"**  
→ Master schema: `supabase/migrations/20260820000000_verdict_schema.sql`  
→ Money Trail scams: `supabase/migrations/20260828_create_money_trail_scams.sql`  
→ Score history: `supabase/migrations/20260905000000_score_snapshots.sql`

**"Where do politician photos get downloaded to?"**  
→ `public/static/data/ls-photos/` (Lok Sabha MPs) and `public/static/data/rs-photos/` (Rajya Sabha MPs)

**"Where is the image proxy / SSRF protection?"**  
→ `src/app/api/proxy-image/route.ts` (Enforces domain whitelisting and blocks loopback/private IPs)

**"Where is rate limiting configured?"**  
→ `src/middleware.ts` (Next.js Edge middleware with in-memory token bucket rate limiter)

**"Where do I change security headers / CSP?"**  
→ `next.config.js` (`headers()` configuration defining Content-Security-Policy, HSTS, X-Frame-Options)

**"Where are the data import scripts?"**  
→ `scripts/` (standalone pipeline loaders) and `data-pipeline/` (orchestrated ingestion framework)

**"Where is the test suite?"**  
→ `tests/unit/` (scoring formula math tests) and `tests/integration/` (REST API contracts and security)

**"Where do I find the OpenAPI spec?"**  
→ `docs/openapi.yaml` (served live via Swagger UI at `/api-docs` and copied at `public/openapi.yaml`)

**"Where are the CAG scam case write-ups?"**  
→ `scripts/seed_scam_data.py` (authoritative seed) → `src/data/mock-scams.ts` (offline fallback) → Supabase `scams` table (live)

**"Where is the Ground Truth news fetcher?"**  
→ `scripts/fetch_ground_truth_daily.py` (Daily RSS news ingest) & `scripts/check_unsolved_status.py` (Unsolved inquiry tracker)

**"Where is the automated data integrity audit script?"**  
→ `scripts/audit_fabricated_data.py` (detection), `scripts/verify_against_myneta.py` (verification), and `scripts/remove_fabricated_entries.py` (safe removal)

**"Where do I find deployment/readiness check results?"**  
→ `scripts/audit/audit_results.json` and `scripts/audit/FULL_AUDIT_REPORT.md`

**"Where is the Union Budget / Tax calculator logic?"**  
→ `src/app/tax-money/page.tsx`, `src/app/where-is-my-tax/page.tsx`, and `src/data/budget-data.ts`

**"Where is the Indian Penal Code (IPC) plain-English translation dictionary?"**  
→ `src/data/ipc-dictionary.ts` & `src/features/criminal-dossier/IPCTranslatorModal.tsx`

---

## 🔢 PROJECT STATS (Auto-Generated)

- **Total pages:** 19
- **Total API routes:** 19
- **Total components:** 55 (11 UI primitives, 4 layout/pwa, 7 root shared, 33 feature-sliced components)
- **Total scripts:** 81 (47 standalone scripts in `scripts/`, 34 pipeline modules in `data-pipeline/`)
- **Total test files:** 8 automated test suites (plus k6 performance runner and summary report)
- **Total lines of TypeScript/TSX:** 21,584 lines across 113 source files in `src/`
- **Total lines of Python:** 7,886 lines in `scripts/` (11,020 lines across `scripts/` and `data-pipeline/`)

---

## ⚠️ Uncategorized / Needs Review

The following auxiliary utility and diagnostic files exist in the project for presentation creation, Vercel environment synchronization, and testing binaries.

| File | Note |
|---|---|
| `scripts/build_verdict_sih_official.py` | Automation script generating and styling the official SIH 2026 pitch deck PowerPoint presentation — Safe to keep as presentation builder |
| `scripts/dump_text.py` | Diagnostic script extracting text boxes from PPTX slides for presentation consistency auditing — One-off pitch deck helper; safe to keep or archive |
| `scripts/export_presentation_images.py` | Converts presentation slides to high-resolution PNG images for inclusion in audit reports — Presentation asset generator; safe to keep |
| `scripts/inspect_shapes_precise.py` | Diagnostic script inspecting PPTX slide shapes and dimensions for layout alignment — One-off pitch deck helper; safe to keep |
| `scripts/inspect_template.py` | Inspects slide master placeholders and layouts in presentation templates — One-off pitch deck helper; safe to keep |
| `scripts/set-vercel-env.ps1` | PowerShell script automating upload of environment variables to Vercel via CLI — Deployment automation; active utility |
| `scripts/set-vercel-env.sh` | Bash script automating upload of environment variables to Vercel via CLI — Deployment automation; active utility |
| `scripts/set_anon_key.py` | Syncs Supabase anonymous key from `.env.local` into Vercel environment configurations — Deployment automation; active utility |
| `scripts/set_vercel_env.py` | Python script setting production environment variables in Vercel project settings — Deployment automation; active utility |
| `tests/load/bin/k6.exe` | Local compiled binary of k6 load tester used for executing high-concurrency benchmarks on Windows — Local testing binary; gitignored |

---

*This file is auto-generated. To regenerate after adding new files, ask your AI assistant to "update PROJECT_FILE_MAP.md based on the current codebase structure."*
