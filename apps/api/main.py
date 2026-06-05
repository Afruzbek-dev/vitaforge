from fastapi import FastAPI, Depends, HTTPException, Header, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from supabase import create_client
from config import get_settings
import httpx
import json
import io
from PIL import Image

app = FastAPI(title="ZenFit API", version="1.0.0")
settings = get_settings()

app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

sb = create_client(settings.supabase_url, settings.supabase_service_key)


# ─── Auth dependency ──────────────────────────────────────
async def get_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Unauthorized")
    token = authorization.split(" ")[1]
    try:
        resp = sb.auth.get_user(token)
    except Exception:
        raise HTTPException(401, "Invalid token")
    if not resp.user:
        raise HTTPException(401, "Invalid token")
    # Get user from DB
    data = sb.table("users").select("*").eq("id", resp.user.id).single().execute()
    if not data.data:
        raise HTTPException(404, "User not found")
    return data.data


# ─── Health ───────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "zenfit-api"}


# ─── Auth routes ──────────────────────────────────────────
class RegisterBody(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "member"


class LoginBody(BaseModel):
    email: str
    password: str


@app.post("/v1/auth/register")
def register(body: RegisterBody):
    try:
        resp = sb.auth.sign_up({"email": body.email, "password": body.password, "options": {"data": {"full_name": body.full_name, "role": body.role}}})
    except Exception as e:
        raise HTTPException(400, str(e))
    if not resp.user:
        raise HTTPException(400, "Registration failed")
    # Auto-create gym for gym_owner
    if body.role == "gym_owner":
        slug = body.full_name.lower().replace(" ", "-")[:20] + "-gym"
        gym = sb.table("gyms").insert({"name": f"{body.full_name}'s Gym", "slug": slug, "owner_id": resp.user.id}).execute()
        if gym.data:
            sb.table("users").update({"gym_id": gym.data[0]["id"]}).eq("id", resp.user.id).execute()
    return {"success": True, "data": {"user_id": str(resp.user.id)}}


@app.post("/v1/auth/login")
def login(body: LoginBody):
    try:
        resp = sb.auth.sign_in_with_password({"email": body.email, "password": body.password})
    except Exception:
        raise HTTPException(401, "Email yoki parol noto'g'ri")
    return {"success": True, "data": {"access_token": resp.session.access_token, "refresh_token": resp.session.refresh_token}}


@app.post("/v1/auth/logout")
def logout():
    return {"success": True}


# ─── Users ────────────────────────────────────────────────
@app.get("/v1/users/me")
def get_me(user=Depends(get_user)):
    return {"success": True, "data": user}


@app.get("/v1/users/me/stats")
def get_stats(user=Depends(get_user)):
    streak = sb.table("member_streaks").select("*").eq("member_id", user["id"]).single().execute()
    s = streak.data or {}
    count = sb.table("attendance").select("*", count="exact").eq("member_id", user["id"]).execute()
    return {"success": True, "data": {
        "current_streak": s.get("current_streak", 0),
        "longest_streak": s.get("longest_streak", 0),
        "total_points": s.get("total_points", 0),
        "badges": s.get("badges", []),
        "total_attendance": count.count or 0,
    }}


# ─── Plans ────────────────────────────────────────────────
@app.get("/v1/plans/current")
def get_plan(user=Depends(get_user)):
    data = sb.table("fitness_plans").select("*").eq("member_id", user["id"]).eq("is_active", True).order("created_at", desc=True).limit(1).execute()
    if not data.data:
        raise HTTPException(404, "Plan topilmadi")
    return {"success": True, "data": data.data[0]}


@app.post("/v1/plans/generate")
async def generate_plan(user=Depends(get_user)):
    profile = sb.table("member_profiles").select("*").eq("user_id", user["id"]).single().execute()
    if not profile.data:
        raise HTTPException(400, "Profil topilmadi")
    p = profile.data
    prompt = f"A'zo: {p.get('age')} yosh, {p.get('gender')}, {p.get('height_cm')}cm, {p.get('weight_kg')}kg. Maqsad: {p.get('goal')}. Faollik: {p.get('activity_level')}. Haftalik plan yarat JSON da."
    system = "Sen ZenFit AI. Faqat JSON qaytar: {\"workouts\":[...],\"nutrition\":{...},\"motivation\":\"...\"}"
    async with httpx.AsyncClient() as client:
        resp = await client.post("https://api.groq.com/openai/v1/chat/completions", headers={"Authorization": f"Bearer {settings.groq_api_key}", "Content-Type": "application/json"},
            json={"model": "llama-3.3-70b-versatile", "messages": [{"role": "system", "content": system}, {"role": "user", "content": prompt}], "max_tokens": 2000})
    result = resp.json()
    text = result.get("choices", [{}])[0].get("message", {}).get("content", "")
    try:
        cleaned = text.replace("```json", "").replace("```", "").strip()
        plan_data = json.loads(cleaned)
    except:
        raise HTTPException(500, "AI plan yarata olmadi")
    from datetime import date, timedelta
    today = date.today()
    week = today.isocalendar()[1]
    sb.table("fitness_plans").update({"is_active": False}).eq("member_id", user["id"]).eq("is_active", True).execute()
    new_plan = sb.table("fitness_plans").insert({
        "member_id": user["id"], "generated_by": "ai", "week_number": week,
        "starts_at": str(today), "ends_at": str(today + timedelta(days=6)),
        "workouts": plan_data.get("workouts", []), "nutrition": plan_data.get("nutrition", {}),
        "ai_model": "llama-3.3-70b", "is_active": True,
    }).execute()
    return {"success": True, "data": new_plan.data[0] if new_plan.data else plan_data}


# ─── Food ─────────────────────────────────────────────────
class FoodLogBody(BaseModel):
    meal_type: str | None = None
    food_name: str
    quantity_g: float | None = None
    calories: float | None = None
    protein_g: float | None = None
    carbs_g: float | None = None
    fat_g: float | None = None
    raw_input: str | None = None


@app.post("/v1/food/log")
def log_food(body: FoodLogBody, user=Depends(get_user)):
    data = sb.table("food_logs").insert({**body.model_dump(), "member_id": user["id"]}).execute()
    return {"success": True, "data": data.data[0] if data.data else None}


@app.get("/v1/food/search")
def search_food(q: str):
    data = sb.table("uzbek_foods").select("*").or_(f"name_uz.ilike.%{q}%,name_ru.ilike.%{q}%").limit(20).execute()
    return {"success": True, "data": data.data}


@app.post("/v1/food/parse")
async def parse_food(body: dict, user=Depends(get_user)):
    text = body.get("text", "")
    async with httpx.AsyncClient() as client:
        resp = await client.post("https://api.groq.com/openai/v1/chat/completions", headers={"Authorization": f"Bearer {settings.groq_api_key}", "Content-Type": "application/json"},
            json={"model": "llama-3.3-70b-versatile", "messages": [
                {"role": "system", "content": "Parse ovqat. JSON qaytar: {\"food_name\":\"...\",\"quantity_g\":0,\"calories\":0,\"protein_g\":0,\"carbs_g\":0,\"fat_g\":0,\"confidence\":0.9}"},
                {"role": "user", "content": f"Parse: {text}"}
            ], "max_tokens": 200})
    result = resp.json()
    raw = result.get("choices", [{}])[0].get("message", {}).get("content", "")
    try:
        return {"success": True, "data": json.loads(raw.replace("```json", "").replace("```", "").strip())}
    except:
        return {"success": True, "data": {"food_name": text, "calories": None, "confidence": 0}}


# ─── AI Chat ──────────────────────────────────────────────
class ChatBody(BaseModel):
    message: str
    session_id: str | None = None


@app.post("/v1/ai/chat")
async def ai_chat(body: ChatBody, user=Depends(get_user)):
    async def stream():
        async with httpx.AsyncClient() as client:
            resp = await client.post("https://api.groq.com/openai/v1/chat/completions", headers={"Authorization": f"Bearer {settings.groq_api_key}", "Content-Type": "application/json"},
                json={"model": "llama-3.3-70b-versatile", "stream": True, "messages": [
                    {"role": "system", "content": "Sen ZenFit AI trener. O'zbek tilida javob ber. Qisqa, foydali."},
                    {"role": "user", "content": body.message}
                ], "max_tokens": 800})
            async for line in resp.aiter_lines():
                if line.startswith("data: ") and line != "data: [DONE]":
                    try:
                        chunk = json.loads(line[6:])
                        text = chunk["choices"][0]["delta"].get("content", "")
                        if text:
                            yield f"data: {json.dumps({'text': text})}\n\n"
                    except:
                        pass
            yield "data: [DONE]\n\n"
    return StreamingResponse(stream(), media_type="text/event-stream")


# ─── Photos ───────────────────────────────────────────────
@app.post("/v1/photos/upload")
async def upload_photo(file: UploadFile = File(...), photo_type: str = Form("front"), user=Depends(get_user)):
    content = await file.read()
    if len(content) > 1 * 1024 * 1024:
        raise HTTPException(400, "1MB dan oshmasin")
    # Compress
    img = Image.open(io.BytesIO(content)).convert("RGB")
    img.thumbnail((1200, 1600))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=80)
    from datetime import date
    today = date.today()
    week = today.isocalendar()[1]
    path = f"{user['id']}/{today.year}-{week:02d}-{photo_type}.jpg"
    sb.storage.from_("progress-photos").upload(path, buf.getvalue(), {"content-type": "image/jpeg", "upsert": "true"})
    sb.table("progress_photos").insert({"member_id": user["id"], "storage_path": path, "photo_type": photo_type, "taken_at": str(today), "week_number": week}).execute()
    return {"success": True, "data": {"photo_id": path}}


