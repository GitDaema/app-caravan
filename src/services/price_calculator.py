# src/services/price_calculator.py
from datetime import date

from src.exceptions.reservation_exceptions import ReservationError


class PriceCalculator:
    """가격 계산에 대한 책임을 담당하는 클래스"""

    def calculate(self, daily_rate: float, start_date: date, end_date: date) -> float:
        """
        예약 기간과 일일 요금을 기준으로 총가격을 계산합니다.
        """
        if start_date >= end_date:
            raise ValueError("시작일은 종료일보다 빨라야 합니다.")

        number_of_days = (end_date - start_date).days
        # 'start_date >= end_date' 체크가 number_of_days <= 0 인 경우를
        # 모두 포함하므로, 아래 중복 체크는 불필요합니다.
        # if number_of_days <= 0:
        #     raise ReservationError("예약은 최소 1일 이상이어야 합니다.")

        return daily_rate * number_of_days