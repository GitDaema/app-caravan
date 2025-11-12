from datetime import date
from typing import TYPE_CHECKING

from src.exceptions.reservation_exceptions import (
    DuplicateReservationError,
    InsufficientFundsError,
    ReservationError,
    UserNotFoundError,
    CaravanNotFoundError,
)
from src.models.reservation import Reservation, ReservationStatus

if TYPE_CHECKING:
    from src.repositories.caravan_repository import CaravanRepository
    from src.repositories.reservation_repository import ReservationRepository
    from src.repositories.user_repository import UserRepository
    from src.services.reservation_validator import ReservationValidator
    from src.services.price_calculator import PriceCalculator


class ReservationService:
    """예약 생성/변경 오케스트레이션 서비스 (트랜잭션 일관성 보장)"""

    def __init__(
        self,
        validator: "ReservationValidator",
        reservation_repository: "ReservationRepository",
        user_repository: "UserRepository",
        caravan_repository: "CaravanRepository",
        price_calculator: "PriceCalculator",
    ):
        self._validator = validator
        self._reservation_repo = reservation_repository
        self._user_repo = user_repository
        self._caravan_repo = caravan_repository
        self._price_calculator = price_calculator

    def create_reservation(
        self, user_id: int, caravan_id: int, start_date: date, end_date: date
    ) -> Reservation:
        try:
            user = self._user_repo.get_by_id(user_id)
            if not user:
                raise UserNotFoundError(f"사용자를 찾을 수 없습니다 (ID: {user_id}).")

            caravan = self._caravan_repo.get_by_id(caravan_id)
            if not caravan:
                raise CaravanNotFoundError(f"카라반을 찾을 수 없습니다 (ID: {caravan_id}).")

            # 가용성/가격/결제 가능 여부 검증 (읽기 전용)
            self._validator.validate_availability(caravan_id, start_date, end_date)
            price = self._price_calculator.calculate(
                caravan.price_per_day, start_date, end_date
            )
            self._validator.validate_payment(user, price)

            # 트랜잭션: 잔액 차감 + 예약 저장 원자화
            session = self._user_repo.db
            new_reservation = Reservation(
                id=None,
                user_id=user_id,
                caravan_id=caravan_id,
                start_date=start_date,
                end_date=end_date,
                price=price,
                status=ReservationStatus.CONFIRMED,
            )

            try:
                # 1) 잔액 차감(커밋 지연)
                self._user_repo.top_up(user_id, -float(price), commit=False)
                # 2) 예약 저장(커밋 지연)
                saved = self._reservation_repo.add(new_reservation, commit=False)
                session.flush()
                session.commit()
                return saved
            except Exception:
                session.rollback()
                raise

        except (
            ValueError,
            UserNotFoundError,
            CaravanNotFoundError,
            DuplicateReservationError,
            InsufficientFundsError,
        ) as e:
            raise e
        except Exception as e:
            raise ReservationError(f"예기치 않은 오류가 발생했습니다: {e}") from e

    def cancel_by_user(self, *, reservation_id: int, user_id: int) -> Reservation:
        r = self._reservation_repo.get_by_id(reservation_id)
        if not r:
            raise ValueError("reservation_not_found")
        if r.user_id != user_id:
            raise PermissionError("forbidden")
        session = self._user_repo.db
        try:
            if r.status != ReservationStatus.CANCELLED:
                # 환불
                self._user_repo.top_up(user_id, float(r.price), commit=False)
            updated = self._reservation_repo.update_status(
                reservation_id, ReservationStatus.CANCELLED, commit=False
            )
            session.flush()
            session.commit()
            return updated  # type: ignore
        except Exception:
            session.rollback()
            raise

    def update_status_by_host(
        self, *, reservation_id: int, host_id: int, status: ReservationStatus
    ) -> Reservation:
        r = self._reservation_repo.get_by_id(reservation_id)
        if not r:
            raise ValueError("reservation_not_found")
        caravan = self._caravan_repo.get_by_id(r.caravan_id)
        if not caravan:
            raise CaravanNotFoundError("caravan_not_found")
        if caravan.host_id != host_id:
            raise PermissionError("forbidden")
        session = self._user_repo.db
        try:
            updated = self._reservation_repo.update_status(
                reservation_id, status, commit=False
            )
            session.flush()
            session.commit()
            return updated  # type: ignore
        except Exception:
            session.rollback()
            raise
