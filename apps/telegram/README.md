# VitaForge Telegram Bot

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
# .env ga tokenlarni to'ldiring
python bot.py
```

## BotFather sozlamalari

1. @BotFather da `/newbot` — bot yarating
2. `/setmenubutton` → Mini App URL: `https://app.vitaforge.uz`
3. `/setdescription` → "VitaForge AI — AI fitness trener va dietolog"
4. `/setcommands`:
   ```
   start - Asosiy menyu
   plan - Haftalik plan
   food - Bugungi ovqatlar
   streak - Streak holati
   help - Yordam
   ```

## Mini App Integration

Web app da Telegram WebApp API:
```javascript
const tg = window.Telegram?.WebApp
tg?.ready()
tg?.expand()
// User telegram_id = tg.initDataUnsafe.user.id
```

## Notifications (Backend dan)

Backend bot ga webhook yuboradi:
```python
await bot.send_message(
    chat_id=user.telegram_id,
    text="⚠️ Streak uzilmoqda! Bugun mashq qiling.",
)
```
