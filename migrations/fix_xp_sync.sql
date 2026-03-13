-- XP Synchronization Script
-- This script ensures users.xp_points matches the sum of their xp_awards

-- Step 1: Create or replace the increment_xp RPC function
CREATE OR REPLACE FUNCTION increment_xp(user_id UUID, amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
    new_total INTEGER;
BEGIN
    UPDATE next_auth.users
    SET xp_points = COALESCE(xp_points, 0) + amount
    WHERE id = user_id
    RETURNING xp_points INTO new_total;
    
    RETURN new_total;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Sync all user XP from xp_awards table
-- This will fix any users who were checked in but didn't get XP updated
UPDATE next_auth.users u
SET xp_points = COALESCE(xp_totals.total, 0)
FROM (
    SELECT 
        user_id,
        SUM(xp_amount) as total
    FROM xp_awards
    GROUP BY user_id
) as xp_totals
WHERE u.id = xp_totals.user_id;

-- Step 3: Set xp_points to 0 for users with no awards (prevent NULL)
UPDATE next_auth.users
SET xp_points = 0
WHERE xp_points IS NULL;

-- Step 4: Verify the sync
SELECT 
    u.email,
    u.name,
    u.xp_points as user_xp,
    COALESCE(SUM(xa.xp_amount), 0) as awarded_xp,
    u.xp_points - COALESCE(SUM(xa.xp_amount), 0) as difference
FROM next_auth.users u
LEFT JOIN xp_awards xa ON u.id = xa.user_id
GROUP BY u.id, u.email, u.name, u.xp_points
HAVING u.xp_points - COALESCE(SUM(xa.xp_amount), 0) != 0
ORDER BY difference DESC
LIMIT 20;

-- If the above query returns rows, those users have XP mismatches
-- The sync query (Step 2) should fix them
