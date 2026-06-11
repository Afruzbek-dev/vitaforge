from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import TIMESTAMP
from sqlalchemy.sql import func
import uuid
from database import Base

class Attendance(Base):
    __tablename__ = "attendance"
    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id       = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    gym_id          = Column(UUID(as_uuid=True), ForeignKey("gyms.id"))
    checked_in_at   = Column(TIMESTAMP(timezone=True), server_default=func.now())
    checked_out_at  = Column(TIMESTAMP(timezone=True))
    source          = Column(String(50), default="manual")  # manual|qr|app
