from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import TIMESTAMP
from sqlalchemy.sql import func
import uuid
from database import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id   = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    session_id  = Column(UUID(as_uuid=True), nullable=False)
    role        = Column(String(20), nullable=False)  # user|assistant
    content     = Column(Text, nullable=False)
    tokens_used = Column(Integer)
    model       = Column(String(100))
    created_at  = Column(TIMESTAMP(timezone=True), server_default=func.now())
