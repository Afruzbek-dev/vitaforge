-- ═══ ZenFit SaaS Upgrade Schema ═══
-- Barcha yangi talablarga mos jadvallar va alter-lar

-- 1. GYMS jadvalini kengaytirish
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'basic';

-- 2. USERS jadvalida name ustunini qo'llab-quvvatlash
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
UPDATE users SET name = full_name WHERE name IS NULL;

-- 3. TRAINERS jadvali
CREATE TABLE IF NOT EXISTS trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  specialization TEXT,
  schedule JSONB DEFAULT '[]',
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT trainers_user_unique UNIQUE (user_id)
);

-- 4. MEMBERS jadvali
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  membership_type VARCHAR(100) DEFAULT 'monthly',
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT members_user_unique UNIQUE (user_id)
);

-- 5. PAYMENTS jadvalini qayta qurish/moslashtirish
-- Agar eski payments jadvali bo'lsa, drop qilamiz yoki ustunlarini o'zgartiramiz
DROP TABLE IF EXISTS payments CASCADE;

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'UZS',
  type VARCHAR(50) NOT NULL DEFAULT 'monthly', -- monthly, annual, drop-in
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, submitted, confirmed, overdue, rejected
  due_date TIMESTAMPTZ NOT NULL,
  paid_date TIMESTAMPTZ,
  confirmed_by UUID REFERENCES users(id),
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ATTENDANCE jadvaliga check_in, check_out va duration_minutes qo'shish
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in TIMESTAMPTZ;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_out TIMESTAMPTZ;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;

-- Mavjud ma'lumotlarni to'ldirish
UPDATE attendance SET check_in = checked_in_at WHERE check_in IS NULL;
UPDATE attendance SET check_out = checked_out_at WHERE check_out IS NULL;

-- 7. NUTRITION_LOGS jadvali (Calorie Tracker)
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type VARCHAR(20) NOT NULL, -- breakfast, lunch, dinner, snack
  food_name VARCHAR(255) NOT NULL,
  calories NUMERIC(7,1) DEFAULT 0,
  protein NUMERIC(6,1) DEFAULT 0,
  carbs NUMERIC(6,1) DEFAULT 0,
  fat NUMERIC(6,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. FOODS jadvali (Custom + Common Foods)
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL bo'lsa umumiy/tizim taomlari
  name VARCHAR(255) NOT NULL,
  calories_per_100g NUMERIC(6,1) NOT NULL,
  protein NUMERIC(5,1) DEFAULT 0,
  carbs NUMERIC(5,1) DEFAULT 0,
  fat NUMERIC(5,1) DEFAULT 0,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- users.settings ustunini JSONB sifatida qo'shish (calorie goals, etc.)
ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"calorie_goal": 2000, "protein_goal": 150, "carbs_goal": 200, "fat_goal": 70}';

-- 9. Row Level Security (RLS) yoqish
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

-- 10. RLS POLICIES

-- TRAINERS
CREATE POLICY "trainers_read_all" ON trainers FOR SELECT USING (true);
CREATE POLICY "trainers_write_owner" ON trainers FOR ALL USING (
  gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
);

-- MEMBERS
CREATE POLICY "members_read_all" ON members FOR SELECT USING (true);
CREATE POLICY "members_write_owner" ON members FOR ALL USING (
  gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
);
CREATE POLICY "members_self_update" ON members FOR UPDATE USING (user_id = auth.uid());

-- PAYMENTS
CREATE POLICY "payments_read_rules" ON payments FOR SELECT USING (
  member_id = auth.uid() OR 
  gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()) OR
  auth.uid() IN (SELECT user_id FROM trainers WHERE gym_id = payments.gym_id)
);
CREATE POLICY "payments_member_update" ON payments FOR UPDATE USING (
  member_id = auth.uid()
);
CREATE POLICY "payments_owner_trainer_all" ON payments FOR ALL USING (
  gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()) OR
  auth.uid() IN (SELECT user_id FROM trainers WHERE gym_id = payments.gym_id)
);
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (true);

-- NUTRITION LOGS
CREATE POLICY "nutrition_self_all" ON nutrition_logs FOR ALL USING (user_id = auth.uid());
CREATE POLICY "nutrition_trainer_read" ON nutrition_logs FOR SELECT USING (
  user_id IN (SELECT user_id FROM members WHERE trainer_id = auth.uid())
);

-- FOODS
CREATE POLICY "foods_read_public_or_own" ON foods FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "foods_write_own" ON foods FOR ALL USING (user_id = auth.uid());

-- 11. INDEXES
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_gym ON payments(gym_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_user ON nutrition_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_foods_user ON foods(user_id);
