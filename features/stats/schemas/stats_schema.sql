-- Stats feature schema
-- Handles statistical analysis and weekly aggregations

CREATE TABLE IF NOT EXISTS weekly_stats (
  id SERIAL PRIMARY KEY,
  week_start_date DATE NOT NULL UNIQUE,
  week_end_date DATE NOT NULL,
  daily_reports_written INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  mood_average DECIMAL(3,2) DEFAULT 0.00,
  thoughts_count INTEGER DEFAULT 0,
  total_diary_entries INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient date range queries
CREATE INDEX IF NOT EXISTS idx_weekly_stats_week_start ON weekly_stats(week_start_date);

-- This table would be populated by aggregating data from:
-- - daily_reports (for mood averages, reports written)
-- - todos (for completed tasks count)
-- - thoughts (for thoughts count)
-- - diary entries (for diary entries count)

-- The stats are calculated from existing data in other tables
-- and cached in this table for performance

-- RLS (Row Level Security) policies would be added here for multi-user setup
-- For single user app, RLS can be disabled or set to allow all operations