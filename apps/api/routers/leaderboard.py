from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from middleware.auth import get_current_user
from models import User, MemberStreak
from services.redis_client import get_leaderboard, update_leaderboard
from datetime import date

router = APIRouter()

@router.get("/gym")
async def gym_leaderboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    week = date.today().isocalendar()[1]
    entries = await get_leaderboard(str(current_user.gym_id), week, top_n=10)

    result = []
    for member_id, score in entries:
        stmt = select(User).where(User.id == member_id)
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()
        if user:
            result.append({"user_id": member_id, "name": user.full_name, "points": int(score)})

    return {"success": True, "data": result, "meta": {"week": week}}
