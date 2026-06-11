import anthropic
from pathlib import Path
from config import settings
from models.user import User, MemberProfile

client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
SYSTEM_PROMPT = Path(__file__).parent / "prompts/chat_v2.0.txt"

async def stream_chat(messages: list, user: User, profile: MemberProfile | None):
    system = SYSTEM_PROMPT.read_text()
    if profile:
        system += f"\n\nFoydalanuvchi: {user.full_name}, {profile.age} yosh, maqsad: {profile.goal}"

    async with client.messages.stream(
        model="claude-haiku-4-5-20251001",
        max_tokens=500,
        system=system,
        messages=messages,
    ) as stream:
        async for text in stream.text_stream:
            yield text
