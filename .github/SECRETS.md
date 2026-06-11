# GitHub Secrets — To'liq ro'yxat

GitHub repo → Settings → Secrets and variables → Actions → New repository secret

## Backend (Railway)
| Secret | Qayerdan olish | Misol |
|--------|---------------|-------|
| `RAILWAY_TOKEN` | railway.app → Account Settings → Tokens | `railway_...` |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → API → service_role | `eyJ...` |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon | `eyJ...` |
| `DATABASE_URL` | Supabase → Settings → Database → URI | `postgresql+asyncpg://...` |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys | `sk-ant-...` |
| `REDIS_URL` | Upstash → Redis → Details → REST URL | `rediss://...` |
| `TELEGRAM_BOT_TOKEN` | @BotFather → /mybot → token | `123456:ABC...` |
| `BOT_SECRET` | O'zingiz random yarating | `vitaforge-bot-secret-2025` |

## Frontend (Vercel)
| Secret | Qayerdan olish |
|--------|---------------|
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens |
| `VERCEL_ORG_ID` | vercel.com → Settings → General → Team ID |
| `VERCEL_PROJECT_ID` | Vercel → Project → Settings → General → Project ID |
| `NEXT_PUBLIC_API_URL` | `https://api.vitaforge.uz/v1` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

## Barchasini bir marta qo'yish (GitHub CLI)
```bash
# GitHub CLI o'rnatilgan bo'lsa:
gh secret set RAILWAY_TOKEN --body "TOKEN"
gh secret set ANTHROPIC_API_KEY --body "sk-ant-..."
gh secret set SUPABASE_URL --body "https://xxx.supabase.co"
# ... va boshqalar
```
