"""
VitaForge — To'liq ARQ Worker Settings
Barcha cron jobs shu yerda ro'yxatga olingan.
"""
from arq import cron
from arq.connections import RedisSettings
from workers.ai_jobs import (
    analyze_progress_photo,
    generate_weekly_plans,
    send_streak_reminders,
    detect_churn_risk,
)
from workers.weekly_report import generate_weekly_reports
import os

class WorkerSettings:
    redis_settings = RedisSettings.from_dsn(os.getenv("REDIS_URL", "redis://localhost"))

    # Background functions (queue based)
    functions = [
        analyze_progress_photo,   # Photo yuklanganda trigger
    ]

    # Cron jobs (vaqt asosida)
    cron_jobs = [
        # Dushanba 06:00 — barcha a'zolarga yangi plan
        cron(generate_weekly_plans,  weekday=0, hour=6,  minute=0),

        # Har kuni 18:00 — streak reminder
        cron(send_streak_reminders,  hour=18, minute=0),

        # Yakshanba 09:00 — churn risk detection + owner alert
        cron(detect_churn_risk,      weekday=6, hour=9,  minute=0),

        # Yakshanba 10:00 — haftalik hisobot a'zolarga
        cron(generate_weekly_reports, weekday=6, hour=10, minute=0),
    ]

    max_jobs = 20
    job_timeout = 300      # 5 daqiqa timeout
    keep_result = 3600     # 1 soat natijani saqlash
    retry_jobs = True
    max_tries = 3
