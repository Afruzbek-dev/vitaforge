-- ═══ ZenFit — Qolgan schemalar ═══
-- Supabase SQL Editor da run qiling

-- ─── Groups (agar hali yaratilmagan bo'lsa) ──────────────
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id),
  invited_by UUID REFERENCES users(id),
  email VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'member',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id),
  name VARCHAR(255) NOT NULL,
  goal VARCHAR(50),
  description TEXT,
  color VARCHAR(7) DEFAULT '#e8ff47',
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  member_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, member_id)
);

-- ─── Plan Instructions (mashq ko'rsatmalari) ─────────────
CREATE TABLE IF NOT EXISTS plan_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES fitness_plans(id) ON DELETE CASCADE,
  day VARCHAR(20) NOT NULL,
  exercise_index SMALLINT NOT NULL,
  instruction_type VARCHAR(20) DEFAULT 'text', -- text | video_url | ai_generated
  content TEXT NOT NULL,
  video_url TEXT,
  created_by UUID REFERENCES users(id),
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Trainer assignments (trener-a'zo bog'lash) ──────────
CREATE TABLE IF NOT EXISTS trainer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES users(id),
  member_id UUID REFERENCES users(id),
  gym_id UUID REFERENCES gyms(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(trainer_id, member_id)
);

-- ─── Telegram users (bot integratsiya) ───────────────────
CREATE TABLE IF NOT EXISTS telegram_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  telegram_id BIGINT UNIQUE NOT NULL,
  chat_id BIGINT NOT NULL,
  username VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  linked_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_invitations_gym ON invitations(gym_id, status);
CREATE INDEX IF NOT EXISTS idx_groups_gym ON groups(gym_id);
CREATE INDEX IF NOT EXISTS idx_group_members ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_plan_instructions ON plan_instructions(plan_id, day);
CREATE INDEX IF NOT EXISTS idx_trainer_assignments ON trainer_assignments(trainer_id, is_active);
CREATE INDEX IF NOT EXISTS idx_telegram_user ON telegram_sessions(user_id);

-- ─── RLS ─────────────────────────────────────────────────
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  CREATE POLICY "owner_invitations" ON invitations FOR ALL USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "owner_groups" ON groups FOR ALL USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "member_groups" ON group_members FOR SELECT USING (member_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "owner_group_members" ON group_members FOR ALL USING (group_id IN (SELECT id FROM groups WHERE gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "plan_instructions_read" ON plan_instructions FOR SELECT USING (
    plan_id IN (SELECT id FROM fitness_plans WHERE member_id = auth.uid())
    OR created_by = auth.uid()
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "plan_instructions_write" ON plan_instructions FOR ALL USING (created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "trainer_assignments_read" ON trainer_assignments FOR SELECT USING (trainer_id = auth.uid() OR member_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "trainer_assignments_manage" ON trainer_assignments FOR ALL USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "telegram_own" ON telegram_sessions FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
