Backend (FastAPI)
=================

FastAPI 기반의 카라반 공유·예약 API 서버입니다.  
유저 인증, 카라반/예약 도메인 로직, DB 연동, 테스트 스위트가 이 폴더와 `src/` 하위에 구현되어 있습니다.

---

## 1. 서버 개요

이 백엔드는 다음과 같은 책임을 가집니다.

- `/api/v1` 이하 RESTful API 제공 (인증, 유저, 카라반, 예약 등)
- JWT 기반 로그인 및 Google ID Token 기반 로그인 지원
- 카라반/예약/유저에 대한 도메인 규칙(중복 예약 방지, 잔액 차감/환불, 역할 기반 권한) 처리
- SQLite 또는 다른 관계형 DB(예: MariaDB)와의 연동
- Pytest 기반의 통합 테스트(주요 비즈니스 플로우 검증)

실제 FastAPI 애플리케이션 객체는 `src/main.py` 의 `app` 이며,  
배포/테스트 편의를 위해 `backend/app/main.py` 에서 이를 재노출합니다.

---

## 2. 로컬 개발 환경 설정 (Setup)

아래 단계는 **루트 디렉터리** (`app-caravan/`) 기준입니다.

1. 가상환경 생성 및 활성화
   - `python -m venv .venv`
   - (macOS/Linux) `source .venv/bin/activate`
   - (Windows) `.\.venv\Scripts\activate`
2. Python 의존성 설치
   - `pip install -r requirements.txt`
3. 환경 변수 설정 (선택)
   - 루트에 `.env` 파일을 두고 다음 값을 필요에 따라 override 합니다.
   - 기본값은 `src/core/config.py` 에 정의된 설정을 따릅니다.

### 주요 환경 변수

- `SECRET_KEY`  
  - JWT 서명에 사용되는 시크릿 키입니다. 기본값은 개발용으로 내장되어 있습니다.
- `DATABASE_URL`  
  - SQLAlchemy 연결 문자열입니다. 기본값은 `sqlite:///./caravan_booking.db` 입니다.
- `CORS_ORIGINS`  
  - CORS 허용 origin 목록(쉼표 구분 문자열). 기본값은 `"*"` (개발 편의 목적).
- `GOOGLE_CLIENT_ID` (선택)  
  - Google ID Token 검증 시 audience 로 사용되는 OAuth Client ID.
- `FIREBASE_PROJECT_ID` (선택)  
  - Firebase Authentication ID Token 검증 시 프로젝트 ID.

### 개발용 DB 초기화

테스트 및 로컬 개발 편의를 위해, SQLite DB를 초기화하고 예제 데이터를 넣는 스크립트를 제공합니다.

- `python initial_data.py`

이 스크립트는:

- 테이블을 드롭 후 재생성하고,
- 기본 관리자 계정(admin@example.com)과 선택적 데모 호스트/카라반 데이터를 생성합니다.

---

## 3. 실행 방법

### 개발 서버 실행

루트 디렉터리에서 다음 명령으로 FastAPI 개발 서버를 실행할 수 있습니다.

- `uvicorn backend.app.main:app --reload`

기본적으로:

- API 베이스 경로: `/api/v1`
- OpenAPI 문서: `/api/v1/openapi.json`

실행 포트(`--port`) 및 기타 Uvicorn 옵션은 필요에 따라 추가로 지정할 수 있습니다.

### 테스트 실행

백엔드 테스트는 `backend/tests/` 하위에 있으며, Pytest로 실행합니다.

- 전체 테스트: `pytest backend/tests -q`
- 커버리지 포함: `pytest --cov=src --cov-report=term-missing backend/tests`

테스트들은 FastAPI 앱과 실제 DB(SQlite, 초기화 스크립트 포함)를 함께 사용해 주요 비즈니스 플로우를 검증합니다.

---

## 4. 주요 기능 설명

백엔드 서버는 다음과 같은 핵심 기능을 제공합니다.

- **인증 및 권한**
  - 이메일/비밀번호 기반 로그인(JWT 발급)
  - Google ID Token 검증 기반 로그인
  - 역할 기반 권한(게스트/호스트/관리자)에 따라 API 접근 제어

- **유저/잔액 관리**
  - 유저 생성 및 중복 이메일 방지
  - 관리자에 의한 유저 승격(guest → host)
  - 잔액 충전/차감 및 예약 취소 시 환불 처리

- **카라반 관리**
  - 호스트에 의한 카라반 등록 및 조회
  - 위치/가격/수용 인원 기반 카라반 검색
  - 카라반별 예약 캘린더 조회(예약된 날짜 범위)

- **예약 도메인 로직**
  - 중복 예약 방지(시간 구간 겹침 검사)
  - 예약 생성 시 잔액 차감, 취소 시 환불
  - 예약 상태 전이 규칙 관리(PENDING/CONFIRMED/CANCELLED)
  - 호스트 및 관리자를 위한 예약 조회/상태 변경 엔드포인트

구체적인 아키텍처와 도메인 설계 의도는 루트의 `DESIGN.md` 에서 추가로 설명합니다.

