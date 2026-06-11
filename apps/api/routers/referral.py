from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from middleware.auth import get_current_user
from models import User, MemberStreak
from services.gamification import record_activity
from services.notification import send_telegram
import hashlib

router = APIRouter()

def _code(user_id: str) -> str:
    return hashlib.md5(user_id.encode()).hexdigest()[:6].upper()

@router.get("/generate")
async def generate_link(current_user: User = Depends(get_current_user)):
    code = _code(str(current_user.id))
    return {"success": True, "data": {
        "code": code,
        "tg_link": f"https://t.me/VitaForgeBot?start=ref_{code}",
        "web_link": f"https://app.vitaforge.uz/join?ref={code}",
        "bonus": "500 quvvat",
        "friend_bonus": "300 quvvat",
    }}

@router.post("/activate/{code}")
async def activate(code: str, current_user: User = Depends(get_current_user),
                   db: AsyncSession = Depends(get_db)):
    all_users = (await db.execute(select(User).where(User.is_active == True))).scalars().all()
    referrer = next((u for u in all_users if _code(str(u.id)) == code.upper()), None)

    if not referrer or referrer.id == current_user.id:
        raise HTTPException(400, "Referral kodi noto'g'ri")

    # Bonus points
    await record_activity(str(referrer.id), str(referrer.gym_id), "referral_success", db)
    await record_activity(str(current_user.id), str(current_user.gym_id), "joined_via_referral", db)

    if referrer.telegram_id:
        await send_telegram(referrer.telegram_id,
            f"🎉 *{current_user.full_name}* sizning tavsiyangiz bilan qo'shildi!\n"
            f"⭐ 500 quvvat hisobingizga tushdi!")

    return {"success": True, "message": "Referral faollashtirildi! 300 quvvat oldingiz."}
