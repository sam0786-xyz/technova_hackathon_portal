-- ==========================================
-- Phase 3: Community, Collaboration & Resources
-- ==========================================

-- ==========================================
-- profiles
-- Extensions to user data for Buddy Finder
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  skills JSON, -- Array of strings for skills
  interests JSON, -- Array of strings for interests
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- community_posts
-- Forum/Thread style posts
-- ==========================================
CREATE TABLE IF NOT EXISTS community_posts (
  id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- e.g., 'General', 'Hackathon', 'Project', 'Question'
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- community_comments
-- Comments on posts
-- ==========================================
CREATE TABLE IF NOT EXISTS community_comments (
  id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- projects
-- Student Project Showcase
-- ==========================================
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  project_url TEXT, -- Live link
  repo_url TEXT, -- GitHub link
  tech_stack JSON, -- Array of tech used
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- resources
-- Academic Resources (PYQs, Notes)
-- ==========================================
CREATE TABLE IF NOT EXISTS resources (
  id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  uploaded_by VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  type TEXT NOT NULL, -- 'PYQ', 'Notes', 'Book', etc.
  semester TEXT,
  subject TEXT,
  is_verified BOOLEAN DEFAULT false, -- Controlled upload
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- RLS Policies
-- ==========================================






-- Profiles: Public read, User update own
-- CREATE POLICY REMOVED:  ON profiles FOR SELECT USING (true);
-- (Update policy omitted for brevity, assuming standard service role or auth check)

-- Posts: Public read, Authenticated create
-- CREATE POLICY REMOVED:  ON community_posts FOR SELECT USING (true);

-- Comments: Public read, Authenticated create
-- CREATE POLICY REMOVED:  ON community_comments FOR SELECT USING (true);

-- Projects: Public read, Authenticated create
-- CREATE POLICY REMOVED:  ON projects FOR SELECT USING (true);

-- Resources: Public read, Admin/Verified create (Simplified to Auth for now, refined by app logic)
-- CREATE POLICY REMOVED:  ON resources FOR SELECT USING (true);
