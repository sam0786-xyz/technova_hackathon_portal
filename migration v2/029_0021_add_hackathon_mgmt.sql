-- Create enum for hackathon team status
CREATE TYPE hackathon_team_status AS ENUM ('pending', 'evaluating', 'shortlisted', 'rejected');

-- 1. Hackathon Teams Table
CREATE TABLE hackathon_teams (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    name TEXT NOT NULL,
    idea_title TEXT NOT NULL,
    status hackathon_team_status DEFAULT 'pending' NOT NULL,
    table_number TEXT,
    total_score NUMERIC DEFAULT 0,
    created_at DATETIME DEFAULT TIMEZONE('utc', NOW()),
    updated_at DATETIME DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Hackathon Participants Table
CREATE TABLE hackathon_participants (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    team_id VARCHAR(36) REFERENCES hackathon_teams(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL, -- Leader, Member
    is_checked_in BOOLEAN DEFAULT false NOT NULL,
    food_count INTEGER DEFAULT 0 NOT NULL,
    created_at DATETIME DEFAULT TIMEZONE('utc', NOW()),
    updated_at DATETIME DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Hackathon Evaluators Table
CREATE TABLE hackathon_evaluators (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY, -- Can map to users ID if logging in
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Hackathon Evaluations Table
CREATE TABLE hackathon_evaluations (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    team_id VARCHAR(36) REFERENCES hackathon_teams(id) ON DELETE CASCADE NOT NULL,
    evaluator_id VARCHAR(36) REFERENCES hackathon_evaluators(id) ON DELETE CASCADE NOT NULL,
    score_innovation NUMERIC NOT NULL,
    score_ui NUMERIC NOT NULL,
    score_technical NUMERIC NOT NULL,
    total_score NUMERIC NOT NULL,
    feedback TEXT,
    created_at DATETIME DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(team_id, evaluator_id) -- One evaluation per evaluator per team
);

-- 5. Hackathon Settings Table (Singleton)
CREATE TABLE hackathon_settings (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    timer_start DATETIME,
    duration_hours INTEGER DEFAULT 24 NOT NULL,
    is_running BOOLEAN DEFAULT false NOT NULL,
    active_announcement TEXT,
    updated_at DATETIME DEFAULT TIMEZONE('utc', NOW())
);

-- Initialize singleton settings row
INSERT INTO hackathon_settings (duration_hours) VALUES (24);

-- 6. Hackathon Schedule Table
CREATE TABLE hackathon_schedule (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    event_type TEXT NOT NULL,  -- Meal, Evaluation, Pitch, Activity
    created_at DATETIME DEFAULT TIMEZONE('utc', NOW())
);

-- 7. Hackathon Food Logs Table
CREATE TABLE hackathon_food_logs (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    participant_id VARCHAR(36) REFERENCES hackathon_participants(id) ON DELETE CASCADE NOT NULL,
    meal_type TEXT NOT NULL,
    scanned_at DATETIME DEFAULT TIMEZONE('utc', NOW())
);


-- Set up RLS 








-- Note: We assume the backend uses Service Role Key for Admin operations so they bypass RLS automatically.
-- We must grant read access for public endpoints (like timer, schedule, shortlisted teams)

-- Allow public read access to settings (for timer logic)
-- CREATE POLICY REMOVED:  ON hackathon_settings
    FOR SELECT USING (true);

-- Allow public read access to schedule
-- CREATE POLICY REMOVED:  ON hackathon_schedule
    FOR SELECT USING (true);

-- Allow public to see shortlisted teams only
-- CREATE POLICY REMOVED:  ON hackathon_teams
    FOR SELECT USING (status = 'shortlisted');

-- Let service_role do everything (implicitly true, but explicitly declaring for safety structure)
-- Not strictly necessary as service_role bypasses RLS, but standard practice.

-- Evaluator Policies (Assuming custom auth middleware sets a JWT or they use next_auth matching email)
-- For simplicity, since Next.js server actions handle the logic via service_role, RLS might not strictly 
-- restrict Evaluators if we do server-side checks. But if using client component fetching:
-- Next Auth uses session user ID, so if `hackathon_evaluators.id` matches `users.id`:
-- CREATE POLICY REMOVED:  ON hackathon_teams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hackathon_evaluators WHERE email = (SELECT email FROM users WHERE id = auth.uid())
        )
    );

-- CREATE POLICY REMOVED:  ON hackathon_evaluations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hackathon_evaluators WHERE email = (SELECT email FROM users WHERE id = auth.uid())
        )
    );
