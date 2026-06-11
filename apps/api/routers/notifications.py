from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from database import get_db
from middleware.auth import get_current_user
from models import User, Notification
from datetime import datetime, timezone

router = APIRouter()

class FCMTokenRequest(BaseModel):
    token: str
    platform: str = "android"  # android|ios|web

@router.get("/")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Notification).where(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(30)
    result = await db.execute(stmt)
    notifs = result.scalars().all()
    unread = sum(1 for n in notifs if not n.read_at)
    return {"success": True, "data": notifs, "meta": {"unread": unread}}

@router.put("/{notif_id}/read")
async def mark_read(
    notif_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = update(Notification).where(
        Notification.id == notif_id,
        Notification.user_id == current_user.id,
    ).values(read_at=datetime.now(timezone.utc))
    await db.execute(stmt)
    await db.commit()
    return {"success": True}
