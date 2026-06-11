import asyncio, logging, os
from datetime import date
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from telegram.constants import ParseMode
import httpx
from dotenv import load_dotenv

load_dotenv()
BOT_TOKEN    = os.getenv("TELEGRAM_BOT_TOKEN", "")
API_URL      = os.getenv("VITAFORGE_API_URL", "http://localhost:8000/v1")
MINI_APP_URL = os.getenv("MINI_APP_URL", "https://app.vitaforge.uz")
BOT_SECRET   = os.getenv("BOT_SECRET", "")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── API helper ────────────────────────────────────────────────
async def api(path: str, telegram_id: int) -> dict | None:
    try:
        async with httpx.AsyncClient(timeout=8) as c:
            r = await c.get(f"{API_URL}/bot{path}",
                headers={"X-Bot-Secret": BOT_SECRET,
                         "X-Telegram-Id": str(telegram_id)})
            return r.json() if r.status_code == 200 else None
    except Exception as e:
        logger.error(f"API error {path}: {e}")
        return None

def mini_app_btn(label: str, path: str = "") -> InlineKeyboardButton:
    return InlineKeyboardButton(label, web_app=WebAppInfo(url=f"{MINI_APP_URL}{path}"))

def main_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [mini_app_btn("🏋️ VitaForge ni ochish")],
        [mini_app_btn("📊 Progressim", "/photos"),
         mini_app_btn("🥗 Ovqat", "/food")],
        [mini_app_btn("🏆 Reyting", "/leaderboard"),
         mini_app_btn("💪 Planim", "/plan")],
    ])

def _today_uz() -> str:
    days = ["Dushanba","Seshanba","Chorshanba","Payshanba","Juma","Shanba","Yakshanba"]
    return days[date.today().weekday()]

def _bar(pct: int, size: int = 10) -> str:
    filled = round(pct / 100 * size)
    return "█" * filled + "░" * (size - filled)

# ── /start ────────────────────────────────────────────────────
async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    args = ctx.args or []

    # Referral orqali kelganmi?
    ref_code = None
    if args and args[0].startswith("ref_"):
        ref_code = args[0][4:]

    data = await api("/users/me/brief", user.id)

    if data and data.get("success"):
        u = data["data"]
        text = (
            f"Qaytib keldingiz, *{u['full_name']}*\\! 👋\n\n"
            f"🔥 Streak: `{u['streak']} kun`\n"
            f"⭐ Ball: `{u['points']:,}`\n\n"
            f"Davom eting — siz yaxshi ishlayapsiz\\!"
        )
    else:
        text = (
            f"Salom, *{user.first_name}*\\! 👋\n\n"
            f"VitaForge — sizning shaxsiy AI fitness treneringiz\\.\n\n"
            f"🎯 Shaxsiy haftalik plan\n"
            f"🥗 O'zbek ovqat tracker\n"
            f"📸 Progress foto AI tahlil\n"
            f"🏆 Gym leaderboard\n\n"
            f"Boshlash uchun pastdagi tugmani bosing 👇"
        )

    msg = await update.message.reply_text(
        text, parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=main_keyboard(),
    )

    # Referral ni faollashtirish
    if ref_code and data and data.get("success"):
        try:
            async with httpx.AsyncClient(timeout=5) as c:
                await c.post(f"{API_URL}/referral/activate/{ref_code}",
                    headers={"X-Bot-Secret": BOT_SECRET,
                             "X-Telegram-Id": str(user.id)})
        except Exception:
            pass

