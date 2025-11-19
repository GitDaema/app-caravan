Backend (FastAPI – Legacy)
=================================

이 디렉터리는 **초기 설계 단계에서 사용했던 FastAPI 기반 백엔드**입니다.  
현재 실제 서비스/데모에서는 **`api/` 디렉터리의 Node.js + Express 백엔드**를 사용하며,
여기 코드는 **참고용(모델링/아이디어)** 으로만 유지합니다.

> 새 기능이나 버그 수정은 항상 `api/` 기준으로 작업하세요.  
> 이 디렉터리의 코드를 수정하거나 배포에 사용하지 않는 것이 기본 원칙입니다.

---

Local run (for reference only)
------------------------------

FastAPI 백엔드를 직접 실행해보고 싶을 때만 사용하세요.

- Create venv and install deps
  - `python -m venv .venv && source .venv/bin/activate`  
    (Windows: `.\.venv\Scripts\activate`)
  - `pip install -r requirements.txt`
- Initialize DB (drop+create dev)
  - `python initial_data.py`
- Start server
  - `uvicorn backend.app.main:app --reload`

Environment variables (legacy)
------------------------------

- `SECRET_KEY`: JWT signing secret (defaults for dev)
- `DATABASE_URL`: e.g. `sqlite:///./caravan_booking.db`
- `GOOGLE_CLIENT_ID`: Google ID Token 검증용 Client ID (선택)
- `FIREBASE_PROJECT_ID`: Firebase Authentication project ID (선택)

Key endpoints (legacy)
----------------------

이 엔드포인트들은 현재 프론트엔드에서 사용하지 않습니다. 개념 참고용입니다.

- `POST /api/v1/login/access-token` (local login → JWT)
- `POST /api/v1/auth/google/verify` (Google ID Token → JWT)
- `POST /api/v1/users` (signup; role optional)
- `POST /api/v1/caravans` (host only)
- `GET/POST /api/v1/reservations`
- `GET /api/v1/reservations/host` (host-only; reservations for caravans I own)
- `GET /api/v1/caravans/{caravan_id}/calendar` (ranges for calendar; [start,end))

Tests (legacy)
--------------

- `pytest -q`

