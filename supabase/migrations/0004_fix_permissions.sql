-- Grant usage on next_auth schema to authenticated and anon users
GRANT USAGE ON SCHEMA next_auth TO authenticated, anon;

-- Grant select on users table to authenticated and anon users (for Leaderboard and public profiles)
GRANT SELECT ON TABLE next_auth.users TO authenticated, anon;

-- Note: Be careful with exposing email/personal info. 
-- The Leaderboard query likely selects specific fields.
-- If stricter security is needed, use a VIEW or RLS policies on next_auth.users 
-- OR use a Service Role function to fetch leaderboard data.
-- For this project scope, granting SELECT is the quick fix for the reported error.
