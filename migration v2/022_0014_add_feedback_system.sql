-- ==========================================
-- Migration: Add Event Feedback System
-- Creates tables for feedback forms, questions, and responses
-- Supports multi-day feedback, XP rewards, and attendance integration
-- ==========================================

-- ==========================================
-- Add feedback-related columns to events table
-- ==========================================

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS feedback_enabled BOOLEAN DEFAULT false;

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS requires_feedback_for_attendance BOOLEAN DEFAULT false;

COMMENT ON COLUMN events.feedback_enabled IS 'Whether feedback collection is enabled for this event';
COMMENT ON COLUMN events.requires_feedback_for_attendance IS 'For online events, whether feedback must be submitted before attendance is marked';

-- ==========================================
-- event_feedback_forms - Form configuration per event
-- ==========================================

CREATE TABLE IF NOT EXISTS event_feedback_forms (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    day_number int DEFAULT NULL,  -- NULL = general form, 1/2/3 = day-specific
    title TEXT NOT NULL,
    description TEXT,
    release_mode TEXT DEFAULT 'automatic' CHECK (release_mode IN ('automatic', 'manual')),
    is_released BOOLEAN DEFAULT false,
    released_at timestamptz,
    closes_at timestamptz,  -- Optional close time
    auto_close_after_days int,  -- Auto-close X days after release
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, day_number)
);

COMMENT ON TABLE event_feedback_forms IS 'Stores feedback form configuration for events';
COMMENT ON COLUMN event_feedback_forms.day_number IS 'NULL for general form, 1/2/3+ for multi-day event specific forms';
COMMENT ON COLUMN event_feedback_forms.release_mode IS 'automatic: releases when event ends, manual: admin releases manually';
COMMENT ON COLUMN event_feedback_forms.auto_close_after_days IS 'Number of days after release when form auto-closes (NULL = never auto-close)';

-- ==========================================
-- feedback_questions - Custom questions for each form
-- ==========================================

CREATE TABLE IF NOT EXISTS feedback_questions (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    form_id VARCHAR(36) NOT NULL REFERENCES event_feedback_forms(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL CHECK (question_type IN ('TEXT', 'textarea', 'rating', 'select', 'checkbox', 'radio')),
    label TEXT NOT NULL,
    placeholder TEXT,
    options JSON,  -- For select/radio/checkbox: [{value: 'opt1', label: 'Option 1'}]
    is_required BOOLEAN DEFAULT true,
    order_index int NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE feedback_questions IS 'Custom questions for feedback forms';
COMMENT ON COLUMN feedback_questions.question_type IS 'TEXT, textarea, rating (1-5), select, checkbox, radio';
COMMENT ON COLUMN feedback_questions.options IS 'JSON array for select/radio/checkbox options';

-- ==========================================
-- feedback_responses - Student submissions
-- ==========================================

CREATE TABLE IF NOT EXISTS feedback_responses (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    form_id VARCHAR(36) NOT NULL REFERENCES event_feedback_forms(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL,  -- References users.id
    answers JSON NOT NULL,  -- {question_id: answer_value}
    submitted_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    xp_awarded BOOLEAN DEFAULT false,
    UNIQUE(form_id, user_id)  -- Prevent duplicate submissions
);

COMMENT ON TABLE feedback_responses IS 'Stores student feedback submissions';
COMMENT ON COLUMN feedback_responses.answers IS 'JSON object mapping question_id to answer value';
COMMENT ON COLUMN feedback_responses.xp_awarded IS 'Whether XP has been awarded for this submission';

-- ==========================================
-- Enable Row Level Security
-- ==========================================





-- Service role full access policies
-- CREATE POLICY REMOVED:  ON event_feedback_forms
    FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY REMOVED:  ON feedback_questions
    FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY REMOVED:  ON feedback_responses
    FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- Indexes for performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_feedback_forms_event ON event_feedback_forms(event_id);
CREATE INDEX IF NOT EXISTS idx_feedback_questions_form ON feedback_questions(form_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_form ON feedback_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_user ON feedback_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_form_user ON feedback_responses(form_id, user_id);

-- ==========================================
-- Grant permissions
-- ==========================================









