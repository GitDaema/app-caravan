# src/models/caravan.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from src.database.session import Base
import enum

class CaravanStatus(str, enum.Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    MAINTENANCE = "maintenance"

class Caravan(Base):
    __tablename__ = "caravans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    capacity = Column(Integer, nullable=False)
    amenities = Column(String)  # Simple string for now, could be a JSON or related table
    location = Column(String, nullable=False)
    price_per_day = Column(Float, nullable=False)
    status = Column(Enum(CaravanStatus), nullable=False, default=CaravanStatus.AVAILABLE)
    
    host_id = Column(Integer, ForeignKey("users.id"))
    host = relationship("User", back_populates="caravans")
