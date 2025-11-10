from typing import List, Optional
from datetime import date

from sqlalchemy.orm import Session

from src.models.reservation import Reservation


class ReservationRepository:
    def __init__(self, db: Session):
        self.db = db

    def add(self, reservation: Reservation) -> Reservation:
        self.db.add(reservation)
        self.db.commit()
        self.db.refresh(reservation)
        return reservation

    def get_by_id(self, reservation_id: int) -> Optional[Reservation]:
        return (
            self.db.query(Reservation)
            .filter(Reservation.id == reservation_id)
            .first()
        )

    def list_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Reservation]:
        return (
            self.db.query(Reservation)
            .filter(Reservation.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_caravan_id(self, caravan_id: int) -> List[Reservation]:
        return (
            self.db.query(Reservation)
            .filter(Reservation.caravan_id == caravan_id)
            .all()
        )

    def find_overlaps(self, caravan_id: int, start_date: date, end_date: date) -> List[Reservation]:
        """Return reservations overlapping with the given interval [start_date, end_date)."""
        return (
            self.db.query(Reservation)
            .filter(Reservation.caravan_id == caravan_id)
            .filter(Reservation.start_date < end_date)
            .filter(Reservation.end_date > start_date)
            .all()
        )

