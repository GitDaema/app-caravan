# src/api/deps.py
from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from src.core import security
from src.core.config import settings
from src.database.session import SessionLocal
from src.models import user as user_model
from src.schemas import token as token_schema
from src.repositories.user_repository import UserRepository
from src.services.user_service import UserService
from src.services.caravan_service import CaravanService
from src.services.reservation_service import ReservationService
from src.services.reservation_validator import ReservationValidator
from src.services.price_calculator import PriceCalculator
from src.repositories.reservation_repository import ReservationRepository
from src.repositories.caravan_repository import CaravanRepository

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)

def get_caravan_service(db: Session = Depends(get_db)) -> CaravanService:
    return CaravanService(db)

def get_reservation_service(db: Session = Depends(get_db)) -> ReservationService:
    reservation_repo = ReservationRepository(db)
    user_repo = UserRepository(db)
    caravan_repo = CaravanRepository(db)
    validator = ReservationValidator(reservation_repo)
    price_calc = PriceCalculator()
    return ReservationService(
        validator=validator,
        reservation_repository=reservation_repo,
        user_repository=user_repo,
        caravan_repository=caravan_repo,
        price_calculator=price_calc,
    )

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> user_model.User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = token_schema.TokenData(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user_repo = UserRepository(db)
    user = user_repo.get_user_by_email(email=token_data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_active_user(
    current_user: user_model.User = Depends(get_current_user),
) -> user_model.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
