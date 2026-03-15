-- ============================================================
-- MIGRATION V2: Supabase PostgreSQL → MySQL 8+
-- Hackathon Management System - Complete Schema
-- ============================================================
-- Run this script on a fresh MySQL 8+ database.
-- All UUIDs use CHAR(36) with UUID() default.
-- PostgreSQL arrays (text[]) are mapped to JSON columns.
-- All timestamps use DATETIME (store in UTC).
-- ============================================================

-- ============================================================
-- 1. AUTH TABLES (replaces Supabase next_auth schema)
-- These tables are used by NextAuth.js for authentication.
-- ============================================================

CREATE TABLE auth_users (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    name            VARCHAR(255) NULL,
    email           VARCHAR(255) NULL,
    email_verified  DATETIME     NULL,
    image           TEXT         NULL,
    -- Extended fields used by the app
    role            VARCHAR(50)  NOT NULL DEFAULT 'student',
    xp_points       INT          NOT NULL DEFAULT 0,
    system_id       VARCHAR(100) NULL,
    year            INT          NULL,
    course          VARCHAR(100) NULL,
    section         VARCHAR(50)  NULL,
    branch          VARCHAR(100) NULL,
    mobile          VARCHAR(20)  NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_auth_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auth_accounts (
    id                  CHAR(36)     NOT NULL DEFAULT (UUID()),
    user_id             CHAR(36)     NOT NULL,
    type                VARCHAR(255) NOT NULL,
    provider            VARCHAR(255) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token       TEXT         NULL,
    access_token        TEXT         NULL,
    expires_at          BIGINT       NULL,
    token_type          VARCHAR(255) NULL,
    scope               TEXT         NULL,
    id_token            TEXT         NULL,
    session_state        VARCHAR(255) NULL,
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_provider_account (provider, provider_account_id),
    CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auth_sessions (
    id            CHAR(36)     NOT NULL DEFAULT (UUID()),
    session_token VARCHAR(255) NOT NULL,
    user_id       CHAR(36)     NOT NULL,
    expires       DATETIME     NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_session_token (session_token),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auth_verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token      VARCHAR(255) NOT NULL,
    expires    DATETIME     NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (identifier, token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 2. PROFILES TABLE
-- Extended user profile data (skills, social links)
-- ============================================================

CREATE TABLE profiles (
    id              CHAR(36)    NOT NULL,
    bio             TEXT        NULL,
    skills          JSON        NULL,       -- was text[] in PG
    interests       JSON        NULL,       -- was text[] in PG
    github_url      VARCHAR(500) NULL,
    linkedin_url    VARCHAR(500) NULL,
    portfolio_url   VARCHAR(500) NULL,
    kaggle_url      VARCHAR(500) NULL,
    leetcode_url    VARCHAR(500) NULL,
    codeforces_url  VARCHAR(500) NULL,
    codechef_url    VARCHAR(500) NULL,
    gfg_url         VARCHAR(500) NULL,
    hackerrank_url  VARCHAR(500) NULL,
    updated_at      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_profiles_user FOREIGN KEY (id) REFERENCES auth_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 3. EVENTS TABLE
-- General event listings (used for hackathon events too)
-- ============================================================

CREATE TABLE events (
    id               CHAR(36)     NOT NULL DEFAULT (UUID()),
    title            VARCHAR(500) NOT NULL,
    slug             VARCHAR(500) NULL,
    description      TEXT         NULL,
    start_time       DATETIME     NOT NULL,
    end_time         DATETIME     NULL,
    venue            VARCHAR(500) NULL,
    capacity         INT          NOT NULL DEFAULT 100,
    price            DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status           VARCHAR(50)  NOT NULL DEFAULT 'upcoming',
    event_type       VARCHAR(100) NULL,
    difficulty_level VARCHAR(50)  NULL,
    is_virtual       BOOLEAN      NOT NULL DEFAULT FALSE,
    is_multi_day     BOOLEAN      NOT NULL DEFAULT FALSE,
    image_url        TEXT         NULL,
    club_id          CHAR(36)     NULL,
    reminder_sent_at DATETIME     NULL,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_events_slug (slug(191)),
    KEY idx_events_start_time (start_time),
    KEY idx_events_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 4. REGISTRATIONS TABLE
-- Event registrations with QR tokens and payment status
-- ============================================================

CREATE TABLE registrations (
    id             CHAR(36)     NOT NULL DEFAULT (UUID()),
    user_id        CHAR(36)     NOT NULL,
    event_id       CHAR(36)     NOT NULL,
    payment_status VARCHAR(50)  NOT NULL DEFAULT 'free',
    qr_token_id    VARCHAR(500) NULL,
    answers        JSON         NULL,
    attended       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_event (user_id, event_id),
    CONSTRAINT fk_registrations_user  FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 5. HACKATHON TEAMS
-- ============================================================

CREATE TABLE hackathon_teams (
    id                CHAR(36)     NOT NULL DEFAULT (UUID()),
    name              VARCHAR(255) NOT NULL,
    idea_title        VARCHAR(500) NULL DEFAULT 'TBD',
    team_code         VARCHAR(100) NULL,
    theme             VARCHAR(255) NULL,
    project_objective TEXT         NULL,
    table_number      VARCHAR(50)  NULL,
    status            VARCHAR(50)  NOT NULL DEFAULT 'pending',
    total_score       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_teams_status (status),
    KEY idx_teams_team_code (team_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 6. HACKATHON PARTICIPANTS
-- Team members (leader + members)
-- ============================================================

CREATE TABLE hackathon_participants (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    team_id         CHAR(36)     NOT NULL,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NULL DEFAULT '',
    phone           VARCHAR(20)  NULL,
    role            VARCHAR(50)  NOT NULL DEFAULT 'Member',
    course          VARCHAR(100) NULL,
    section         VARCHAR(50)  NULL,
    system_id       VARCHAR(100) NULL,
    year            VARCHAR(10)  NULL,
    college         VARCHAR(255) NULL,
    is_checked_in   BOOLEAN      NOT NULL DEFAULT FALSE,
    food_count      INT          NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_participants_team (team_id),
    KEY idx_participants_email (email),
    CONSTRAINT fk_participants_team FOREIGN KEY (team_id) REFERENCES hackathon_teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 7. HACKATHON EVALUATORS
-- External evaluators with magic link access
-- ============================================================

CREATE TABLE hackathon_evaluators (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    email       VARCHAR(255) NOT NULL,
    name        VARCHAR(255) NOT NULL DEFAULT 'Evaluator',
    magic_token CHAR(36)     NOT NULL DEFAULT (UUID()),
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_evaluators_email (email),
    UNIQUE KEY uk_evaluators_token (magic_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 8. HACKATHON EVALUATIONS
-- Scores per team per evaluator per round
-- ============================================================

CREATE TABLE hackathon_evaluations (
    id                  CHAR(36)     NOT NULL DEFAULT (UUID()),
    team_id             CHAR(36)     NOT NULL,
    evaluator_id        CHAR(36)     NOT NULL,
    evaluation_round    INT          NOT NULL DEFAULT 1,
    score_innovation    DECIMAL(5,2) NULL DEFAULT 0,
    score_feasibility   DECIMAL(5,2) NULL DEFAULT 0,
    score_impact        DECIMAL(5,2) NULL DEFAULT 0,
    score_ux            DECIMAL(5,2) NULL DEFAULT 0,
    score_presentation  DECIMAL(5,2) NULL DEFAULT 0,
    -- Legacy / alternate scoring fields used in some views
    score_idea          DECIMAL(5,2) NULL DEFAULT 0,
    score_tools         DECIMAL(5,2) NULL DEFAULT 0,
    score_sustainability DECIMAL(5,2) NULL DEFAULT 0,
    score_communication DECIMAL(5,2) NULL DEFAULT 0,
    total_score         DECIMAL(10,2) NOT NULL DEFAULT 0,
    feedback            TEXT         NULL,
    edit_requested      BOOLEAN      NOT NULL DEFAULT FALSE,
    edit_granted        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_eval_team_evaluator_round (team_id, evaluator_id, evaluation_round),
    KEY idx_evaluations_team (team_id),
    KEY idx_evaluations_evaluator (evaluator_id),
    CONSTRAINT fk_evaluations_team      FOREIGN KEY (team_id)      REFERENCES hackathon_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_evaluations_evaluator FOREIGN KEY (evaluator_id) REFERENCES hackathon_evaluators(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 9. HACKATHON SETTINGS
-- Singleton config row for timer, announcements, evaluation state
-- ============================================================

CREATE TABLE hackathon_settings (
    id                    CHAR(36)     NOT NULL DEFAULT (UUID()),
    timer_start           DATETIME     NULL,
    duration_hours        INT          NOT NULL DEFAULT 24,
    is_running            BOOLEAN      NOT NULL DEFAULT FALSE,
    evaluation_open       BOOLEAN      NOT NULL DEFAULT FALSE,
    evaluation_rounds     INT          NOT NULL DEFAULT 1,
    active_announcement   TEXT         NULL,
    custom_meals          JSON         NULL,   -- was text[] in PG
    updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 10. HACKATHON SCHEDULE
-- Timeline items for the event
-- ============================================================

CREATE TABLE hackathon_schedule (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    title       VARCHAR(255) NOT NULL,
    description TEXT         NULL,
    start_time  DATETIME     NOT NULL,
    end_time    DATETIME     NULL,
    event_type  VARCHAR(100) NOT NULL DEFAULT 'general',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_schedule_start (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 11. HACKATHON ROLES
-- Custom role assignments by email (admin, student_lead, volunteer)
-- ============================================================

CREATE TABLE hackathon_roles (
    id         CHAR(36)     NOT NULL DEFAULT (UUID()),
    email      VARCHAR(255) NOT NULL,
    role       VARCHAR(50)  NOT NULL DEFAULT 'volunteer',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_roles_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 12. HACKATHON VOLUNTEERS
-- Staff volunteers with check-in tracking
-- ============================================================

CREATE TABLE hackathon_volunteers (
    id               CHAR(36)     NOT NULL DEFAULT (UUID()),
    email            VARCHAR(255) NOT NULL,
    name             VARCHAR(255) NOT NULL DEFAULT 'Volunteer',
    team_name        VARCHAR(255) NULL DEFAULT 'Registration & Stage Team',
    shift            VARCHAR(100) NULL,
    assigned_team_id CHAR(36)     NULL,
    system_id        VARCHAR(100) NULL,
    section          VARCHAR(50)  NULL,
    year             VARCHAR(10)  NULL,
    mobile           VARCHAR(20)  NULL,
    department       VARCHAR(100) NULL,
    is_checked_in    BOOLEAN      NOT NULL DEFAULT FALSE,
    check_in_time    DATETIME     NULL,
    food_count       INT          NOT NULL DEFAULT 0,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_volunteers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 13. HACKATHON FOOD LOGS
-- Per-meal scanning records
-- ============================================================

CREATE TABLE hackathon_food_logs (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    participant_id  CHAR(36)     NULL,
    volunteer_id    CHAR(36)     NULL,
    meal_type       VARCHAR(100) NOT NULL DEFAULT 'default',
    scanned_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_food_participant (participant_id),
    KEY idx_food_volunteer (volunteer_id),
    KEY idx_food_meal (meal_type),
    CONSTRAINT fk_food_participant FOREIGN KEY (participant_id) REFERENCES hackathon_participants(id) ON DELETE SET NULL,
    CONSTRAINT fk_food_volunteer   FOREIGN KEY (volunteer_id)   REFERENCES hackathon_volunteers(id)   ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 14. SPONSORSHIPS
-- Financial tracking for hackathon sponsorships
-- ============================================================

CREATE TABLE sponsorships (
    id          CHAR(36)       NOT NULL DEFAULT (UUID()),
    source      VARCHAR(500)   NOT NULL,
    amount      DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    received_at DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_sponsorships_date (received_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 15. EMAIL LOGS
-- Audit trail for blast emails
-- ============================================================

CREATE TABLE email_logs (
    id               CHAR(36)     NOT NULL DEFAULT (UUID()),
    event_id         CHAR(36)     NULL,
    type             VARCHAR(50)  NOT NULL DEFAULT 'blast',
    subject          VARCHAR(500) NULL,
    message          TEXT         NULL,
    recipients_count INT          NOT NULL DEFAULT 0,
    sent_by          CHAR(36)     NULL,
    sent_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_email_logs_event (event_id),
    CONSTRAINT fk_email_logs_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    CONSTRAINT fk_email_logs_sender FOREIGN KEY (sent_by) REFERENCES auth_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- END OF MIGRATION V2
-- ============================================================
-- Next Steps:
-- 1. Run this script on your MySQL 8+ instance
-- 2. Replace @auth/supabase-adapter with @auth/mysql-adapter or @auth/prisma-adapter
-- 3. Replace @supabase/supabase-js client calls with mysql2 or Prisma ORM calls
-- 4. Update .env to use MySQL connection string instead of Supabase keys
-- ============================================================
