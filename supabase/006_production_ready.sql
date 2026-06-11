-- ═══ ZenFit — Production-Ready Supabase Schema ═══
-- Supabase SQL Editor da run qiling
-- Bu fayl 006_ — oldingi 001-005 lardan KEYIN run qilinadi

-- ─── 1. Auth Trigger yangilash (email ham saqlansin) ─────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- Email column (agar yo'q bo'lsa)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(100);

-- ─── 5. Multi Gym Permission (gym_members) ───────────────
CREATE TABLE IF NOT EXISTS gym_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner | manager | trainer | member
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gym_id, user_id)
);

ALTER TABLE gym_members ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "gym_members_read" ON gym_members FOR SELECT USING (
    user_id = auth.uid() OR gym_id IN (SELECT gym_id FROM gym_members WHERE user_id = auth.uid() AND role IN ('owner','manager'))
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "gym_members_manage" ON gym_members FOR ALL USING (
    gym_id IN (SELECT gym_id FROM gym_members WHERE user_id = auth.uid() AND role IN ('owner','manager'))
  ) WITH CHECK (
    gym_id IN (SELECT gym_id FROM gym_members WHERE user_id = auth.uid() AND role IN ('owner','manager'))
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_gym_members_user ON gym_members(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_members_gym ON gym_members(gym_id, role);

-- ─── 6. Storage Security ─────────────────────────────────
DO $$ BEGIN
  INSERT INTO storage.buckets (id, name, public) VALUES ('progress-photos', 'progress-photos', false);
EXCEPTION WHEN unique_violation THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "upload_own_progress" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "read_own_progress" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 7. Database Functions (RPC) ─────────────────────────

-- Create gym with owner
CREATE OR REPLACE FUNCTION create_gym_with_owner(p_name TEXT, p_slug TEXT, p_city TEXT DEFAULT NULL)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_gym_id UUID;
BEGIN
  INSERT INTO gyms (name, slug, owner_id, city) VALUES (p_name, p_slug, auth.uid(), p_city) RETURNING id INTO v_gym_id;
  UPDATE users SET gym_id = v_gym_id WHERE id = auth.uid();
  INSERT INTO gym_members (gym_id, user_id, role) VALUES (v_gym_id, auth.uid(), 'owner');
  RETURN v_gym_id;
END;
$$;

-- Record activity (points + streak update)
CREATE OR REPLACE FUNCTION record_activity(p_action TEXT, p_points INTEGER DEFAULT 10)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_streak RECORD;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT * INTO v_streak FROM member_streaks WHERE member_id = auth.uid();
  IF NOT FOUND THEN
    INSERT INTO member_streaks (member_id, current_streak, longest_streak, total_points, last_activity)
    VALUES (auth.uid(), 1, 1, p_points, v_today);
  ELSE
    IF v_streak.last_activity = v_today THEN
      UPDATE member_streaks SET total_points = total_points + p_points WHERE member_id = auth.uid();
    ELSIF v_streak.last_activity = v_today - 1 THEN
      UPDATE member_streaks SET
        current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        total_points = total_points + p_points,
        last_activity = v_today
      WHERE member_id = auth.uid();
    ELSE
      UPDATE member_streaks SET
        current_streak = 1,
        total_points = total_points + p_points,
        last_activity = v_today
      WHERE member_id = auth.uid();
    END IF;
  END IF;
END;
$$;

-- ─── 8. Audit Log ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id UUID,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id UUID,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id, created_at DESC);

-- ─── 9. Soft Delete — users jadvalida (yuqorida qo'shildi) ──

-- ─── 13. Membership Lifecycle ────────────────────────────
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  gym_id UUID REFERENCES gyms(id),
  plan TEXT DEFAULT 'free', -- free | starter | pro | network
  status TEXT DEFAULT 'active', -- active | expired | frozen | cancelled | pending
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "membership_own" ON memberships FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "membership_gym" ON memberships FOR ALL USING (
    gym_id IN (SELECT gym_id FROM gym_members WHERE user_id = auth.uid() AND role IN ('owner','manager'))
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_memberships_gym ON memberships(gym_id, status);

-- ─── 14. Production Indexes ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_gym_role ON users(gym_id, role);
CREATE INDEX IF NOT EXISTS idx_food_logs_member_day ON food_logs(member_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_gym_date ON attendance(gym_id, checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_plans_member_active ON fitness_plans(member_id, is_active);
CREATE INDEX IF NOT EXISTS idx_streaks_points ON member_streaks(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_photos_member ON progress_photos(member_id, taken_at DESC);

-- ─── 17. Security Hardening ──────────────────────────────
REVOKE ALL ON public.users FROM anon;
REVOKE ALL ON public.gyms FROM anon;
REVOKE ALL ON public.food_logs FROM anon;
REVOKE ALL ON public.fitness_plans FROM anon;
REVOKE ALL ON public.progress_photos FROM anon;
REVOKE ALL ON public.member_streaks FROM anon;
REVOKE ALL ON public.attendance FROM anon;

-- uzbek_foods faqat SELECT (hamma uchun)
GRANT SELECT ON public.uzbek_foods TO anon;
GRANT SELECT ON public.uzbek_foods TO authenticated;

-- Authenticated users
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.fitness_plans TO authenticated;
GRANT SELECT, INSERT ON public.progress_photos TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.member_streaks TO authenticated;
GRANT SELECT, INSERT ON public.attendance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.group_members TO authenticated;
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.gyms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_members TO authenticated;
GRANT SELECT, INSERT ON public.memberships TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.challenges TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.challenge_participants TO authenticated;
GRANT SELECT, INSERT ON public.referrals TO authenticated;
GRANT SELECT, INSERT ON public.feed_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.telegram_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.plan_instructions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.trainer_assignments TO authenticated;
