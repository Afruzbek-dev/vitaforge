from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date, timedelta
from database import get_db
from middleware.auth import get_current_user
from middleware.rate_limit import check_rate_limit
from models import User, FitnessPlan
from services.ai.plan_generator import generate_plan, PROMPT_VERSION
import uuid

router = APIRouter()

@router.get("/current")
async def get_current_plan(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(FitnessPlan).where(
        FitnessPlan.member_id == current_user.id,
        FitnessPlan.is_active == True,
    ).order_by(FitnessPlan.created_at.desc())
    result = await db.execute(stmt)
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(404, detail="Aktiv plan topilmadi. Yangi plan yarating.")
    return {"success": True, "data": plan}

@router.post("/generate")
async def generate_new_plan(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await check_rate_limit(str(current_user.id), "plan_generate", limit=1, window=604800)  # 1/week

    profile = current_user.profile
    if not profile or not profile.onboarding_done:
        raise HTTPException(400, detail="Avval profilingizni to'ldiring")

    week = date.today().isocalendar()[1]
    try:
        plan_data = await generate_plan(profile, week)
    except Exception as e:
        raise HTTPException(500, detail=f"Plan yaratishda xatolik: {str(e)}")

    # Eski planlarni deactivate
    old_plans = await db.execute(
        select(FitnessPlan).where(FitnessPlan.member_id == current_user.id, FitnessPlan.is_active == True)
    )
    for old in old_plans.scalars():
        old.is_active = False

    today = date.today()
    plan = FitnessPlan(
        member_id=current_user.id,
        generated_by="ai",
        week_number=week,
        starts_at=today,
        ends_at=today + timedelta(days=6),
        workouts=plan_data.get("workouts", []),
        nutrition=plan_data.get("nutrition", {}),
        ai_model="claude-sonnet-4-6",
        ai_prompt_version=PROMPT_VERSION,
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return {"success": True, "data": plan}
