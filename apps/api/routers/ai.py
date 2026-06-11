from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from middleware.auth import get_current_user
from middleware.rate_limit import check_rate_limit
from models import User
from services.ai.chat_handler import stream_chat
import json, uuid

router = APIRouter()

class ChatRequest(BaseModel):
    messages: list
    session_id: str | None = None

@router.post("/chat")
async def ai_chat(req: ChatRequest, current_user: User = Depends(get_current_user)):
    await check_rate_limit(str(current_user.id), "ai_chat", limit=50, window=86400)

    session_id = req.session_id or str(uuid.uuid4())

    async def generate():
        yield f"data: {json.dumps({'session_id': session_id})}\n\n"
        async for chunk in stream_chat(req.messages, current_user, current_user.profile):
            yield f"data: {json.dumps({'text': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
