"""
Haftalik hisobot generatsiya — har yakshanba 09:00 da ishlaydi.
Har a'zoga Telegram da haftalik xulosasini yuboradi.
"""
import logging
from datetime import date, timedelta, datetime, timezone
from sqlalchemy import select, func
from database import AsyncSessionLocal
from models import User, MemberStreak, Attendance, FoodLog, FitnessPlan
from services.notification import send_telegram

logger = logging.getLogger(__name__)


async def generate_weekly_reports(ctx):
    """ARQ cron job — Yakshanba 09:00"""
    today = date.today()
    week_start = today - timedelta(days=7)

    async with AsyncSessionLocal() as db:
        # Barcha aktiv a'zolar
        members_q = await db.execute(
            select(User).where(
                User.role == "member",
                User.is_active == True,
                User.telegram_id.isnot(None),
            )
        )
        members = members_q.scalars().all()
        sent = 0

        for user in members:
            try:
                report = await _build_report(db, user, week_start, today)
                msg = _format_report(user.full_name or "Siz", report)
                if await send_telegram(user.telegram_id, msg):
                    sent += 1
            except Exception as e:
                logger.error(f"Report failed for {user.id}: {e}")

    logger.info(f"Weekly reports sent: {sent}/{len(members)}")


async def _build_report(db, user, start: date, end: date) -> dict:
    """A'zo uchun haftalik statistika yig'adi."""
    start_dt = datetime.combine(start, datetime.min.time()).replace(tzinfo=timezone.utc)
    end_dt   = datetime.combine(end,   datetime.max.time()).replace(tzinfo=timezone.utc)

    # Kelish soni
    visits_q = await db.execute(
        select(func.count(Attendance.id)).where(
            Attendance.member_id == user.id,
            Attendance.checked_in_at.between(start_dt, end_dt),
        )
    )
    visits = visits_q.scalar() or 0

    # Ovqat yozuvlari
    food_q = await db.execute(
        select(
            func.count(FoodLog.id).label("entries"),
            func.avg(FoodLog.calories).label("avg_cal"),
        ).where(
            FoodLog.member_id == user.id,
            FoodLog.logged_at.between(start_dt, end_dt),
        )
    )
    food_row = food_q.one()
    food_entries = food_row.entries or 0
    avg_cal = round(food_row.avg_cal or 0)

    # Streak
    streak_q = await db.execute(
        select(MemberStreak).where(MemberStreak.member_id == user.id)
    )
    streak = streak_q.scalar_one_or_none()
    cur_streak = streak.current_streak if streak else 0
    total_pts  = streak.total_points   if streak else 0

    # Aktiv kun soni
    active_days_q = await db.execute(
        select(func.count(func.distinct(func.date(Attendance.checked_in_at)))).where(
            Attendance.member_id == user.id,
            Attendance.checked_in_at.between(start_dt, end_dt),
        )
    )
    active_days = active_days_q.scalar() or 0

    return {
        "visits": visits,
        "active_days": active_days,
        "food_entries": food_entries,
        "avg_cal": avg_cal,
        "current_streak": cur_streak,
        "total_points": total_pts,
        "week": date.today().isocalendar()[1],
    }


def _format_report(name: str, r: dict) -> str:
    """Telegram xabar formatida haftalik hisobot."""
    streak_emoji = "🔥" if r["current_streak"] >= 7 else "💪" if r["current_streak"] >= 3 else "🌱"
    consistency = round(r["active_days"] / 7 * 100)

    lines = [
        f"📊 *{r['week']}\\-hafta hisoboti*\n",
        f"Salom, *{name}*\\!\n",
        f"━━━━━━━━━━━━━━━",
        f"🏋️ Gym tashrifi: `{r['visits']} marta`",
        f"📅 Aktiv kunlar: `{r['active_days']}/7` \\({consistency}%\\)",
        f"🥗 Ovqat yozuvlari: `{r['food_entries']} ta`",
    ]

    if r["avg_cal"] > 0:
        lines.append(f"🔥 O'rtacha kaloriya: `{r['avg_cal']} kcal`")

    lines += [
        f"━━━━━━━━━━━━━━━",
        f"{streak_emoji} Streak: `{r['current_streak']} kun`",
        f"⭐ Jami ball: `{r['total_points']:,}`",
        f"━━━━━━━━━━━━━━━",
    ]

    if consistency >= 70:
        lines.append("🚀 Ajoyib hafta\\! Davom eting\\!")
    elif consistency >= 40:
        lines.append("👍 Yaxshi hafta\\! Keyingi haftada ko'proq kelishga harakat qiling\\.")
    else:
        lines.append("💙 Bu hafta qiyin bo'ldi\\. Ertaga yangi boshlanish\\!")

    return "\n".join(lines)
