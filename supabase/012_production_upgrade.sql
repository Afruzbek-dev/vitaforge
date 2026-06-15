-- =====================================================
-- VITAFORGE PRODUCTION UPGRADE
-- =====================================================

-- ROLES
DO $$ BEGIN CREATE TYPE gym_role AS ENUM ('owner','manager','trainer','member'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE membership_status AS ENUM ('active','expired','frozen','cancelled','pending'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE photo_type_enum AS ENUM ('front','side','back'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- USERS IMPROVEMENTS
-- =====================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- =====================================================
-- GYM MEMBERS
-- =====================================================

CREATE TABLE IF NOT EXISTS gym_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role gym_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gym_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_gym_members_gym ON gym_members(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_members_user ON gym_members(user_id);

-- =====================================================
-- MEMBERSHIPS
-- =====================================================

CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  price NUMERIC(10,2),
  status membership_status DEFAULT 'pending',
  starts_at DATE NOT NULL,
  expires_at DATE NOT NULL,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (expires_at >= starts_at)
);

-- =====================================================
-- WORKOUT SESSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES users(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  notes TEXT,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TRAINER NOTES
-- =====================================================

CREATE TABLE IF NOT EXISTS trainer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  member_id UUID REFERENCES users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- BODY MEASUREMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chest_cm NUMERIC(5,2),
  waist_cm NUMERIC(5,2),
  hips_cm NUMERIC(5,2),
  arm_cm NUMERIC(5,2),
  body_fat NUMERIC(5,2),
  measured_at DATE NOT NULL
);

-- =====================================================
-- WATER LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- SLEEP LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sleep_hours NUMERIC(4,2),
  quality INTEGER,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- CHAT SESSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- AI USAGE LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  model TEXT,
  tokens INTEGER,
  cost NUMERIC(10,5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- PAYMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id),
  membership_id UUID REFERENCES memberships(id),
  amount NUMERIC(10,2),
  currency TEXT DEFAULT 'UZS',
  provider TEXT,
  status TEXT,
  paid_at TIMESTAMPTZ
);

-- =====================================================
-- AUDIT LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id UUID,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- =====================================================
-- RLS + FORCE
-- =====================================================

ALTER TABLE gym_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE member_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE food_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE progress_photos FORCE ROW LEVEL SECURITY;
ALTER TABLE chat_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE gym_members FORCE ROW LEVEL SECURITY;
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions FORCE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES (yangi jadvallar uchun)
-- =====================================================

CREATE POLICY "gm_own" ON gym_members FOR SELECT USING (user_id = auth.uid() OR gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));
CREATE POLICY "gm_manage" ON gym_members FOR ALL USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())) WITH CHECK (true);
DROP POLICY IF EXISTS "membership_own" ON memberships;
DROP POLICY IF EXISTS "membership_manage" ON memberships;
DROP POLICY IF EXISTS "membership_gym" ON memberships;
CREATE POLICY "membership_own" ON memberships FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "membership_manage" ON memberships FOR ALL USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())) WITH CHECK (true);
CREATE POLICY "ws_own" ON workout_sessions FOR ALL USING (member_id = auth.uid()) WITH CHECK (member_id = auth.uid());
CREATE POLICY "tn_access" ON trainer_notes FOR ALL USING (trainer_id = auth.uid() OR member_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());
CREATE POLICY "bm_own" ON body_measurements FOR ALL USING (member_id = auth.uid()) WITH CHECK (member_id = auth.uid());
CREATE POLICY "wl_own" ON water_logs FOR ALL USING (member_id = auth.uid()) WITH CHECK (member_id = auth.uid());
CREATE POLICY "sl_own" ON sleep_logs FOR ALL USING (member_id = auth.uid()) WITH CHECK (member_id = auth.uid());
CREATE POLICY "cs_own" ON chat_sessions FOR ALL USING (member_id = auth.uid()) WITH CHECK (member_id = auth.uid());
CREATE POLICY "ai_own" ON ai_usage_logs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "pay_gym" ON payments FOR SELECT USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));
CREATE POLICY "audit_own" ON audit_logs FOR SELECT USING (actor_id = auth.uid());
CREATE POLICY "audit_insert" ON audit_logs FOR INSERT WITH CHECK (true);
