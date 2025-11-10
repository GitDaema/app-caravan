# src/api/endpoints/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.api import deps
from src.services.user_service import UserService
from src.exceptions.user_exceptions import UserAlreadyExistsError
from src.models import user as user_model
from src.schemas import user as user_schema

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
