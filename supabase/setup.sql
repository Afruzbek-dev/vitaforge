-- ═══ VitaForge AI — To'liq Supabase Schema ═══
-- Supabase SQL Editor ga paste qilib Run bosing

-- ─── GYMS ───────────────────────────────────────────────────
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

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

DO $$ BEGIN
  ALTER TABLE gyms ADD CONSTRAINT gyms_owner_fk FOREIGN KEY (owner_id) REFERENCES users(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── MEMBER PROFILES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS member_profiles (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  age                  SMALLINT,
  gender               VARCHAR(10),
  height_cm            NUMERIC(5,1),
  weight_kg            NUMERIC(5,1),
  goal                 VARCHAR(50),
  activity_level       VARCHAR(50),
  dietary_restrictions TEXT[] DEFAULT '{}',
  medical_notes        TEXT,
  onboarding_done      BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- ─── FITNESS PLANS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fitness_plans (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  trainer_id          UUID REFERENCES users(id),
  generated_by        VARCHAR(20) DEFAULT 'ai',
  week_number         SMALLINT NOT NULL,
  starts_at           DATE NOT NULL,
  ends_at             DATE NOT NULL,
  workouts            JSONB NOT NULL DEFAULT '[]',
  nutrition           JSONB NOT NULL DEFAULT '{}',
  ai_model            VARCHAR(100),
  ai_prompt_version   VARCHAR(20),
  notes               TEXT,
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ─── FOOD LOG ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS food_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
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

-- ─── UZBEK FOOD DATABASE ─────────────────────────────────────
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
  source            VARCHAR(100),
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── PROGRESS PHOTOS ─────────────────────────────────────────
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

-- ─── STREAKS ─────────────────────────────────────────────────
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

-- ─── ATTENDANCE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  gym_id          UUID REFERENCES gyms(id),
  checked_in_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_out_at  TIMESTAMPTZ,
  source          VARCHAR(50) DEFAULT 'manual'
);

-- ─── CHAT MESSAGES ───────────────────────────────────────────
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

-- ─── NOTIFICATIONS ───────────────────────────────────────────
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

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_food_logs_member ON food_logs(member_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id, checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_member ON progress_photos(member_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_plans_member ON fitness_plans(member_id, is_active);
CREATE INDEX IF NOT EXISTS idx_users_gym ON users(gym_id);

-- ─── AUTO USER CREATION ON SIGNUP ────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE uzbek_foods ENABLE ROW LEVEL SECURITY;

-- Everyone can read uzbek_foods
CREATE POLICY "public_read_uzbek_foods" ON uzbek_foods FOR SELECT USING (true);

-- Users see themselves
CREATE POLICY "users_self" ON users FOR ALL USING (id = auth.uid());
CREATE POLICY "member_own_profile" ON member_profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY "member_own_plans" ON fitness_plans FOR ALL USING (member_id = auth.uid());
CREATE POLICY "member_own_food" ON food_logs FOR ALL USING (member_id = auth.uid());
CREATE POLICY "member_own_photos" ON progress_photos FOR ALL USING (member_id = auth.uid());
CREATE POLICY "member_own_streak" ON member_streaks FOR ALL USING (member_id = auth.uid());
CREATE POLICY "member_own_attendance" ON attendance FOR ALL USING (member_id = auth.uid());
CREATE POLICY "member_own_chat" ON chat_messages FOR ALL USING (member_id = auth.uid());
CREATE POLICY "user_own_notifs" ON notifications FOR ALL USING (user_id = auth.uid());

-- Gym owner sees gym members
CREATE POLICY "owner_see_members" ON users FOR SELECT USING (
  gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
);

-- ─── SEED: UZBEK FOODS ──────────────────────────────────────
INSERT INTO uzbek_foods (name_uz, name_ru, name_en, category, calories_per_100g, protein_g, carbs_g, fat_g, serving_size_g, aliases, verified) VALUES
('Osh (palov)', 'Плов', 'Plov', 'main_dish', 180, 5.2, 25.0, 7.0, 350, ARRAY['palov', 'plov', 'osh'], true),
('Shurpa', 'Шурпа', 'Shurpa', 'soup', 65, 4.5, 5.0, 3.0, 400, ARRAY['shorpa', 'shorva'], true),
('Manti', 'Манты', 'Manti', 'main_dish', 195, 9.8, 22.0, 8.0, 200, ARRAY['manty', 'manti'], true),
('Somsa', 'Самса', 'Samsa', 'snack', 320, 11.0, 32.0, 16.0, 120, ARRAY['samsa', 'somsa'], true),
('Non (oq)', 'Лепёшка', 'Bread', 'bread', 270, 8.5, 53.0, 2.5, 100, ARRAY['non', 'bread', 'lepyoshka'], true),
('Lagmon', 'Лагман', 'Lagman', 'main_dish', 145, 6.0, 18.0, 5.5, 350, ARRAY['lagmon', 'lagman'], true),
('Dimlama', 'Димлама', 'Dimlama', 'main_dish', 95, 5.5, 8.0, 4.5, 300, ARRAY['dimlama'], true),
('Kabob', 'Кабоб', 'Kebab', 'main_dish', 285, 22.0, 2.0, 21.0, 150, ARRAY['kebab', 'kabob', 'shashlik'], true),
('Tovuq (qaynatilgan)', 'Курица', 'Chicken', 'protein', 165, 31.0, 0.0, 3.6, 150, ARRAY['chicken', 'tovuq'], true),
('Tuxum (qaynatilgan)', 'Яйцо', 'Egg', 'protein', 155, 13.0, 1.1, 11.0, 60, ARRAY['egg', 'tuxum'], true),
('Guruch (qaynatilgan)', 'Рис', 'Rice', 'grain', 130, 2.7, 28.0, 0.3, 200, ARRAY['rice', 'guruch'], true),
('Kartoshka', 'Картошка', 'Potato', 'vegetable', 86, 2.0, 20.0, 0.1, 200, ARRAY['potato', 'kartoshka'], true),
('Pomidor', 'Помидор', 'Tomato', 'vegetable', 18, 0.9, 3.9, 0.2, 150, ARRAY['tomato', 'pomidor'], true),
('Bodring', 'Огурец', 'Cucumber', 'vegetable', 15, 0.7, 3.1, 0.1, 150, ARRAY['cucumber', 'bodring'], true),
('Qatiq', 'Катык', 'Katyk', 'dairy', 56, 2.8, 4.5, 3.0, 200, ARRAY['katyk', 'qatiq', 'yogurt'], true),
('Choy (qora)', 'Чай', 'Tea', 'drink', 1, 0.0, 0.2, 0.0, 250, ARRAY['tea', 'choy'], true),
('Olma', 'Яблоко', 'Apple', 'fruit', 52, 0.3, 14.0, 0.2, 150, ARRAY['apple', 'olma'], true),
('Banan', 'Банан', 'Banana', 'fruit', 89, 1.1, 23.0, 0.3, 120, ARRAY['banana', 'banan'], true),
('Mol gosht', 'Говядина', 'Beef', 'protein', 218, 26.0, 0.0, 12.0, 150, ARRAY['beef', 'mol gosht'], true),
('Sut', 'Молоко', 'Milk', 'dairy', 61, 3.2, 4.8, 3.3, 250, ARRAY['milk', 'sut'], true)
ON CONFLICT DO NOTHING;
