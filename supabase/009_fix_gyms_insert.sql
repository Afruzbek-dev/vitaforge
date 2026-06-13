-- Fix: Gym yaratish RLS
-- Supabase SQL Editor da run qiling

DROP POLICY IF EXISTS "gyms_insert" ON gyms;
CREATE POLICY "gyms_insert" ON gyms FOR INSERT TO authenticated WITH CHECK (true);

-- Agar FORCE RLS gyms ga qo'yilgan bo'lsa — olib tashlash
ALTER TABLE gyms NO FORCE ROW LEVEL SECURITY;
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
