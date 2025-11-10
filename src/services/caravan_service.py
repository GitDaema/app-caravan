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