@app.get("/v1/photos/history")
def get_photos(user=Depends(get_user)):
    data = sb.table("progress_photos").select("*").eq("member_id", user["id"]).order("taken_at", desc=True).limit(20).execute()
    photos = []
    for p in (data.data or []):
        url = sb.storage.from_("progress-photos").create_signed_url(p["storage_path"], 600)
        photos.append({**p, "url": url.get("signedURL", "")})
    return {"success": True, "data": photos}


# ─── Gym ──────────────────────────────────────────────────
@app.get("/v1/gym/members")
def get_members(user=Depends(get_user)):
    members = sb.table("users").select("id,full_name,phone,role").eq("gym_id", user.get("gym_id")).eq("role", "member").execute()
    ids = [m["id"] for m in (members.data or [])]
    profiles = sb.table("member_profiles").select("user_id,goal,onboarding_done").in_("user_id", ids).execute() if ids else type("", (), {"data": []})()
    pmap = {p["user_id"]: p for p in (profiles.data or [])}
    return {"success": True, "data": [{**m, "goal": pmap.get(m["id"], {}).get("goal"), "onboarding_done": pmap.get(m["id"], {}).get("onboarding_done", False)} for m in (members.data or [])]}


@app.get("/v1/gym/analytics/retention")
def retention(user=Depends(get_user)):
    from datetime import datetime, timedelta
    gym_id = user.get("gym_id")
    total = sb.table("users").select("*", count="exact").eq("gym_id", gym_id).eq("role", "member").execute()
    ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
    active = sb.table("attendance").select("member_id").eq("gym_id", gym_id).gte("checked_in_at", ago).execute()
    active_count = len(set(a["member_id"] for a in (active.data or [])))
    t = total.count or 0
    return {"success": True, "data": {"total_members": t, "active_last_30_days": active_count, "retention_rate": round(active_count / t * 100, 1) if t else 0}}


@app.get("/v1/leaderboard")
def leaderboard(user=Depends(get_user)):
    data = sb.table("member_streaks").select("member_id,total_points,current_streak,badges").order("total_points", desc=True).limit(20).execute()
    ids = [s["member_id"] for s in (data.data or [])]
    users = sb.table("users").select("id,full_name").in_("id", ids).execute() if ids else type("", (), {"data": []})()
    names = {u["id"]: u["full_name"] for u in (users.data or [])}
    return {"success": True, "data": [{"rank": i+1, "member_id": s["member_id"], "full_name": names.get(s["member_id"], "?"), "points": s["total_points"], "streak": s["current_streak"]} for i, s in enumerate(data.data or [])]}
