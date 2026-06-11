import anthropic
import json
from pathlib import Path
from config import settings

client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
SYSTEM_PROMPT = Path(__file__).parent / "prompts/food_parse_v1.1.txt"

async def parse_food_input(raw_text: str) -> dict:
    system = SYSTEM_PROMPT.read_text()
    response = await client.messages.create(
        model="claude-haiku-4-5-20251001",   # Haiku — tez + arzon
        max_tokens=300,
        system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": f'Foydalanuvchi yozdi: "{raw_text}"'}],
    )
    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())
