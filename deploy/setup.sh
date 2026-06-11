#!/bin/bash
# VitaForge — Local va Production Setup Script
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== VitaForge Setup ===${NC}"

# ── Check dependencies ────────────────────────────────────────
check_cmd() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}✗ $1 topilmadi. O'rnating.${NC}"; exit 1
  else
    echo -e "${GREEN}✓ $1${NC}"
  fi
}

echo "Dasturlar tekshirilmoqda..."
check_cmd git
check_cmd python3
check_cmd node
check_cmd npm
check_cmd docker

# ── API setup ─────────────────────────────────────────────────
echo -e "\n${YELLOW}API sozlanmoqda...${NC}"
cd apps/api
if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${YELLOW}⚠ apps/api/.env yaratildi — API keylarni to'ldiring!${NC}"
fi
pip install -r requirements.txt --quiet
echo -e "${GREEN}✓ Python packages o'rnatildi${NC}"

# ── Web setup ─────────────────────────────────────────────────
echo -e "\n${YELLOW}Web app sozlanmoqda...${NC}"
cd ../../apps/web
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
  echo -e "${YELLOW}⚠ apps/web/.env.local yaratildi — URL larni to'ldiring!${NC}"
fi
npm install --silent
echo -e "${GREEN}✓ Node packages o'rnatildi${NC}"

# ── Telegram bot setup ────────────────────────────────────────
echo -e "\n${YELLOW}Telegram bot sozlanmoqda...${NC}"
cd ../../apps/telegram
if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${YELLOW}⚠ apps/telegram/.env yaratildi — BOT_TOKEN ni to'ldiring!${NC}"
fi
pip install -r requirements.txt --quiet
echo -e "${GREEN}✓ Telegram bot packages o'rnatildi${NC}"

cd ../..

echo -e "\n${GREEN}=== Setup tugadi! ===${NC}"
echo ""
echo "Keyingi qadamlar:"
echo "  1. apps/api/.env → ANTHROPIC_API_KEY, SUPABASE_*, REDIS_URL"
echo "  2. apps/web/.env.local → NEXT_PUBLIC_API_URL, SUPABASE_*"
echo "  3. apps/telegram/.env → TELEGRAM_BOT_TOKEN"
echo ""
echo "Ishga tushirish:"
echo "  docker-compose up -d   # API + Worker + Redis"
echo "  cd apps/web && npm run dev  # Web app"
echo "  cd apps/telegram && python bot.py  # Bot"
echo ""
echo -e "${GREEN}Swagger docs: http://localhost:8000/docs${NC}"
echo -e "${GREEN}Web app: http://localhost:3000${NC}"
