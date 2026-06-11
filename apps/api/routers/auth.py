from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from supabase import create_client
from database import get_db
from models import User
from config import settings
import uuid

router = APIRouter()
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "member"   # member|gym_owner|trainer
    gym_id: str | None = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        sb_user = supabase.auth.admin.create_user({
            "email": req.email,
            "password": req.password,
            "email_confirm": True,
        })
    except Exception as e:
        raise HTTPException(400, detail=str(e))

    user = User(
        id=uuid.UUID(sb_user.user.id),
        role=req.role,
        full_name=req.full_name,
        gym_id=uuid.UUID(req.gym_id) if req.gym_id else None,
    )
    db.add(user)
    await db.commit()
    return {"success": True, "message": "Ro'yxatdan o'tdingiz"}

@router.post("/login")
async def login(req: LoginRequest):
    try:
        result = supabase.auth.sign_in_with_password({"email": req.email, "password": req.password})
    except Exception as e:
        raise HTTPException(401, detail="Email yoki parol noto'g'ri")
    return {
        "success": True,
        "data": {
            "access_token": result.session.access_token,
            "refresh_token": result.session.refresh_token,
            "user_id": result.user.id,
        }
    }

@router.post("/refresh")
async def refresh(refresh_token: str):
    try:
        result = supabase.auth.refresh_session(refresh_token)
        return {"success": True, "data": {"access_token": result.session.access_token}}
    except Exception:
        raise HTTPException(401, detail="Refresh token noto'g'ri")
