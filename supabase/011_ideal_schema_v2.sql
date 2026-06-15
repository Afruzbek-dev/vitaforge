-- ═══ ZenFit — Ideal Schema v2 (21 ta fix) ═══
-- BARCHA oldingi jadvallarni tuzatadi + yangilarini qo'shadi
-- Supabase SQL Editor da run qiling

-- ─── ENUM TYPES ──────────────────────────────────────────
DO $$ BEGIN CREATE TYPE gym_role AS ENUM ('owner','manager','trainer','member'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE fitness_goal AS ENUM ('weight_loss','muscle_gain','endurance','maintenance','health'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE activity_level AS ENUM ('sedentary','light','moderate','active','very_active'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE photo_type AS ENUM ('front','side','back'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE chat_role AS ENUM ('user','assistant','system'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE plan_source AS ENUM ('ai','trainer','hybrid'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE membership_status AS ENUM ('active','expired','frozen','cancelled','pending','trial'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notif_type AS ENUM ('plan_ready','streak_reminder','churn_alert','challenge_update','trainer_message','badge_earned','weekly_report'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── FIX #1: gyms.owner_id FK ────────────────────────────
DO $$ BEGIN
  ALTER TABLE gyms ADD CONSTRAINT gyms_owner_fk FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── FIX #4: member_profiles numeric types ───────────────
ALTER TABLE member_profiles ALTER COLUMN age TYPE SMALLINT USING age::SMALLINT;
ALTER TABLE member_profiles ALTER COLUMN height_cm TYPE NUMERIC(5,1) USING height_cm::NUMERIC(5,1);
ALTER TABLE member_profiles ALTER COLUMN weight_kg TYPE NUMERIC(5,1) USING weight_kg::NUMERIC(5,1);

-- ─── FIX #6: fitness_plans date check ────────────────────
ALTER TABLE fitness_plans DROP CONSTRAINT IF EXISTS plans_date_check;
ALTER TABLE fitness_plans ADD CONSTRAINT plans_date_check CHECK (ends_at >= starts_at);

-- ─── FIX #8: food_logs positive values ───────────────────
ALTER TABLE food_logs DROP CONSTRAINT IF EXISTS food_calories_positive;
ALTER TABLE food_logs ADD CONSTRAINT food_calories_positive CHECK (calories IS NULL OR calories >= 0);
ALTER TABLE food_logs ADD CONSTRAINT food_protein_positive CHECK (protein_g IS NULL OR protein_g >= 0);
ALTER TABLE food_logs ADD CONSTRAINT food_carbs_positive CHECK (carbs_g IS NULL OR carbs_g >= 0);
ALTER TABLE food_logs ADD CONSTRAINT food_fat_positive CHECK (fat_g IS NULL OR fat_g >= 0);

-- ─── FIX #9: uzbek_foods unique name ─────────────────────
DELETE FROM uzbek_foods a USING uzbek_foods b WHERE a.id > b.id AND a.name_uz = b.name_uz;
ALTER TABLE uzbek_foods DROP CONSTRAINT IF EXISTS uzbek_foods_name_unique;
ALTER TABLE uzbek_foods ADD CONSTRAINT uzbek_foods_name_unique UNIQUE (name_uz);

-- ─── FIX #14: users.email column ─────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(100);
DO $$ BEGIN ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── FIX #16: Soft delete ────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ─── FIX #15: updated_at trigger ─────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DO $$ BEGIN CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON member_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER trg_gyms_updated BEFORE UPDATE ON gyms FOR EACH ROW EXECUTE FUNCTION set_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── FIX #17: Audit Logs ─────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_actor_time ON audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity, entity_id, created_at DESC);

-- ─── NEW: Memberships (subscription lifecycle) ───────────
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status membership_status NOT NULL DEFAULT 'trial',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT membership_dates CHECK (expires_at IS NULL OR expires_at > starts_at)
);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id, status);

-- ─── NEW: Workout Sessions (plan tracking) ───────────────
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES fitness_plans(id),
  day VARCHAR(20) NOT NULL,
  exercises_completed JSONB DEFAULT '[]',
  total_exercises SMALLINT DEFAULT 0,
  completed_count SMALLINT DEFAULT 0,
  food_compliance BOOLEAN,
  notes TEXT,
  completed_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sessions_member ON workout_sessions(member_id, completed_at DESC);

-- ─── NEW: Trainer Notes ──────────────────────────────────
CREATE TABLE IF NOT EXISTS trainer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES users(id),
  member_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notes_member ON trainer_notes(member_id, created_at DESC);

-- ─── NEW: AI Usage Logs ──────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL, -- chat, plan_generate, food_parse, photo_analyze
  model TEXT,
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage_logs(user_id, created_at DESC);

-- ─── NEW: Subscription Plans (catalog) ───────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY, -- free, starter, pro, scale
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL DEFAULT 0, -- cents
  price_annual INTEGER DEFAULT 0,
  max_members INTEGER DEFAULT 0,
  max_trainers INTEGER DEFAULT 1,
  ai_chat_daily INTEGER DEFAULT 5,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true
);
INSERT INTO subscription_plans (id, name, price_monthly, price_annual, max_members, max_trainers, ai_chat_daily, features) VALUES
  ('free', 'Free', 0, 0, 0, 0, 5, '["ovqat_tracker","streak","1_plan_per_month"]'),
  ('starter', 'Starter', 3900, 34800, 100, 1, 20, '["haftalik_plan","progress_foto","leaderboard","telegram_app"]'),
  ('pro', 'Pro', 6900, 66000, 500, 5, 999, '["cheksiz_ai","churn_prediction","haftalik_hisobot","challenges"]'),
  ('scale', 'Scale', 14900, 142800, 99999, 999, 999, '["white_label","api","custom_ai","24_7_support"]')
ON CONFLICT (id) DO UPDATE SET price_monthly = EXCLUDED.price_monthly, price_annual = EXCLUDED.price_annual;

-- ─── FIX #18-19-20-21: RLS everywhere + FORCE ───────────
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE workout_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE trainer_notes FORCE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY "sessions_own" ON workout_sessions FOR ALL USING (member_id = auth.uid()) WITH CHECK (member_id = auth.uid());
CREATE POLICY "notes_trainer" ON trainer_notes FOR ALL USING (trainer_id = auth.uid() OR member_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());
CREATE POLICY "ai_own" ON ai_usage_logs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "membership_own" ON memberships;
CREATE POLICY "membership_own" ON memberships FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "membership_gym" ON memberships;
CREATE POLICY "membership_gym" ON memberships FOR ALL USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())) WITH CHECK (true);
CREATE POLICY "audit_read" ON audit_logs FOR SELECT USING (actor_id = auth.uid());
CREATE POLICY "audit_insert" ON audit_logs FOR INSERT WITH CHECK (true);

-- ─── Performance Indexes ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_gym_active ON users(gym_id, role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_plans_active ON fitness_plans(member_id) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_streaks_rank ON member_streaks(total_points DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_food_member_day ON food_logs(member_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_gym ON attendance(gym_id, checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_groups_gym ON groups(gym_id) WHERE is_active = true;
