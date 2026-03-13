-- Add magic_token to hackathon_evaluators for direct links
ALTER TABLE hackathon_evaluators 
ADD COLUMN IF NOT EXISTS magic_token VARCHAR(36) DEFAULT (UUID()) NOT NULL;
