# src/api/endpoints/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.api import deps
from src.services.user_service import UserService
from src.exceptions.user_exceptions import UserAlreadyExistsError
from src.models import user as user_model
from src.schemas import user as user_schema
from pydantic import BaseModel
from src.models.user import UserRole

router = APIRouter()

@router.post("/", response_model=user_schema.User)
def create_user(
    *,
    user_service: UserService = Depends(deps.get_user_service),
    user_in: user_schema.UserCreate,
):
    """
    Create new user.
    """
    try:
        user = user_service.create_user(user_in=user_in)
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    return user

@router.get("/me", response_model=user_schema.User)
def read_user_me(
    current_user: user_model.User = Depends(deps.get_current_active_user),
):
    """
    Get current user.
    """
    return current_user


class TopUpRequest(BaseModel):
    amount: float


@router.post("/{user_id}/promote", response_model=user_schema.User, status_code=status.HTTP_200_OK)
def promote_to_host(
    *,
    user_id: int,
    current_user: user_model.User = Depends(deps.get_current_active_user),
    user_service: UserService = Depends(deps.get_user_service),
):
    """
    Promote a user to HOST. Admin only.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="admin_only")
    try:
        return user_service.promote_to_host(user_id)
    except ValueError as e:
        if str(e) == "user_not_found":
            raise HTTPException(status_code=404, detail="user_not_found")
        raise


@router.post("/{user_id}/topup", response_model=user_schema.User, status_code=status.HTTP_200_OK)
def top_up_balance(
    *,
    user_id: int,
    payload: TopUpRequest,
    current_user: user_model.User = Depends(deps.get_current_active_user),
    user_service: UserService = Depends(deps.get_user_service),
):
    """
    Top up user balance (dev/admin).
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="admin_only")
    try:
        return user_service.top_up(user_id, payload.amount)
    except ValueError as e:
        code = str(e)
        if code == "user_not_found":
            raise HTTPException(status_code=404, detail="user_not_found")
        if code == "amount_must_be_positive":
            raise HTTPException(status_code=400, detail=code)
        raise
