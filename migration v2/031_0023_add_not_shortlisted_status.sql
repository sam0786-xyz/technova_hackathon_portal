-- Add 'not_shortlisted' to hackathon_team_status enum
ALTER TYPE hackathon_team_status ADD VALUE IF NOT EXISTS 'not_shortlisted';
