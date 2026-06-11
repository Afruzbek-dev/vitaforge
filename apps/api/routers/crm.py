from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_
from pydantic import BaseModel
from datetime import date, datetime, timezone, timedelta
from database import get_db
from middleware.auth import require_roles
from models import User, MemberStreak, MemberProfile, Attendance, FoodLog, ProgressPhoto, FitnessPlan, Notification, Challenge, ChallengeParticipant
import uuid

router = APIRouter()

class MessageBody(BaseModel):
    text: str

class BulkNotifyBody(BaseModel):
    message: str
    target: str = "all"  # all|active|risk|custom
    member_ids: list[str] | None = None

class ChallengeCreate(BaseModel):
    title: str
    description: str | None = None
    type: str = "individual"
    metric: str = "points"
    target_value: int = 100
    starts_at: datetime
    ends_at: datetime
    prize_desc: str | None = None
    bonus_points: int = 500

class TrainerNote(BaseModel):
    text: str

def _risk(streak) -> str:
    if not streak or not streak.last_activity:
        return "unknown"
    d = (date.today() - streak.last_activity).days
    if d >= 7: return "high"
    if d >= 4 or (streak.current_streak < 3): return "medium"
    return "low"

# ── Members list ──────────────────────────────────────────────
@router.get("/members")
async def list_members(
    search: str | None = Query(None),
    status: str | None = Query(None),  # active|risk|new|inactive
    sort_by: str = Query("joined"),
    sort_dir: str = Query("desc"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, le=100),
    owner: User = Depends(require_roles("gym_owner","trainer","admin")),
    db: AsyncSession = Depends(get_db),
):
    q = (select(User, MemberStreak, MemberProfile)
         .outerjoin(MemberStreak, MemberStreak.member_id == User.id)
         .outerjoin(MemberProfile, MemberProfile.user_id == User.id)
         .where(User.gym_id == owner.gym_id, User.role == "member", User.is_active == True))

    if search:
        q = q.where(or_(User.full_name.ilike(f"%{search}%"), User.phone.ilike(f"%{search}%")))

    today = date.today()
    if status == "risk":     q = q.where(MemberStreak.current_streak < 3)
    elif status == "new":    q = q.where(User.created_at >= datetime.now(timezone.utc) - timedelta(days=30))
    elif status == "inactive": q = q.where(MemberStreak.last_activity < today - timedelta(days=7))
    elif status == "active": q = q.where(MemberStreak.last_activity >= today - timedelta(days=3))

    sort_map = {"streak": MemberStreak.current_streak, "points": MemberStreak.total_points,
                "joined": User.created_at, "last_seen": MemberStreak.last_activity}
    col = sort_map.get(sort_by, User.created_at)
    q = q.order_by(desc(col) if sort_dir == "desc" else col)

    total_q = select(func.count()).select_from(q.subquery())
    total = await db.scalar(total_q)
    result = await db.execute(q.offset((page-1)*per_page).limit(per_page))

    members = []
    for u, s, p in result.all():
        members.append({
            "id": str(u.id), "full_name": u.full_name, "phone": u.phone,
            "telegram_id": u.telegram_id, "avatar_url": u.avatar_url,
            "created_at": str(u.created_at),
            "streak": {"current": s.current_streak if s else 0,
                       "longest": s.longest_streak if s else 0,
                       "points": s.total_points if s else 0,
                       "last_activity": str(s.last_activity) if s else None,
                       "badges": s.badges if s else []},
            "profile": {"goal": p.goal if p else None, "weight_kg": p.weight_kg if p else None},
            "risk_level": _risk(s),
        })

    return {"success": True, "data": members,
            "meta": {"total": total, "page": page, "pages": -(-total // per_page)}}

# ── Member detail ─────────────────────────────────────────────
@router.get("/members/{member_id}")
async def member_detail(
    member_id: str,
    owner: User = Depends(require_roles("gym_owner","trainer","admin")),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(User).where(User.id == member_id, User.gym_id == owner.gym_id))
    member = res.scalar_one_or_none()
    if not member: raise HTTPException(404, "A'zo topilmadi")

    thirty_ago = datetime.now(timezone.utc) - timedelta(days=30)

    food_q = await db.execute(
        select(func.date(FoodLog.logged_at).label("day"),
               func.sum(FoodLog.calories).label("total_cal"),
               func.count(FoodLog.id).label("entries"))
        .where(FoodLog.member_id == member_id, FoodLog.logged_at >= thirty_ago)
        .group_by(func.date(FoodLog.logged_at))
        .order_by(func.date(FoodLog.logged_at))
    )
    food_history = [{"date": str(r.day), "calories": round(r.total_cal or 0), "entries": r.entries}
                    for r in food_q.all()]

    att_q = await db.execute(
        select(func.date(Attendance.checked_in_at).label("day"),
               func.count(Attendance.id).label("visits"))
        .where(Attendance.member_id == member_id, Attendance.checked_in_at >= thirty_ago)
        .group_by(func.date(Attendance.checked_in_at))
    )
    attendance = [{"date": str(r.day), "visits": r.visits} for r in att_q.all()]

    photos_q = await db.execute(
        select(ProgressPhoto).where(ProgressPhoto.member_id == member_id)
        .order_by(desc(ProgressPhoto.taken_at)).limit(12)
    )
    photos = [{"id": str(p.id), "week": p.week_number, "date": str(p.taken_at),
               "score": float(p.ai_score) if p.ai_score else None, "type": p.photo_type}
              for p in photos_q.scalars()]

    plans_q = await db.execute(
        select(FitnessPlan).where(FitnessPlan.member_id == member_id)
        .order_by(desc(FitnessPlan.week_number)).limit(5)
    )
    plans = [{"id": str(p.id), "week": p.week_number, "is_active": p.is_active,
              "created_at": str(p.created_at)} for p in plans_q.scalars()]

    streak_q = await db.execute(select(MemberStreak).where(MemberStreak.member_id == member_id))
    streak = streak_q.scalar_one_or_none()

    return {"success": True, "data": {
        "member": {"id": str(member.id), "full_name": member.full_name,
                   "phone": member.phone, "telegram_id": member.telegram_id,
                   "telegram_username": getattr(member, "telegram_username", None),
                   "created_at": str(member.created_at)},
        "streak": {"current": streak.current_streak if streak else 0,
                   "longest": streak.longest_streak if streak else 0,
                   "points": streak.total_points if streak else 0,
                   "badges": streak.badges if streak else []},
        "food_history": food_history, "attendance": attendance,
        "photos": photos, "plans": plans, "risk_level": _risk(streak),
    }}

# ── Send message ──────────────────────────────────────────────
@router.post("/members/{member_id}/message")
async def send_message(member_id: str, body: MessageBody,
                       owner: User = Depends(require_roles("gym_owner","trainer")),
                       db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.id == member_id, User.gym_id == owner.gym_id))
    member = res.scalar_one_or_none()
    if not member or not member.telegram_id:
        raise HTTPException(404, "A'zo yoki Telegram topilmadi")
    from services.notification import send_telegram
    ok = await send_telegram(member.telegram_id,
                              f"💬 *{owner.full_name or 'Treneringiz'}:*\n\n{body.text}")
    db.add(Notification(user_id=member.id, type="trainer_message",
                        title=f"{owner.full_name} dan xabar", body=body.text,
                        sent_via=["telegram"] if ok else []))
    await db.commit()
    return {"success": ok}

# ── Analytics ─────────────────────────────────────────────────
@router.get("/analytics")
async def analytics(period: int = Query(30),
                    owner: User = Depends(require_roles("gym_owner","admin")),
                    db: AsyncSession = Depends(get_db)):
    start = datetime.now(timezone.utc) - timedelta(days=period)
    gid = owner.gym_id

    total = await db.scalar(select(func.count(User.id)).where(
        User.gym_id == gid, User.role == "member", User.is_active == True))
    active = await db.scalar(select(func.count(Attendance.member_id.distinct())).where(
        Attendance.gym_id == gid, Attendance.checked_in_at >= start))
    new_members = await db.scalar(select(func.count(User.id)).where(
        User.gym_id == gid, User.role == "member", User.created_at >= start))
    at_risk = await db.scalar(select(func.count(MemberStreak.member_id)).where(
        MemberStreak.current_streak < 3,
        MemberStreak.member_id.in_(
            select(User.id).where(User.gym_id == gid, User.role == "member"))))

    retention = round((active / total * 100), 1) if total else 0

    daily_q = await db.execute(
        select(func.date(Attendance.checked_in_at).label("day"),
               func.count(Attendance.id).label("visits"),
               func.count(Attendance.member_id.distinct()).label("unique"))
        .where(Attendance.gym_id == gid, Attendance.checked_in_at >= start)
        .group_by(func.date(Attendance.checked_in_at))
        .order_by(func.date(Attendance.checked_in_at))
    )
    daily_trend = [{"date": str(r.day), "visits": r.visits, "unique": r.unique}
                   for r in daily_q.all()]

    top_q = await db.execute(
        select(User, MemberStreak).join(MemberStreak, MemberStreak.member_id == User.id)
        .where(User.gym_id == gid, User.role == "member")
        .order_by(desc(MemberStreak.total_points)).limit(5)
    )
    top = [{"name": u.full_name, "points": s.total_points, "streak": s.current_streak}
           for u, s in top_q.all()]

    risk_q = await db.execute(
        select(User, MemberStreak).join(MemberStreak, MemberStreak.member_id == User.id)
        .where(User.gym_id == gid, User.role == "member", MemberStreak.current_streak < 3)
        .order_by(MemberStreak.current_streak).limit(10)
    )
    risk_list = [{"id": str(u.id), "name": u.full_name, "telegram_id": u.telegram_id,
                  "streak": s.current_streak, "last_seen": str(s.last_activity),
                  "risk": _risk(s)} for u, s in risk_q.all()]

    return {"success": True, "data": {
        "summary": {"total_members": total, "active_members": active,
                    "new_members": new_members, "at_risk": at_risk,
                    "retention_rate": retention, "churn_rate": round(100-retention,1)},
        "daily_trend": daily_trend, "top_members": top, "risk_list": risk_list,
    }}

# ── Bulk notify ───────────────────────────────────────────────
@router.post("/notify/bulk")
async def bulk_notify(body: BulkNotifyBody,
                      owner: User = Depends(require_roles("gym_owner","trainer")),
                      db: AsyncSession = Depends(get_db)):
    from services.notification import send_telegram
    q = select(User).where(User.gym_id == owner.gym_id, User.role == "member",
                            User.is_active == True, User.telegram_id.isnot(None))
    if body.target == "risk":
        q = q.join(MemberStreak).where(MemberStreak.current_streak < 3)
    elif body.target == "active":
        q = q.join(MemberStreak).where(MemberStreak.last_activity >= date.today() - timedelta(days=3))
    elif body.target == "custom" and body.member_ids:
        q = q.where(User.id.in_(body.member_ids))

    members = (await db.execute(q)).scalars().all()
    sent = sum([1 for m in members
                if await send_telegram(m.telegram_id,
                    f"📢 *{owner.full_name or 'Gym'}:*\n\n{body.message}")])
    return {"success": True, "data": {"sent": sent, "total": len(members)}}

# ── Challenge ─────────────────────────────────────────────────
@router.post("/challenges")
async def create_challenge(body: ChallengeCreate,
                            owner: User = Depends(require_roles("gym_owner","trainer")),
                            db: AsyncSession = Depends(get_db)):
    from services.notification import send_telegram
    ch = Challenge(gym_id=owner.gym_id, **body.model_dump())
    db.add(ch)
    await db.commit()
    await db.refresh(ch)

    members = (await db.execute(
        select(User).where(User.gym_id == owner.gym_id, User.role == "member",
                           User.telegram_id.isnot(None))
    )).scalars().all()
    for m in members:
        await send_telegram(m.telegram_id,
            f"🎯 *Yangi challenge!*\n\n*{body.title}*\n"
            f"{body.description or ''}\n\n"
            f"🏆 {body.prize_desc or f'Top 3 ga {body.bonus_points} ball'}\n"
            f"📅 Tugaydi: {body.ends_at.strftime('%d.%m.%Y')}")
    return {"success": True, "data": {"challenge_id": str(ch.id)}}

@router.get("/challenges")
async def get_challenges(owner: User = Depends(require_roles("gym_owner","trainer","admin")),
                         db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Challenge).where(Challenge.gym_id == owner.gym_id)
                         .order_by(desc(Challenge.created_at)))
    return {"success": True, "data": [
        {"id": str(c.id), "title": c.title, "type": c.type, "metric": c.metric,
         "starts_at": str(c.starts_at), "ends_at": str(c.ends_at),
         "is_active": c.is_active, "prize_desc": c.prize_desc}
        for c in q.scalars()
    ]}
