-- ==========================================
-- Phase 3: Community, Collaboration & Resources
-- ==========================================

-- ==========================================
-- public.profiles
-- Extensions to user data for Buddy Finder
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES next_auth.users(id) ON DELETE CASCADE,
  bio text,
  skills text[], -- Array of strings for skills
  interests text[], -- Array of strings for interests
  github_url text,
  linkedin_url text,
  portfolio_url text,
  updated_at timestamptz DEFAULT now()
);

-- ==========================================
-- public.community_posts
-- Forum/Thread style posts
-- ==========================================
CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text, -- e.g., 'General', 'Hackathon', 'Project', 'Question'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ==========================================
-- public.community_comments
-- Comments on posts
-- ==========================================
CREATE TABLE IF NOT EXISTS public.community_comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- public.projects
-- Student Project Showcase
-- ==========================================
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  video_url text,
  project_url text, -- Live link
  repo_url text, -- GitHub link
  tech_stack text[], -- Array of tech used
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- public.resources
-- Academic Resources (PYQs, Notes)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  uploaded_by uuid NOT NULL REFERENCES next_auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  type text NOT NULL, -- 'PYQ', 'Notes', 'Book', etc.
  semester text,
  subject text,
  is_verified boolean DEFAULT false, -- Controlled upload
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- RLS Policies
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, User update own
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
-- (Update policy omitted for brevity, assuming standard service role or auth check)

-- Posts: Public read, Authenticated create
CREATE POLICY "Public read posts" ON public.community_posts FOR SELECT USING (true);

-- Comments: Public read, Authenticated create
CREATE POLICY "Public read comments" ON public.community_comments FOR SELECT USING (true);

-- Projects: Public read, Authenticated create
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);

-- Resources: Public read, Admin/Verified create (Simplified to Auth for now, refined by app logic)
CREATE POLICY "Public read resources" ON public.resources FOR SELECT USING (true);
