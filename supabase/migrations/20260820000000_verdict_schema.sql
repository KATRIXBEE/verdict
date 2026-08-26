CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core politicians table
CREATE TABLE IF NOT EXISTS politicians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  name_variants TEXT[],
  photo_url TEXT,
  date_of_birth DATE,
  age INTEGER,
  gender VARCHAR(20),
  current_party VARCHAR(255),
  party VARCHAR(255),
  current_constituency VARCHAR(255),
  constituency VARCHAR(255),
  current_state VARCHAR(255),
  state VARCHAR(255),
  current_house VARCHAR(100),
  profession TEXT,
  education TEXT,
  education_verification_status VARCHAR(50) DEFAULT 'Not Checked',
  wikipedia_url TEXT,
  bio_summary TEXT,
  official_website TEXT,
  social_twitter VARCHAR(255),
  social_facebook VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  mp_code VARCHAR(50),
  verdict_score DECIMAL(3,1) DEFAULT 5.0,
  score_breakdown JSONB,
  data_completeness_percent INTEGER DEFAULT 0,
  criminal_case_count INTEGER,
  worst_case_severity VARCHAR(20),
  attendance_percent DECIMAL(5,2),
  questions_asked INTEGER,
  debates_count INTEGER,
  asset_growth_percent DECIMAL(10,2),
  party_switch_count INTEGER,
  mplads_utilisation_percent DECIMAL(5,2),
  mplads_allocated BIGINT,
  mplads_utilised BIGINT,
  total_assets BIGINT,
  liabilities BIGINT,
  election_year INTEGER,
  terms_served INTEGER,
  result VARCHAR(50),
  portfolio_history JSONB,
  data_source VARCHAR(100),
  needs_review BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Election history table
CREATE TABLE IF NOT EXISTS election_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id UUID REFERENCES politicians(id) ON DELETE CASCADE,
  election_year INTEGER NOT NULL,
  house VARCHAR(100),
  constituency VARCHAR(255),
  state VARCHAR(255),
  party VARCHAR(255),
  votes_received INTEGER,
  vote_share_percent DECIMAL(5,2),
  result VARCHAR(50),
  margin INTEGER,
  total_candidates INTEGER,
  source VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(politician_id, election_year, constituency)
);

-- Assets table (multi-year)
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id UUID REFERENCES politicians(id) ON DELETE CASCADE,
  election_year INTEGER NOT NULL,
  movable_assets BIGINT,
  immovable_assets BIGINT,
  total_assets BIGINT,
  total_liabilities BIGINT,
  net_assets BIGINT,
  spouse_assets BIGINT,
  dependent_assets BIGINT,
  income_sources TEXT,
  source VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(politician_id, election_year)
);

-- Criminal cases table
CREATE TABLE IF NOT EXISTS criminal_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id UUID REFERENCES politicians(id) ON DELETE CASCADE,
  case_number VARCHAR(255),
  court_name VARCHAR(255),
  court_state VARCHAR(100),
  ipc_sections TEXT[],
  ipc_plain_english TEXT[],
  nature_of_offence TEXT,
  date_filed DATE,
  current_status VARCHAR(100),
  next_hearing_date DATE,
  severity VARCHAR(20),
  score_impact DECIMAL(3,1),
  election_year_declared INTEGER,
  ecourts_case_id VARCHAR(255),
  last_status_check TIMESTAMP WITH TIME ZONE,
  source VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parliamentary performance table
CREATE TABLE IF NOT EXISTS parliamentary_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id UUID REFERENCES politicians(id) ON DELETE CASCADE,
  term_year_start INTEGER,
  term_year_end INTEGER,
  house VARCHAR(100),
  total_sessions INTEGER,
  sessions_attended INTEGER,
  attendance_percent DECIMAL(5,2),
  questions_asked_starred INTEGER,
  questions_asked_unstarred INTEGER,
  debates_participated INTEGER,
  private_bills_introduced INTEGER,
  private_bills_passed INTEGER,
  source VARCHAR(100),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(politician_id, term_year_start, house)
);

-- Party history table
CREATE TABLE IF NOT EXISTS party_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id UUID REFERENCES politicians(id) ON DELETE CASCADE,
  party_name VARCHAR(255) NOT NULL,
  joined_date DATE,
  left_date DATE,
  reason_for_leaving VARCHAR(255),
  source VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Citizen ratings table
CREATE TABLE IF NOT EXISTS citizen_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id UUID REFERENCES politicians(id) ON DELETE CASCADE,
  politician_slug VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  user_name VARCHAR(100),
  user_constituency VARCHAR(255),
  comment TEXT,
  digilocker_verified BOOLEAN DEFAULT FALSE,
  is_local_voter BOOLEAN DEFAULT FALSE,
  client_ip VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ground truth articles table
