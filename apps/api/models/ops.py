from sqlalchemy import Column, String, Integer, Numeric, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.types import TIMESTAMP
from sqlalchemy.sql import func
import uuid
from database import Base


class ImportJob(Base):
    __tablename__ = "import_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    gym_id = Column(UUID(as_uuid=True), ForeignKey("gyms.id"))
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    source_system = Column(String(50))
    filename = Column(String(255))
    status = Column(String(20), default="pending")
    total_rows = Column(Integer, default=0)
    imported_rows = Column(Integer, default=0)
    failed_rows = Column(Integer, default=0)
    error_log = Column(JSONB, default=list)
    column_mapping = Column(JSONB, default=dict)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    completed_at = Column(TIMESTAMP(timezone=True))


class FinanceTransaction(Base):
    __tablename__ = "finance_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    gym_id = Column(UUID(as_uuid=True), ForeignKey("gyms.id"))
    type = Column(String(20), nullable=False)
    category = Column(String(50))
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="UZS")
    member_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    description = Column(Text)
    payment_method = Column(String(20), default="cash")
    recorded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    occurred_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    gym_id = Column(UUID(as_uuid=True), ForeignKey("gyms.id"))
    name = Column(String(255), nullable=False)
    category = Column(String(50))
    quantity = Column(Integer, default=0)
    unit = Column(String(20), default="dona")
    purchase_price = Column(Numeric(12, 2))
    notes = Column(Text)
    condition = Column(String(20), default="good")
    added_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
