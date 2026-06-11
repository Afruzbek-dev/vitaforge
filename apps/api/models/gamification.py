from sqlalchemy import Column, Integer, SmallInteger, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.types import String, TIMESTAMP
from sqlalchemy.orm import relationship
import uuid
from database import Base

class MemberStreak(Base):
    __tablename__ = "member_streaks"
    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id      = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    current_streak = Column(SmallInteger, default=0)
    longest_streak = Column(SmallInteger, default=0)
    last_activity  = Column(Date)
    total_points   = Column(Integer, default=0)
    badges         = Column(ARRAY(String), default=[])
    updated_at     = Column(TIMESTAMP(timezone=True))
    user           = relationship("User", back_populates="streak")
