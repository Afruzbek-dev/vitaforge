from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from database import get_db
from middleware.auth import get_current_user
from models import User, MemberStreak
from services.redis_client import get_leaderboard
from datetime import date

router = APIRouter()

@router.get("/gym")
async def gym_leaderboard(
    period: str = Query("week", regex="^(week|month|all)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    week = date.today().isocalendar()[1]

    if period == "week":
        # Redis dan (real-time haftalik)
        entries = await get_leaderboard(str(current_user.gym_id), week, 20)
        result = []
        for member_id, score in entries:
            u_q = await db.execute(select(User).where(User.id == member_id))
            u = u_q.scalar_one_or_none()
            if u:
                s_q = await db.execute(
                    select(MemberStreak).where(MemberStreak.member_id == member_id)
                )
                s = s_q.scalar_one_or_none()
                result.append({
                    "user_id": str(member_id),
                    "name": u.full_name,
                    "points": int(score),
                    "streak": s.current_streak if s else 0,
                    "badges": (s.badges or [])[-1:] if s else [],
                })
        return {"success": True, "data": result,
                "meta": {"period": period, "week": week}}

    else:
        # DB dan (oylik yoki barcha vaqt)
        q = (select(User, MemberStreak)
             .join(MemberStreak, MemberStreak.member_id == User.id)
             .where(User.gym_id == current_user.gym_id, User.role == "member",
                    User.is_active == True)
             .order_by(desc(MemberStreak.total_points))
             .limit(20))
        res = await db.execute(q)
        result = [
            {
                "user_id": str(u.id),
                "name": u.full_name,
                "points": s.total_points,
                "streak": s.current_streak,
                "badges": (s.badges or [])[-1:],
            }
            for u, s in res.all()
        ]
        return {"success": True, "data": result,
                "meta": {"period": period}}
