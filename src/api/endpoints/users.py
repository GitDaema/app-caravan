# src/api/endpoints/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.api import deps
from src.crud import crud_user
from src.models import user as user_model
from src.schemas import user as user_schema

router = APIRouter()

@router.post("/", response_model=user_schema.User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: user_schema.UserCreate,
):
    """
    Create new user.
    """
    user = crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = crud_user.create_user(db, user_in=user_in)
    return user

@router.get("/me", response_model=user_schema.User)
def read_user_me(
    current_user: user_model.User = Depends(deps.get_current_active_user),
):
    """
    Get current user.
    """
    return current_user
