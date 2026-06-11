from fastapi import APIRouter, Depends, UploadFile, Form, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from PIL import Image
from io import BytesIO
from datetime import date
from supabase import create_client
from database import get_db
from middleware.auth import get_current_user
from models import User, ProgressPhoto
from services.ai.photo_analyzer import analyze_photo
from config import settings
import uuid

router = APIRouter()
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_MB = 10

async def _analyze_in_background(photo_id: str, image_url: str, user_stats: dict, db: AsyncSession):
    try:
        analysis = await analyze_photo(image_url, user_stats)
        stmt = select(ProgressPhoto).where(ProgressPhoto.id == uuid.UUID(photo_id))
        result = await db.execute(stmt)
        photo = result.scalar_one_or_none()
        if photo:
            photo.ai_analysis = analysis
            photo.ai_score = analysis.get("score")
            photo.ai_model = "claude-sonnet-4-6"
            from datetime import datetime, timezone
            photo.analyzed_at = datetime.now(timezone.utc)
            await db.commit()
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Photo analyze xatolik: {e}")

@router.post("/upload")
async def upload_photo(
    background_tasks: BackgroundTasks,
    file: UploadFile,
    photo_type: str = Form("front"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, detail="Faqat JPG, PNG, WebP ruxsat etilgan")

    contents = await file.read()
    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, detail=f"Rasm hajmi {MAX_SIZE_MB}MB dan oshmasin")

    # Resize & compress
    img = Image.open(BytesIO(contents)).convert("RGB")
    img.thumbnail((1200, 1600), Image.LANCZOS)
    buf = BytesIO()
    img.save(buf, format="JPEG", quality=85, optimize=True)

    today = date.today()
    week = today.isocalendar()[1]
    path = f"{current_user.gym_id}/{current_user.id}/{today.year}-{week:02d}-{photo_type}.jpg"

    supabase.storage.from_("progress-photos").upload(
        path, buf.getvalue(),
        {"content-type": "image/jpeg", "upsert": "true"}
    )

    photo = ProgressPhoto(
        member_id=current_user.id,
        storage_path=path,
        photo_type=photo_type,
        taken_at=today,
        week_number=week,
    )
    db.add(photo)
    await db.commit()
    await db.refresh(photo)

    # Get signed URL for AI analysis
    signed = supabase.storage.from_("progress-photos").create_signed_url(path, expires_in=600)
    profile = current_user.profile
    user_stats = {
        "age": profile.age if profile else None,
        "weight_kg": profile.weight_kg if profile else None,
        "goal": profile.goal if profile else None,
    }
    background_tasks.add_task(
        _analyze_in_background, str(photo.id), signed["signedURL"], user_stats, db
    )

    return {"success": True, "data": {"photo_id": str(photo.id), "message": "Rasm yuklandi, AI tahlil qilinmoqda..."}}

@router.get("/history")
async def get_photos(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ProgressPhoto).where(
        ProgressPhoto.member_id == current_user.id
    ).order_by(ProgressPhoto.taken_at.desc()).limit(20)
    result = await db.execute(stmt)
    photos = result.scalars().all()

    # Generate signed URLs
    items = []
    for p in photos:
        try:
            signed = supabase.storage.from_("progress-photos").create_signed_url(p.storage_path, expires_in=3600)
            url = signed.get("signedURL", "")
        except Exception:
            url = ""
        items.append({**p.__dict__, "url": url})

    return {"success": True, "data": items}
