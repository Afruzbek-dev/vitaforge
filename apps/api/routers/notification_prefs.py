from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from database import get_db
from middleware.auth import get_current_user
from models import User

router = APIRouter()

class PrefsUpdate(BaseModel):
    streak_reminder:  bool | None = None
    weekly_plan:      bool | None = None
    challenge_update: bool | None = None
    weekly_report:    bool | None = None
    friend_joined:    bool | None = None

@router.get("/me/notification-prefs")
async def get_prefs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from models import NotificationPref
    q = await db.execute(
        select(NotificationPref).where(NotificationPref.user_id == current_user.id)
    )
    prefs = q.scalar_one_or_none()
    if not prefs:
        return {"success": True, "data": {
            "streak_reminder": True, "weekly_plan": True,
            "challenge_update": True, "weekly_report": True, "friend_joined": True,
        }}
    return {"success": True, "data": {
        "streak_reminder":  prefs.streak_reminder,
        "weekly_plan":      prefs.weekly_plan,
        "challenge_update": prefs.challenge_update,
        "weekly_report":    prefs.weekly_report,
        "friend_joined":    prefs.friend_joined,
    }}

@router.put("/me/notification-prefs")
async def update_prefs(
    body: PrefsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from models import NotificationPref
    from datetime import datetime, timezone
    q = await db.execute(
        select(NotificationPref).where(NotificationPref.user_id == current_user.id)
    )
    prefs = q.scalar_one_or_none()
    if not prefs:
        prefs = NotificationPref(user_id=current_user.id)
        db.add(prefs)

    for k, v in body.model_dump(exclude_none=True).items():
        setattr(prefs, k, v)
    prefs.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return {"success": True}
