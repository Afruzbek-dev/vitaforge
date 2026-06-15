-- Fix: invitation qabul qiluvchi ham ko'ra olsin
-- Supabase SQL Editor da run qiling

DROP POLICY IF EXISTS "invitations_select" ON invitations;
DROP POLICY IF EXISTS "invitations_insert" ON invitations;

CREATE POLICY "invitations_select" ON invitations FOR SELECT USING (
  invited_by = auth.uid()
  OR email = auth.uid()::text
);
CREATE POLICY "invitations_insert" ON invitations FOR INSERT WITH CHECK (invited_by = auth.uid());
CREATE POLICY "invitations_update" ON invitations FOR UPDATE USING (
  email = auth.uid()::text
  OR invited_by = auth.uid()
) WITH CHECK (true);
