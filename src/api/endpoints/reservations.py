from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status

from src.api import deps
from src.services.reservation_service import ReservationService
from src.schemas import reservation as reservation_schema
from src.models import user as user_model
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

