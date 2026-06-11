from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from database import get_db
from middleware.auth import require_roles, get_current_user
from models import User, Gym
import uuid

router = APIRouter()

class TrainerCreate(BaseModel):
    name: str
    telegram: str | None = None

@router.get("/settings")
async def get_settings(
    owner: User = Depends(require_roles("gym_owner","admin")),
    db: AsyncSession = Depends(get_db),
):
    gym_q = await db.execute(select(Gym).where(Gym.id == owner.gym_id))
    gym = gym_q.scalar_one_or_none()
    if not gym:
        raise HTTPException(404, "Gym topilmadi")

    # Member count
    from models import User as U
    count_q = await db.execute(
        select(func.count(U.id)).where(U.gym_id == gym.id, U.role == "member", U.is_active == True)
    )
    trainer_q = await db.execute(
        select(func.count(U.id)).where(U.gym_id == gym.id, U.role == "trainer", U.is_active == True)
    )
    return {"success": True, "data": {
        "id": str(gym.id), "name": gym.name, "slug": gym.slug,
        "city": gym.city, "plan": gym.plan,
        "created_at": str(gym.created_at),
        "member_count": count_q.scalar(),
        "trainer_count": trainer_q.scalar(),
    }}

@router.get("/trainers")
async def get_trainers(
    owner: User = Depends(require_roles("gym_owner","admin")),
    db: AsyncSession = Depends(get_db),
):
    q = await db.execute(
        select(User).where(User.gym_id == owner.gym_id,
                           User.role == "trainer", User.is_active == True)
    )
    trainers = q.scalars().all()
    return {"success": True, "data": [
        {"id": str(t.id), "full_name": t.full_name,
         "telegram_id": t.telegram_id,
         "telegram_username": getattr(t,"telegram_username",None)}
        for t in trainers
    ]}

@router.post("/trainers")
async def add_trainer(
    body: TrainerCreate,
    owner: User = Depends(require_roles("gym_owner","admin")),
    db: AsyncSession = Depends(get_db),
):
    # Telegram username bilan mavjud user topish
    if body.telegram:
        uname = body.telegram.lstrip("@")
        q = await db.execute(select(User).where(User.telegram_username == uname))
        existing = q.scalar_one_or_none()
        if existing:
            existing.role = "trainer"
            existing.gym_id = owner.gym_id
            await db.commit()
            return {"success": True, "message": "Trener qo'shildi"}

    # Yangi placeholder trener yaratish
    new_trainer = User(
        id=uuid.uuid4(),
        full_name=body.name,
        role="trainer",
        gym_id=owner.gym_id,
        is_active=True,
    )
    if body.telegram:
        new_trainer.telegram_username = body.telegram.lstrip("@")
    db.add(new_trainer)
    await db.commit()
    return {"success": True, "message": "Trener qo'shildi"}

@router.delete("/trainers/{trainer_id}")
async def remove_trainer(
    trainer_id: str,
    owner: User = Depends(require_roles("gym_owner","admin")),
    db: AsyncSession = Depends(get_db),
):
    q = await db.execute(select(User).where(
        User.id == trainer_id, User.gym_id == owner.gym_id, User.role == "trainer"
    ))
    t = q.scalar_one_or_none()
    if not t:
        raise HTTPException(404, "Trener topilmadi")
    t.is_active = False
    await db.commit()
    return {"success": True}

from sqlalchemy import func
