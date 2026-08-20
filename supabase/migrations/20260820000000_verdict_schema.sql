-- ========================================================================
-- VERDICT DATABASE SCHEMA & SECURITY POLICIES (Supabase / Postgres 15+)
-- Adheres to AGENTS.md & database.md Engineering Standards
-- ========================================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------
-- 1. States and Constituencies Master
-- ------------------------------------------------------------------------
create table if not exists public.constituencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text not null,
  type text not null check (type in ('lok_sabha', 'vidhan_sabha')),
  code text unique not null,
  registered_voters integer check (registered_voters >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for constituency search & lookups
create index if not exists idx_constituencies_state on public.constituencies(state);
create index if not exists idx_constituencies_name on public.constituencies(name);

-- ------------------------------------------------------------------------
-- 2. Politicians Master Table
-- ------------------------------------------------------------------------
create table if not exists public.politicians (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  slug text unique not null,
  photo_url text,
  current_party text not null,
  current_constituency_id uuid references public.constituencies(id) on delete set null,
  age integer check (age >= 25),
  gender text check (gender in ('male', 'female', 'other')),
  profession_declared text,
  education_degree text,
  education_institution text,
  education_status text not null default 'unverified' check (education_status in ('verified', 'unverified', 'suspicious')),
  attendance_percentage numeric(5,2) check (attendance_percentage between 0 and 100),
  debates_participated integer not null default 0 check (debates_participated >= 0),
  questions_asked integer not null default 0 check (questions_asked >= 0),
  private_member_bills integer not null default 0 check (private_member_bills >= 0),
  calculated_verdict_score numeric(3,1) not null default 5.0 check (calculated_verdict_score between 0 and 10),
  news_sentiment_score numeric(3,2) not null default 0.50 check (news_sentiment_score between 0 and 1),
  terms_served integer not null default 1 check (terms_served >= 1),
  is_minister boolean not null default false,
  portfolio text,
  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for hot queries
create index if not exists idx_politicians_slug on public.politicians(slug);
create index if not exists idx_politicians_current_party on public.politicians(current_party);
create index if not exists idx_politicians_constituency on public.politicians(current_constituency_id);
create index if not exists idx_politicians_score on public.politicians(calculated_verdict_score desc);

-- ------------------------------------------------------------------------
-- 3. Party Affiliation History ("Aaya Ram Gaya Ram")
-- ------------------------------------------------------------------------
create table if not exists public.party_history (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references public.politicians(id) on delete cascade,
  party_name text not null,
  start_year integer not null check (start_year >= 1947),
  end_year integer check (end_year is null or end_year >= start_year),
  is_current boolean not null default false,
  switch_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_party_history_politician on public.party_history(politician_id);

-- ------------------------------------------------------------------------
-- 4. Criminal Cases & eCourts Records
-- ------------------------------------------------------------------------
create table if not exists public.criminal_cases (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references public.politicians(id) on delete cascade,
  cnr_number text,
  case_number text not null,
  court_name text not null,
  ipc_sections text[] not null default '{}',
  plain_english_summary text not null,
  severity_tier text not null check (severity_tier in ('minor', 'moderate', 'serious', 'severe')),
  status text not null check (status in ('active', 'bail_granted', 'stayed', 'acquitted', 'convicted')),
  filing_date date,
  last_hearing_date date,
  next_hearing_date date,
  presiding_judge text,
  source_affidavit_url text,
  ecourts_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_criminal_cases_politician on public.criminal_cases(politician_id);
create index if not exists idx_criminal_cases_severity on public.criminal_cases(severity_tier);
create index if not exists idx_criminal_cases_status on public.criminal_cases(status);

-- ------------------------------------------------------------------------
-- 5. Multi-Year Asset Filings (ECI Form 26)
-- ------------------------------------------------------------------------
create table if not exists public.asset_declarations (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references public.politicians(id) on delete cascade,
  election_year integer not null check (election_year in (2009, 2014, 2019, 2024, 2029)),
  movable_assets numeric(14,2) not null check (movable_assets >= 0),
  immovable_assets numeric(14,2) not null check (immovable_assets >= 0),
  total_assets numeric(14,2) generated always as (movable_assets + immovable_assets) stored,
  total_liabilities numeric(14,2) not null default 0 check (total_liabilities >= 0),
  declared_annual_income numeric(14,2) check (declared_annual_income is null or declared_annual_income >= 0),
  is_outlier_growth boolean not null default false,
  growth_cagr numeric(6,2),
  affidavit_pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_politician_election_year unique (politician_id, election_year)
);

create index if not exists idx_asset_politician on public.asset_declarations(politician_id);
create index if not exists idx_asset_election_year on public.asset_declarations(election_year);

-- ------------------------------------------------------------------------
-- 6. Citizen Ratings (Aadhaar Verified & Anti-Brigading)
-- ------------------------------------------------------------------------
create table if not exists public.citizen_ratings (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references public.politicians(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_constituency_id uuid references public.constituencies(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  feedback_tag text check (feedback_tag in ('responsive', 'absentee', 'infrastructure', 'integrity', 'reformist', 'communal', 'accessible')),
  comment text,
  is_local_voter boolean not null default false,
  digilocker_verified boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_user_politician_rating unique (politician_id, user_id)
);

create index if not exists idx_citizen_ratings_politician on public.citizen_ratings(politician_id);
create index if not exists idx_citizen_ratings_local on public.citizen_ratings(politician_id, is_local_voter);

-- ------------------------------------------------------------------------
-- 7. Row Level Security (RLS) - Leak Proof Configuration
-- ------------------------------------------------------------------------
alter table public.constituencies enable row level security;
alter table public.politicians enable row level security;
alter table public.party_history enable row level security;
alter table public.criminal_cases enable row level security;
alter table public.asset_declarations enable row level security;
alter table public.citizen_ratings enable row level security;

-- Public read access for factual public records
create policy "Public can view constituencies" on public.constituencies
  for select using (true);

create policy "Public can view politicians" on public.politicians
  for select using (true);

create policy "Public can view party histories" on public.party_history
  for select using (true);

create policy "Public can view criminal cases" on public.criminal_cases
  for select using (true);

create policy "Public can view asset declarations" on public.asset_declarations
  for select using (true);

create policy "Public can view aggregated citizen ratings" on public.citizen_ratings
  for select using (true);

-- Per-operation strict RLS for citizen ratings
create policy "Verified users can insert their own rating" on public.citizen_ratings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own rating" on public.citizen_ratings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own rating" on public.citizen_ratings
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------------------
-- 8. Atomic Multi-Step Calculation Trigger
-- ------------------------------------------------------------------------
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_politicians_updated_at
  before update on public.politicians
  for each row execute function public.update_updated_at_column();
