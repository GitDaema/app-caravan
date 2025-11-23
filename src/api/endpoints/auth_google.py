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
    """
    Google/Firebase ID 토큰을 검증하고, 필요 시 최초 로그인 사용자를 생성한 뒤
    애플리케이션용 액세스 토큰을 발급한다.

    검증 단계:
    1) GOOGLE_CLIENT_ID 가 설정된 경우: Google OAuth ID 토큰을 audience 포함해 검증한다.
    2) 실패하고 FIREBASE_PROJECT_ID 가 설정된 경우: Firebase ID 토큰으로 재검증한다.

    모든 검증이 실패하거나 이메일이 없으면 401 invalid_google_token 으로 응답한다.
    """
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

    # TODO: 향후 DI 컨테이너를 통해 UserRepository 를 주입받도록 개선한다.
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
