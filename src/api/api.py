# src/api/api.py
from fastapi import APIRouter

from src.api.endpoints import login, users, caravans, reservations
from src.api.endpoints import auth_google

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(caravans.router, prefix="/caravans", tags=["caravans"])
api_router.include_router(reservations.router, prefix="/reservations", tags=["reservations"])
api_router.include_router(auth_google.router, prefix="/auth/google", tags=["auth"])
