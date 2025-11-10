# src/api/endpoints/caravans.py
from fastapi import APIRouter, Depends, HTTPException
from src.api import deps
from src.services.caravan_service import CaravanService
from src.schemas import caravan as caravan_schema
from src.models import user as user_model
from src.models.user import UserRole

router = APIRouter()

@router.post("/", response_model=caravan_schema.Caravan)
def create_caravan(
    *,
    caravan_service: CaravanService = Depends(deps.get_caravan_service),
    caravan_in: caravan_schema.CaravanCreate,
    current_user: user_model.User = Depends(deps.get_current_active_user),
):
    """
    Create new caravan. Only accessible to users with the 'host' role.
    """
    if current_user.role != UserRole.HOST:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to create a caravan. User must be a host.",
        )
    caravan = caravan_service.create_caravan(caravan_in=caravan_in, host=current_user)
    return caravan
