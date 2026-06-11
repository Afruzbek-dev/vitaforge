from sqlalchemy import Column, String, Boolean, ForeignKey, SmallInteger, Date, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from database import Base
from .mixins import TimestampMixin

class FitnessPlan(Base, TimestampMixin):
    __tablename__ = "fitness_plans"
    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id           = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    trainer_id          = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    generated_by        = Column(String(20), default="ai")   # ai|trainer|hybrid
    week_number         = Column(SmallInteger, nullable=False)
    starts_at           = Column(Date, nullable=False)
    ends_at             = Column(Date, nullable=False)
    workouts            = Column(JSONB, nullable=False)
    nutrition           = Column(JSONB, nullable=False)
    ai_model            = Column(String(100))
    ai_prompt_version   = Column(String(20))
    notes               = Column(Text)
    is_active           = Column(Boolean, default=True)
