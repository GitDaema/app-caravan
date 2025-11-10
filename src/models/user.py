# src/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, Enum, Float
from sqlalchemy.orm import relationship
from src.database.session import Base
import enum

class UserRole(str, enum.Enum):
    GUEST = "guest"
    HOST = "host"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.GUEST)
    balance = Column(Float, nullable=False, default=0.0)
    
    caravans = relationship("Caravan", back_populates="host")
