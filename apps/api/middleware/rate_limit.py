from fastapi import HTTPException, Request
import time
from services.redis_client import redis

async def check_rate_limit(user_id: str, action: str, limit: int, window: int = 3600) -> bool:
    key = f"ratelimit:{action}:{user_id}:{int(time.time() / window)}"
    try:
        count = await redis.incr(key)
        if count == 1:
            await redis.expire(key, window)
        if count > limit:
            raise HTTPException(429, detail=f"Limit oshib ketdi. {window // 60} daqiqadan so'ng urinib ko'ring.")
        return True
    except HTTPException:
        raise
    except Exception:
        return True  # Redis xatosida o'tkazib yuborish
