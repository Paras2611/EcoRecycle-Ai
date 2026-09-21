import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="USER")
    created_at = Column(DateTime, default=utc_now)

    analyses = relationship("WasteAnalysis", back_populates="user")


class WasteAnalysis(Base):
    __tablename__ = "waste_analysis"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area_name = Column(String(255), nullable=False)
    radius_km = Column(Float, default=10.0)
    total_items = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="analyses")
    results = relationship("WasteResult", back_populates="analysis", cascade="all, delete-orphan")


class WasteResult(Base):
    __tablename__ = "waste_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("waste_analysis.id"), nullable=False)
    waste_type = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    detected_object = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    analysis = relationship("WasteAnalysis", back_populates="results")


class RecyclingFacility(Base):
    __tablename__ = "recycling_facilities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact = Column(String(100), nullable=True)
    capacity_tpd = Column(Float, nullable=False)  # Tons per day
    status = Column(String(50), default="OPERATIONAL")
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    waste_types = relationship("FacilityWasteType", back_populates="facility", cascade="all, delete-orphan")


class FacilityWasteType(Base):
    __tablename__ = "facility_waste_types"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    facility_id = Column(String(36), ForeignKey("recycling_facilities.id"), nullable=False)
    waste_type = Column(String(100), nullable=False)
    processing_method = Column(String(255), nullable=False)

    facility = relationship("RecyclingFacility", back_populates="waste_types")
