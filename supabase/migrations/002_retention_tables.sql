-- VitaForge — Retention & CRM jadvallar

CREATE TABLE IF NOT EXISTS referrals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID REFERENCES users(id),
  referred_id   UUID REFERENCES users(id),
  gym_id        UUID REFERENCES gyms(id),
  status        VARCHAR(20) DEFAULT 'pending',
  referrer_bonus INTEGER DEFAULT 500,
  referred_bonus INTEGER DEFAULT 300,
  created_at    TIMESTAMPTZ DEFAULT now(),
  rewarded_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS challenges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id        UUID REFERENCES gyms(id),
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  type          VARCHAR(50) DEFAULT 'individual',
  metric        VARCHAR(50) DEFAULT 'points',
  target_value  INTEGER DEFAULT 100,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  prize_desc    TEXT,
  bonus_points  INTEGER DEFAULT 500,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS challenge_participants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id  UUID REFERENCES challenges(id),
  member_id     UUID REFERENCES users(id),
  current_value INTEGER DEFAULT 0,
  rank          INTEGER,
  joined_at     TIMESTAMPTZ DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  UNIQUE(challenge_id, member_id)
);

CREATE TABLE IF NOT EXISTS feed_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id     UUID REFERENCES gyms(id),
  user_id    UUID REFERENCES users(id),
  type       VARCHAR(50),
  data       JSONB DEFAULT '{}',
  reactions  JSONB DEFAULT '{"fist":0,"fire":0,"clap":0}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_prefs (
  user_id          UUID PRIMARY KEY REFERENCES users(id),
  streak_reminder  BOOLEAN DEFAULT true,
  weekly_plan      BOOLEAN DEFAULT true,
  challenge_update BOOLEAN DEFAULT true,
  weekly_report    BOOLEAN DEFAULT true,
  churn_alert      BOOLEAN DEFAULT true,
  friend_joined    BOOLEAN DEFAULT true,
  updated_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_challenges_gym ON challenges(gym_id, is_active);
CREATE INDEX IF NOT EXISTS idx_feed_gym ON feed_events(gym_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
