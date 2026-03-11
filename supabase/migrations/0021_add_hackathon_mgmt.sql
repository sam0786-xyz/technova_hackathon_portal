-- Create enum for hackathon team status
CREATE TYPE hackathon_team_status AS ENUM ('pending', 'evaluating', 'shortlisted', 'rejected');

-- 1. Hackathon Teams Table
CREATE TABLE public.hackathon_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    idea_title TEXT NOT NULL,
    status hackathon_team_status DEFAULT 'pending' NOT NULL,
    table_number TEXT,
    total_score NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Hackathon Participants Table
CREATE TABLE public.hackathon_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.hackathon_teams(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL, -- Leader, Member
    is_checked_in BOOLEAN DEFAULT false NOT NULL,
    food_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Hackathon Evaluators Table
CREATE TABLE public.hackathon_evaluators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Can map to next_auth.users ID if logging in
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Hackathon Evaluations Table
CREATE TABLE public.hackathon_evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.hackathon_teams(id) ON DELETE CASCADE NOT NULL,
    evaluator_id UUID REFERENCES public.hackathon_evaluators(id) ON DELETE CASCADE NOT NULL,
    score_innovation NUMERIC NOT NULL,
    score_ui NUMERIC NOT NULL,
    score_technical NUMERIC NOT NULL,
    total_score NUMERIC NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(team_id, evaluator_id) -- One evaluation per evaluator per team
);

-- 5. Hackathon Settings Table (Singleton)
CREATE TABLE public.hackathon_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timer_start TIMESTAMP WITH TIME ZONE,
    duration_hours INTEGER DEFAULT 24 NOT NULL,
    is_running BOOLEAN DEFAULT false NOT NULL,
    active_announcement TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Initialize singleton settings row
INSERT INTO public.hackathon_settings (duration_hours) VALUES (24);

-- 6. Hackathon Schedule Table
CREATE TABLE public.hackathon_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    event_type TEXT NOT NULL,  -- Meal, Evaluation, Pitch, Activity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 7. Hackathon Food Logs Table
CREATE TABLE public.hackathon_food_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID REFERENCES public.hackathon_participants(id) ON DELETE CASCADE NOT NULL,
    meal_type TEXT NOT NULL,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);


-- Set up RLS 
ALTER TABLE public.hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_evaluators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_food_logs ENABLE ROW LEVEL SECURITY;

-- Note: We assume the backend uses Service Role Key for Admin operations so they bypass RLS automatically.
-- We must grant read access for public endpoints (like timer, schedule, shortlisted teams)

-- Allow public read access to settings (for timer logic)
CREATE POLICY "Public can read hackathon settings" ON public.hackathon_settings
    FOR SELECT USING (true);

-- Allow public read access to schedule
CREATE POLICY "Public can read hackathon schedule" ON public.hackathon_schedule
    FOR SELECT USING (true);

-- Allow public to see shortlisted teams only
CREATE POLICY "Public can see shortlisted teams" ON public.hackathon_teams
    FOR SELECT USING (status = 'shortlisted');

-- Let service_role do everything (implicitly true, but explicitly declaring for safety structure)
-- Not strictly necessary as service_role bypasses RLS, but standard practice.

-- Evaluator Policies (Assuming custom auth middleware sets a JWT or they use next_auth matching email)
-- For simplicity, since Next.js server actions handle the logic via service_role, RLS might not strictly 
-- restrict Evaluators if we do server-side checks. But if using client component fetching:
-- Next Auth uses session user ID, so if `hackathon_evaluators.id` matches `next_auth.users.id`:
CREATE POLICY "Evaluators can read teams" ON public.hackathon_teams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.hackathon_evaluators WHERE email = (SELECT email FROM next_auth.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Evaluators can evaluate" ON public.hackathon_evaluations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.hackathon_evaluators WHERE email = (SELECT email FROM next_auth.users WHERE id = auth.uid())
        )
    );
