# src/services/reservation_validator.py
from datetime import date
from typing import TYPE_CHECKING

from src.exceptions.reservation_exceptions import (
    DuplicateReservationError,
    InsufficientFundsError,
)
from src.models.user import User

if TYPE_CHECKING:
    from src.repositories.reservation_repository import ReservationRepository


class ReservationValidator:
    def __init__(self, reservation_repository: "ReservationRepository"):
        self._reservation_repository = reservation_repository

    def validate_availability(
        self, caravan_id: int, start_date: date, end_date: date
    ) -> None:
        """
        특정 카라반에 대해 예약 가능한 날짜인지 검증합니다.
        [start_date, end_date) 구간을 기준으로 겹치는 예약이 있는지 확인합니다.

        성능 노트(Performance Note):
        현재 구현은 특정 카라반의 모든 예약을 가져와 순회하는 방식(O(n))입니다.
        예약 데이터가 매우 많아질 경우 성능 저하가 발생할 수 있습니다.
        대규모 시스템에서는 데이터베이스 쿼리 최적화(인덱싱)나,
        메모리 내에서 처리해야 할 경우 인터벌 트리(Interval Tree)와 같은
        자료구조를 사용하여 O(log n + k) 시간 복잡도로 개선할 수 있습니다.
        """
        if start_date >= end_date:
            raise ValueError("start_date must be before end_date")

        reservations = self._reservation_repository.get_by_caravan_id(caravan_id)
        for r in reservations:
            # 겹침 조건: (start_date < r.end_date) and (end_date > r.start_date)
            if start_date < r.end_date and end_date > r.start_date:
                raise DuplicateReservationError(
                    f"Caravan {caravan_id} is already booked for the selected dates."
                )

    def validate_payment(self, user: User, price: float) -> None:
        """
        사용자가 해당 금액을 지불할 충분한 잔액을 가지고 있는지 검증합니다.
        """
        if user.balance < price:
            raise InsufficientFundsError(
                f"User {user.id} has insufficient funds. "
                f"Required: {price}, Available: {user.balance}"
            )