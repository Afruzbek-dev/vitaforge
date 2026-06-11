from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.types import TIMESTAMP
from sqlalchemy.sql import func
import uuid
from database import Base

class Notification(Base):
    __tablename__ = "notifications"
    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    type       = Column(String(50), nullable=False)
    title      = Column(String(255), nullable=False)
    body       = Column(Text)
    data       = Column(JSONB, default={})
    sent_via   = Column(ARRAY(String))
    read_at    = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
