import httpx, logging, os
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")

async def send_telegram(telegram_id: int, text: str, parse_mode: str = "Markdown") -> bool:
    if not BOT_TOKEN: return False
    try:
        async with httpx.AsyncClient() as c:
            res = await c.post(
                f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                json={"chat_id": telegram_id, "text": text, "parse_mode": parse_mode},
                timeout=5.0,
            )
            return res.status_code == 200
    except Exception as e:
        logger.error(f"Telegram send failed: {e}")
        return False

async def notify_churn_alert(owner_tg: int, member_name: str, streak: int):
    return await send_telegram(owner_tg,
        f"⚠️ *Churn ogohlantirish*\n\n*{member_name}* {streak} kundan beri kelmadi.")

async def notify_streak_reminder(member_tg: int, name: str, streak: int):
    emoji = "🔥" if streak >= 7 else "💪"
    return await send_telegram(member_tg,
        f"{emoji} *{name}*, streak {streak} kun!\nBugun mashqni o'tkazib yubormang!")

async def notify_plan_ready(member_tg: int, name: str):
    return await send_telegram(member_tg,
        f"🤖 *{name}*, AI yangi haftalik planingizni tayyorladi!\nApp da ko'ring 💪")
