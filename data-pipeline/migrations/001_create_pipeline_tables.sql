-- ========================================================================
-- VERDICT DATA PIPELINE MIGRATION 001
-- Extends existing tables and creates pipeline schema
-- ========================================================================

-- 1. Extend or Create Politicians Table
CREATE TABLE IF NOT EXISTS politicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_variants TEXT[] DEFAULT '{}',
    slug TEXT UNIQUE NOT NULL,
    photo_url TEXT,
    date_of_birth DATE,
    gender TEXT,
    current_party TEXT,
    current_constituency TEXT,
    current_state TEXT,
    current_house TEXT,
    profession TEXT,
    education TEXT,
    education_verification_status TEXT DEFAULT 'Not Checked',
    wikipedia_url TEXT,
    wikipedia_summary TEXT,
    official_website TEXT,
    social_twitter TEXT,
    social_facebook TEXT,
    verdict_score NUMERIC(4, 2) DEFAULT 5.0,
    data_completeness_percent INTEGER DEFAULT 0,
    data_sources TEXT[] DEFAULT '{}',
    needs_review BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching politicians
CREATE INDEX IF NOT EXISTS idx_pipeline_politicians_slug ON politicians(slug);
CREATE INDEX IF NOT EXISTS idx_pipeline_politicians_name ON politicians(name);
CREATE INDEX IF NOT EXISTS idx_pipeline_politicians_party ON politicians(current_party);
CREATE INDEX IF NOT EXISTS idx_pipeline_politicians_state ON politicians(current_state);

-- 2. Election History Table
CREATE TABLE IF NOT EXISTS election_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    election_year INTEGER NOT NULL,
    house TEXT NOT NULL,
    constituency TEXT NOT NULL,
    state TEXT NOT NULL,
    party TEXT NOT NULL,
    votes_received INTEGER,
    vote_share_percent NUMERIC(5, 2),
    result TEXT NOT NULL,
    total_candidates INTEGER,
    runner_up_votes INTEGER,
    margin INTEGER,
    source TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_politician_election_constituency UNIQUE (politician_id, election_year, constituency)
);

CREATE INDEX IF NOT EXISTS idx_pipeline_election_politician ON election_history(politician_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_election_year ON election_history(election_year);

-- 3. Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    election_year INTEGER NOT NULL,
    movable_assets BIGINT,
    immovable_assets BIGINT,
    total_assets BIGINT,
    total_liabilities BIGINT,
    net_assets BIGINT,
    spouse_assets BIGINT,
    dependent_assets BIGINT,
    income_sources TEXT,
    pan_number_declared BOOLEAN DEFAULT FALSE,
    source TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_politician_asset_year UNIQUE (politician_id, election_year)
);

CREATE INDEX IF NOT EXISTS idx_pipeline_assets_politician ON assets(politician_id);

-- 4. Criminal Cases Table
CREATE TABLE IF NOT EXISTS criminal_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    case_number TEXT,
    court_name TEXT,
    court_state TEXT,
    ipc_sections TEXT[] DEFAULT '{}',
    ipc_plain_english TEXT[] DEFAULT '{}',
    nature_of_offence TEXT,
    date_filed DATE,
    current_status TEXT DEFAULT 'Chargesheet Filed',
    next_hearing_date DATE,
    severity TEXT DEFAULT 'Moderate',
    score_impact NUMERIC(4, 2) DEFAULT 0.0,
    election_year_declared INTEGER,
    ecourts_case_id TEXT,
    last_status_check TIMESTAMPTZ,
    source TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pipeline_cases_politician ON criminal_cases(politician_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_cases_status ON criminal_cases(current_status);
CREATE INDEX IF NOT EXISTS idx_pipeline_cases_severity ON criminal_cases(severity);

-- 5. Parliamentary Performance Table
CREATE TABLE IF NOT EXISTS parliamentary_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    term_year_start INTEGER NOT NULL,
    term_year_end INTEGER,
    house TEXT NOT NULL,
    total_sessions INTEGER,
    sessions_attended INTEGER,
    attendance_percent NUMERIC(5, 2),
    questions_asked_starred INTEGER DEFAULT 0,
    questions_asked_unstarred INTEGER DEFAULT 0,
    debates_participated INTEGER DEFAULT 0,
    private_bills_introduced INTEGER DEFAULT 0,
    private_bills_passed INTEGER DEFAULT 0,
    source TEXT NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_politician_term_house UNIQUE (politician_id, term_year_start, house)
);

CREATE INDEX IF NOT EXISTS idx_pipeline_parliament_politician ON parliamentary_performance(politician_id);

-- 6. Party History Table
CREATE TABLE IF NOT EXISTS party_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    party_name TEXT NOT NULL,
    joined_date DATE,
    left_date DATE,
    reason_for_leaving TEXT,
    source TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pipeline_party_history_politician ON party_history(politician_id);

-- 7. Data Import Log Table
CREATE TABLE IF NOT EXISTS data_import_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    status TEXT NOT NULL,
    politicians_processed INTEGER DEFAULT 0,
    politicians_created INTEGER DEFAULT 0,
    politicians_updated INTEGER DEFAULT 0,
    errors TEXT,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pipeline_import_log_source ON data_import_log(source);

-- 8. IPC Lookup Table & Seed Data
CREATE TABLE IF NOT EXISTS ipc_lookup (
    section TEXT PRIMARY KEY,
    plain_english TEXT NOT NULL,
    severity TEXT NOT NULL,
    category TEXT NOT NULL
);

-- Seed IPC Table
INSERT INTO ipc_lookup (section, plain_english, severity, category) VALUES
    ('302', 'Murder', 'Severe', 'Violent Crime'),
    ('376', 'Rape', 'Severe', 'Sexual Offences'),
    ('406', 'Criminal breach of trust', 'Serious', 'Financial Crime'),
    ('420', 'Cheating and fraudulent property transfer', 'Serious', 'Financial Crime'),
    ('147', 'Rioting', 'Moderate', 'Public Order'),
    ('148', 'Rioting armed with deadly weapon', 'Serious', 'Public Order'),
    ('149', 'Unlawful assembly', 'Moderate', 'Public Order'),
    ('188', 'Disobedience to public servant order', 'Minor', 'Public Order'),
    ('120B', 'Criminal conspiracy', 'Serious', 'Conspiracy'),
    ('201', 'Causing disappearance of evidence', 'Serious', 'Obstruction of Justice'),
    ('384', 'Extortion', 'Serious', 'Violent Crime'),
    ('386', 'Extortion by putting person in fear of death', 'Serious', 'Violent Crime'),
    ('409', 'Criminal breach of trust by public servant', 'Severe', 'Corruption'),
    ('411', 'Dishonestly receiving stolen property', 'Moderate', 'Property Offence'),
    ('465', 'Forgery', 'Serious', 'Fraud'),
    ('471', 'Using forged document as genuine', 'Serious', 'Fraud'),
    ('498A', 'Cruelty by husband or relatives', 'Serious', 'Domestic Violence'),
    ('POCSO', 'Crime against a child', 'Severe', 'Child Protection'),
    ('PC Act 7', 'Offence relating to bribery', 'Severe', 'Corruption'),
    ('PC Act 13', 'Criminal misconduct by public servant', 'Severe', 'Corruption')
ON CONFLICT (section) DO NOTHING;

-- 9. News Mentions Table
CREATE TABLE IF NOT EXISTS news_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    headline TEXT NOT NULL,
    source_name TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    published_date DATE,
    sentiment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pipeline_news_politician ON news_mentions(politician_id);
