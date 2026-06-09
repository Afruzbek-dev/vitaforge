-- ═══ ZenFit — Retention Engine Schema ═══

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id),
  referred_id UUID REFERENCES users(id),
  gym_id UUID REFERENCES gyms(id),
  status VARCHAR(20) DEFAULT 'pending',
  referrer_bonus INTEGER DEFAULT 500,
  referred_bonus INTEGER DEFAULT 300,
  created_at TIMESTAMPTZ DEFAULT now(),
  rewarded_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'individual',
  metric VARCHAR(50) DEFAULT 'points',
  target_value INTEGER,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  prize_desc TEXT,
  bonus_points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  member_id UUID REFERENCES users(id),
  current_value INTEGER DEFAULT 0,
  rank INTEGER,
  joined_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(challenge_id, member_id)
);

CREATE TABLE IF NOT EXISTS feed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50),
  data JSONB DEFAULT '{}',
  reactions JSONB DEFAULT '{"fire":0,"clap":0,"fist":0}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_own" ON referrals FOR ALL USING (referrer_id = auth.uid() OR referred_id = auth.uid());
CREATE POLICY "challenges_gym" ON challenges FOR ALL USING (gym_id IN (SELECT gym_id FROM users WHERE id = auth.uid()));
CREATE POLICY "challenge_parts" ON challenge_participants FOR ALL USING (member_id = auth.uid() OR challenge_id IN (SELECT id FROM challenges WHERE gym_id IN (SELECT gym_id FROM users WHERE id = auth.uid())));
CREATE POLICY "feed_gym" ON feed_events FOR ALL USING (gym_id IN (SELECT gym_id FROM users WHERE id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_challenges_gym ON challenges(gym_id, is_active);
CREATE INDEX IF NOT EXISTS idx_feed_gym ON feed_events(gym_id, created_at DESC);
