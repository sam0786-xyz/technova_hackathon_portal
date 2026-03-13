-- Add evaluation_round column
ALTER TABLE hackathon_evaluations ADD COLUMN IF NOT EXISTS evaluation_round INTEGER DEFAULT 1 NOT NULL;

-- Add new scoring rubric columns (6 criteria * 5 points max = 30)
ALTER TABLE hackathon_evaluations ADD COLUMN IF NOT EXISTS score_idea NUMERIC DEFAULT 0 NOT NULL;
ALTER TABLE hackathon_evaluations ADD COLUMN IF NOT EXISTS score_tools NUMERIC DEFAULT 0 NOT NULL;
ALTER TABLE hackathon_evaluations ADD COLUMN IF NOT EXISTS score_impact NUMERIC DEFAULT 0 NOT NULL;
ALTER TABLE hackathon_evaluations ADD COLUMN IF NOT EXISTS score_sustainability NUMERIC DEFAULT 0 NOT NULL;
ALTER TABLE hackathon_evaluations ADD COLUMN IF NOT EXISTS score_feasibility NUMERIC DEFAULT 0 NOT NULL;
ALTER TABLE hackathon_evaluations ADD COLUMN IF NOT EXISTS score_communication NUMERIC DEFAULT 0 NOT NULL;

-- Drop old 3-factor criteria columns
ALTER TABLE hackathon_evaluations DROP COLUMN IF EXISTS score_innovation;
ALTER TABLE hackathon_evaluations DROP COLUMN IF EXISTS score_ui;
ALTER TABLE hackathon_evaluations DROP COLUMN IF EXISTS score_technical;

-- Drop the old UNIQUE constraint which locked to just team_id + evaluator_id
ALTER TABLE hackathon_evaluations DROP CONSTRAINT IF EXISTS hackathon_evaluations_team_id_evaluator_id_key;

-- Re-add UNIQUE constraint to include the new evaluation_round column, 
-- allowing an evaluator to score the same team again in the final round
ALTER TABLE hackathon_evaluations ADD CONSTRAINT hackathon_evaluations_team_evaluator_round_key UNIQUE (team_id, evaluator_id, evaluation_round);
