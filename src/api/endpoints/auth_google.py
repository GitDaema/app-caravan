from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from google.oauth2 import id_token
from google.auth.transport import requests as grequests

from src.api import deps
from src.core.config import settings
from src.core import security
from src.repositories.user_repository import UserRepository
from src.schemas.user import UserCreate
from src.models.user import UserRole


class GoogleVerifyRequest(BaseModel):
    idToken: str


class GoogleVerifyResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


router = APIRouter()


@router.post("/verify", response_model=GoogleVerifyResponse)
def verify_google_id_token(
    payload: GoogleVerifyRequest,
    db: Session = Depends(deps.get_db),
):
    try:
        info = id_token.verify_oauth2_token(
            payload.idToken, grequests.Request(), settings.SECRET_KEY  # NOTE: replace with GOOGLE_CLIENT_ID when available
        )
        if info.get("iss") not in ("https://accounts.google.com", "accounts.google.com"):
            raise ValueError("invalid_issuer")
        email = info.get("email")
        if not email:
            raise ValueError("email_required")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_google_token")

    user_repo = UserRepository(db)
    user = user_repo.get_user_by_email(email=email)

    if not user:
        # 최초 로그인 사용자는 게스트로 생성
        user = user_repo.create_user(
            user_in=UserCreate(email=email, password="oauth", full_name=info.get("name", ""), role=UserRole.GUEST)
        )

    token = security.create_access_token(user.email)
    return GoogleVerifyResponse(
        access_token=token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={"id": user.id, "email": user.email, "name": user.full_name},
    )

