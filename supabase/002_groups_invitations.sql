-- ═══ VitaForge — Groups + Invitations ═══
-- Supabase SQL Editor da run qiling

-- A'zo taklif qilish
CREATE TABLE IF NOT EXISTS invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id      UUID REFERENCES gyms(id),
  invited_by  UUID REFERENCES users(id),
  email       VARCHAR(255),
  phone       VARCHAR(20),
  role        VARCHAR(50) DEFAULT 'member',
  status      VARCHAR(20) DEFAULT 'pending', -- pending | accepted | expired
  created_at  TIMESTAMPTZ DEFAULT now(),
  expires_at  TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

-- Maqsad asosidagi guruhlar
CREATE TABLE IF NOT EXISTS groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id      UUID REFERENCES gyms(id),
  name        VARCHAR(255) NOT NULL,
  goal        VARCHAR(50), -- weight_loss | muscle_gain | endurance | health
  description TEXT,
  color       VARCHAR(7) DEFAULT '#e8ff47',
  created_by  UUID REFERENCES users(id),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Guruh a'zolari
CREATE TABLE IF NOT EXISTS group_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID REFERENCES groups(id) ON DELETE CASCADE,
  member_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, member_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invitations_gym ON invitations(gym_id, status);
CREATE INDEX IF NOT EXISTS idx_groups_gym ON groups(gym_id);
CREATE INDEX IF NOT EXISTS idx_group_members ON group_members(group_id);

-- RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_manage_invitations" ON invitations FOR ALL USING (
  gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
);
CREATE POLICY "owner_manage_groups" ON groups FOR ALL USING (
  gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
);
CREATE POLICY "members_see_own_groups" ON group_members FOR SELECT USING (
  member_id = auth.uid()
);
CREATE POLICY "owner_manage_group_members" ON group_members FOR ALL USING (
  group_id IN (SELECT id FROM groups WHERE gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
);
