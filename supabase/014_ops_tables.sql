-- ═══ ZenFit v3.0 — Operations Module ═══

CREATE TABLE IF NOT EXISTS import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  source_system TEXT DEFAULT 'csv',
  filename TEXT,
  status TEXT DEFAULT 'pending', -- pending|processing|done|failed
  total_rows INTEGER DEFAULT 0,
  imported_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]',
  column_mapping JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'UZS',
  member_id UUID REFERENCES users(id),
  description TEXT,
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash','card','click','payme','bank_transfer')),
  recorded_by UUID REFERENCES users(id),
  occurred_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'equipment',
  quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
  unit TEXT DEFAULT 'dona',
  purchase_price NUMERIC(12,2),
  notes TEXT,
  condition TEXT DEFAULT 'good' CHECK (condition IN ('good','fair','poor','broken')),
  low_stock_threshold INTEGER DEFAULT 5,
  added_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN DROP POLICY IF EXISTS "ops_import" ON import_jobs; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "ops_finance" ON finance_transactions; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "ops_inventory" ON inventory_items; EXCEPTION WHEN undefined_table THEN NULL; END $$;

CREATE POLICY "ops_import" ON import_jobs FOR ALL USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())) WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));
CREATE POLICY "ops_finance" ON finance_transactions FOR ALL USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())) WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));
CREATE POLICY "ops_inventory" ON inventory_items FOR ALL USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())) WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_finance_gym ON finance_transactions(gym_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_gym ON inventory_items(gym_id);
