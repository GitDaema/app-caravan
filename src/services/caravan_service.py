# src/services/caravan_service.py
from sqlalchemy.orm import Session
from src.repositories.caravan_repository import CaravanRepository
from src.schemas.caravan import CaravanCreate
from src.models.caravan import Caravan
from src.models.user import User

class CaravanService:
    def __init__(self, db: Session):
        self.caravan_repo = CaravanRepository(db)

    def create_caravan(self, *, caravan_in: CaravanCreate, host: User) -> Caravan:
        """
        Create a new caravan.
        - A user can only create a caravan if they are a host.
        """
        # This is a placeholder for business logic that should be implemented.
        # For example, checking if the user is a host.
        # if host.role != UserRole.HOST:
        #     raise SomeException("User is not a host")
        
        return self.caravan_repo.create(caravan_in=caravan_in, host_id=host.id)

    def get(self, caravan_id: int) -> Caravan | None:
        return self.caravan_repo.get_by_id(caravan_id)

    def list(
        self,
        *,
        location: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        min_capacity: int | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Caravan]:
        return self.caravan_repo.search(
            location=location,
            min_price=min_price,
            max_price=max_price,
            min_capacity=min_capacity,
            skip=skip,
            limit=limit,
        )
