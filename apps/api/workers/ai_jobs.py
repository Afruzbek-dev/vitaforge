"""
Background AI jobs — real implementation
"""
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import AsyncSessionLocal
from models import User, MemberProfile, MemberStreak
from services.ai.plan_generator import generate_plan, PROMPT_VERSION
from services.notification import notify_plan_ready, notify_streak_reminder, notify_churn_alert
from services.redis_client import redis
from datetime import date, timedelta
import uuid

logger = logging.getLogger(__name__)

async def analyze_progress_photo(ctx, photo_id: str):
    """Photo yuklangandan keyin AI analiz"""
    from models import ProgressPhoto
    from services.ai.photo_analyzer import analyze_photo
    from supabase import create_client
    from config import settings
    from datetime import datetime, timezone

    async with AsyncSessionLocal() as db:
        stmt = select(ProgressPhoto).where(ProgressPhoto.id == uuid.UUID(photo_id))
        res = await db.execute(stmt)
        photo = res.scalar_one_or_none()
        if not photo:
            logger.error(f"Photo {photo_id} not found")
            return

        # User stats olish
        user_stmt = select(User).where(User.id == photo.member_id)
        user_res = await db.execute(user_stmt)
        user = user_res.scalar_one_or_none()
        profile = user.profile if user else None

        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        try:
            signed = supabase.storage.from_("progress-photos").create_signed_url(photo.storage_path, 600)
            image_url = signed.get("signedURL", "")
        except Exception as e:
            logger.error(f"Signed URL failed: {e}")
            return

        user_stats = {
            "age": profile.age if profile else None,
            "weight_kg": profile.weight_kg if profile else None,
            "goal": profile.goal if profile else None,
        }

        analysis = await analyze_photo(image_url, user_stats)
        photo.ai_analysis = analysis
        photo.ai_score = analysis.get("score")
        photo.ai_model = "claude-sonnet-4-6"
        photo.analyzed_at = datetime.now(timezone.utc)
        await db.commit()
        logger.info(f"Photo {photo_id} analyzed. Score: {analysis.get('score')}")

async def generate_weekly_plans(ctx):
    """Cron: Har dushanba — aktiv a'zolarga plan yaratish"""
    from models import FitnessPlan
    from datetime import timedelta

    async with AsyncSessionLocal() as db:
        stmt = select(User).where(User.role == "member", User.is_active == True)
        res = await db.execute(stmt)
        members = res.scalars().all()

        week = date.today().isocalendar()[1]
        for user in members:
            if not user.profile or not user.profile.onboarding_done:
                continue
            try:
                plan_data = await generate_plan(user.profile, week)
                today = date.today()
                plan = FitnessPlan(
                    member_id=user.id, generated_by="ai", week_number=week,
                    starts_at=today, ends_at=today + timedelta(days=6),
                    workouts=plan_data.get("workouts", []),
                    nutrition=plan_data.get("nutrition", {}),
                    ai_model="claude-sonnet-4-6", ai_prompt_version=PROMPT_VERSION,
                )
                db.add(plan)
                # Telegram notification
                if user.telegram_id:
                    await notify_plan_ready(user.telegram_id, user.full_name or "Siz")
            except Exception as e:
                logger.error(f"Plan gen failed for {user.id}: {e}")
        await db.commit()
        logger.info(f"Weekly plans generated for {len(members)} members")

async def send_streak_reminders(ctx):
    """Cron: Har kuni 18:00 — bugun kelmagan a'zolarga eslatma"""
    today = date.today()
    async with AsyncSessionLocal() as db:
        stmt = select(User, MemberStreak).join(
            MemberStreak, MemberStreak.member_id == User.id
        ).where(
            User.role == "member",
            User.is_active == True,
            User.telegram_id.isnot(None),
            MemberStreak.last_activity < today,
            MemberStreak.current_streak > 0,
        )
        res = await db.execute(stmt)
        for user, streak in res.all():
            try:
                await notify_streak_reminder(user.telegram_id, user.full_name or "Siz", streak.current_streak)
            except Exception as e:
                logger.warning(f"Reminder failed for {user.id}: {e}")
    logger.info("Streak reminders sent")

async def detect_churn_risk(ctx):
    """Cron: Har yakshanba — churn risk a'zolarni gym ownerga bildirish"""
    three_days_ago = date.today() - timedelta(days=3)
    async with AsyncSessionLocal() as db:
        stmt = select(User, MemberStreak).join(
            MemberStreak, MemberStreak.member_id == User.id
        ).where(
            User.role == "member",
            User.is_active == True,
            MemberStreak.current_streak < 3,
        )
        res = await db.execute(stmt)
        at_risk = res.all()

        if not at_risk:
            return

        # Gym ownerlari telegram id larini olish
        owner_ids = set()
        for user, _ in at_risk:
            if user.gym_id:
                gym_stmt = select(User).where(
                    User.gym_id == user.gym_id, User.role == "gym_owner", User.telegram_id.isnot(None)
                )
                gym_res = await db.execute(gym_stmt)
                owners = gym_res.scalars().all()
                for o in owners:
                    if o.telegram_id not in owner_ids:
                        owner_ids.add(o.telegram_id)
                        await notify_churn_alert(
                            o.telegram_id,
                            user.full_name or "A'zo",
                            _.current_streak
                        )
    logger.info(f"Churn risk checked: {len(at_risk)} at risk")
