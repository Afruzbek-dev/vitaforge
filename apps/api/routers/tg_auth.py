from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from database import get_db
from models import User, MemberStreak, MemberProfile
from services.telegram_auth import verify_telegram_init_data, verify_telegram_widget
from config import settings
import uuid, jwt

router = APIRouter()

class TgMiniAppAuth(BaseModel):
    init_data: str
    role: str = "member"

class TgWidgetAuth(BaseModel):
    id: int
    first_name: str
    last_name: str | None = None
    username: str | None = None
    photo_url: str | None = None
    auth_date: int
    hash: str
    role: str = "member"

def create_jwt(user_id: str, role: str) -> str:
    return jwt.encode({
        "sub": user_id, "role": role,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(days=30),
    }, settings.JWT_SECRET, algorithm="HS256")

async def get_or_create_tg_user(telegram_id, first_name, last_name,
                                  username, photo_url, role, db):
    stmt = select(User).where(User.telegram_id == telegram_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if user:
        user.full_name = f"{first_name} {last_name or ''}".strip()
        if username: user.telegram_username = username
        if photo_url: user.avatar_url = photo_url
        await db.commit()
        return user, False

    from supabase import create_client
    sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    phantom = f"tg_{telegram_id}@vitaforge.internal"
    try:
        r = sb.auth.admin.create_user({
            "email": phantom, "password": str(uuid.uuid4()),
            "email_confirm": True, "user_metadata": {"telegram_id": telegram_id}
        })
        uid = uuid.UUID(r.user.id)
    except Exception:
        for u in sb.auth.admin.list_users():
            if u.email == phantom:
                uid = uuid.UUID(u.id); break
        else:
            raise HTTPException(500, "User yaratishda xatolik")

    new_user = User(id=uid, telegram_id=telegram_id, telegram_username=username,
                    full_name=f"{first_name} {last_name or ''}".strip(),
                    avatar_url=photo_url, role=role, is_active=True)
    db.add(new_user)
    db.add(MemberStreak(member_id=uid, current_streak=0, longest_streak=0,
                        total_points=0, badges=[]))
    await db.commit()
    await db.refresh(new_user)
    return new_user, True

def _set_cookie(response: Response, token: str):
    response.set_cookie("vf_token", token, max_age=30*24*3600,
                        httponly=True, secure=True, samesite="none")

@router.post("/tg/miniapp")
async def tg_miniapp_auth(body: TgMiniAppAuth, response: Response,
                           db: AsyncSession = Depends(get_db)):
    tg_user = verify_telegram_init_data(body.init_data, settings.TELEGRAM_BOT_TOKEN)
    if not tg_user:
        raise HTTPException(401, "initData noto'g'ri")
    user, is_new = await get_or_create_tg_user(
        tg_user["id"], tg_user.get("first_name",""), tg_user.get("last_name"),
        tg_user.get("username"), tg_user.get("photo_url"), body.role, db)
    token = create_jwt(str(user.id), user.role)
    _set_cookie(response, token)
    profile = user.profile
    return {"success": True, "data": {
        "token": token, "user_id": str(user.id), "role": user.role,
        "full_name": user.full_name, "is_new": is_new,
        "onboarding_done": profile.onboarding_done if profile else False,
    }}

@router.post("/tg/widget")
async def tg_widget_auth(body: TgWidgetAuth, response: Response,
                          db: AsyncSession = Depends(get_db)):
    data = body.model_dump()
    if not verify_telegram_widget(data, settings.TELEGRAM_BOT_TOKEN):
        raise HTTPException(401, "Widget ma'lumotlari noto'g'ri")
    user, is_new = await get_or_create_tg_user(
        body.id, body.first_name, body.last_name,
        body.username, body.photo_url, body.role, db)
    token = create_jwt(str(user.id), user.role)
    _set_cookie(response, token)
    return {"success": True, "data": {
        "token": token, "user_id": str(user.id),
        "role": user.role, "is_new": is_new,
    }}

@router.post("/tg/refresh")
async def refresh_token(response: Response,
                        current_user: User = Depends(get_current_user)):
    token = create_jwt(str(current_user.id), current_user.role)
    _set_cookie(response, token)
    return {"success": True, "data": {"token": token}}
