from fastapi import Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from supabase import create_client
from database import get_db
from models import User
from config import settings

supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

async def get_current_user(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, detail="Authorization header kerak")

    token = authorization.split(" ")[1]

    try:
        result = supabase_client.auth.get_user(token)
        if not result.user:
            raise HTTPException(401, detail="Token noto'g'ri")
        uid = result.user.id
    except Exception:
        raise HTTPException(401, detail="Token tekshirib bo'lmadi")

    stmt = select(User).where(User.id == uid)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        raise HTTPException(404, detail="Foydalanuvchi topilmadi")
    if not user.is_active:
        raise HTTPException(403, detail="Akkaunt bloklangan")

    return user

def require_roles(*roles: str):
    async def checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(403, detail=f"Bu amalni bajarish uchun '{'/'.join(roles)}' roli kerak")
        return current_user
    return Depends(checker)
