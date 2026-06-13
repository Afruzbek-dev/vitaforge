-- ═══ ZenFit — Production Hardening (10 kritik fix) ═══
-- Supabase SQL Editor da run qiling

-- ─── 1. ENUM types ──────────────────────────────────────
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('gym_owner','trainer','member','admin','manager'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE membership_status AS ENUM ('active','expired','frozen','cancelled','pending'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE gym_member_role AS ENUM ('owner','manager','trainer','member'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 2. Users table hardening ───────────────────────────
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ─── 3. Auth Trigger fix (error handling + on conflict) ─
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = now();
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- ─── 4. gym_members constraints ─────────────────────────
ALTER TABLE gym_members DROP CONSTRAINT IF EXISTS gym_members_gym_id_user_id_key;
ALTER TABLE gym_members ADD CONSTRAINT gym_members_unique UNIQUE (gym_id, user_id);
ALTER TABLE gym_members DROP CONSTRAINT IF EXISTS gym_members_user_id_fkey;
ALTER TABLE gym_members ADD CONSTRAINT gym_members_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE gym_members DROP CONSTRAINT IF EXISTS gym_members_gym_id_fkey;
ALTER TABLE gym_members ADD CONSTRAINT gym_members_gym_fk FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE;

-- ─── 5. Memberships constraints ─────────────────────────
ALTER TABLE memberships ADD CONSTRAINT memberships_dates_check CHECK (expires_at IS NULL OR expires_at > starts_at);

-- ─── 6. Attendance duplicate protection ─────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_one_per_day ON attendance (member_id, (checked_in_at::date));

-- ─── 7. Force RLS on all tables ─────────────────────────
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE gyms FORCE ROW LEVEL SECURITY;
ALTER TABLE gym_members FORCE ROW LEVEL SECURITY;
ALTER TABLE member_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE fitness_plans FORCE ROW LEVEL SECURITY;
ALTER TABLE food_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE progress_photos FORCE ROW LEVEL SECURITY;
ALTER TABLE member_streaks FORCE ROW LEVEL SECURITY;
ALTER TABLE attendance FORCE ROW LEVEL SECURITY;
ALTER TABLE chat_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE groups FORCE ROW LEVEL SECURITY;
ALTER TABLE group_members FORCE ROW LEVEL SECURITY;
ALTER TABLE invitations FORCE ROW LEVEL SECURITY;
ALTER TABLE challenges FORCE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants FORCE ROW LEVEL SECURITY;
ALTER TABLE referrals FORCE ROW LEVEL SECURITY;
ALTER TABLE feed_events FORCE ROW LEVEL SECURITY;

-- ─── 8. Storage security fix ────────────────────────────
-- Drop overly permissive policies
DROP POLICY IF EXISTS "upload_own_progress" ON storage.objects;
DROP POLICY IF EXISTS "read_own_progress" ON storage.objects;

-- Strict folder-based policies
CREATE POLICY "storage_upload_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "storage_read_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
-- Gym owner can read all members photos
CREATE POLICY "storage_read_gym" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'progress-photos' AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM users WHERE gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  ));

-- ─── 9. Audit log improvements ──────────────────────────
ALTER TABLE audit_logs ADD CONSTRAINT audit_actor_fk FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity, entity_id);

-- Auto audit trigger for important tables
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO audit_logs (actor_id, action, entity, entity_id, payload)
  VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), to_jsonb(NEW));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_users ON users;
CREATE TRIGGER audit_users AFTER UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION log_audit();
DROP TRIGGER IF EXISTS audit_memberships ON memberships;
CREATE TRIGGER audit_memberships AFTER INSERT OR UPDATE ON memberships FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ─── 10. Composite indexes for performance ──────────────
CREATE INDEX IF NOT EXISTS idx_users_gym_role_active ON users(gym_id, role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_food_member_date ON food_logs(member_id, (logged_at::date) DESC);
CREATE INDEX IF NOT EXISTS idx_plans_member_active ON fitness_plans(member_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_attendance_gym_day ON attendance(gym_id, (checked_in_at::date) DESC);
CREATE INDEX IF NOT EXISTS idx_streaks_rank ON member_streaks(total_points DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(gym_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_groups_gym_active ON groups(gym_id) WHERE is_active = true;

-- ─── 11. Soft delete filter in main RLS ─────────────────
-- Users who are soft-deleted shouldn't appear
DROP POLICY IF EXISTS "users_select" ON users;
CREATE POLICY "users_select" ON users FOR SELECT USING (deleted_at IS NULL);

-- ─── 12. Updated_at auto-trigger ────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_profiles_updated ON member_profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON member_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
