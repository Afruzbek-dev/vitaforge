from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import datetime, timezone, date, timedelta
from database import get_db
from middleware.auth import get_current_user
from models import User, Attendance
from services.gamification import record_activity

router = APIRouter()

class CheckinBody(BaseModel):
    source: str = "app"  # app|qr|manual

@router.post("/checkin")
async def checkin(
    body: CheckinBody,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Member gym ga kelganini belgilaydi."""
    # Bugun allaqachon check-in qilinganmi?
    today = date.today()
    existing = await db.execute(
        select(Attendance).where(
            Attendance.member_id == current_user.id,
            func.date(Attendance.checked_in_at) == today,
        )
    )
    if existing.scalar_one_or_none():
        return {"success": True, "message": "Bugun allaqachon belgilangansiz", "already": True}

    att = Attendance(
        member_id=current_user.id,
        gym_id=current_user.gym_id,
        checked_in_at=datetime.now(timezone.utc),
        source=body.source,
    )
    db.add(att)
    await db.commit()

    # Gamification
    result = await record_activity(
        str(current_user.id), str(current_user.gym_id), "gym_checkin", db
    )

    return {
        "success": True,
        "message": "Xush kelibsiz! ✅",
        "already": False,
        "gamification": result,
    }

@router.post("/checkout")
async def checkout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Member gym dan chiqishini belgilaydi."""
    today = date.today()
    q = await db.execute(
        select(Attendance).where(
            Attendance.member_id == current_user.id,
            func.date(Attendance.checked_in_at) == today,
            Attendance.checked_out_at.is_(None),
        )
    )
    att = q.scalar_one_or_none()
    if att:
        att.checked_out_at = datetime.now(timezone.utc)
        await db.commit()
        duration = att.checked_out_at - att.checked_in_at
        return {"success": True,
                "duration_minutes": int(duration.total_seconds() / 60)}
    return {"success": False, "message": "Aktiv check-in topilmadi"}

@router.get("/history")
async def history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    thirty_ago = datetime.now(timezone.utc) - timedelta(days=30)
    q = await db.execute(
        select(Attendance)
        .where(Attendance.member_id == current_user.id,
               Attendance.checked_in_at >= thirty_ago)
        .order_by(Attendance.checked_in_at.desc())
    )
    records = q.scalars().all()
    return {
        "success": True,
        "data": [{
            "date": str(a.checked_in_at.date()),
            "checked_in": str(a.checked_in_at),
            "checked_out": str(a.checked_out_at) if a.checked_out_at else None,
            "source": a.source,
        } for a in records],
        "meta": {"total_visits": len(records)}
    }
