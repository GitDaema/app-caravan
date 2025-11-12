# src/repositories/caravan_repository.py
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional

from src.models.caravan import Caravan
from src.schemas.caravan import CaravanCreate, CaravanUpdate


class CaravanRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, caravan_id: int) -> Optional[Caravan]:
        return self.get(caravan_id)

    def get(self, caravan_id: int) -> Optional[Caravan]:
        return self.db.query(Caravan).filter(Caravan.id == caravan_id).first()

    def get_multi(self, skip: int = 0, limit: int = 100) -> List[Caravan]:
        return self.db.query(Caravan).offset(skip).limit(limit).all()

    def search(
        self,
        *,
        location: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_capacity: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Caravan]:
        q = self.db.query(Caravan)
        if location:
            q = q.filter(Caravan.location.ilike(f"%{location}%"))
        if min_price is not None:
            q = q.filter(Caravan.price_per_day >= min_price)
        if max_price is not None:
            q = q.filter(Caravan.price_per_day <= max_price)
        if min_capacity is not None:
            q = q.filter(Caravan.capacity >= min_capacity)
        return q.offset(skip).limit(limit).all()

    def create(self, *, caravan_in: CaravanCreate, host_id: int) -> Caravan:
        db_caravan = Caravan(**caravan_in.model_dump(), host_id=host_id)
        self.db.add(db_caravan)
        self.db.commit()
        self.db.refresh(db_caravan)
        return db_caravan

    def update(self, *, db_caravan: Caravan, caravan_in: CaravanUpdate) -> Caravan:
        update_data = caravan_in.model_dump(exclude_unset=True)
        for field in update_data:
            setattr(db_caravan, field, update_data[field])
        self.db.add(db_caravan)
        self.db.commit()
        self.db.refresh(db_caravan)
        return db_caravan

    def remove(self, *, caravan_id: int) -> Caravan:
        db_caravan = self.db.query(Caravan).get(caravan_id)
        self.db.delete(db_caravan)
        self.db.commit()
        return db_caravan
