from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import TIMESTAMP
from sqlalchemy.sql import func
import uuid
from database import Base

class Referral(Base):
    __tablename__ = "referrals"
    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    referrer_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    referred_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    gym_id         = Column(UUID(as_uuid=True), ForeignKey("gyms.id"))
    status         = Column(String(20), default="pending")
    referrer_bonus = Column(Integer, default=500)
    referred_bonus = Column(Integer, default=300)
    created_at     = Column(TIMESTAMP(timezone=True), server_default=func.now())
    rewarded_at    = Column(TIMESTAMP(timezone=True))
