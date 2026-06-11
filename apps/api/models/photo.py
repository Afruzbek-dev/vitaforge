from sqlalchemy import Column, String, Boolean, ForeignKey, SmallInteger, Date, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.types import TIMESTAMP
import uuid
from database import Base
from .mixins import TimestampMixin

class ProgressPhoto(Base, TimestampMixin):
    __tablename__ = "progress_photos"
    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    storage_path = Column(String(500), nullable=False)
    photo_type   = Column(String(20), default="front")  # front|side|back
    taken_at     = Column(Date, nullable=False)
    week_number  = Column(SmallInteger)
    ai_score     = Column(Numeric(4, 1))
    ai_analysis  = Column(JSONB)
    ai_model     = Column(String(100))
    analyzed_at  = Column(TIMESTAMP(timezone=True))
    is_private   = Column(Boolean, default=True)
