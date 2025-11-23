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
    """
    현재 로그인한 사용자의 예약 목록을 페이징하여 반환한다.
    실제 조회는 ReservationService.list_user_reservations 에 위임된다.
    """
    return reservation_service.list_user_reservations(current_user.id, skip=skip, limit=limit)


@router.get("/host", response_model=list[reservation_schema.Reservation])
def list_host_reservations(
    *,
    reservation_service: ReservationService = Depends(deps.get_reservation_service),
    current_user: user_model.User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 200,
):
    """
    호스트가 자신의 카라반들에 대한 예약 목록을 조회하는 엔드포인트.
    HOST 가 아닌 경우 403 host_only 를 반환한다.
    """
    if current_user.role != UserRole.HOST:
        raise HTTPException(status_code=403, detail="host_only")
    return reservation_service.list_host_reservations(
        host_id=current_user.id,
        skip=skip,
        limit=limit,
    )


@router.post("/", response_model=reservation_schema.Reservation, status_code=status.HTTP_201_CREATED)
def create_reservation(
    *,
    reservation_service: ReservationService = Depends(deps.get_reservation_service),
    current_user: user_model.User = Depends(deps.get_current_active_user),
    reservation_in: reservation_schema.ReservationCreate,
):
    """
    현재 로그인한 사용자를 예약 주체로 하여 카라반 예약을 생성한다.
    도메인 예외를 HTTP 상태 코드(400/402/404/409/500)로 매핑한다.
    """
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
    """
    ADMIN 이 전체 예약 목록을 필터 조건(사용자/카라반/상태/호스트)과 함께 조회한다.
    ADMIN 이 아닌 사용자는 403 admin_only 로 거부된다.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="admin_only")
    return reservation_service.list_all_reservations(
        skip=skip,
        limit=limit,
        user_id=user_id,
        caravan_id=caravan_id,
        status=(status_q.value if hasattr(status_q, "value") and status_q else status_q),
        host_id=host_id,
    )

@router.get("/{reservation_id}", response_model=reservation_schema.Reservation)
def get_reservation(
    *,
    reservation_id: int,
    reservation_service: ReservationService = Depends(deps.get_reservation_service),
    current_user: user_model.User = Depends(deps.get_current_active_user),
):
    """
    단일 예약 상세를 조회한다.
    - 예약이 없으면 404 reservation_not_found
    - 다른 사용자의 예약이면 403 forbidden
    """
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
    """
    예약을 사용자가 직접 취소하는 엔드포인트.
    ReservationService.cancel_by_user 에서 발생한 도메인 오류를 HTTP 상태 코드로 변환한다.
    """
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
    """
    호스트가 예약 상태를 변경하는 엔드포인트.

    - host 권한이 아닌 사용자는 403 host_only
    - 예약/카라반 미존재, 권한 없음, 잘못된 상태 전이는 ReservationService 예외를
      404/403/409/400 으로 매핑한다.
    """
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
        if code == "cannot_update_cancelled":
            raise HTTPException(status_code=409, detail=code)
        if code == "invalid_transition":
            raise HTTPException(status_code=400, detail=code)
        raise
    except CaravanNotFoundError:
        raise HTTPException(status_code=404, detail="caravan_not_found")
    except PermissionError:
        raise HTTPException(status_code=403, detail="forbidden")
