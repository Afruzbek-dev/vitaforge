-- ═══ ZenFit — BARCHA RLS INSERT FIX + NULL FIX ═══
-- Supabase SQL Editor da run qiling
-- Bu barcha jadvallar uchun INSERT ni to'g'rilaydi

-- ─── 1. Eski NULL gym_id larni tuzatish ──────────────────
UPDATE groups SET gym_id = (SELECT gym_id FROM users WHERE id = groups.created_by) WHERE gym_id IS NULL AND created_by IS NOT NULL;
UPDATE invitations SET gym_id = (SELECT gym_id FROM users WHERE id = invitations.invited_by) WHERE gym_id IS NULL AND invited_by IS NOT NULL;

-- ─── 2. USERS — owner o'zini va gym a'zolarini ko'ra olishi ──
DROP POLICY IF EXISTS "users_read" ON users;
DROP POLICY IF EXISTS "users_update_self" ON users;
DROP POLICY IF EXISTS "owner_update_members" ON users;
DROP POLICY IF EXISTS "users_self" ON users;
DROP POLICY IF EXISTS "owner_see_members" ON users;
DROP POLICY IF EXISTS "trainer_see_gym_members" ON users;
DROP POLICY IF EXISTS "admin_all_users" ON users;

CREATE POLICY "users_select" ON users FOR SELECT USING (true); -- hamma o'qiy oladi (RLS faqat yozish uchun)
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "users_update" ON users FOR UPDATE USING (
  id = auth.uid()
  OR gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
) WITH CHECK (true);

-- ─── 3. MEMBER_PROFILES ─────────────────────────────────
DROP POLICY IF EXISTS "member_own_profile" ON member_profiles;
DROP POLICY IF EXISTS "profiles_read" ON member_profiles;
DROP POLICY IF EXISTS "profiles_write" ON member_profiles;
DROP POLICY IF EXISTS "trainer_see_profiles" ON member_profiles;

CREATE POLICY "profiles_select" ON member_profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON member_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_update" ON member_profiles FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── 4. FOOD_LOGS ───────────────────────────────────────
DROP POLICY IF EXISTS "member_own_food" ON food_logs;

CREATE POLICY "food_select" ON food_logs FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "food_insert" ON food_logs FOR INSERT WITH CHECK (member_id = auth.uid());
CREATE POLICY "food_delete" ON food_logs FOR DELETE USING (member_id = auth.uid());

-- ─── 5. FITNESS_PLANS ───────────────────────────────────
DROP POLICY IF EXISTS "member_own_plans" ON fitness_plans;
DROP POLICY IF EXISTS "plans_all" ON fitness_plans;
DROP POLICY IF EXISTS "trainer_see_plans" ON fitness_plans;
DROP POLICY IF EXISTS "trainer_update_plans" ON fitness_plans;

