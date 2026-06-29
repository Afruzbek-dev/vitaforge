-- ═══ ZenFit SaaS Nutrition Tracking Upgrade ═══

-- Create nutrition_logs table if not exists
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name TEXT NOT NULL,
  calories NUMERIC DEFAULT 0,
  protein NUMERIC DEFAULT 0,
  carbs NUMERIC DEFAULT 0,
  fat NUMERIC DEFAULT 0,
  portion_grams NUMERIC DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create foods table if not exists
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  calories_per_100g NUMERIC DEFAULT 0,
  protein NUMERIC DEFAULT 0,
  carbs NUMERIC DEFAULT 0,
  fat NUMERIC DEFAULT 0,
  is_custom BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own logs" ON nutrition_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view all foods" ON foods FOR SELECT USING (true);
CREATE POLICY "Users can insert own foods" ON foods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own foods" ON foods FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_foods_search ON foods(name);

-- Seed common foods
INSERT INTO foods (name, calories_per_100g, protein, carbs, fat, is_custom) VALUES
('Tuxum (qaynatilgan)', 155, 13, 1.1, 11, false),
('Guruch (pishirilgan)', 130, 2.7, 28, 0.3, false),
('Tovuq ko''krak', 165, 31, 0, 3.6, false),
('Non (oq)', 265, 9, 49, 3.2, false),
('Osh (palov)', 220, 8, 30, 8, false),
('Sabzavotli salat', 45, 2, 8, 0.5, false),
('Sut (1 stakan)', 60, 3.2, 4.7, 3.2, false),
('Banan', 89, 1.1, 23, 0.3, false),
('Olma', 52, 0.3, 14, 0.2, false),
('Yogurt', 59, 10, 3.6, 0.4, false)
ON CONFLICT DO NOTHING;
