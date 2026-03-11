-- Migration to add evaluation_open toggle to hackathon_settings

ALTER TABLE public.hackathon_settings 
ADD COLUMN evaluation_open BOOLEAN DEFAULT false NOT NULL;
