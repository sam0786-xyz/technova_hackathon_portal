-- 1. Roles
DO $$ BEGIN
    CREATE TYPE hackathon_role_type AS ENUM ('super_admin', 'admin', 'student_lead', 'volunteer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS hackathon_roles (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role hackathon_role_type NOT NULL DEFAULT 'volunteer',
    created_at DATETIME DEFAULT TIMEZONE('utc', NOW())
);



-- 2. Participants
ALTER TABLE hackathon_participants
    ADD COLUMN IF NOT EXISTS course TEXT,
    ADD COLUMN IF NOT EXISTS section TEXT,
    ADD COLUMN IF NOT EXISTS system_id TEXT,
    ADD COLUMN IF NOT EXISTS year TEXT,
    ADD COLUMN IF NOT EXISTS college TEXT;

-- 3. Teams
ALTER TABLE hackathon_teams
    ADD COLUMN IF NOT EXISTS theme TEXT,
    ADD COLUMN IF NOT EXISTS team_code TEXT UNIQUE;

-- 4. Volunteers
ALTER TABLE hackathon_volunteers
    ADD COLUMN IF NOT EXISTS shift TEXT,
    ADD COLUMN IF NOT EXISTS assigned_team_id VARCHAR(36) REFERENCES hackathon_teams(id) ON DELETE SET NULL;

-- 5. Evaluations (Rubric and edit flag)
ALTER TABLE hackathon_evaluations
    ADD COLUMN IF NOT EXISTS score_innovation NUMERIC,
    ADD COLUMN IF NOT EXISTS score_feasibility NUMERIC,
    ADD COLUMN IF NOT EXISTS score_impact NUMERIC,
    ADD COLUMN IF NOT EXISTS score_ux NUMERIC,
    ADD COLUMN IF NOT EXISTS score_presentation NUMERIC,
    ADD COLUMN IF NOT EXISTS edit_requested BOOLEAN DEFAULT false NOT NULL,
    ADD COLUMN IF NOT EXISTS edit_granted BOOLEAN DEFAULT false NOT NULL;
