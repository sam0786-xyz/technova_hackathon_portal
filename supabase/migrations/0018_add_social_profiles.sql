-- ==========================================
-- Add Social Profile Links to profiles table
-- ==========================================

-- Add new columns for competitive programming profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS kaggle_url text,
ADD COLUMN IF NOT EXISTS leetcode_url text,
ADD COLUMN IF NOT EXISTS codeforces_url text,
ADD COLUMN IF NOT EXISTS codechef_url text,
ADD COLUMN IF NOT EXISTS gfg_url text,
ADD COLUMN IF NOT EXISTS hackerrank_url text;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.kaggle_url IS 'Kaggle profile URL';
COMMENT ON COLUMN public.profiles.leetcode_url IS 'LeetCode profile URL';
COMMENT ON COLUMN public.profiles.codeforces_url IS 'Codeforces profile URL';
COMMENT ON COLUMN public.profiles.codechef_url IS 'CodeChef profile URL';
COMMENT ON COLUMN public.profiles.gfg_url IS 'GeeksforGeeks profile URL';
COMMENT ON COLUMN public.profiles.hackerrank_url IS 'HackerRank profile URL';
