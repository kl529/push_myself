-- Weekly Report feature schema
-- Handles weekly reflections and retrospectives

CREATE TABLE IF NOT EXISTS weekly_reports (
  id SERIAL PRIMARY KEY,
  week_start_date DATE NOT NULL UNIQUE,
  week_end_date DATE NOT NULL,
  what_went_well TEXT,
  what_didnt_go_well TEXT,
  what_learned TEXT,
  next_week_goals TEXT,
  weekly_summary VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient date range queries
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week_start ON weekly_reports(week_start_date);

-- RLS (Row Level Security) policies would be added here for multi-user setup
-- For single user app, RLS can be disabled or set to allow all operations