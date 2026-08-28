-- ===================================================
-- VERDICT MIGRATION: GROUND TRUTH: MONEY TRAIL
-- Schema for Government Fund Misuse & CAG Audit Cases
-- ===================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS scam_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  subtitle TEXT,
  category VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,

  -- Financial data
  amount_allocated_crore DECIMAL(20,2),
  amount_misused_crore DECIMAL(20,2),
  amount_unspent_crore DECIMAL(20,2),
  amount_diverted_crore DECIMAL(20,2),
  amount_recovered_crore DECIMAL(20,2),
  corruption_percent DECIMAL(5,2),

  -- Benchmark comparison
  benchmark_cost_unit VARCHAR(100),
  benchmark_cost_india_normal DECIMAL(20,2),
  benchmark_cost_actual DECIMAL(20,2),
  benchmark_cost_usa DECIMAL(20,2),
  benchmark_cost_china DECIMAL(20,2),
  benchmark_cost_germany DECIMAL(20,2),
  benchmark_cost_uk DECIMAL(20,2),
  benchmark_cost_australia DECIMAL(20,2),
  benchmark_unit_label VARCHAR(100),
  cost_inflation_multiple DECIMAL(5,2),

  -- Scheme details
  scheme_name VARCHAR(500),
  ministry VARCHAR(500),
  total_beneficiaries_claimed BIGINT,
  actual_beneficiaries BIGINT,
  ghost_beneficiaries BIGINT,
  period_start INTEGER,
  period_end INTEGER,

  -- Source and accountability
  audit_body VARCHAR(255),
  audit_report_ref VARCHAR(500),
  audit_year INTEGER,
  court_case_ref VARCHAR(500),
  parliament_ref VARCHAR(500),
  source_url TEXT,
  source_name VARCHAR(255),

  -- Politician accountability
  responsible_minister_slug VARCHAR(255),
  responsible_ministry VARCHAR(255),
  responsible_politicians JSONB,

  -- Status
  current_status VARCHAR(100),
  action_taken TEXT,
  money_recovered_crore DECIMAL(20,2),

  -- Narrative
  summary TEXT NOT NULL,
  detailed_explanation TEXT,
  what_this_means_for_citizens TEXT,
  international_comparison TEXT,

  -- Meta
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scam_timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scam_id UUID REFERENCES scam_cases(id) ON DELETE CASCADE,
  event_date DATE,
  event_year INTEGER,
  event_title VARCHAR(500),
  event_description TEXT,
  event_type VARCHAR(50),
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scam_category 
  ON scam_cases(category);
CREATE INDEX IF NOT EXISTS idx_scam_severity 
  ON scam_cases(severity);
CREATE INDEX IF NOT EXISTS idx_scam_ministry 
  ON scam_cases(responsible_ministry);
CREATE INDEX IF NOT EXISTS idx_scam_slug 
  ON scam_cases(slug);
CREATE INDEX IF NOT EXISTS idx_scam_timeline_scam_id 
  ON scam_timeline_events(scam_id);

-- Enable RLS
ALTER TABLE scam_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_timeline_events ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read on scam_cases" 
  ON scam_cases FOR SELECT USING (true);

CREATE POLICY "Allow public read on scam_timeline_events" 
  ON scam_timeline_events FOR SELECT USING (true);
