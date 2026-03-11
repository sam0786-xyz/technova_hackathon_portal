-- ==========================================
-- Migration: Add Event Feedback System
-- Creates tables for feedback forms, questions, and responses
-- Supports multi-day feedback, XP rewards, and attendance integration
-- ==========================================

-- ==========================================
-- Add feedback-related columns to events table
-- ==========================================

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS feedback_enabled boolean DEFAULT false;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS requires_feedback_for_attendance boolean DEFAULT false;

COMMENT ON COLUMN public.events.feedback_enabled IS 'Whether feedback collection is enabled for this event';
COMMENT ON COLUMN public.events.requires_feedback_for_attendance IS 'For online events, whether feedback must be submitted before attendance is marked';

-- ==========================================
-- event_feedback_forms - Form configuration per event
-- ==========================================

CREATE TABLE IF NOT EXISTS public.event_feedback_forms (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    day_number int DEFAULT NULL,  -- NULL = general form, 1/2/3 = day-specific
    title text NOT NULL,
    description text,
    release_mode text DEFAULT 'automatic' CHECK (release_mode IN ('automatic', 'manual')),
    is_released boolean DEFAULT false,
    released_at timestamptz,
    closes_at timestamptz,  -- Optional close time
    auto_close_after_days int,  -- Auto-close X days after release
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(event_id, day_number)
);

COMMENT ON TABLE public.event_feedback_forms IS 'Stores feedback form configuration for events';
COMMENT ON COLUMN public.event_feedback_forms.day_number IS 'NULL for general form, 1/2/3+ for multi-day event specific forms';
COMMENT ON COLUMN public.event_feedback_forms.release_mode IS 'automatic: releases when event ends, manual: admin releases manually';
COMMENT ON COLUMN public.event_feedback_forms.auto_close_after_days IS 'Number of days after release when form auto-closes (NULL = never auto-close)';

-- ==========================================
-- feedback_questions - Custom questions for each form
-- ==========================================

CREATE TABLE IF NOT EXISTS public.feedback_questions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    form_id uuid NOT NULL REFERENCES public.event_feedback_forms(id) ON DELETE CASCADE,
    question_type text NOT NULL CHECK (question_type IN ('text', 'textarea', 'rating', 'select', 'checkbox', 'radio')),
    label text NOT NULL,
    placeholder text,
    options jsonb,  -- For select/radio/checkbox: [{value: 'opt1', label: 'Option 1'}]
    is_required boolean DEFAULT true,
    order_index int NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.feedback_questions IS 'Custom questions for feedback forms';
COMMENT ON COLUMN public.feedback_questions.question_type IS 'text, textarea, rating (1-5), select, checkbox, radio';
COMMENT ON COLUMN public.feedback_questions.options IS 'JSON array for select/radio/checkbox options';

-- ==========================================
-- feedback_responses - Student submissions
-- ==========================================

CREATE TABLE IF NOT EXISTS public.feedback_responses (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    form_id uuid NOT NULL REFERENCES public.event_feedback_forms(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,  -- References next_auth.users.id
    answers jsonb NOT NULL,  -- {question_id: answer_value}
    submitted_at timestamptz DEFAULT now(),
    xp_awarded boolean DEFAULT false,
    UNIQUE(form_id, user_id)  -- Prevent duplicate submissions
);

COMMENT ON TABLE public.feedback_responses IS 'Stores student feedback submissions';
COMMENT ON COLUMN public.feedback_responses.answers IS 'JSON object mapping question_id to answer value';
COMMENT ON COLUMN public.feedback_responses.xp_awarded IS 'Whether XP has been awarded for this submission';

-- ==========================================
-- Enable Row Level Security
-- ==========================================

ALTER TABLE public.event_feedback_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;

-- Service role full access policies
CREATE POLICY "Service role full access to event_feedback_forms" ON public.event_feedback_forms
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to feedback_questions" ON public.feedback_questions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to feedback_responses" ON public.feedback_responses
    FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- Indexes for performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_feedback_forms_event ON public.event_feedback_forms(event_id);
CREATE INDEX IF NOT EXISTS idx_feedback_questions_form ON public.feedback_questions(form_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_form ON public.feedback_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_user ON public.feedback_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_form_user ON public.feedback_responses(form_id, user_id);

-- ==========================================
-- Grant permissions
-- ==========================================

GRANT ALL ON TABLE public.event_feedback_forms TO postgres;
GRANT ALL ON TABLE public.event_feedback_forms TO service_role;

GRANT ALL ON TABLE public.feedback_questions TO postgres;
GRANT ALL ON TABLE public.feedback_questions TO service_role;

GRANT ALL ON TABLE public.feedback_responses TO postgres;
GRANT ALL ON TABLE public.feedback_responses TO service_role;
