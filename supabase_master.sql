-- ==============================================================================
-- 🚀 MONDAY PLATFORM - MASTER SUPABASE PRODUCTION SCHEMA & PERFORMANCE PACK
-- ==============================================================================
-- Ushbu skript platformani 3 ta portal (Talabalar, Ustozlar va Super Admin) uchun
-- maksimal darajada tezkor, xavfsiz va to'liq sinxron holatga keltiradi.
-- ==============================================================================

-- 1. admin_users (Super Admin & Ustozlar / Adminlar) jadvali
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('super_admin', 'teacher')),
  subject TEXT DEFAULT 'Frontend',
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- 2. questions (Savollar Bazasi) jadvali
CREATE TABLE IF NOT EXISTS public.questions (
  id BIGINT PRIMARY KEY,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  topic TEXT,
  question TEXT NOT NULL,
  options JSONB,
  answer TEXT,
  hint TEXT,
  points INTEGER DEFAULT 1,
  placeholder TEXT,
  accepted JSONB,
  tokens JSONB,
  correct_order JSONB,
  broken_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. exam_groups (Imtihon Guruhlari) jadvali
CREATE TABLE IF NOT EXISTS public.exam_groups (
  id TEXT PRIMARY KEY,
  group_name TEXT NOT NULL,
  group_code TEXT UNIQUE NOT NULL,
  counts JSONB NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  max_students INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  teacher_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  teacher_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Qo'shimcha ustunlar mavjud bo'lmasa qo'shish
ALTER TABLE public.exam_groups ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL;
ALTER TABLE public.exam_groups ADD COLUMN IF NOT EXISTS teacher_name TEXT;

-- 4. results (Topshirilgan Imtihon Natijalari) jadvali
CREATE TABLE IF NOT EXISTS public.results (
  id BIGSERIAL PRIMARY KEY,
  student_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  violation_count INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 60,
  answers JSONB NOT NULL,
  category_order JSONB,
  option_orders JSONB,
  drag_orders JSONB,
  group_code TEXT,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.results ADD COLUMN IF NOT EXISTS group_code TEXT;

-- 5. exam_settings (Imtihon Umumiy Sozlamalari) jadvali
CREATE TABLE IF NOT EXISTS public.exam_settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  counts JSONB NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  max_violations INTEGER DEFAULT 3,
  penalty_per_violation INTEGER DEFAULT 1,
  enforce_fullscreen BOOLEAN DEFAULT true,
  shuffle_questions BOOLEAN DEFAULT true,
  shuffle_options BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ⚡ 6. PERFORMANCE INDEKSLAR (Maksimal Tezkorlik)
-- Minglab talabalar bir vaqtda test topshirganda qotmasligi uchun
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON public.admin_users(is_active);

CREATE INDEX IF NOT EXISTS idx_exam_groups_code ON public.exam_groups(group_code);
CREATE INDEX IF NOT EXISTS idx_exam_groups_active ON public.exam_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_exam_groups_created ON public.exam_groups(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_results_group_code ON public.results(group_code);
CREATE INDEX IF NOT EXISTS idx_results_student_name ON public.results(student_name);
CREATE INDEX IF NOT EXISTS idx_results_score ON public.results(score DESC);
CREATE INDEX IF NOT EXISTS idx_results_submitted ON public.results(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions(type);

-- ==============================================================================
-- 📊 7. SUPER ADMIN UCHUN TEZKOR STATISTIKA VIEW (Alohida Sayt Uchun)
-- Super Admin sayti ochilganda 1 ta so'rov bilan butun tizim statistikasini beradi
-- ==============================================================================
CREATE OR REPLACE VIEW public.super_admin_analytics AS
SELECT
  (SELECT COUNT(*) FROM public.admin_users WHERE role = 'teacher') AS total_teachers,
  (SELECT COUNT(*) FROM public.admin_users WHERE role = 'teacher' AND is_active = true) AS active_teachers,
  (SELECT COUNT(*) FROM public.exam_groups) AS total_groups,
  (SELECT COUNT(*) FROM public.exam_groups WHERE is_active = true) AS active_groups,
  (SELECT COUNT(*) FROM public.results) AS total_submissions,
  (SELECT COALESCE(ROUND(AVG(score), 1), 0) FROM public.results) AS average_score,
  (SELECT COUNT(*) FROM public.questions) AS total_questions;

-- ==============================================================================
-- 🛡️ 8. ROW LEVEL SECURITY (RLS) VA RUXSATLAR
-- ==============================================================================
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_settings ENABLE ROW LEVEL SECURITY;

-- admin_users
DROP POLICY IF EXISTS "Public access admin_users" ON public.admin_users;
CREATE POLICY "Public access admin_users" ON public.admin_users FOR ALL USING (true);

-- questions
DROP POLICY IF EXISTS "Public access questions" ON public.questions;
CREATE POLICY "Public access questions" ON public.questions FOR ALL USING (true);

-- exam_groups
DROP POLICY IF EXISTS "Public access exam_groups" ON public.exam_groups;
CREATE POLICY "Public access exam_groups" ON public.exam_groups FOR ALL USING (true);

-- results
DROP POLICY IF EXISTS "Public access results" ON public.results;
CREATE POLICY "Public access results" ON public.results FOR ALL USING (true);

-- exam_settings
DROP POLICY IF EXISTS "Public access exam_settings" ON public.exam_settings;
CREATE POLICY "Public access exam_settings" ON public.exam_settings FOR ALL USING (true);

-- ==============================================================================
-- 👑 9. STANDART SUPER ADMIN HISOBI
-- ==============================================================================
INSERT INTO public.admin_users (full_name, username, password, role, is_active)
VALUES ('Bosh Administrator', 'superadmin', 'JAMSHID', 'super_admin', true)
ON CONFLICT (username) DO UPDATE SET is_active = true;

-- ==============================================================================
-- ⚡ 10. REALTIME (JONLI SINXRONIZATSIYA) SOZLAMALARI
-- ==============================================================================
ALTER TABLE public.admin_users REPLICA IDENTITY FULL;
ALTER TABLE public.results REPLICA IDENTITY FULL;
ALTER TABLE public.exam_groups REPLICA IDENTITY FULL;
ALTER TABLE public.exam_settings REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'admin_users') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_users;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'results') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.results;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'exam_groups') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_groups;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'exam_settings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_settings;
  END IF;
END $$;
