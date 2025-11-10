class ReservationError(Exception):
    """Base exception for reservation-related errors."""


class DuplicateReservationError(ReservationError):
    def __init__(self, message: str = "duplicate_reservation"):
        super().__init__(message)


class InsufficientFundsError(ReservationError):
    def __init__(self, message: str = "insufficient_funds"):
        super().__init__(message)


class UserNotFoundError(ReservationError):
    pass


class CaravanNotFoundError(ReservationError):
    pass

