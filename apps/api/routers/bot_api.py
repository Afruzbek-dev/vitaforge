"""
Faqat Telegram Bot uchun — X-Bot-Secret header bilan himoyalangan.
X-Telegram-Id header orqali user ni topadi.
"""
from fastapi import APIRouter, Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from database import get_db
from models import User, MemberStreak, FitnessPlan, FoodLog, Challenge, Attendance
from datetime import date, datetime, timezone, timedelta
import os

router = APIRouter()
BOT_SECRET = os.getenv("BOT_SECRET", "")

async def bot_user(x_bot_secret: str = Header(None),
                   x_telegram_id: str = Header(None),
                   db: AsyncSession = Depends(get_db)) -> User:
    if x_bot_secret != BOT_SECRET:
        raise HTTPException(403, "Forbidden")
    if not x_telegram_id:
        raise HTTPException(400, "X-Telegram-Id kerak")
    res = await db.execute(select(User).where(
        User.telegram_id == int(x_telegram_id), User.is_active == True))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User topilmadi")
    return user

@router.get("/bot/users/me/brief")
async def bot_me(user: User = Depends(bot_user), db: AsyncSession = Depends(get_db)):
    streak_q = await db.execute(select(MemberStreak).where(MemberStreak.member_id == user.id))
    s = streak_q.scalar_one_or_none()
    return {"success": True, "data": {
        "full_name": user.full_name, "role": user.role,
        "streak": s.current_streak if s else 0,
        "points": s.total_points if s else 0,
    }}

@router.get("/bot/plan/current")
async def bot_plan(user: User = Depends(bot_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(FitnessPlan).where(
        FitnessPlan.member_id == user.id, FitnessPlan.is_active == True
    ).order_by(desc(FitnessPlan.created_at)))
    plan = res.scalar_one_or_none()
    if not plan:
        return {"success": False, "data": None}
    return {"success": True, "data": {
        "week_number": plan.week_number, "weekly_goal": "",
        "workouts": plan.workouts, "nutrition": plan.nutrition,
        "motivation": plan.nutrition.get("motivation", ""),
    }}

@router.get("/bot/food/today")
async def bot_food(user: User = Depends(bot_user), db: AsyncSession = Depends(get_db)):
    today = date.today()
    q = await db.execute(select(FoodLog).where(
        FoodLog.member_id == user.id,
        func.date(FoodLog.logged_at) == today,
    ))
    logs = q.scalars().all()
    total = sum(l.calories or 0 for l in logs)
    return {"success": True,
            "data": [{"food_name": l.food_name, "calories": float(l.calories or 0)} for l in logs],
            "meta": {"total_calories": round(total), "target_calories": 2000}}

@router.get("/bot/users/me/stats")
async def bot_stats(user: User = Depends(bot_user), db: AsyncSession = Depends(get_db)):
    s_q = await db.execute(select(MemberStreak).where(MemberStreak.member_id == user.id))
    s = s_q.scalar_one_or_none()
    return {"success": True, "data": {"streak": {
        "current_streak": s.current_streak if s else 0,
        "longest_streak": s.longest_streak if s else 0,
        "total_points": s.total_points if s else 0,
        "badges": s.badges if s else [],
    }}}

@router.get("/bot/leaderboard/gym")
async def bot_leaderboard(user: User = Depends(bot_user), db: AsyncSession = Depends(get_db)):
    from services.redis_client import get_leaderboard
    week = date.today().isocalendar()[1]
    entries = await get_leaderboard(str(user.gym_id), week, 10)
    result = []
    for member_id, score in entries:
        u_q = await db.execute(select(User).where(User.id == member_id))
        u = u_q.scalar_one_or_none()
        if u:
            result.append({"name": u.full_name, "points": int(score)})
    return {"success": True, "data": result}

@router.get("/bot/challenges/active")
async def bot_challenge(user: User = Depends(bot_user), db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    q = await db.execute(select(Challenge).where(
        Challenge.gym_id == user.gym_id, Challenge.is_active == True,
        Challenge.starts_at <= now, Challenge.ends_at >= now,
    ).order_by(desc(Challenge.created_at)))
    ch = q.scalar_one_or_none()
    if not ch:
        return {"success": True, "data": None}
    days_left = (ch.ends_at - now).days
    return {"success": True, "data": {
        "id": str(ch.id), "name": ch.title, "description": ch.description,
        "days_left": max(0, days_left), "my_rank": None, "my_points": 0,
    }}
