import redis.asyncio as aioredis
from config import settings

redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

async def update_leaderboard(gym_id: str, member_id: str, points: int, week: int):
    key = f"leaderboard:{gym_id}:week:{week}"
    await redis.zadd(key, {str(member_id): points})
    await redis.expire(key, 7 * 24 * 3600)

async def get_leaderboard(gym_id: str, week: int, top_n: int = 10):
    key = f"leaderboard:{gym_id}:week:{week}"
    return await redis.zrevrange(key, 0, top_n - 1, withscores=True)

async def get_chat_context(session_id: str) -> list:
    import json
    key = f"chat:ctx:{session_id}"
    data = await redis.get(key)
    return json.loads(data) if data else []

async def save_chat_context(session_id: str, messages: list):
    import json
    key = f"chat:ctx:{session_id}"
    await redis.setex(key, 3600, json.dumps(messages))
