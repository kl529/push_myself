-- Dashboard feature schema
-- Handles daily quotes and self-affirmation settings

-- Self-affirmation settings (localStorage only for now)
-- The DashboardTab currently uses localStorage to store user's custom affirmation
-- Key: 'userAffirmation'
-- This could be moved to Supabase in the future if needed

-- Daily quotes are handled in the shared data/quotes.ts file
-- No additional database tables are required for the basic dashboard functionality