import anthropic
import json
from pathlib import Path
from config import settings
from models.user import MemberProfile

client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

PROMPT_VERSION = "v1.2"
SYSTEM_PROMPT = Path(__file__).parent / "prompts/plan_v1.2.txt"

async def generate_plan(profile: MemberProfile, week_number: int) -> dict:
    system = SYSTEM_PROMPT.read_text()
    user_msg = f"""
A'zo ma'lumotlari:
- Yosh: {profile.age}
- Jins: {profile.gender}
- Bo'y: {profile.height_cm} cm
- Vazn: {profile.weight_kg} kg
- Maqsad: {profile.goal}
- Faollik darajasi: {profile.activity_level}
- Cheklovlar: {profile.dietary_restrictions or "yo'q"}
- Tibbiy eslatmalar: {profile.medical_notes or "yo'q"}
- Bu {week_number}-hafta

Shu ma'lumotlar asosida bu hafta uchun to'liq plan yarat.
"""
    # Prompt caching for cost optimization
    response = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": user_msg}],
    )
    raw = response.content[0].text.strip()
    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())