# ── /plan ─────────────────────────────────────────────────────
async def cmd_plan(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    data = await api("/plan/current", update.effective_user.id)
    if not data or not data.get("success") or not data.get("data"):
        await update.message.reply_text(
            "📋 Aktiv plan topilmadi\\. AI plan yaratish uchun app ni oching 👇",
            parse_mode=ParseMode.MARKDOWN_V2,
            reply_markup=InlineKeyboardMarkup([[
                mini_app_btn("🤖 Plan yaratish", "/plan")
            ]])
        )
        return

    p = data["data"]
    n = p.get("nutrition", {})
    workouts = p.get("workouts", [])
    today_w = next((w for w in workouts if w.get("day") == _today_uz()), None)

    text = (
        f"💪 *{p['week_number']}\\-hafta plani*\n\n"
        f"🥗 *Kunlik norma:*\n"
        f"  Kaloriya: `{n.get('daily_calories', 0)}`\n"
        f"  Protein: `{n.get('protein_g', 0)}g`\n"
        f"  Uglevod: `{n.get('carbs_g', 0)}g`\n"
    )
    if today_w and today_w.get("type") != "rest":
        exs = today_w.get("exercises", [])[:3]
        ex_lines = "\n".join(
            f"  • {e['name']}: `{e['sets']}×{e['reps']}`" for e in exs
        )
        text += f"\n🏋️ *Bugungi mashqlar:*\n{ex_lines}"
        if len(today_w.get("exercises", [])) > 3:
            text += "\n  _\\.\\.\\._"
    elif today_w and today_w.get("type") == "rest":
        text += "\n😴 *Bugun:* Dam olish kuni"

    await update.message.reply_text(
        text, parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup([[mini_app_btn("To'liq plan", "/plan")]])
    )

# ── /food ─────────────────────────────────────────────────────
async def cmd_food(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    data = await api("/food/today", update.effective_user.id)
    if not data or not data.get("success"):
        await update.message.reply_text("❌ Ma'lumot yuklanmadi\\.", parse_mode=ParseMode.MARKDOWN_V2)
        return

    logs = data["data"]
    meta = data.get("meta", {})
    total = meta.get("total_calories", 0)
    target = meta.get("target_calories", 2000)
    pct = min(round(total / target * 100), 100) if target else 0

    if not logs:
        text = "🥗 *Bugun hali ovqat qo'shilmagan*\n\nNima yedingiz\\?"
    else:
        items = "\n".join(
            f"  • {l['food_name']} — `{round(l.get('calories') or 0)} kcal`"
            for l in logs[:5]
        )
        text = (
            f"🥗 *Bugungi ovqatlar:*\n{items}\n\n"
            f"`{_bar(pct)}` {pct}%\n"
            f"*{round(total)}/{target} kcal*"
        )
        if len(logs) > 5:
            text += f"\n  _\\+{len(logs)-5} ta yana_"

    await update.message.reply_text(
        text, parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup([[mini_app_btn("Ovqat qo'shish", "/food")]])
    )

# ── /streak ───────────────────────────────────────────────────
async def cmd_streak(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    data = await api("/users/me/stats", update.effective_user.id)
    if not data:
        await update.message.reply_text("❌ Ma'lumot yuklanmadi\\.", parse_mode=ParseMode.MARKDOWN_V2)
        return

    s = data["data"].get("streak", {})
    cur   = s.get("current_streak", 0)
    best  = s.get("longest_streak", 0)
    pts   = s.get("total_points", 0)
    badges = s.get("badges", [])

    fire = "🔥" * min(max(cur // 7, 1), 5) if cur > 0 else "💤"
    badge_text = " ".join(badges[-3:]) if badges else "Hali yo'q"

    await update.message.reply_text(
        f"{fire} *Streak: {cur} kun*\n\n"
        f"🏆 Rekord: `{best} kun`\n"
        f"⭐ Ball: `{pts:,}`\n"
        f"🎖️ Badges: {badge_text}\n\n"
        f"{'Ajoyib\\! Davom eting 🚀' if cur >= 7 else 'Har kuni mashq qiling — streak oshadi\\!'}",
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup([[mini_app_btn("Batafsil", "/dashboard")]])
    )

# ── /leaderboard ──────────────────────────────────────────────
async def cmd_leaderboard(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    data = await api("/leaderboard/gym", update.effective_user.id)
    if not data or not data.get("success"):
        await update.message.reply_text("❌ Yuklanmadi\\.", parse_mode=ParseMode.MARKDOWN_V2)
        return

    entries = data["data"]
    medals = ["🥇", "🥈", "🥉"]
    lines = [
        f"{medals[i] if i < 3 else f'{i+1}\\.'} {e['name']} — `{e['points']:,}`"
        for i, e in enumerate(entries[:10])
    ]
    await update.message.reply_text(
        "🏆 *Haftalik Top\\-10*\n\n" + "\n".join(lines),
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup([[mini_app_btn("To'liq reyting", "/leaderboard")]])
    )

# ── /challenge ────────────────────────────────────────────────
async def cmd_challenge(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    data = await api("/challenges/active", update.effective_user.id)
    if not data or not data["data"]:
        await update.message.reply_text(
            "🎯 Hozirda aktiv challenge yo'q\\.\n\nYangi challenge boshlanishi haqida xabar olasiz\\!",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    ch = data["data"]
    await update.message.reply_text(
        f"🎯 *{ch['name']}*\n\n"
        f"📅 Qoldi: `{ch.get('days_left', 0)} kun`\n"
        f"📊 O'rningiz: `#{ch.get('my_rank', '?')}`\n"
        f"⭐ Ballingiz: `{ch.get('my_points', 0):,}`\n\n"
        f"_{ch.get('description', '') or ''}_",
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup([[
            mini_app_btn("Challenge ko'rish", f"/gym/challenges")
        ]])
    )

# ── /invite (referral) ────────────────────────────────────────
async def cmd_invite(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    try:
        async with httpx.AsyncClient(timeout=5) as c:
            r = await c.get(f"{API_URL}/referral/generate",
                headers={"X-Bot-Secret": BOT_SECRET, "X-Telegram-Id": str(user.id)})
            d = r.json()
    except Exception:
        await update.message.reply_text("❌ Link yaratishda xatolik\\.", parse_mode=ParseMode.MARKDOWN_V2)
        return

    link = d.get("data", {}).get("tg_link", "")
    await update.message.reply_text(
        f"🎁 *Do'stingizni taklif qiling\\!*\n\n"
        f"Sizning link: `{link}`\n\n"
        f"Do'stingiz qo'shilganda:\n"
        f"  Siz: ⭐ 500 quvvat\n"
        f"  Do'stingiz: ⭐ 300 quvvat\n\n"
        f"Link do'stingizga yuboring 👆",
        parse_mode=ParseMode.MARKDOWN_V2,
    )

# ── /settings ─────────────────────────────────────────────────
async def cmd_settings(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "⚙️ *Bildirishnomalar*\n\nQaysilarini olmoqchisiz?",
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("🔥 Streak eslatma",     callback_data="notif_streak")],
            [InlineKeyboardButton("💪 Haftalik plan",      callback_data="notif_plan")],
            [InlineKeyboardButton("🎯 Challenge yangiligi", callback_data="notif_challenge")],
            [InlineKeyboardButton("📊 Haftalik hisobot",   callback_data="notif_weekly")],
            [InlineKeyboardButton("✅ Hammasi yoqilgan",    callback_data="notif_all_on")],
        ])
    )

async def cb_settings(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.callback_query.answer()
    await update.callback_query.edit_message_text(
        "✅ Sozlamalar saqlandi\\!",
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup([[mini_app_btn("🏋️ VitaForge")]])
    )

# ── /help ─────────────────────────────────────────────────────
async def cmd_help(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🤖 *VitaForge Bot*\n\n"
        "/start — Asosiy menyu\n"
        "/plan — Haftalik plan\n"
        "/food — Bugungi ovqatlar\n"
        "/streak — Streak va ball\n"
        "/leaderboard — Gym reytingi\n"
        "/challenge — Aktiv challenge\n"
        "/invite — Do'st taklif qilish\n"
        "/settings — Bildirishnomalar\n"
        "/help — Yordam",
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=main_keyboard(),
    )

# ── Main ──────────────────────────────────────────────────────
def main():
    app = Application.builder().token(BOT_TOKEN).build()
    for cmd, handler in [
        ("start",       cmd_start),
        ("plan",        cmd_plan),
        ("food",        cmd_food),
        ("streak",      cmd_streak),
        ("leaderboard", cmd_leaderboard),
        ("challenge",   cmd_challenge),
        ("invite",      cmd_invite),
        ("settings",    cmd_settings),
        ("help",        cmd_help),
    ]:
        app.add_handler(CommandHandler(cmd, handler))
    app.add_handler(CallbackQueryHandler(cb_settings, pattern="^notif_"))
    print("VitaForge Bot ishga tushdi ✅")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
