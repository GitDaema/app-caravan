Backend (FastAPI)

로컬 실행
- 가상환경 활성화 후 의존성 설치: `pip install -r requirements.txt`
- DB 초기화(개발용 drop+create): `python initial_data.py`
- 서버 실행: `uvicorn backend.app.main:app --reload`

환경 변수
- `SECRET_KEY`: JWT 서명 키(미설정 시 기본값 사용)
- `DATABASE_URL`: 예) `sqlite:///./caravan_booking.db`

주요 엔드포인트
- `POST /api/v1/login/access-token` (폼 로그인)
- `POST /api/v1/auth/google/verify` (Google ID Token 검증 → JWT 발급)
- `POST /api/v1/users` (회원가입: role 포함 가능)
- `POST /api/v1/caravans` (호스트만)
- `GET/POST /api/v1/reservations`

테스트
- `pytest -q` (최소 스모크 테스트 제공)
