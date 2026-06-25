-- ZenFit Admin user yaratish
-- Login: admin@zenfit.uz / ZenFit2025!

-- 1. Auth user yaratish (Supabase Dashboard > Authentication > Users > Add User)
-- Email: admin@zenfit.uz
-- Password: ZenFit2025!

-- 2. Keyin users jadvalida rolni o'zgartirish:
-- (auth user yaratilgandan keyin uid ni qo'ying)
-- INSERT INTO users (id, full_name, phone, role) 
-- VALUES ('<auth-uid>', 'ZenFit Admin', '+998900000000', 'admin');

-- Agar users jadvalida admin role yo'q bo'lsa:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
  ) THEN
    -- skip
    NULL;
  ELSE
    ALTER TABLE users DROP CONSTRAINT users_role_check;
  END IF;
END $$;

-- Role check'ni yangilash (admin qo'shish)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('member', 'gym_owner', 'trainer', 'admin'));
