-- ═══ ZenFit — RLS Fix + Gym Owner Create User ═══
-- Supabase SQL Editor da run qiling

-- ─── Fix: food_logs INSERT policy ────────────────────────
DROP POLICY IF EXISTS "member_own_food" ON food_logs;
CREATE POLICY "member_own_food" ON food_logs
  FOR ALL USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

-- ─── Fix: groups INSERT/UPDATE policies ──────────────────
DROP POLICY IF EXISTS "owner_groups" ON groups;
CREATE POLICY "owner_groups" ON groups
  FOR ALL USING (
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
    OR created_by = auth.uid()
  )
  WITH CHECK (
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
    OR created_by = auth.uid()
  );

-- ─── Fix: group_members policies ─────────────────────────
DROP POLICY IF EXISTS "owner_group_members" ON group_members;
DROP POLICY IF EXISTS "member_groups" ON group_members;
CREATE POLICY "manage_group_members" ON group_members
  FOR ALL USING (
    member_id = auth.uid()
    OR group_id IN (SELECT id FROM groups WHERE gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
    OR group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  )
  WITH CHECK (
    group_id IN (SELECT id FROM groups WHERE gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
    OR group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );

-- ─── Fix: invitations policies ───────────────────────────
DROP POLICY IF EXISTS "owner_invitations" ON invitations;
DROP POLICY IF EXISTS "owner_manage_invitations" ON invitations;
CREATE POLICY "manage_invitations" ON invitations
  FOR ALL USING (
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
    OR invited_by = auth.uid()
  )
  WITH CHECK (
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
    OR invited_by = auth.uid()
  );

-- ─── Fix: member_streaks INSERT policy ───────────────────
DROP POLICY IF EXISTS "member_own_streak" ON member_streaks;
CREATE POLICY "member_own_streak" ON member_streaks
  FOR ALL USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

-- ─── Fix: attendance INSERT ──────────────────────────────
DROP POLICY IF EXISTS "member_own_attendance" ON attendance;
DROP POLICY IF EXISTS "gym_see_attendance" ON attendance;
CREATE POLICY "attendance_all" ON attendance
  FOR ALL USING (
    member_id = auth.uid()
    OR gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    member_id = auth.uid()
    OR gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  );

-- ─── Fix: users — trainer/owner can see gym members ──────
DROP POLICY IF EXISTS "owner_see_members" ON users;
DROP POLICY IF EXISTS "users_self" ON users;
DROP POLICY IF EXISTS "trainer_see_gym_members" ON users;
CREATE POLICY "users_read" ON users
  FOR SELECT USING (
    id = auth.uid()
    OR gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
    OR gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
  );
CREATE POLICY "users_update_self" ON users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
-- Allow gym owner to update gym_id of users (adding to gym)
CREATE POLICY "owner_update_members" ON users
  FOR UPDATE USING (
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  )
  WITH CHECK (true);

-- ─── Fix: member_profiles — trainer can read ─────────────
DROP POLICY IF EXISTS "member_own_profile" ON member_profiles;
DROP POLICY IF EXISTS "trainer_see_profiles" ON member_profiles;
CREATE POLICY "profiles_read" ON member_profiles
  FOR SELECT USING (
    user_id = auth.uid()
    OR user_id IN (SELECT id FROM users WHERE gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
    OR user_id IN (SELECT id FROM users WHERE gym_id = (SELECT gym_id FROM users WHERE id = auth.uid()))
  );
CREATE POLICY "profiles_write" ON member_profiles
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── Fix: fitness_plans — trainer can create for members ─
DROP POLICY IF EXISTS "member_own_plans" ON fitness_plans;
DROP POLICY IF EXISTS "trainer_see_plans" ON fitness_plans;
DROP POLICY IF EXISTS "trainer_update_plans" ON fitness_plans;
CREATE POLICY "plans_all" ON fitness_plans
  FOR ALL USING (
    member_id = auth.uid()
    OR member_id IN (SELECT id FROM users WHERE gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
    OR member_id IN (SELECT id FROM users WHERE gym_id = (SELECT gym_id FROM users WHERE id = auth.uid()))
  )
  WITH CHECK (
    member_id = auth.uid()
    OR member_id IN (SELECT id FROM users WHERE gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
    OR member_id IN (SELECT id FROM users WHERE gym_id = (SELECT gym_id FROM users WHERE id = auth.uid()))
  );

-- ─── Gym Owner: create new user function ─────────────────
-- Bu funksiya gym owner yoki trener tomonidan chaqiriladi
-- Yangi user yaratib, gymga qo'shadi
CREATE OR REPLACE FUNCTION create_gym_member(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_gym_id UUID,
  p_role TEXT DEFAULT 'member'
) RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name, 'role', p_role),
    now(),
    now()
  ) RETURNING id INTO new_user_id;

  -- Update public.users with gym_id (trigger creates the row)
  UPDATE users SET gym_id = p_gym_id, role = p_role WHERE id = new_user_id;

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
