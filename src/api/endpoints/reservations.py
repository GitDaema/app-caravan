from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from src.api import deps
from src.services.reservation_service import ReservationService
from src.schemas import reservation as reservation_schema
from src.models import user as user_model
from src.models.reservation import ReservationStatus
from src.models.user import UserRole
from src.exceptions.reservation_exceptions import (
    DuplicateReservationError,
    InsufficientFundsError,
    UserNotFoundError,
    CaravanNotFoundError,
    ReservationError,
)


router = APIRouter()


@router.get("/", response_model=list[reservation_schema.Reservation])
def list_my_reservations(
    *,
    reservation_service: ReservationService = Depends(deps.get_reservation_service),
    current_user: user_model.User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100,
):
    return reservation_service._reservation_repo.list_by_user(current_user.id, skip=skip, limit=limit)


@router.post("/", response_model=reservation_schema.Reservation, status_code=status.HTTP_201_CREATED)
def create_reservation(
    *,
    reservation_service: ReservationService = Depends(deps.get_reservation_service),
    current_user: user_model.User = Depends(deps.get_current_active_user),
    reservation_in: reservation_schema.ReservationCreate,
):
    try:
        created = reservation_service.create_reservation(
            user_id=current_user.id,
            caravan_id=reservation_in.caravan_id,
            start_date=reservation_in.start_date,
            end_date=reservation_in.end_date,
        )
        return created
    except DuplicateReservationError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="duplicate_reservation") from e
    except InsufficientFundsError as e:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="insufficient_funds") from e
    except UserNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except CaravanNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except ReservationError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="reservation_error") from e

@router.get("/all", response_model=list[reservation_schema.Reservation])
def list_all_reservations(
    *,
    reservation_service: ReservationService = Depends(deps.get_reservation_service),
    current_user: user_model.User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 200,
    user_id: int | None = None,
    caravan_id: int | None = None,
    status_q: ReservationStatus | None = None,
    host_id: int | None = None,
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="admin_only")
    return reservation_service._reservation_repo.list_all(
        skip=skip,
        limit=limit,
        user_id=user_id,
        caravan_id=caravan_id,
        status=(status_q.value if hasattr(status_q, 'value') and status_q else status_q),
        host_id=host_id,
    )

@router.get("/{reservation_id}", response_model=reservation_schema.Reservation)
def get_reservation(
    *,
    reservation_id: int,
    reservation_service: ReservationService = Depends(deps.get_reservation_service),
    current_user: user_model.User = Depends(deps.get_current_active_user),
):
    r = reservation_service._reservation_repo.get_by_id(reservation_id)
    if not r:
        raise HTTPException(status_code=404, detail="reservation_not_found")
    if r.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="forbidden")
    return r


@router.post("/{reservation_id}/cancel", response_model=reservation_schema.Reservation)
def cancel_reservation(
    *,
    reservation_id: int,
    reservation_service: ReservationService = Depends(deps.get_reservation_service),
    current_user: user_model.User = Depends(deps.get_current_active_user),
):
    try:
        return reservation_service.cancel_by_user(reservation_id=reservation_id, user_id=current_user.id)
    except ValueError as e:
        code = str(e)
        if code == "reservation_not_found":
            raise HTTPException(status_code=404, detail=code)
        raise
    except PermissionError:
        raise HTTPException(status_code=403, detail="forbidden")


class ReservationStatusUpdate(BaseModel):
    status: ReservationStatus


@router.post("/{reservation_id}/status", response_model=reservation_schema.Reservation)
def update_reservation_status(
    *,
    reservation_id: int,
    payload: ReservationStatusUpdate,
    reservation_service: ReservationService = Depends(deps.get_reservation_service),
    current_user: user_model.User = Depends(deps.get_current_active_user),
):
    if current_user.role.value != "host":
        raise HTTPException(status_code=403, detail="host_only")
    try:
        return reservation_service.update_status_by_host(
            reservation_id=reservation_id, host_id=current_user.id, status=payload.status
        )
    except ValueError as e:
        code = str(e)
        if code == "reservation_not_found":
            raise HTTPException(status_code=404, detail=code)
        raise
    except CaravanNotFoundError:
        raise HTTPException(status_code=404, detail="caravan_not_found")
    except PermissionError:
        raise HTTPException(status_code=403, detail="forbidden")
