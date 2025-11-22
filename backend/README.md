Backend (FastAPI – Legacy)
==========================

이 디렉터리는 과제 초기에 사용하던 **FastAPI 기반 백엔드**입니다.  
현재 실제 실행/배포에 사용되는 백엔드는 **`api/` 디렉터리의 Node.js + Express + Prisma 구현**이며,  
여기 코드는 **모델/비즈니스 규칙을 참고하는 레거시 코드**로만 남겨두었습니다.

> 새로운 기능 추가나 버그 수정, 리뷰/메시지 같은 최신 기능 구현은  
> 항상 `api/` 기준으로 작업해 주세요.
>
> `backend/` 코드를 수정하거나 배포에 사용하는 것은 지양하는 것이 기본 원칙입니다.  
> 전체 아키텍처 및 최신 흐름은 루트의 `GEMINI.md` 와 `docs/QUICKSTART.md` 를 참고하세요.

---

Local run (legacy, 참고용)
-------------------------

FastAPI 백엔드를 직접 돌려 보고 싶을 때만 사용합니다.

1. 가상환경 및 의존성 설치
   - `python -m venv .venv`
   - (macOS/Linux) `source .venv/bin/activate`
   - (Windows) `.\.venv\Scripts\activate`
   - `pip install -r requirements.txt`
2. 개발용 DB 초기화 (SQLite)
   - `python initial_data.py`
3. 서버 실행
   - `uvicorn backend.app.main:app --reload`

Environment variables (legacy)
------------------------------

- `SECRET_KEY`  
  - JWT 서명용 시크릿 (개발 기본값 존재)
- `DATABASE_URL`  
  - 예: `sqlite:///./caravan_booking.db`
- (선택) `GOOGLE_CLIENT_ID`  
  - Google ID Token 검증용 Client ID
- (선택) `FIREBASE_PROJECT_ID`  
  - Firebase Authentication project ID

Key endpoints (legacy)
----------------------

이 엔드포인트들은 현재 React 프론트엔드에서는 사용하지 않으며,  
개념/모델링 참고용으로만 남겨두었습니다.

- `POST /api/v1/login/access-token` – 로컬 로그인(JWT)
- `POST /api/v1/auth/google/verify` – Google ID Token → JWT
- `POST /api/v1/users` – 회원 가입 (role 옵션)
- `POST /api/v1/caravans` – 카라반 등록 (host 전용)
- `GET/POST /api/v1/reservations` – 예약 생성/조회
- `GET /api/v1/reservations/host` – 내가 소유한 카라반의 예약 조회
- `GET /api/v1/caravans/{caravan_id}/calendar` – 카라반별 예약 캘린더 구간 조회

Tests (legacy)
--------------

- `pytest -q`

