# ROLE
너는 멀티플랫폼(PC/모바일) 앱을 구현하는 풀스택 코딩 에이전트다. 출력은 “파일별 전체 코드 본문”만 포함하라. 설명/수다는 최소화하고, 각 코드 블록 첫 줄에 파일 경로 주석을 넣어라(예: `# web/src/main.tsx`). 한 번에 실행 가능한 구조를 생성하고, README에 로컬 실행/빌드 방법을 명시하라. 항상 한국어로 답변해라.

# GOAL
- 하나의 코드베이스로 PC와 모바일에서 모두 실행 가능한 앱을 만든다.
- 웹(PWA)로 동작하며, 모바일 빌드는 Capacitor로 래핑 가능하도록 한다. (데스크톱은 선택: Tauri 스캐폴드만 README에 옵션으로 안내)
- **구글 로그인**을 지원하고, 로그인 상태로 백엔드 API(예약 도메인) 호출이 가능하다.
- 단순하지만 현대적인 **UI/UX**(반응형, 접근성, 기본 컴포넌트 일관성)를 제공한다.

# STACK (정확히 이 스펙 사용)
## Frontend (Web/PWA, 모바일 래핑 베이스)
- Vite + React + TypeScript
- react-router-dom
- @tanstack/react-query (데이터 패칭/캐싱)
- Zustand (가벼운 전역 상태)
- Tailwind CSS + shadcn/ui + lucide-react
- Firebase Web SDK v10 (Google Auth Provider) — 브라우저에서 구글 로그인 처리
- Capacitor v6 (iOS/Android 래핑 준비: `@capacitor/core`, `@capacitor/cli`, `@capacitor/app`, `@capacitor/browser`)
- PWA: `vite-plugin-pwa`

## Backend (API)
- FastAPI (Python 3.11+)
- uvicorn
- python-jose[cryptography] (JWT 발급/검증)
- google-auth (구글 ID 토큰 검증용)
- pydantic
- httpx (선택: 외부 연동시)
- pytest (간단 테스트)

# AUTH FLOW (명확한 스펙)
1) 프론트엔드가 **Firebase Google Sign-In**으로 `idToken`(Google ID Token)을 획득한다.
2) 프론트엔드는 백엔드에 `POST /auth/google/verify` (JSON: `{ "idToken": "<string>" }`)를 보낸다.
3) 백엔드는 `google.oauth2.id_token.verify_oauth2_token`으로 ID 토큰을 검증하고, 내부 사용자 생성/조회 후 **서버 발급 JWT**(access_token, HS256) 반환.
4) 이후 프론트엔드는 `Authorization: Bearer <access_token>` 헤더로 예약(Reservation) API를 호출.

# API SPEC (정확히 이대로)
- `POST /auth/google/verify`
  - Req: `{ "idToken": "string" }`
  - Res: `{ "access_token": "string", "token_type": "bearer", "expires_in": 3600, "user": { "id": int, "email": "string", "name": "string" } }`
  - 400/401: 토큰 검증 실패

- `GET /me`
  - 헤더: `Authorization: Bearer <token>`
  - Res: 현재 사용자 프로필

- 예약(샘플 도메인; 최소 엔드투엔드 확인 목적)
  - `GET /reservations` (내 예약 목록)
  - `POST /reservations`
    - Req: `{ "caravan_id": int, "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" }`
    - Res: `Reservation` JSON (id, user_id, caravan_id, start_date, end_date, price, status)
  - 중복되면 409 with `{ "detail": "duplicate_reservation" }`, 잔액 부족은 402 with `{ "detail": "insufficient_funds" }`

# FRONTEND REQUIREMENTS (UI/UX)
- 페이지: `/`(홈/Landing), `/login`, `/app`(로그인 후 대시보드: “예약 만들기” 폼 + 리스트)
- 반응형 레이아웃(Grid/Card), 모바일 우선, 키보드 접근성 포커스 스타일, ARIA 라벨 기본 준수
- 헤더에 “로그인/로그아웃”, 프로필 아바타, 로딩/에러 상태 일관 표기(shadcn/ui `Toast`/`Alert`)
- 상태:
  - `useAuthStore`(Zustand): `{ user, accessToken, signInWithGoogle(), signOut() }`
  - React Query: `useQuery('me')`, `useQuery('reservations')`, `useMutation('createReservation')`
