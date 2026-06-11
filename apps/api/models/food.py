from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.types import TIMESTAMP
from sqlalchemy.sql import func
import uuid
from database import Base
from .mixins import TimestampMixin

class FoodLog(Base, TimestampMixin):
    __tablename__ = "food_logs"
    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id   = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    logged_at   = Column(TIMESTAMP(timezone=True), server_default=func.now())
    meal_type   = Column(String(20))      # breakfast|lunch|dinner|snack
    food_name   = Column(String(255), nullable=False)
    quantity_g  = Column(Numeric(7, 1))
    calories    = Column(Numeric(7, 1))
    protein_g   = Column(Numeric(6, 1))
    carbs_g     = Column(Numeric(6, 1))
    fat_g       = Column(Numeric(6, 1))
    is_uzbek    = Column(Boolean, default=False)
    raw_input   = Column(Text)
    ai_parsed   = Column(Boolean, default=False)

class UzbekFood(Base, TimestampMixin):
    __tablename__ = "uzbek_foods"
    id                = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name_uz           = Column(String(255), nullable=False)
    name_ru           = Column(String(255))
    name_en           = Column(String(255))
    category          = Column(String(100))
    calories_per_100g = Column(Numeric(6, 1))
    protein_g         = Column(Numeric(5, 1))
    carbs_g           = Column(Numeric(5, 1))
    fat_g             = Column(Numeric(5, 1))
    serving_size_g    = Column(Numeric(6, 1))
    aliases           = Column(ARRAY(String))
    verified          = Column(Boolean, default=False)
