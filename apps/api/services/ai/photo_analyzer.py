import anthropic
import json
from pathlib import Path
from config import settings

client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
SYSTEM_PROMPT = Path(__file__).parent / "prompts/photo_v1.0.txt"

async def analyze_photo(image_url: str, user_stats: dict) -> dict:
    system = SYSTEM_PROMPT.read_text()
    response = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=800,
        system=system,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "url", "url": image_url}},
                {"type": "text", "text": f"Foydalanuvchi: {user_stats.get('age')} yosh, "
                 f"{user_stats.get('weight_kg')} kg, maqsad: {user_stats.get('goal')}. "
                 f"Oldingi score: {user_stats.get('prev_score', 'yo\\'q')}"},
            ],
        }],
    )
    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())
