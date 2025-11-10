# src/schemas/caravan.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from src.models.caravan import CaravanStatus

# Shared properties
class CaravanBase(BaseModel):
    name: str
    description: Optional[str] = None
    capacity: int
    amenities: Optional[str] = None
    location: str
    price_per_day: float

# Properties to receive via API on creation
class CaravanCreate(CaravanBase):
    pass

# Properties to receive via API on update
class CaravanUpdate(CaravanBase):
    name: Optional[str] = None
    capacity: Optional[int] = None
    location: Optional[str] = None
    price_per_day: Optional[float] = None
    status: Optional[CaravanStatus] = None

# Properties shared by models stored in DB
class CaravanInDBBase(CaravanBase):
    id: int
    host_id: int
    status: CaravanStatus

    model_config = ConfigDict(from_attributes=True)

# Properties to return to client
class Caravan(CaravanInDBBase):
    pass
