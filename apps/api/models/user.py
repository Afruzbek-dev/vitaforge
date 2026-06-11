from sqlalchemy import Column, String, Boolean, ForeignKey, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base
from .mixins import TimestampMixin

class Gym(Base, TimestampMixin):
    __tablename__ = "gyms"
    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name        = Column(String(255), nullable=False)
    slug        = Column(String(100), unique=True, nullable=False)
    owner_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    city        = Column(String(100))
    plan        = Column(String(50), default="pilot")  # pilot|basic|pro
    is_active   = Column(Boolean, default=True)
    members     = relationship("User", back_populates="gym", foreign_keys="User.gym_id")

class User(Base, TimestampMixin):
    __tablename__ = "users"
    id          = Column(UUID(as_uuid=True), primary_key=True)  # Supabase auth.users id
    gym_id      = Column(UUID(as_uuid=True), ForeignKey("gyms.id"))
    role        = Column(String(50), nullable=False)  # gym_owner|trainer|member|admin
    full_name   = Column(String(255))
    phone       = Column(String(20))
    telegram_id = Column(BigInteger, unique=True)
    avatar_url  = Column(String(500))
    is_active   = Column(Boolean, default=True)
    gym         = relationship("Gym", back_populates="members", foreign_keys=[gym_id])
    profile     = relationship("MemberProfile", back_populates="user", uselist=False)
    streak      = relationship("MemberStreak", back_populates="user", uselist=False)

class MemberProfile(Base, TimestampMixin):
    __tablename__ = "member_profiles"
    id                   = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id              = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    age                  = Column(String(3))
    gender               = Column(String(10))  # male|female|other
    height_cm            = Column(String(6))
    weight_kg            = Column(String(6))
    goal                 = Column(String(50))  # weight_loss|muscle_gain|endurance|health
    activity_level       = Column(String(50))  # sedentary|light|moderate|active|very_active
    dietary_restrictions = Column(String(500), default="")
    medical_notes        = Column(String(1000))
    onboarding_done      = Column(Boolean, default=False)
    user                 = relationship("User", back_populates="profile")
