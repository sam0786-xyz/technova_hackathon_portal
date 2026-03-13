-- ==========================================
-- Add Social Profile Links to profiles table
-- ==========================================

-- Add new columns for competitive programming profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS kaggle_url TEXT,
ADD COLUMN IF NOT EXISTS leetcode_url TEXT,
ADD COLUMN IF NOT EXISTS codeforces_url TEXT,
ADD COLUMN IF NOT EXISTS codechef_url TEXT,
ADD COLUMN IF NOT EXISTS gfg_url TEXT,
ADD COLUMN IF NOT EXISTS hackerrank_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.kaggle_url IS 'Kaggle profile URL';
COMMENT ON COLUMN profiles.leetcode_url IS 'LeetCode profile URL';
COMMENT ON COLUMN profiles.codeforces_url IS 'Codeforces profile URL';
COMMENT ON COLUMN profiles.codechef_url IS 'CodeChef profile URL';
COMMENT ON COLUMN profiles.gfg_url IS 'GeeksforGeeks profile URL';
COMMENT ON COLUMN profiles.hackerrank_url IS 'HackerRank profile URL';
