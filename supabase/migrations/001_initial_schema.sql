-- VitaForge AI — Initial Schema
-- Run this in Supabase SQL Editor

-- ─── GYMS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gyms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(100) UNIQUE NOT NULL,
  owner_id        UUID,
  city            VARCHAR(100),
  plan            VARCHAR(50) DEFAULT 'pilot',
  plan_expires_at TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT true,
  settings        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── USERS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  gym_id      UUID REFERENCES gyms(id),
  role        VARCHAR(50) NOT NULL DEFAULT 'member',
  full_name   VARCHAR(255),
  phone       VARCHAR(20),
  telegram_id BIGINT UNIQUE,
  avatar_url  TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── MEMBER PROFILES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS member_profiles (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  age                  VARCHAR(3),
  gender               VARCHAR(10),
  height_cm            VARCHAR(6),
  weight_kg            VARCHAR(6),
  goal                 VARCHAR(50),
  activity_level       VARCHAR(50),
  dietary_restrictions TEXT DEFAULT '',
  medical_notes        TEXT,
  onboarding_done      BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- ─── FITNESS PLANS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fitness_plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  trainer_id        UUID REFERENCES users(id),
  generated_by      VARCHAR(20) DEFAULT 'ai',
  week_number       SMALLINT NOT NULL,
  starts_at         DATE NOT NULL,
  ends_at           DATE NOT NULL,
  workouts          JSONB NOT NULL DEFAULT '[]',
  nutrition         JSONB NOT NULL DEFAULT '{}',
  ai_model          VARCHAR(100),
  ai_prompt_version VARCHAR(20),
  notes             TEXT,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── FOOD LOGS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS food_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at   TIMESTAMPTZ DEFAULT now(),
  meal_type   VARCHAR(20),
  food_name   VARCHAR(255) NOT NULL,
  quantity_g  NUMERIC(7,1),
  calories    NUMERIC(7,1),
  protein_g   NUMERIC(6,1),
  carbs_g     NUMERIC(6,1),
  fat_g       NUMERIC(6,1),
  is_uzbek    BOOLEAN DEFAULT false,
  raw_input   TEXT,
  ai_parsed   BOOLEAN DEFAULT false
);

-- ─── UZBEK FOOD DATABASE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS uzbek_foods (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz           VARCHAR(255) NOT NULL,
  name_ru           VARCHAR(255),
  name_en           VARCHAR(255),
  category          VARCHAR(100),
  calories_per_100g NUMERIC(6,1),
  protein_g         NUMERIC(5,1),
  carbs_g           NUMERIC(5,1),
  fat_g             NUMERIC(5,1),
  serving_size_g    NUMERIC(6,1),
  aliases           TEXT[] DEFAULT '{}',
  verified          BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── PROGRESS PHOTOS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progress_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  photo_type   VARCHAR(20) DEFAULT 'front',
  taken_at     DATE NOT NULL,
  week_number  SMALLINT,
  ai_score     NUMERIC(4,1),
  ai_analysis  JSONB,
  ai_model     VARCHAR(100),
  analyzed_at  TIMESTAMPTZ,
  is_private   BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ─── MEMBER STREAKS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS member_streaks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_streak SMALLINT DEFAULT 0,
  longest_streak SMALLINT DEFAULT 0,
  last_activity  DATE,
  total_points   INTEGER DEFAULT 0,
  badges         TEXT[] DEFAULT '{}',
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- ─── ATTENDANCE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  gym_id         UUID REFERENCES gyms(id),
  checked_in_at  TIMESTAMPTZ DEFAULT now(),
  checked_out_at TIMESTAMPTZ,
  source         VARCHAR(50) DEFAULT 'manual'
);

-- ─── CHAT MESSAGES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id  UUID NOT NULL,
  role        VARCHAR(20) NOT NULL,
  content     TEXT NOT NULL,
  tokens_used INTEGER,
  model       VARCHAR(100),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── NOTIFICATIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  body       TEXT,
  data       JSONB DEFAULT '{}',
  sent_via   TEXT[] DEFAULT '{}',
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── INDEXES ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_food_logs_member_date ON food_logs(member_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id, checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_gym ON attendance(gym_id, checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_photos_member ON progress_photos(member_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_fitness_plans_member ON fitness_plans(member_id, is_active);
CREATE INDEX IF NOT EXISTS idx_uzbek_foods_name ON uzbek_foods(name_uz);

-- ─── RLS POLICIES ──────────────────────────────────────────────
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_plans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages   ENABLE ROW LEVEL SECURITY;

-- Member o'z ma'lumotlarini ko'ra oladi
CREATE POLICY "member_own_profile" ON member_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "member_own_plans" ON fitness_plans
  FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "member_own_food" ON food_logs
  FOR ALL USING (member_id = auth.uid());

CREATE POLICY "member_own_photos" ON progress_photos
  FOR ALL USING (member_id = auth.uid());

CREATE POLICY "member_own_chat" ON chat_messages
  FOR ALL USING (member_id = auth.uid());
