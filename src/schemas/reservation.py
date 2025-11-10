from datetime import date
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict

from src.models.reservation import ReservationStatus


class ReservationBase(BaseModel):
    caravan_id: int
    start_date: date
    end_date: date


class ReservationCreate(ReservationBase):
    pass


class ReservationUpdate(BaseModel):
    status: Optional[ReservationStatus] = None


class ReservationInDBBase(ReservationBase):
    id: int
    user_id: int
    price: float
    status: ReservationStatus = Field(default=ReservationStatus.PENDING)

    model_config = ConfigDict(from_attributes=True)


class Reservation(ReservationInDBBase):
    pass
