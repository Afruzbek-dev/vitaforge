-- Fix food_logs RLS — Supabase SQL Editor da run qiling
DROP POLICY IF EXISTS "food_all" ON food_logs;
DROP POLICY IF EXISTS "food_select" ON food_logs;
DROP POLICY IF EXISTS "food_insert" ON food_logs;
DROP POLICY IF EXISTS "food_delete" ON food_logs;
DROP POLICY IF EXISTS "member_own_food" ON food_logs;
CREATE POLICY "food_all" ON food_logs FOR ALL TO authenticated USING (member_id = auth.uid()) WITH CHECK (member_id = auth.uid());
