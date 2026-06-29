# ZenFit — AI-Powered Gym Management SaaS

Telegram Mini App orqali ishlaydigan gym boshqaruv platformasi. O'zbekiston sport zallari uchun maxsus ishlab chiqilgan.

## 🚀 Quick Start

```bash
cd apps/web
npm install
npm run dev
```

Ochiladi: http://localhost:3000

## ⚙️ Supabase Setup

1. [supabase.com](https://supabase.com) → Yangi loyiha yarating
2. SQL Editor → quyidagi migratsiyalarni ketma-ket bajaring:
   ```
   supabase/setup.sql
   supabase/020_saas_upgrade.sql
   supabase/021_nutrition_tables.sql
   ```
3. Storage → `receipts` bucket yarating (public)
4. Storage → `avatars` bucket yarating (public)
5. `apps/web/.env.local` faylni yarating:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_MODE=true
NEXT_PUBLIC_DEMO_MODE=false

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your-bot-token
NEXT_PUBLIC_WEBAPP_URL=https://your-app.vercel.app
```

6. `npm run dev`

## 🤖 Telegram Mini App

1. [@BotFather](https://t.me/BotFather) → `/newbot` → Bot yarating
2. Bot token'ni `.env.local` ga qo'shing
3. Deploy qilingan URL'ni Bot's Menu Button sifatida sozlang
4. Bot buyruqlarini faollashtirish: `https://your-app.vercel.app/api/telegram` sahifasini oching

### Bot buyruqlari
| Buyruq | Tavsif |
|--------|--------|
| `/start` | Botni ishga tushirish |
| `/plan` | Bugungi mashq rejasi |
| `/food` | Ovqat kaloriyasi |
| `/profile` | Profil ma'lumotlari |
| `/help` | Yordam |

## 📁 Loyiha Strukturasi

```
vitaforge/
├── apps/
│   └── web/                    ← Next.js 15 Frontend
│       ├── app/
│       │   ├── (app)/          ← Autentifikatsiyadan keyin
│       │   │   ├── dashboard/  ← Member panel
│       │   │   │   ├── food/       ← Kaloriya tracker
│       │   │   │   ├── plan/       ← Mashq rejasi
│       │   │   │   ├── profile/    ← Profil & sozlamalar
│       │   │   │   ├── chat/       ← AI chat
│       │   │   │   └── ...
│       │   │   ├── gym/        ← Gym Owner / Admin / Trainer panel
│       │   │   │   ├── members/    ← A'zolar boshqaruvi
│       │   │   │   ├── trainers/   ← Trenerlar boshqaruvi
│       │   │   │   ├── payments/   ← To'lovlar tizimi
│       │   │   │   ├── retention/  ← Churn & Retention analitika
│       │   │   │   ├── analytics/  ← Umumiy analitika
│       │   │   │   ├── attendance/ ← Davomat
│       │   │   │   └── ...
│       │   │   └── layout.tsx  ← Auth guard + Navigation
│       │   ├── (auth)/         ← Login/Register
│       │   ├── api/            ← API routes
│       │   └── page.tsx        ← Landing page
│       ├── components/
│       │   ├── ui/             ← Shared UI components
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── input.tsx
│       │   │   ├── label.tsx
│       │   │   ├── toast.tsx
│       │   │   ├── modal.tsx
│       │   │   ├── confirm-dialog.tsx
│       │   │   ├── bottom-sheet.tsx
│       │   │   ├── skeleton.tsx
│       │   │   ├── empty-state.tsx
│       │   │   ├── badge.tsx
│       │   │   └── tabs.tsx
│       │   └── shared/         ← Layout components
│       ├── lib/
│       │   ├── store/          ← Zustand stores
│       │   ├── types.ts        ← TypeScript type definitions
│       │   ├── supabase.ts     ← Supabase client
│       │   ├── supabase-api.ts ← Supabase data layer
│       │   ├── auth.ts         ← Auth helpers
│       │   ├── telegram.ts     ← Telegram SDK helpers
│       │   └── gamification.ts ← Points & badges
│       └── tailwind.config.ts
├── supabase/
│   ├── setup.sql               ← Asosiy jadvallar
│   ├── 020_saas_upgrade.sql    ← SaaS kengaytirish
│   ├── 021_nutrition_tables.sql← Ovqat tracker jadvallari
│   └── seed.sql                ← Seed data
└── docker-compose.yml
```

## 🎨 Design System

| Token | Qiymat |
|-------|--------|
| Background | `#0F0F14` |
| Surface | `#1A1A24` |
| Surface2 | `#22222F` |
| Border | `#2D2D3D` |
| Primary/Accent | `#6366F1` (Indigo) |
| Success | `#10B981` (Emerald) |
| Warning | `#F59E0B` (Amber) |
| Danger | `#EF4444` (Red) |
| Text Primary | `#F9FAFB` |
| Text Secondary | `#9CA3AF` |
| Font | Inter (Google Fonts) |
| Radius (buttons) | 12px |
| Radius (cards) | 16px |

## 🔧 Tech Stack

| Qatlam | Texnologiya |
|--------|-------------|
| Frontend | Next.js 15, React 18, TypeScript |
| Styling | TailwindCSS, CSS Custom Properties |
| State | Zustand + localStorage |
| Data Fetching | TanStack Query (React Query) |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Realtime | Supabase Realtime (to'lov statuslari) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Telegram | Mini App SDK + Bot API |
| Deploy | Vercel |

## 👥 Rollar

| Rol | Panel | Imkoniyatlar |
|-----|-------|-------------|
| **Admin** | `/gym` | Barcha gymlarni boshqarish, tizim analitikasi |
| **Gym Owner** | `/gym` | A'zolar, trenerlar, to'lovlar, retention |
| **Trainer** | `/gym` | O'z klientlari, mashqlar, to'lov so'rash |
| **Member** | `/dashboard` | Mashq rejasi, ovqat tracker, profil |

## 📱 Telegram Mini App

Foydalanuvchi Telegram bot orqali Mini App-ni ochganda:
1. `telegram_id` orqali avtomatik autentifikatsiya
2. Yangi foydalanuvchi → Onboarding (ism, telefon, rol)
3. Qaytgan foydalanuvchi → To'g'ridan-to'g'ri dashboard

## 💳 To'lovlar Oqimi

```
Gym Owner → "To'lov so'rash" → pending
Member → "To'ladim" + chek yuklash → submitted
Gym Owner → "Tasdiqlash" yoki "Rad etish" → confirmed/rejected
Tizim → muddati o'tgan → overdue
```

## 📊 Churn & Retention

- **Churn Rate**: oxirgi 30 kunda tashrif buyurmagan a'zolar %
- **Risk Levels**: Active → Recovering → At Risk → Critical → Lost
- **Win-Back**: Yo'qotilgan a'zolarni qaytarish kampaniyasi
- **Revenue at Risk**: Xavf ostidagi a'zolar to'lovlari

## 🍎 Kaloriya Tracker

- Kunlik ko'rinish: Nonushta / Tushlik / Kechki ovqat / Gazak
- Ovqat qidirish (O'zbek taomlari bazasi)
- Maxsus ovqat qo'shish
- Kaloriya halqasi (maqsad vs iste'mol)
- Makro nutrientlar (Protein / Karbohidrat / Yog')
- 7 kunlik tarix

## 📄 License

MIT
