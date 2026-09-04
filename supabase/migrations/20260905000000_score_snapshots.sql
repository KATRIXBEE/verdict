-- Migration: 20260905000000_score_snapshots.sql
-- Description: Score snapshot tracking, Ground Truth interesting tags, and unsolved case follow-up schema

-- 1. Score snapshots table
CREATE TABLE IF NOT EXISTS score_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id UUID REFERENCES politicians(id) ON DELETE CASCADE,
  politician_slug VARCHAR(255),
  verdict_score DECIMAL(3,1) NOT NULL,
  criminal_case_count INTEGER,
  attendance_percent DECIMAL(5,2),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(politician_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_snapshot_politician 
  ON score_snapshots(politician_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_date 
  ON score_snapshots(snapshot_date);

ALTER TABLE score_snapshots ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Public read score snapshots' 
    AND tablename = 'score_snapshots'
  ) THEN
    CREATE POLICY "Public read score snapshots"
      ON score_snapshots FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Service insert score snapshots' 
    AND tablename = 'score_snapshots'
  ) THEN
    CREATE POLICY "Service insert score snapshots"
      ON score_snapshots FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 2. Ground Truth Articles extensions: interesting flag & unsolved case tracking
ALTER TABLE ground_truth_articles 
ADD COLUMN IF NOT EXISTS is_interesting BOOLEAN DEFAULT FALSE;

ALTER TABLE ground_truth_articles
ADD COLUMN IF NOT EXISTS unsolved_status VARCHAR(50) DEFAULT NULL;

ALTER TABLE ground_truth_articles
ADD COLUMN IF NOT EXISTS last_status_check TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_gt_interesting
  ON ground_truth_articles(is_interesting);
