from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date
from models import MemberStreak
from services.redis_client import update_leaderboard
import logging

logger = logging.getLogger(__name__)

POINTS = {
    "gym_checkin": 10, "food_log": 3, "photo_upload": 20,
    "plan_generated": 15, "streak_7": 50, "streak_14": 100, "streak_30": 250,
}

BADGES = {
    "first_checkin": ("🏅", lambda s: s.current_streak >= 1),
    "streak_7":      ("🔥", lambda s: s.current_streak >= 7),
    "streak_14":     ("⚡", lambda s: s.current_streak >= 14),
    "streak_30":     ("💎", lambda s: s.current_streak >= 30),
    "top_10":        ("🏆", lambda s: s.total_points >= 500),
}

async def record_activity(member_id: str, gym_id: str, action: str, db: AsyncSession) -> dict:
    stmt = select(MemberStreak).where(MemberStreak.member_id == member_id)
    res = await db.execute(stmt)
    streak = res.scalar_one_or_none()
    today = date.today()

    if not streak:
        streak = MemberStreak(member_id=member_id, current_streak=1,
                              longest_streak=1, last_activity=today, total_points=0, badges=[])
        db.add(streak)
    else:
        if streak.last_activity:
            diff = (today - streak.last_activity).days
            if diff == 1:   streak.current_streak += 1
            elif diff > 1:  streak.current_streak = 1
        else:
            streak.current_streak = 1
        streak.last_activity = today
        streak.longest_streak = max(streak.longest_streak, streak.current_streak)

    pts = POINTS.get(action, 5)
    if streak.current_streak in (7, 14, 30):
        pts += POINTS.get(f"streak_{streak.current_streak}", 0)
    streak.total_points += pts

    new_badges = []
    for bid, (emoji, cond) in BADGES.items():
        if bid not in (streak.badges or []) and cond(streak):
            new_badges.append(bid)
            streak.badges = (streak.badges or []) + [bid]

    await db.commit()

    week = today.isocalendar()[1]
    try:
        await update_leaderboard(gym_id, member_id, streak.total_points, week)
    except Exception as e:
        logger.warning(f"Leaderboard update failed: {e}")

    return {"points_added": pts, "total_points": streak.total_points,
            "current_streak": streak.current_streak, "new_badges": new_badges}
