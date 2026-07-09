-- Migration: Interventions and Gamification updates
-- Description: Adds tables for Gym Owner CRM actions and updates profiles for churn scoring

-- 1. Interventions Table (Tracks SMS, discounts, calls sent to at-risk members)
CREATE TABLE IF NOT EXISTS public.interventions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- e.g., 'sms_sent', 'call_made', 'discount_offered'
    description TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast queries by gym and member
CREATE INDEX IF NOT EXISTS idx_interventions_gym ON public.interventions(gym_id);
CREATE INDEX IF NOT EXISTS idx_interventions_member ON public.interventions(member_id);

-- 2. Add risk columns to member_profiles if they don't exist
ALTER TABLE public.member_profiles 
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'Low';

-- 3. Analytics & Challenges dummy tables (for the new GymService queries)
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    total_days INTEGER NOT NULL DEFAULT 30,
    days_passed INTEGER NOT NULL DEFAULT 0,
    participants INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Owner can read and write interventions for their gym
CREATE POLICY "Owners can manage interventions" ON public.interventions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.gym_id = interventions.gym_id 
      AND (users.role = 'gym_owner' OR users.role = 'admin')
    )
  );

-- Owner can manage challenges
CREATE POLICY "Owners can manage challenges" ON public.challenges
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.gym_id = challenges.gym_id 
      AND (users.role = 'gym_owner' OR users.role = 'admin')
    )
  );
