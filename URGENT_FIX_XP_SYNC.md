# URGENT: Fix Leaderboard XP Sync

## Problem
Students show XP in history but total XP and rank are wrong.

Example from screenshot:
- XP History: +5, +50, +15, +15 = 85 XP
- Showing: 5 XP, Rank #46 ❌

## Solution - Run This SQL NOW

### Step 1: Go to Supabase Dashboard
1. Open Supabase Dashboard
2. Click **SQL Editor** in sidebar
3. Click **New Query**

### Step 2: Copy and Run This SQL

```sql
-- SYNC ALL USER XP FROM xp_awards TABLE
-- This will fix all students with wrong XP totals

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

-- Set 0 XP for users with no awards
UPDATE next_auth.users
SET xp_points = 0
WHERE xp_points IS NULL;
```

### Step 3: Verify the Fix

Run this query to check if XP is now correct:

```sql
SELECT 
    u.name,
    u.email,
    u.xp_points as user_xp,
    COALESCE(SUM(xa.xp_amount), 0) as awarded_xp
FROM next_auth.users u
LEFT JOIN xp_awards xa ON u.id = xa.user_id
WHERE u.email = '2022278936.shahrzan@g.sharda.ac.in'
GROUP BY u.id, u.name, u.email, u.xp_points;
```

Should show:
- user_xp: 85
- awarded_xp: 85

## After Running SQL:

1. Refresh leaderboard page
2. Student should now show:
   - **85 TOTAL XP**
   - **Correct rank** (much higher than #46)

## Why This Happened

The code was using a non-existent RPC function that failed silently. XP was recorded in `xp_awards` but not updated in `users.xp_points`. 

This is now fixed in the code (pushed to sameer-dev), so new check-ins will work correctly.

---

**Run the SQL NOW to fix all existing students!**
