from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from database import get_db
from middleware.auth import get_current_user
from models import User, MemberProfile

router = APIRouter()

class ProfileUpdate(BaseModel):
    age: str | None = None
    gender: str | None = None
    height_cm: str | None = None
    weight_kg: str | None = None
    goal: str | None = None
    activity_level: str | None = None
    dietary_restrictions: str | None = None
    medical_notes: str | None = None

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "data": {
            "id": str(current_user.id),
            "full_name": current_user.full_name,
            "role": current_user.role,
            "gym_id": str(current_user.gym_id) if current_user.gym_id else None,
        }
    }

@router.put("/me")
async def update_me(
    update: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = current_user.profile
    if not profile:
        profile = MemberProfile(user_id=current_user.id)
        db.add(profile)
    for k, v in update.model_dump(exclude_none=True).items():
        setattr(profile, k, v)
    if all([profile.age, profile.weight_kg, profile.goal]):
        profile.onboarding_done = True
    await db.commit()
    return {"success": True, "message": "Ma'lumotlar yangilandi"}