- 환경변수:
  - Frontend `.env`: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_API_BASE_URL`
- PWA: 기본 manifest, service worker 등록

# BACKEND REQUIREMENTS
- `.env` 예시: `GOOGLE_CLIENT_ID`, `JWT_SECRET`, `JWT_EXPIRES_SECONDS=3600`, `CORS_ORIGINS=*`(개발용)
- 모듈:
  - `auth.py`: Google ID 토큰 검증 → 내부 JWT 발급
  - `deps.py`: 인증 디펜던시(헤더에서 Bearer 추출→검증)
  - `models.py`: In-memory User/Reservation (또는 Pydantic 모델)
  - `routes_auth.py`, `routes_reservations.py`
  - CORS 허용(FastAPI `CORSMiddleware`) — 개발 편의

# FILE TREE (생성)
web/
  index.html
  vite.config.ts
  package.json
  tsconfig.json
  tailwind.config.js
  postcss.config.js
  src/
    main.tsx
    App.tsx
    routes/
      Landing.tsx
      Login.tsx
      Dashboard.tsx
    components/
      Header.tsx
      ReservationForm.tsx
      ReservationList.tsx
    lib/
      firebase.ts
      api.ts
      queryClient.ts
    store/
      auth.ts
    styles/
      globals.css
    shadcn-components/*   # 자동 생성/사용 가정
    pwa.ts                # PWA 등록
backend/
  app/
    main.py
    auth.py
    deps.py
    routes_auth.py
    routes_reservations.py
    models.py
    schema.py
    settings.py
  tests/
    test_auth.py
    test_reservations_smoke.py
  pyproject.toml
  README.md
capacitor/               # 초기화 스크립트/README에서 안내만. 실제 생성 커맨드 포함.

# OUTPUT FORMAT
- 각 파일을 **별도 코드 블록**으로 출력. (파일 경로 주석 필수)
- `web/README.md`와 `backend/README.md`를 포함하여 로컬 실행 방법, ENV 설정, PWA/Capacitor 빌드 지침을 서술.
- 테스트: `backend/tests/*`는 `pytest -q`로 통과 가능한 최소 스모크 제공.

# ACCEPTANCE CRITERIA
- 로컬에서:
  1) 백엔드 `uvicorn app.main:app --reload` 실행.
  2) 프론트엔드 `npm run dev` 실행.
  3) `/login`에서 “Google로 로그인” → 동의 후 `/app`으로 이동.
  4) `/app`에서 예약 생성 폼 제출 시, 토큰 포함 API 호출로 예약 생성/조회 가능.
- PWA는 설치 가능(manifest/service worker 동작), 모바일 디바이스에서도 반응형으로 정상 사용 가능.
- Capacitor: `npx cap init`/`npx cap add ios|android`/`npx cap copy`/`npx cap open ios|android` 사용 지침을 README에 제공.
- 코드 스타일: 타입 안정성, 접근성, 에러 상태/로딩 상태 표준화.

# REPRESENTATIVE EXAMPLE (권위 톤 예시: 백엔드 구글 검증 엔드포인트)
```python
# backend/app/auth.py
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from fastapi import HTTPException, status
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
from jose import jwt

from .settings import settings

def verify_google_id_token(id_token_str: str) -> Dict[str, Any]:
    try:
        info = id_token.verify_oauth2_token(
            id_token_str, grequests.Request(), settings.GOOGLE_CLIENT_ID
        )
        if info.get("iss") not in ("https://accounts.google.com", "accounts.google.com"):
            raise ValueError("Invalid issuer")
        if not info.get("email"):
            raise ValueError("Email required")
        return {
            "sub": info["sub"],
            "email": info["email"],
            "name": info.get("name", ""),
            "picture": info.get("picture", ""),
        }
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_google_token")

def create_access_token(user_id: int, email: str) -> str:
    now = datetime.utcnow()
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=settings.JWT_EXPIRES_SECONDS)).timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

START
위 스펙을 충족하는 전체 코드를 “파일별 코드 블록”으로 출력하라. 프런트엔드/백엔드 각각 README에 실행 방법과 ENV 샘플을 포함하라. 테스트 코드는 백엔드에 최소 2개 스모크를 제공하라.