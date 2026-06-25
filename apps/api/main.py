"""
VitaForge API - main application entrypoint
"""
from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import init_db
from middleware.logging_mw import LoggingMiddleware
from routers import ai, auth, food, gym, notifications, photos, plans, users
from routers.attendance import router as attendance_router
from routers.bot_api import router as bot_api_router
from routers.crm import router as crm_router
from routers.finance import router as finance_router
from routers.gym_settings import router as gym_settings_router
from routers.import_router import router as import_router
from routers.inventory import router as inventory_router
from routers.leaderboard_full import router as leaderboard_router
from routers.notification_prefs import router as notif_prefs_router
from routers.referral import router as referral_router
from routers.tg_auth import router as tg_auth_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    logger.info("VitaForge API started")
    yield
    logger.info("VitaForge API shutting down")


app = FastAPI(
    title="VitaForge AI API",
    version="2.1.0",
    description="O'zbekiston gym lari uchun AI fitness va nutrition platform",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)

app.include_router(auth.router, prefix="/v1/auth", tags=["Auth"])
app.include_router(tg_auth_router, prefix="/v1/auth", tags=["TG Auth"])
app.include_router(users.router, prefix="/v1/users", tags=["Users"])
app.include_router(notif_prefs_router, prefix="/v1/users", tags=["Users"])
app.include_router(plans.router, prefix="/v1/plans", tags=["Plans"])
app.include_router(food.router, prefix="/v1/food", tags=["Food"])
app.include_router(photos.router, prefix="/v1/photos", tags=["Photos"])
app.include_router(attendance_router, prefix="/v1/attendance", tags=["Attendance"])
app.include_router(ai.router, prefix="/v1/ai", tags=["AI"])
app.include_router(leaderboard_router, prefix="/v1/leaderboard", tags=["Leaderboard"])
app.include_router(referral_router, prefix="/v1/referral", tags=["Referral"])
app.include_router(gym.router, prefix="/v1/gym", tags=["Gym"])
app.include_router(gym_settings_router, prefix="/v1/gym", tags=["Gym"])
app.include_router(crm_router, prefix="/v1/crm", tags=["CRM"])
app.include_router(import_router, prefix="/v1/import", tags=["Import"])
app.include_router(finance_router, prefix="/v1/finance", tags=["Finance"])
app.include_router(inventory_router, prefix="/v1/inventory", tags=["Inventory"])
app.include_router(notifications.router, prefix="/v1/notifications", tags=["Notifications"])
app.include_router(bot_api_router, prefix="/v1", tags=["Bot"])


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "vitaforge-api",
        "version": "2.1.0",
        "endpoints": len(app.routes),
    }


@app.get("/")
async def root():
    return {"message": "VitaForge AI API", "docs": "/docs"}
