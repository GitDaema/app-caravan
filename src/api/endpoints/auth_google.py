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
    request = grequests.Request()
    info = None
    email = None
    # Attempt 1: Google OAuth ID token (GIS)
    try:
        audience = settings.GOOGLE_CLIENT_ID
        if audience:
            info = id_token.verify_oauth2_token(payload.idToken, request, audience)
        else:
            info = id_token.verify_oauth2_token(payload.idToken, request)
        if info.get("iss") not in ("https://accounts.google.com", "accounts.google.com"):
            raise ValueError("invalid_issuer")
        email = info.get("email")
    except Exception:
        info = None
    # Attempt 2: Firebase ID token (securetoken.google.com)
    if info is None and settings.FIREBASE_PROJECT_ID:
        try:
            # verify_firebase_token checks issuer and key set for securetoken
            info = id_token.verify_firebase_token(
                payload.idToken, request, audience=settings.FIREBASE_PROJECT_ID
            )
            # Firebase issuer format: https://securetoken.google.com/<project-id>
            iss = info.get("iss", "")
            expected_iss = f"https://securetoken.google.com/{settings.FIREBASE_PROJECT_ID}"
            if iss != expected_iss:
                raise ValueError("invalid_issuer")
            email = info.get("email")
        except Exception:
            info = None

    if info is None or not email:
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
        user={
            "id": user.id,
            "email": user.email,
            "name": user.full_name,
            "role": (user.role.value if hasattr(user.role, "value") else str(user.role)),
        },
    )
