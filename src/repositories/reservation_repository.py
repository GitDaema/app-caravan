from typing import List, Optional
from datetime import date

from sqlalchemy.orm import Session
from sqlalchemy import select

from src.models.reservation import Reservation
from src.models.caravan import Caravan


class ReservationRepository:
    def __init__(self, db: Session):
        self.db = db

    def add(self, reservation: Reservation, *, commit: bool = True) -> Reservation:
        self.db.add(reservation)
        if commit:
            self.db.commit()
            self.db.refresh(reservation)
        else:
            self.db.flush()
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

    def list_all(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        user_id: int | None = None,
        caravan_id: int | None = None,
        status: str | None = None,
        host_id: int | None = None,
    ) -> List[Reservation]:
        q = self.db.query(Reservation)
        if user_id is not None:
            q = q.filter(Reservation.user_id == user_id)
        if caravan_id is not None:
            q = q.filter(Reservation.caravan_id == caravan_id)
        if status is not None:
            q = q.filter(Reservation.status == status)
        if host_id is not None:
            q = q.join(Caravan, Caravan.id == Reservation.caravan_id).filter(Caravan.host_id == host_id)
        return q.offset(skip).limit(limit).all()

    def update_status(self, reservation_id: int, new_status: str, *, commit: bool = True) -> Optional[Reservation]:
        r = self.get_by_id(reservation_id)
        if not r:
            return None
        r.status = new_status
        self.db.add(r)
        if commit:
            self.db.commit()
            self.db.refresh(r)
        else:
            self.db.flush()
        return r
