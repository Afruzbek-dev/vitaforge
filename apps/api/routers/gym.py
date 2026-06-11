from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from middleware.auth import require_roles, get_current_user
from models import User, Gym, MemberStreak, Attendance
from datetime import date, timedelta

router = APIRouter()

@router.get("/members")
async def get_members(
    current_user: User = Depends(require_roles("gym_owner", "trainer", "admin")),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).where(
        User.gym_id == current_user.gym_id,
        User.role == "member",
        User.is_active == True,
    )
    result = await db.execute(stmt)
    members = result.scalars().all()
    return {"success": True, "data": members, "meta": {"total": len(members)}}

@router.get("/analytics/retention")
async def retention_stats(
    current_user: User = Depends(require_roles("gym_owner", "admin")),
    db: AsyncSession = Depends(get_db),
):
    thirty_days_ago = date.today() - timedelta(days=30)
    # Members who checked in last 30 days
    active_stmt = select(func.count(Attendance.member_id.distinct())).where(
        Attendance.gym_id == current_user.gym_id,
        func.date(Attendance.checked_in_at) >= thirty_days_ago,
    )
    active_count = (await db.execute(active_stmt)).scalar()

    total_stmt = select(func.count(User.id)).where(
        User.gym_id == current_user.gym_id,
        User.role == "member",
        User.is_active == True,
    )
    total_count = (await db.execute(total_stmt)).scalar()

    retention = round((active_count / total_count * 100), 1) if total_count else 0
    return {
        "success": True,
        "data": {
            "retention_rate": retention,
            "active_members": active_count,
            "total_members": total_count,
            "period_days": 30,
        }
    }

@router.get("/analytics/churn-risk")
async def churn_risk(
    current_user: User = Depends(require_roles("gym_owner", "trainer", "admin")),
    db: AsyncSession = Depends(get_db),
):
    # A'zolar streak < 3 — churn risk
    stmt = select(User, MemberStreak).join(
        MemberStreak, MemberStreak.member_id == User.id
    ).where(
        User.gym_id == current_user.gym_id,
        User.role == "member",
        MemberStreak.current_streak < 3,
    )
    result = await db.execute(stmt)
    at_risk = result.all()
    return {
        "success": True,
        "data": [{"user": u, "streak": s} for u, s in at_risk],
        "meta": {"count": len(at_risk)}
    }