CREATE POLICY "plans_select" ON fitness_plans FOR SELECT USING (
  member_id = auth.uid()
  OR member_id IN (SELECT id FROM users WHERE gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
  OR member_id IN (SELECT id FROM users WHERE gym_id = (SELECT gym_id FROM users WHERE id = auth.uid()))
);
CREATE POLICY "plans_insert" ON fitness_plans FOR INSERT WITH CHECK (
  member_id = auth.uid()
  OR member_id IN (SELECT id FROM users WHERE gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
);
CREATE POLICY "plans_update" ON fitness_plans FOR UPDATE USING (
  member_id = auth.uid()
  OR member_id IN (SELECT id FROM users WHERE gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
) WITH CHECK (true);

-- ─── 6. PROGRESS_PHOTOS ─────────────────────────────────
DROP POLICY IF EXISTS "member_own_photos" ON progress_photos;
DROP POLICY IF EXISTS "trainer_see_photos" ON progress_photos;

CREATE POLICY "photos_select" ON progress_photos FOR SELECT USING (
  member_id = auth.uid()
  OR member_id IN (SELECT id FROM users WHERE gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
);
CREATE POLICY "photos_insert" ON progress_photos FOR INSERT WITH CHECK (member_id = auth.uid());

-- ─── 7. MEMBER_STREAKS ──────────────────────────────────
DROP POLICY IF EXISTS "member_own_streak" ON member_streaks;
DROP POLICY IF EXISTS "gym_see_streaks" ON member_streaks;

CREATE POLICY "streaks_select" ON member_streaks FOR SELECT USING (true); -- leaderboard uchun
CREATE POLICY "streaks_insert" ON member_streaks FOR INSERT WITH CHECK (member_id = auth.uid());
CREATE POLICY "streaks_update" ON member_streaks FOR UPDATE USING (member_id = auth.uid()) WITH CHECK (member_id = auth.uid());

-- ─── 8. ATTENDANCE ──────────────────────────────────────
DROP POLICY IF EXISTS "member_own_attendance" ON attendance;
DROP POLICY IF EXISTS "gym_see_attendance" ON attendance;
DROP POLICY IF EXISTS "attendance_all" ON attendance;

CREATE POLICY "attendance_select" ON attendance FOR SELECT USING (
  member_id = auth.uid()
  OR gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  OR gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "attendance_insert" ON attendance FOR INSERT WITH CHECK (
  member_id = auth.uid()
  OR gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
);

-- ─── 9. CHAT_MESSAGES ───────────────────────────────────
DROP POLICY IF EXISTS "member_own_chat" ON chat_messages;

CREATE POLICY "chat_select" ON chat_messages FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "chat_insert" ON chat_messages FOR INSERT WITH CHECK (member_id = auth.uid());

-- ─── 10. NOTIFICATIONS ──────────────────────────────────
DROP POLICY IF EXISTS "user_own_notifs" ON notifications;
DROP POLICY IF EXISTS "user_own_notifications" ON notifications;

CREATE POLICY "notif_select" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notif_insert" ON notifications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "notif_update" ON notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (true);

-- ─── 11. GROUPS ─────────────────────────────────────────
DROP POLICY IF EXISTS "owner_groups" ON groups;
DROP POLICY IF EXISTS "owner_manage_groups" ON groups;

CREATE POLICY "groups_select" ON groups FOR SELECT USING (
  gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  OR created_by = auth.uid()
  OR gym_id = (SELECT gym_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "groups_insert" ON groups FOR INSERT WITH CHECK (
  created_by = auth.uid()
);
CREATE POLICY "groups_update" ON groups FOR UPDATE USING (
  created_by = auth.uid()
  OR gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
) WITH CHECK (true);

-- ─── 12. GROUP_MEMBERS ──────────────────────────────────
DROP POLICY IF EXISTS "manage_group_members" ON group_members;
DROP POLICY IF EXISTS "member_groups" ON group_members;
DROP POLICY IF EXISTS "owner_group_members" ON group_members;
DROP POLICY IF EXISTS "see_own_groups" ON group_members;

CREATE POLICY "gm_select" ON group_members FOR SELECT USING (
  member_id = auth.uid()
  OR group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  OR group_id IN (SELECT id FROM groups WHERE gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
);
CREATE POLICY "gm_insert" ON group_members FOR INSERT WITH CHECK (
  group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  OR group_id IN (SELECT id FROM groups WHERE gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
);
CREATE POLICY "gm_delete" ON group_members FOR DELETE USING (
  group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  OR group_id IN (SELECT id FROM groups WHERE gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
);

-- ─── 13. INVITATIONS ────────────────────────────────────
DROP POLICY IF EXISTS "manage_invitations" ON invitations;
DROP POLICY IF EXISTS "owner_invitations" ON invitations;
DROP POLICY IF EXISTS "owner_manage_invitations" ON invitations;

CREATE POLICY "invitations_select" ON invitations FOR SELECT USING (
  invited_by = auth.uid()
  OR gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
);
CREATE POLICY "invitations_insert" ON invitations FOR INSERT WITH CHECK (invited_by = auth.uid());

-- ─── 14. GYMS ───────────────────────────────────────────
DROP POLICY IF EXISTS "gyms_policy" ON gyms;
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gyms_select" ON gyms FOR SELECT USING (true); -- hamma gym larni ko'ra oladi
CREATE POLICY "gyms_insert" ON gyms FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "gyms_update" ON gyms FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (true);

-- ─── 15. UZBEK_FOODS (hamma o'qiy oladi) ────────────────
DROP POLICY IF EXISTS "public_read_uzbek_foods" ON uzbek_foods;
CREATE POLICY "uzbek_foods_read" ON uzbek_foods FOR SELECT USING (true);

-- ─── 16. PLAN_INSTRUCTIONS ──────────────────────────────
DROP POLICY IF EXISTS "plan_instructions_read" ON plan_instructions;
DROP POLICY IF EXISTS "plan_instructions_write" ON plan_instructions;

CREATE POLICY "pi_select" ON plan_instructions FOR SELECT USING (
  plan_id IN (SELECT id FROM fitness_plans WHERE member_id = auth.uid())
  OR created_by = auth.uid()
);
CREATE POLICY "pi_insert" ON plan_instructions FOR INSERT WITH CHECK (created_by = auth.uid());

-- ─── 17. CHALLENGES ─────────────────────────────────────
DROP POLICY IF EXISTS "challenges_gym" ON challenges;

CREATE POLICY "challenges_select" ON challenges FOR SELECT USING (
  gym_id IN (SELECT gym_id FROM users WHERE id = auth.uid())
  OR created_by = auth.uid()
);
CREATE POLICY "challenges_insert" ON challenges FOR INSERT WITH CHECK (created_by = auth.uid());

-- ─── 18. CHALLENGE_PARTICIPANTS ─────────────────────────
DROP POLICY IF EXISTS "challenge_parts" ON challenge_participants;

CREATE POLICY "cp_select" ON challenge_participants FOR SELECT USING (
  member_id = auth.uid()
  OR challenge_id IN (SELECT id FROM challenges WHERE created_by = auth.uid())
);
CREATE POLICY "cp_insert" ON challenge_participants FOR INSERT WITH CHECK (member_id = auth.uid());
CREATE POLICY "cp_update" ON challenge_participants FOR UPDATE USING (member_id = auth.uid()) WITH CHECK (true);

-- ─── 19. REFERRALS ──────────────────────────────────────
DROP POLICY IF EXISTS "referrals_own" ON referrals;

CREATE POLICY "referrals_select" ON referrals FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());
CREATE POLICY "referrals_insert" ON referrals FOR INSERT WITH CHECK (true); -- API orqali yaratiladi

-- ─── 20. FEED_EVENTS ────────────────────────────────────
DROP POLICY IF EXISTS "feed_gym" ON feed_events;

CREATE POLICY "feed_select" ON feed_events FOR SELECT USING (
  gym_id IN (SELECT gym_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "feed_insert" ON feed_events FOR INSERT WITH CHECK (user_id = auth.uid());

-- ─── 21. TELEGRAM_SESSIONS ──────────────────────────────
DROP POLICY IF EXISTS "telegram_own" ON telegram_sessions;

CREATE POLICY "tg_select" ON telegram_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "tg_insert" ON telegram_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "tg_update" ON telegram_sessions FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (true);

-- ─── 22. TRAINER_ASSIGNMENTS ────────────────────────────
DROP POLICY IF EXISTS "trainer_assignments_read" ON trainer_assignments;
DROP POLICY IF EXISTS "trainer_assignments_manage" ON trainer_assignments;

CREATE POLICY "ta_select" ON trainer_assignments FOR SELECT USING (
  trainer_id = auth.uid() OR member_id = auth.uid()
  OR gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
);
CREATE POLICY "ta_insert" ON trainer_assignments FOR INSERT WITH CHECK (
  gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
);
