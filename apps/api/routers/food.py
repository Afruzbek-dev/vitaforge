from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import date
from database import get_db
from middleware.auth import get_current_user
from models import User, FoodLog, UzbekFood
from services.ai.food_parser import parse_food_input

router = APIRouter()

class FoodLogCreate(BaseModel):
    food_name: str
    quantity_g: float | None = None
    calories: float | None = None
    protein_g: float | None = None
    carbs_g: float | None = None
    fat_g: float | None = None
    meal_type: str = "lunch"
    raw_input: str | None = None

class FoodParseRequest(BaseModel):
    text: str  # "bir piyola osh" yoki "200g tovuq"

@router.post("/log")
async def log_food(
    req: FoodLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    log = FoodLog(member_id=current_user.id, **req.model_dump())
    db.add(log)
    await db.commit()
    return {"success": True, "data": {"id": str(log.id)}}

@router.get("/log")
async def get_food_log(
    log_date: date = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    target = log_date or date.today()
    stmt = select(FoodLog).where(
        FoodLog.member_id == current_user.id,
        func.date(FoodLog.logged_at) == target,
    ).order_by(FoodLog.logged_at)
    result = await db.execute(stmt)
    logs = result.scalars().all()
    total_cal = sum(l.calories or 0 for l in logs)
    return {"success": True, "data": logs, "meta": {"total_calories": total_cal, "date": str(target)}}

@router.get("/search")
async def search_food(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UzbekFood).where(
        UzbekFood.name_uz.ilike(f"%{q}%")
    ).limit(10)
    result = await db.execute(stmt)
    foods = result.scalars().all()
    return {"success": True, "data": foods}

@router.post("/parse")
async def parse_food(
    req: FoodParseRequest,
    current_user: User = Depends(get_current_user),
):
    parsed = await parse_food_input(req.text)
    return {"success": True, "data": parsed}
