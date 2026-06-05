"""
ZenFit Telegram Bot — Webhook mode
Deploy: Railway yoki Vercel serverless

Environment:
  TELEGRAM_BOT_TOKEN=your-bot-token
  SUPABASE_URL=...
  SUPABASE_SERVICE_KEY=...
  GROQ_API_KEY=...
  WEBHOOK_URL=https://your-domain/webhook
"""

from fastapi import FastAPI, Request
from supabase import create_client
import httpx
import os
import json

app = FastAPI()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
GROQ_KEY = os.getenv("GROQ_API_KEY", "")
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "")

sb = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL else None
TG = f"https://api.telegram.org/bot{BOT_TOKEN}"


async def send_msg(chat_id: int, text: str):
    async with httpx.AsyncClient() as c:
        await c.post(f"{TG}/sendMessage", json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"})


async def ai_response(text: str) -> str:
    async with httpx.AsyncClient() as c:
        resp = await c.post("https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
            json={"model": "llama-3.3-70b-versatile", "messages": [
                {"role": "system", "content": "Sen ZenFit AI fitness trener. O'zbek tilida qisqa javob ber."},
                {"role": "user", "content": text}
            ], "max_tokens": 500})
    data = resp.json()
    return data.get("choices", [{}])[0].get("message", {}).get("content", "Xatolik")


@app.post("/webhook")
async def webhook(request: Request):
    body = await request.json()
    msg = body.get("message", {})
    chat_id = msg.get("chat", {}).get("id")
    text = msg.get("text", "")
    user_tg_id = msg.get("from", {}).get("id")
    username = msg.get("from", {}).get("username", "")

    if not chat_id or not text:
        return {"ok": True}

    # /start — link account
    if text == "/start":
        await send_msg(chat_id, "🏋️ *ZenFit AI* ga xush kelibsiz!\n\nBuyruqlar:\n/plan — Haftalik plan\n/streak — Streak\n/food <ovqat> — Kaloriya\n/ask <savol> — AI trener\n/link <email> — Hisobni ulash")
        return {"ok": True}

    # /link <email> — connect telegram to account
    if text.startswith("/link "):
        email = text[6:].strip()
        # Find user by checking auth (simplified: search by full_name or store email)
        if sb:
            data = sb.table("telegram_sessions").upsert({"telegram_id": user_tg_id, "chat_id": chat_id, "username": username}, on_conflict="telegram_id").execute()
            await send_msg(chat_id, f"✅ Telegram ulandi! ({username})\nWeb dan ham foydalanishingiz mumkin.")
        return {"ok": True}

    # /plan — show current plan summary
    if text == "/plan":
        if sb:
            session = sb.table("telegram_sessions").select("user_id").eq("telegram_id", user_tg_id).single().execute()
            if session.data and session.data.get("user_id"):
                plan = sb.table("fitness_plans").select("workouts,nutrition").eq("member_id", session.data["user_id"]).eq("is_active", True).single().execute()
                if plan.data:
                    n = plan.data.get("nutrition", {})
                    w_count = len(plan.data.get("workouts", []))
                    await send_msg(chat_id, f"📋 *Haftalik plan*\n\n🔥 {n.get('daily_calories', '?')} kkal/kun\n💪 Protein: {n.get('protein_g', '?')}g\n📅 {w_count} ta mashg'ulot kun")
                    return {"ok": True}
        await send_msg(chat_id, "❌ Plan topilmadi. Avval /link bilan hisobingizni ulang.")
        return {"ok": True}

    # /streak
    if text == "/streak":
        if sb:
            session = sb.table("telegram_sessions").select("user_id").eq("telegram_id", user_tg_id).single().execute()
            if session.data and session.data.get("user_id"):
                streak = sb.table("member_streaks").select("current_streak,total_points").eq("member_id", session.data["user_id"]).single().execute()
                if streak.data:
                    await send_msg(chat_id, f"🔥 Streak: *{streak.data['current_streak']}* kun\n⚡ Kuch: *{streak.data['total_points']}* ball")
                    return {"ok": True}
        await send_msg(chat_id, "Hisobingizni /link bilan ulang.")
        return {"ok": True}

    # /food <text> — AI parse
    if text.startswith("/food "):
        food = text[6:].strip()
        answer = await ai_response(f"'{food}' ovqatining kaloriyasi, proteini, yog'i va karbohidratini qisqa ayt.")
        await send_msg(chat_id, f"🥗 *{food}*\n\n{answer}")
        return {"ok": True}

    # /ask <question> — AI chat
    if text.startswith("/ask "):
        question = text[5:].strip()
        answer = await ai_response(question)
        await send_msg(chat_id, answer)
        return {"ok": True}

    # Default — treat as AI question
    answer = await ai_response(text)
    await send_msg(chat_id, answer)
    return {"ok": True}


@app.get("/setup-webhook")
async def setup_webhook():
    async with httpx.AsyncClient() as c:
        resp = await c.post(f"{TG}/setWebhook", json={"url": f"{WEBHOOK_URL}/webhook"})
    return resp.json()


@app.get("/health")
def health():
    return {"status": "ok", "bot": bool(BOT_TOKEN)}
