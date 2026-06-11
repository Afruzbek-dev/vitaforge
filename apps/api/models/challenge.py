from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import TIMESTAMP
from sqlalchemy.sql import func
import uuid
from database import Base
from .mixins import TimestampMixin

class Challenge(Base, TimestampMixin):
    __tablename__ = "challenges"
    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    gym_id       = Column(UUID(as_uuid=True), ForeignKey("gyms.id"))
    title        = Column(String(255), nullable=False)
    description  = Column(Text)
    type         = Column(String(50), default="individual")
    metric       = Column(String(50), default="points")
    target_value = Column(Integer, default=100)
    starts_at    = Column(TIMESTAMP(timezone=True), nullable=False)
    ends_at      = Column(TIMESTAMP(timezone=True), nullable=False)
    prize_desc   = Column(Text)
    bonus_points = Column(Integer, default=500)
    is_active    = Column(Boolean, default=True)

class ChallengeParticipant(Base):
    __tablename__ = "challenge_participants"
    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    challenge_id  = Column(UUID(as_uuid=True), ForeignKey("challenges.id"))
    member_id     = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    current_value = Column(Integer, default=0)
    rank          = Column(Integer)
    joined_at     = Column(TIMESTAMP(timezone=True), server_default=func.now())
    completed_at  = Column(TIMESTAMP(timezone=True))
