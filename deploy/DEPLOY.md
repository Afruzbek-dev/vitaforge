# VitaForge — To'liq Deploy Qo'llanma

## Kerakli akkauntlar
- [ ] GitHub (kod repo)
- [ ] Supabase (DB + Auth + Storage)
- [ ] Railway (FastAPI backend)
- [ ] Vercel (Next.js frontend)
- [ ] Upstash (Redis)
- [ ] Cloudflare (DNS + CDN)
- [ ] Anthropic (Claude API key)

---

## 1. SUPABASE SOZLASH

### 1.1 Project yaratish
1. supabase.com → "New project"
2. Name: `vitaforge-prod`
3. DB password: kuchli parol (saqlang!)
4. Region: `ap-southeast-1` (Singapore — O'zbekistonga eng yaqin)

### 1.2 Schema deploy
```sql
-- SQL Editor ga nusxalang:
-- supabase/migrations/001_initial_schema.sql ni to'liq paste qiling
-- keyin Run tugmasi
```

### 1.3 Seed (Uzbek food DB)
```sql
-- supabase/seed.sql ni paste qiling → Run
```

### 1.4 Storage bucket
```
Storage → New bucket
  Name: progress-photos
  Public: OFF (private)
  File size limit: 10MB
  Allowed MIME types: image/jpeg, image/png, image/webp
```

### 1.5 Auth sozlamalari
```
Authentication → Settings:
  Site URL: https://app.vitaforge.uz
  Redirect URLs: https://app.vitaforge.uz/**, http://localhost:3000/**
```

### 1.6 API Keys olish
```
Settings → API:
  Project URL    → SUPABASE_URL
  anon key       → SUPABASE_ANON_KEY  
  service_role   → SUPABASE_SERVICE_KEY (maxfiy!)
  
Settings → Database:
  Connection string (URI) → DATABASE_URL
  URI ni asyncpg uchun: postgresql+asyncpg://...
```

---

## 2. UPSTASH REDIS

1. console.upstash.com → "Create Database"
2. Name: `vitaforge-redis`
3. Region: `ap-southeast-1`
4. TLS: ON
5. **Redis URL** → `REDIS_URL` (rediss://... format)

---

## 3. RAILWAY — BACKEND

### 3.1 Project yaratish
1. railway.app → "New Project"
2. "Deploy from GitHub repo" → vitaforge repo tanlang
3. Service name: `vitaforge-api`
4. Root directory: `apps/api`

### 3.2 Environment variables
Railway → vitaforge-api → Variables:
```
APP_ENV=production
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
DATABASE_URL=postgresql+asyncpg://postgres:PASS@db.xxx.supabase.co:5432/postgres
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=rediss://default:TOKEN@HOST.upstash.io:6379
ALLOWED_ORIGINS=["https://vitaforge.uz","https://app.vitaforge.uz"]
BASE_URL=https://api.vitaforge.uz
JWT_SECRET=RANDOM_32_CHAR_STRING
```

### 3.3 Start command
Railway → Settings → Deploy:
```
Build command:  pip install -r requirements.txt
Start command:  uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2
```

### 3.4 ARQ Worker (background jobs)
Railway → "Add Service" → same repo:
- Service name: `vitaforge-worker`  
- Root directory: `apps/api`
- Start command: `python -m arq workers.worker.WorkerSettings`
- Same env variables

### 3.5 Custom domain
Railway → vitaforge-api → Settings → Domains:
```
Add domain: api.vitaforge.uz
```
Cloudflare DNS ga qo'shing (keyingi qadamda)

### 3.6 Health check
```
Settings → Health Check Path: /health
```

---

## 4. VERCEL — FRONTEND

### 4.1 Import
1. vercel.com → "Add New Project"
2. GitHub repo → import
3. Root directory: `apps/web`
4. Framework: Next.js (auto-detect)

### 4.2 Environment variables
Vercel → Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://api.vitaforge.uz/v1
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_ENV=production
```

### 4.3 Custom domains
Vercel → Domains:
```
vitaforge.uz        → Landing (root)
app.vitaforge.uz    → Web App
```

---

## 5. CLOUDFLARE DNS

vitaforge.uz domenini Cloudflare ga qo'shing:
```
Type  Name    Content                    Proxy
A     @       Vercel IP (76.76.21.21)   ✅ Proxied
A     app     Vercel IP (76.76.21.21)   ✅ Proxied
CNAME api     RAILWAY_DOMAIN.up.railway.app  ✅ Proxied
```

SSL/TLS → Full (strict)

---

## 6. TELEGRAM BOT DEPLOY

### Railway da
1. "Add Service" → same repo
2. Root directory: `apps/telegram`
3. Start command: `python bot.py`
4. Variables:
```
TELEGRAM_BOT_TOKEN=TOKEN_FROM_BOTFATHER
VITAFORGE_API_URL=https://api.vitaforge.uz/v1
MINI_APP_URL=https://app.vitaforge.uz
BOT_SECRET=RANDOM_SECRET
```

### BotFather da
```
/setmenubutton → @VitaForgeBot → 
  Button text: 🏋️ VitaForge
  URL: https://app.vitaforge.uz

/setdomain → @VitaForgeBot → vitaforge.uz
```

---

## 7. PRODUCTION CHECKLIST

### Backend
- [ ] `APP_ENV=production`
- [ ] HTTPS barcha URL larda
- [ ] CORS `allowed_origins` to'g'ri
- [ ] `JWT_SECRET` kuchli (32+ char random)
- [ ] Supabase RLS policies yoqilgan
- [ ] Railway health check `/health` ishlaydi
- [ ] Worker service ishga tushgan

### Frontend
- [ ] `NEXT_PUBLIC_API_URL` production URL
- [ ] Vercel custom domain SSL
- [ ] `next.config.ts` `images.remotePatterns` to'g'ri

### Supabase
- [ ] RLS barcha tablarda yoqilgan
- [ ] Storage bucket private
- [ ] Seed ma'lumotlari kiritilgan

### Monitoring
- [ ] Sentry o'rnatilgan (ixtiyoriy, birinchi oyda emas)
- [ ] Railway logs kuzatilmoqda
- [ ] Upstash Redis quota kuzatilmoqda

---

## 8. BIRINCHI DEPLOY — QADAM TARTIBI

```bash
# 1. Repo tayyorlash
git init
git add .
git commit -m "Initial VitaForge commit"
git remote add origin https://github.com/YOUR/vitaforge.git
git push -u origin main

# 2. Supabase → SQL run (001_initial_schema.sql)

# 3. Upstash → Redis URL olish

# 4. Railway → deploy (api + worker)

# 5. Vercel → deploy (web)

# 6. Cloudflare → DNS

# 7. Telegram BotFather sozlash

# 8. Test
curl https://api.vitaforge.uz/health
# → {"status":"ok","service":"vitaforge-api","version":"1.0.0"}
```

---

## 9. XARAJAT MONITORING

| Xizmat | Bepul limit | Pulliq |
|--------|-------------|--------|
| Supabase | 500MB DB, 1GB storage, 50K auth users | Pro: $25/oy |
| Railway | $5 kredit/oy | ~$5-20/oy |
| Vercel | 100GB bandwidth | Pro: $20/oy |
| Upstash Redis | 10K cmd/kun | $0.2/100K cmd |
| Cloudflare | Bepul | — |
| Anthropic | Pay-as-you-go | ~$2-15/oy |

**MVP jami: ~$7-10/oy**
