from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from middleware.auth import get_current_user
from models import User, MemberProfile, MemberStreak
import os

router = APIRouter()
BOT_SECRET = os.getenv("BOT_SECRET", "")

@router.get("/me/stats")
async def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    streak_res = await db.execute(select(MemberStreak).where(MemberStreak.member_id == current_user.id))
    streak = streak_res.scalar_one_or_none()
    profile_res = await db.execute(select(MemberProfile).where(MemberProfile.user_id == current_user.id))
    profile = profile_res.scalar_one_or_none()

    return {"success": True, "data": {
        "onboarding_done": profile.onboarding_done if profile else False,
        "streak": {
            "current_streak": streak.current_streak if streak else 0,
            "longest_streak": streak.longest_streak if streak else 0,
            "total_points":   streak.total_points   if streak else 0,
            "badges":         streak.badges         if streak else [],
            "last_activity":  str(streak.last_activity) if streak and streak.last_activity else None,
        }
    }}

@router.put("/me/onboarding")
async def complete_onboarding(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(MemberProfile).where(MemberProfile.user_id == current_user.id))
    profile = res.scalar_one_or_none()
    if not profile:
        profile = MemberProfile(user_id=current_user.id, onboarding_done=True)
        db.add(profile)
    else:
        profile.onboarding_done = True
    await db.commit()
    return {"success": True}

@router.get("/by-telegram/{telegram_id}")
async def get_by_telegram(
    telegram_id: int,
    x_bot_secret: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    if x_bot_secret != BOT_SECRET:
        raise HTTPException(403, "Forbidden")
    res = await db.execute(select(User).where(User.telegram_id == telegram_id, User.is_active == True))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")
    return {"success": True, "data": {"user_id": str(user.id)}}