CREATE TABLE IF NOT EXISTS ground_truth_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE,
  headline TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  source VARCHAR(255),
  source_url TEXT,
  author VARCHAR(255),
  author_badge VARCHAR(50),
  category VARCHAR(100),
  location_state VARCHAR(100),
  location_district VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Ongoing',
  severity VARCHAR(20),
  affected_people_count INTEGER,
  published_at TIMESTAMP WITH TIME ZONE,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IPC lookup table
CREATE TABLE IF NOT EXISTS ipc_lookup (
  section VARCHAR(20) PRIMARY KEY,
  plain_english TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL,
  category VARCHAR(100)
);

-- Data import log table
CREATE TABLE IF NOT EXISTS data_import_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source VARCHAR(100),
  status VARCHAR(50),
  politicians_processed INTEGER DEFAULT 0,
  politicians_created INTEGER DEFAULT 0,
  politicians_updated INTEGER DEFAULT 0,
  errors TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_politicians_slug ON politicians(slug);
CREATE INDEX IF NOT EXISTS idx_politicians_state ON politicians(state);
CREATE INDEX IF NOT EXISTS idx_politicians_party ON politicians(current_party);
CREATE INDEX IF NOT EXISTS idx_politicians_house ON politicians(current_house);
CREATE INDEX IF NOT EXISTS idx_politicians_score ON politicians(verdict_score DESC);
CREATE INDEX IF NOT EXISTS idx_politicians_name ON politicians(name);
CREATE INDEX IF NOT EXISTS idx_criminal_cases_politician ON criminal_cases(politician_id);
CREATE INDEX IF NOT EXISTS idx_assets_politician ON assets(politician_id);
CREATE INDEX IF NOT EXISTS idx_ratings_politician ON citizen_ratings(politician_slug);
CREATE INDEX IF NOT EXISTS idx_ground_truth_category ON ground_truth_articles(category);

-- Seed IPC lookup table
INSERT INTO ipc_lookup (section, plain_english, severity, category)
VALUES
  ('302', 'Murder', 'Severe', 'Violent Crime'),
  ('376', 'Rape', 'Severe', 'Sexual Crime'),
  ('406', 'Criminal breach of trust', 'Serious', 'Financial Crime'),
  ('420', 'Cheating and fraud', 'Serious', 'Financial Crime'),
  ('147', 'Rioting', 'Moderate', 'Public Order'),
  ('148', 'Rioting with deadly weapon', 'Serious', 'Public Order'),
  ('149', 'Unlawful assembly', 'Moderate', 'Public Order'),
  ('188', 'Disobedience to public servant', 'Minor', 'Administrative'),
  ('120B', 'Criminal conspiracy', 'Serious', 'Criminal Law'),
  ('201', 'Destruction of evidence', 'Serious', 'Criminal Law'),
  ('384', 'Extortion', 'Serious', 'Financial Crime'),
  ('409', 'Breach of trust by public servant', 'Severe', 'Corruption'),
  ('465', 'Forgery', 'Serious', 'Financial Crime'),
  ('471', 'Using forged document', 'Serious', 'Financial Crime'),
  ('498A', 'Cruelty by husband or relatives', 'Serious', 'Domestic'),
  ('POCSO', 'Crime against a child', 'Severe', 'Child Safety'),
  ('PC-7', 'Offence relating to bribery', 'Severe', 'Corruption'),
  ('PC-13', 'Criminal misconduct by public servant', 'Severe', 'Corruption')
ON CONFLICT (section) DO NOTHING;

-- Row Level Security (read-only for public)
ALTER TABLE politicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE criminal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ground_truth_articles ENABLE ROW LEVEL SECURITY;

-- Public read access (all civic data is public)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read politicians' AND tablename = 'politicians') THEN
    CREATE POLICY "Public read politicians" ON politicians FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read criminal cases' AND tablename = 'criminal_cases') THEN
    CREATE POLICY "Public read criminal cases" ON criminal_cases FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read assets' AND tablename = 'assets') THEN
    CREATE POLICY "Public read assets" ON assets FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read election history' AND tablename = 'election_history') THEN
    CREATE POLICY "Public read election history" ON election_history FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read ground truth' AND tablename = 'ground_truth_articles') THEN
    CREATE POLICY "Public read ground truth" ON ground_truth_articles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read ratings' AND tablename = 'citizen_ratings') THEN
    CREATE POLICY "Public read ratings" ON citizen_ratings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert ratings' AND tablename = 'citizen_ratings') THEN
    CREATE POLICY "Public insert ratings" ON citizen_ratings FOR INSERT WITH CHECK (true);
  END IF;
END $$;
