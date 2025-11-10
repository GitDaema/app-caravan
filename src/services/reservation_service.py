# src/services/reservation_service.py
from datetime import date
from typing import TYPE_CHECKING

from src.exceptions.reservation_exceptions import (
    DuplicateReservationError,
    InsufficientFundsError,
    ReservationError,
    UserNotFoundError,
    CaravanNotFoundError,
)
from src.models.reservation import Reservation

if TYPE_CHECKING:
    from src.repositories.caravan_repository import CaravanRepository
    from src.repositories.reservation_repository import ReservationRepository
    from src.repositories.user_repository import UserRepository
    from src.services.reservation_validator import ReservationValidator
    from src.services.price_calculator import PriceCalculator


class ReservationService:
    """
    예약 생성 프로세스를 조정(Orchestrate)하는 책임을 가집니다.
    - 엔티티 조회
    - 가격 계산 위임
    - 유효성 검사 위임
    - 예약 정보 저장 위임
    """

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
        """
        새로운 예약을 생성하고 저장합니다.

        :raises UserNotFoundError: 사용자를 찾을 수 없을 때
        :raises CaravanNotFoundError: 카라반을 찾을 수 없을 때
        :raises DuplicateReservationError: 날짜가 중복될 때
        :raises InsufficientFundsError: 잔액이 부족할 때
        :raises ReservationError: 그 외 예약 관련 에러 발생 시
        :return: 생성되고 저장된 Reservation 객체
        """
        try:
            # 1. 엔티티 조회
            user = self._user_repo.get_by_id(user_id)
            if not user:
                raise UserNotFoundError(f"사용자를 찾을 수 없습니다 (ID: {user_id}).")

            caravan = self._caravan_repo.get_by_id(caravan_id)
            if not caravan:
                raise CaravanNotFoundError(f"카라반을 찾을 수 없습니다 (ID: {caravan_id}).")

            # 2. 유효성 검사 (가용성)
            self._validator.validate_availability(caravan_id, start_date, end_date)

            # 3. 가격 계산 위임
            price = self._price_calculator.calculate(caravan.daily_rate, start_date, end_date)

            # 4. 유효성 검사 (지불)
            self._validator.validate_payment(user, price)

            # 5. 예약 객체 생성 (ID는 리포지토리에서 할당)
            new_reservation = Reservation(
                id=None,  # ID는 리포지토리에서 할당 예정
                user_id=user_id,
                caravan_id=caravan_id,
                start_date=start_date,
                end_date=end_date,
                price=price,
                status="confirmed",
            )

            # 6. 리포지토리에 저장 위임 및 최종 객체 반환
            saved_reservation = self._reservation_repo.add(new_reservation)
            return saved_reservation

        except (
            ValueError, # 날짜 순서 등
            UserNotFoundError,
            CaravanNotFoundError,
            DuplicateReservationError,
            InsufficientFundsError,
        ) as e:
            # 의미가 명확한 예외는 그대로 전달
            raise e
        except Exception as e:
            # 예측하지 못한 다른 모든 예외는 ReservationError로 래핑하여 추상화 수준을 유지
            raise ReservationError(f"예기치 않은 오류가 발생했습니다: {e}") from e