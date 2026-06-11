from sqlalchemy import Column, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import TIMESTAMP
from sqlalchemy.sql import func
from database import Base

class NotificationPref(Base):
    __tablename__ = "notification_prefs"
    user_id          = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    streak_reminder  = Column(Boolean, default=True)
    weekly_plan      = Column(Boolean, default=True)
    challenge_update = Column(Boolean, default=True)
    weekly_report    = Column(Boolean, default=True)
    churn_alert      = Column(Boolean, default=True)
    friend_joined    = Column(Boolean, default=True)
    updated_at       = Column(TIMESTAMP(timezone=True), server_default=func.now())
