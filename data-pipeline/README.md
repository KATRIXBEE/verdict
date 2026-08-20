# 🏛️ VERDICT — Backend Data Ingestion & Enrichment Pipeline

Production-grade asynchronous data pipeline for ingesting, scraping, parsing, and auto-updating 1000+ Indian politician profiles across public government sources.

---

## 1. Architecture & Data Sources

| Source | Method | Rate Limit | Scope & Data Extracted | Frequency |
|---|---|---|---|---|
| **Lok Dhaba (Ashoka TCPD)** | CSV Dataset Parse | N/A (Batch) | 50,000+ candidate election histories, vote shares, victory margins, declared assets | Initial Seed & Post-Election |
| **MyNeta.info (ADR)** | Async Scraper | 0.33 req/sec (1/3s) | Assets, liabilities, criminal cases with IPC sections, Form 26 PDF URLs | On-Demand / Bi-Weekly |
| **Sansad.in** | Async Scraper | 0.50 req/sec (1/2s) | 543 Lok Sabha + 245 Rajya Sabha attendance %, debates, starred/unstarred questions, PM bills | Weekly (Mon 03:00 IST) |
| **Wikipedia REST API** | REST API | 1.00 req/sec (1/1s) | Biographical summary extracts, verified birth dates, portrait photos | On-Demand / Monthly |
| **eCourts (NJDG)** | Async Scraper | 0.20 req/sec (1/5s) | Live hearing dates, case stages, presiding judges | Daily (02:00 IST) |
| **Google News RSS** | RSS XML Stream | 0.50 req/sec (1/2s) | 90-day media mentions, keyword sentiment polarity classifier | Daily (02:30 IST) |
| **ECI Form 26 PDF** | `pdfplumber` Regex | Local / Async | Education, profession, assets, liabilities, criminal dockets from scanned affidavits | Batch per Election Cycle |

---

## 2. Quick Setup

### 2.1 Install Dependencies
Ensure Python 3.11+ is installed, then run:

```bash
cd data-pipeline
pip install -r requirements.txt
```

### 2.2 Configure Environment Variables (`.env`)
Create a `.env` file in `data-pipeline/` (or project root):

```ini
# PostgreSQL (same database as VERDICT web platform)
# If omitted, defaults to zero-dependency local SQLite async database (verdict_pipeline.db)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/verdict

# Rate Limits & Proxy Rotation
PROXY_LIST=http://user:pass@proxy1.com:8080,http://user:pass@proxy2.com:8080
PIPELINE_LOG_LEVEL=INFO
MAX_DAILY_MYNETA_REQUESTS=500
MAX_DAILY_ECOURTS_REQUESTS=200
LOK_DHABA_CSV_PATH=./data/lok_dhaba_sample.csv
```

---

## 3. CLI Command Usage

All pipeline tasks are driven by the unified CLI entrypoint `main.py`:

### 🌾 Step 1: Seed Historical Election Data (Lok Dhaba)
```bash
python main.py import lok_dhaba --file data/lok_dhaba_sample.csv
```
> Ingests candidate profiles, generates unique URL-safe slugs, and seeds multi-year election histories.

### 📂 Step 2: Enrich Assets & Criminal Cases (MyNeta)
```bash
# Enrich politicians from a specific state:
python main.py enrich myneta --state Maharashtra

# Or enrich across all states:
python main.py enrich myneta
```

### 📖 Step 3: Enrich Bio & Photos (Wikipedia)
```bash
python main.py enrich wikipedia
```
> Queries Wikipedia API with name-variation cascades to fetch biographical extracts and portrait photos without overwriting existing ECI photos.

### 🏛️ Step 4: Enrich Parliamentary Performance (Sansad.in)
```bash
python main.py enrich sansad
```
> Scrapes attendance percentage, debates, and questions asked for all Lok Sabha & Rajya Sabha MPs.

### 📜 Step 5: Parse Scanned ECI Affidavits
```bash
# Parse a specific local or remote affidavit PDF:
python main.py parse affidavits --file path/to/affidavit.pdf

# Or process queued batch for election year:
python main.py parse affidavits --year 2024
```

### 🧮 Step 6: Recalculate Algorithmic VERDICT Scores
```bash
python main.py calculate scores
```
> Computes the 0.0–10.0 tamper-proof VERDICT Score and `data_completeness_percent` across attendance, asset growth, criminal deductions, UGC education verification, questions, and party loyalty.

### 📊 Step 7: Check Database Status & Audit Report
```bash
python main.py status
```
> Displays a formatted summary table of total politicians, photo coverage %, criminal docket records, asset declarations, and recent import logs.

### ⏰ Step 8: Run Automated Daemon Scheduler
```bash
python main.py run-scheduler
```
> Starts the background `APScheduler` daemon executing daily eCourts/News updates and weekly Sansad/Score recomputations.

---

## 4. Algorithmic VERDICT Score Formula (0.0 – 10.0)

$$\text{VERDICT Score} = \text{Base (4.0)} + \text{Attendance (0.5–2.0)} + \text{Asset Growth (0.0–2.0)} - \text{Crime Deductions (0.0–4.0)} + \text{Education (0.0–0.5)} + \text{Questions (0.25–1.0)} + \text{Loyalty (0.0–0.5)}$$

- **Attendance (Max 2.0 pts):** $\ge 80\% \rightarrow 2.0$, $60-79\% \rightarrow 1.5$, $40-59\% \rightarrow 1.0$, $<40\% \rightarrow 0.5$.
- **Asset Growth (Max 2.0 pts):** $<200\% \rightarrow 2.0$, $200-400\% \rightarrow 1.0$, $>400\% \rightarrow 0.0$ (Outlier anomaly).
- **Criminal Deductions:** Active cases deduct by severity (Minor: $-0.5$, Moderate: $-1.5$, Serious: $-2.5$, Severe: $-4.0$). Convictions double deduction. Total deduction capped at $-4.0$.
- **Education Verification:** Verified $\rightarrow 0.5$, Unverified $\rightarrow 0.25$, UGC Fake University list match $\rightarrow 0.0$.
- **Questions Asked:** $>100 \rightarrow 1.0$, $50-100 \rightarrow 0.75$, $10-49 \rightarrow 0.5$, $<10 \rightarrow 0.25$.
- **Party Loyalty:** 0 switches $\rightarrow 0.5$, 1 switch $\rightarrow 0.35$, 2 switches $\rightarrow 0.2$, $3+\rightarrow 0.0$.

---

## 5. Resilience & Rate Limiting Guidelines

1. **Token Bucket Rate Limiter (`utils/rate_limiter.py`):** Every scraper acquires tokens before emitting HTTP requests, preventing IP bans.
2. **Proxy Manager (`utils/proxy_manager.py`):** Automatically rotates proxies from `PROXY_LIST` and places failing IP addresses on a 60-minute cooling period.
3. **Exponential Backoff (`tenacity`):** Failed requests retry up to 3 times (1s, 4s, 16s). If a `429` is encountered, the scraper enters a cooldown delay.
4. **Structured JSON Logging (`utils/logger.py`):** Real-time JSON logs written daily to `logs/pipeline_YYYY-MM-DD.log`.
