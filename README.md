# VitaForge AI

O'zbekiston gym lari uchun AI fitness platform.

## Quick Start (Demo — 30 sekund)

```bash
cd apps/web
npm install
npm run dev
```

Ochiladi: http://localhost:3000  
Login: tugmalarni bosing (demo rejim)

## Supabase ga ulash

1. [supabase.com](https://supabase.com) → New Project
2. SQL Editor → `supabase/migrations/001_initial_schema.sql` run
3. SQL Editor → `supabase/migrations/002_rls_policies.sql` run
4. SQL Editor → `supabase/seed.sql` run
5. Storage → `progress-photos` bucket (private) yarating
6. `apps/web/.env.local` faylni yangilang:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_MODE=true
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

7. `npm run dev`

## Texnologiyalar

| Qatlam | Stack |
|--------|-------|
| Frontend | Next.js 15, TypeScript, Tailwind, TanStack Query, Zustand |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| AI | Claude Sonnet (plan) + Haiku (chat, food parse) |
| Cache | Upstash Redis |
| Deploy | Vercel (web) + Railway (API) |

## Papka strukturasi

```
vitaforge/
├── apps/
│   ├── api/          ← FastAPI backend
│   └── web/          ← Next.js frontend
├── packages/
│   ├── types/        ← Shared TypeScript types
│   └── utils/        ← Shared utilities
├── supabase/
│   ├── migrations/   ← SQL schema + RLS
│   └── seed.sql      ← Uzbek food database
└── docker-compose.yml
```

## Design System

- Background: `#07070a`
- Cards: `#13131c`
- Accent: `#e8ff47`
- Fonts: Syne (headings), DM Sans (body), JetBrains Mono (labels)
- Dark-first, minimal, professional
