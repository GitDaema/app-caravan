# src/api/endpoints/caravans.py
from fastapi import APIRouter, Depends, HTTPException, Query
from src.api import deps
from src.services.caravan_service import CaravanService
from src.schemas import caravan as caravan_schema
from src.models import user as user_model
from src.models.user import UserRole
from sqlalchemy.orm import Session
from src.repositories.reservation_repository import ReservationRepository
from src.models.reservation import ReservationStatus
from pydantic import BaseModel
from datetime import date

router = APIRouter()

@router.post("/", response_model=caravan_schema.Caravan)
def create_caravan(
    *,
    caravan_service: CaravanService = Depends(deps.get_caravan_service),
    caravan_in: caravan_schema.CaravanCreate,
    current_user: user_model.User = Depends(deps.get_current_active_user),
):
    """
    Create new caravan. Only accessible to users with the 'host' role.
    """
    if current_user.role != UserRole.HOST:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to create a caravan. User must be a host.",
        )
    caravan = caravan_service.create_caravan(caravan_in=caravan_in, host=current_user)
    return caravan


@router.get("/", response_model=list[caravan_schema.Caravan])
def list_caravans(
    *,
    caravan_service: CaravanService = Depends(deps.get_caravan_service),
    location: str | None = Query(default=None),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    min_capacity: int | None = Query(default=None, ge=1),
    skip: int = 0,
    limit: int = 100,
):
    return caravan_service.list(
        location=location,
        min_price=min_price,
        max_price=max_price,
        min_capacity=min_capacity,
        skip=skip,
        limit=limit,
    )


@router.get("/{caravan_id}", response_model=caravan_schema.Caravan)
def get_caravan(
    *,
    caravan_id: int,
    caravan_service: CaravanService = Depends(deps.get_caravan_service),
):
    c = caravan_service.get(caravan_id)
    if not c:
        raise HTTPException(status_code=404, detail="caravan_not_found")
    return c


class CalendarRange(BaseModel):
    start: date
    end: date


class CaravanCalendarResponse(BaseModel):
    caravan_id: int
    ranges: list[CalendarRange]


@router.get("/{caravan_id}/calendar", response_model=CaravanCalendarResponse)
def get_caravan_calendar(
    *,
    caravan_id: int,
    db: Session = Depends(deps.get_db),
):
    repo = ReservationRepository(db)
    reservations = repo.get_by_caravan_id(caravan_id)
    if reservations is None:
        # get_by_caravan_id returns list; if caravan doesn't exist, still returns []
        reservations = []
    # Include ranges for non-cancelled reservations only, [start, end) semantics
    ranges = [
        {"start": r.start_date, "end": r.end_date}
        for r in reservations
        if r.status != ReservationStatus.CANCELLED
    ]
    return {"caravan_id": caravan_id, "ranges": ranges}
