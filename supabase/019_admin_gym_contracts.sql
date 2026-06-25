-- ZenFit Admin: gym_status + contracts

-- 1. Gyms jadvaliga status ustuni
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS capacity int;

-- 2. Kontraktlar jadvali (admin <-> gym o'rtasida)
CREATE TABLE IF NOT EXISTS contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE NOT NULL,
  plan text NOT NULL DEFAULT 'standard' CHECK (plan IN ('starter', 'standard', 'premium')),
  price_monthly bigint NOT NULL DEFAULT 0,
  starts_at date NOT NULL DEFAULT CURRENT_DATE,
  ends_at date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access contracts" ON contracts FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_contracts_gym ON contracts(gym_id);

-- 3. Gym payments (user -> gym to'lovi, gym owner tasdiqlaydi)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gym_id uuid REFERENCES gyms(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id uuid;
