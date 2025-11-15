# 프로젝트 개발 일지

- 개발 참고: 초기 Gemini CLI를 이용할 계획이었으나 일부 개발 사항의 안정성 확보가 어려워, 보다 안정적인 Codex 기반으로 개발 방식을 전환하여 진행한다.

## 프로젝트 개요
- 프로젝트명: CaravanShare (app-caravan)
- 목표: FastAPI 기반 예약 도메인 API와 Vite+React PWA를 통합한 멀티플랫폼(웹/PWA, 모바일 래핑 가능) 카라반 공유 앱 MVP 구축 — 폼 로그인과 Google 로그인(토큰 교환) 지원, 기본 예약 흐름 작동, 간단한 관리자/호스트 권한 시나리오 제공
- 범위: 서버(FastAPI + SQLite/SQLAlchemy) · 웹(PWA, React Router, TanStack Query, Zustand) · 개발/테스트 스크립트(Windows 우선) · 최소 스모크 테스트(pytest)

---

### Day 1 - 환경 세팅 및 백엔드 도메인/API 골격 구현

#### AI 개발 프롬프트

Gemini CLI 작업이 중단되었어. 이어서 부탁할게. `@GEMINI.md`의 메인 프롬프트를 받아서, `@GOAL.md`의 구체적 목표 및 평가 기준을 토대로 '카라반 공유 플랫폼 PC + 모바일 앱'을 이어서 제작해줘.

---

* `codebase_investigator` 분석을 완료했습니다. 현재 코드는 FastAPI 기반이며 기본적인 구조를 갖추고 있지만, `GOAL.md`의 요구사항인 클래스 기반 리포지토리 패턴, 서비스 계층, 그리고 핵심 도메인 모델(Caravan, Reservation 등)이 누락되었습니다.

* **계획은 다음과 같습니다:**
    1.  `crud_user.py`를 클래스 기반 `UserRepository`로 리팩토링합니다.
    2.  비즈니스 로직을 분리하기 위해 `UserService`를 생성합니다.
    3.  `users.py` 엔드포인트가 새로운 `UserService`를 사용하도록 수정합니다.
    4.  `Caravan` 도메인을 모델, 스키마, CRUD, API 엔드포인트 순으로 구현합니다.
    5.  새로운 `caravans` 라우터를 `api.py`에 추가합니다.
    6.  `tests` 디렉토리를 만들고 초기 테스트를 추가합니다.

---

* 먼저 `crud_user.py` 리팩토링부터 시작하겠습니다. 파일 내용을 확인합니다.
* `crud_user.py` 내용을 확인했습니다. 이제 클래스 기반 리포지토리로 리팩토링하겠습니다. `src/repositories/user_repository.py` 파일을 생성하고 로직을 옮긴 후, `src/repositories` 디렉토리와 `__init__.py` 파일을 생성하겠습니다. 디렉토리부터 만들겠습니다.
* `repositories` 디렉토리를 만들었으니, 이제 그 안에 `__init__.py` 파일을 생성하겠습니다.
* 이제 `user_repository.py` 파일을 만들고 클래스 기반의 리포지토리 구현을 작성하겠습니다.
* `UserRepository`를 만들었으니, 이제 비즈니스 로직을 담을 `UserService`를 만들겠습니다. 먼저 `src/services` 디렉토리가 없으면 만들고, 그 안에 `__init__.py` 파일을 생성하겠습니다. `codebase_investigator`는 비어 있다고 했지만, 확인차 진행합니다.
* `services` 디렉토리가 이미 있으니, 그 안에 `user_service.py`와 `__init__.py` 파일을 생성하겠습니다.
* `user_service.py` 파일을 생성하겠습니다. 이 서비스는 `UserRepository`에 의존하며, 사용자 생성 로직과 기존 사용자 확인 로직을 API 엔드포인트에서 이곳으로 옮길 것입니다. 먼저 `src/api/endpoints/users.py`를 읽어 이동해야 할 비즈니스 로직을 파악하겠습니다.
* `users.py`의 비즈니스 로직을 확인했습니다. 이제 `user_service.py`를 생성하여 사용자 생성 및 중복 확인 로직을 `UserRepository`를 통해 처리하도록 구현하겠습니다. `GOAL.md`의 요구사항에 따라 커스텀 예외 처리를 위해 `src/exceptions/user_exceptions.py` 파일을 생성할 것이며, 이를 위해 먼저 `exceptions` 디렉토리를 생성하겠습니다.
* 이제 `exceptions` 디렉토리에 `__init__.py` 파일을 생성하겠습니다.
* 이제 `user_exceptions.py` 파일에 사용자 정의 예외를 만들겠습니다.
* 이제 `UserRepository`와 새로운 사용자 정의 예외를 사용하여 `UserService`를 만들 수 있습니다.
* `UserService`를 만들었으니, 이제 `users.py` 엔드포인트를 리팩토링해야 합니다. `UserService`와 `UserAlreadyExistsError`를 가져와 `create_user` 엔드포인트에서 `UserService`를 인스턴스화하고, 서비스의 `create_user` 메서드를 호출하며 `UserAlreadyExistsError`를 처리하여 `HTTPException`을 발생시킵니다. 또한, `db: Session`을 직접 전달하는 대신 `UserService`를 제공하는 종속성을 `src/api/deps.py`에 추가하여 의존성 주입을 업데이트하겠습니다. 먼저 `deps.py`를 수정하겠습니다.
* `src/api/deps.py` 내용을 확인했습니다. `get_user_service` 의존성 함수를 추가하여 `UserService`를 제공하고, `get_current_user`가 `crud_user` 대신 새로운 `UserRepository`를 사용하도록 수정하겠습니다. 먼저 `get_current_user`부터 업데이트합니다.
* 실수했습니다. `from src.crud import crud_user` 임포트를 제거했어야 합니다. 지금 수정하고 `get_user_service` 의존성을 추가하겠습니다.
* `deps.py`를 업데이트했으니, 이제 `users.py` 엔드포인트가 `UserService`를 사용하도록 리팩토링하겠습니다.
* 사용자 생성 로직을 리팩토링했습니다. 이제 `users.py` 엔드포인트는 `UserService`를, `UserService`는 `UserRepository`를 사용합니다. 비즈니스 로직은 API 계층에서 분리되었고, 데이터 접근은 리포지토리가 담당합니다. 더 이상 필요 없는 `crud_user.py` 파일은 삭제하겠습니다.

---

* 사용자 관리 리팩토링이 끝났으니, 이제 `GOAL.md`에 따라 `Caravan` 도메인 구현을 시작하겠습니다. `caravan.py` (모델), `caravan.py` (스키마), `caravan_repository.py`, `caravan_service.py`, `caravans.py` (엔드포인트), `caravan_exceptions.py` 파일을 생성할 것입니다. 먼저 `user.py` 모델을 참고하여 `caravan.py` 모델 파일부터 만들겠습니다.
* 사용자 모델을 기반으로 캐러밴 모델을 만들겠습니다. `GOAL.md`에 따라 수용 인원, 편의시설, 사진, 위치 정보를 포함하고, 소유자(호스트)와의 관계를 설정하여 `src/models/caravan.py` 파일을 생성합니다.
* `Caravan` 모델을 만들고 `User` 모델에 `caravans` 관계를 추가했지만, `user.py`를 직접 수정할 수 없으니 `user.py`를 다시 읽고 `replace`를 사용하여 관계를 추가해야 합니다.
* 이제 `src/models/user.py`의 `User` 모델에 `caravans` 관계를 추가하겠습니다.
* `src/models/caravan.py`에서 `User.caravans` 관계 정의를 잘못 추가했습니다. 삭제하겠습니다.
* 모델이 올바르게 설정되었으니, 이제 `Caravan` 모델에 대한 Pydantic 스키마를 생성하겠습니다. `src/schemas/caravan.py` 파일을 만들 것이며, `src/schemas/user.py`를 템플릿으로 사용하겠습니다.
* 사용자 스키마를 확인했습니다. 이제 캐러밴 스키마를 만들겠습니다. `CaravanBase`, `CaravanCreate`, `CaravanUpdate`, `Caravan` 스키마를 포함하는 `src/schemas/caravan.py` 파일을 생성합니다.
* 다음은 `CaravanRepository`를 만들 차례입니다. `UserRepository`와 비슷하게 `src/repositories/caravan_repository.py` 파일을 생성하겠습니다.
* 이제 `CaravanService`를 만들겠습니다. 이 서비스는 `CaravanRepository`를 사용하여 캐러밴 관리 비즈니스 로직을 처리하며, `create_caravan` 메서드로 시작하겠습니다. `src/services/caravan_service.py` 파일을 생성합니다.
* 이제 `src/api/endpoints/caravans.py`에 캐러밴 API 엔드포인트를 만들어야 합니다. 캐러밴 생성 라우트를 포함하며, 이 엔드포인트는 `CaravanService`와 현재 사용자(호스트)에 의존합니다. 먼저 `src/api/deps.py`에 `CaravanService`의 의존성을 추가해야 합니다.
* `src/api/deps.py`에 `get_caravan_service` 의존성을 추가하겠습니다.
* 이제 `caravans.py` 엔드포인트 파일을 만들겠습니다. 인증된 사용자만 접근 가능한 `create_caravan` 엔드포인트를 추가하고, 사용자가 호스트인지 확인하는 권한 로직을 위한 자리 표시자도 넣겠습니다.
* 이제 새 `caravans` 라우터를 `src/api/api.py`의 메인 API 라우터에 추가해야 합니다.
* 이제 `caravans` 라우터를 `src/api/api.py`에 추가하겠습니다.

---

* `Caravan` 도메인의 기본 구조를 구현했습니다. 사용자 관리를 서비스/리포지토리 패턴으로 리팩토링하고, `crud_user.py`를 삭제했습니다. `Caravan` 모델, 스키마, 리포지토리, 서비스, 생성 API 엔드포인트를 구현하고 메인 라우터에 추가했습니다.
* 이제 `GOAL.md`의 다른 기능(예약, 결제, 리뷰)을 진행하기 전에, `caravan` 테이블을 포함하는 초기 데이터베이스 마이그레이션을 생성해야 합니다. Alembic 같은 마이그레이션 도구가 없는 것 같으니, `main.py`에서 데이터베이스 초기화 방법을 확인하겠습니다.
* `main.py`에는 데이터베이스 초기화 로직이 없습니다. 별도로 처리되는 것 같으니 `initial_data.py`에서 단서를 찾아보겠습니다.
* `initial_data.py`가 `Base.metadata.create_all(bind=engine)`로 테이블을 생성하지만, 삭제된 `crud_user.create_user`를 사용하고 있습니다. `UserService`를 사용하도록 `initial_data.py`를 수정하여 `init_db` 함수가 테이블 생성과 초기 데이터 생성을 모두 책임지도록 하겠습니다. 지금 바로 수정하겠습니다.
* 이전 `replace` 호출의 `old_string`에 복사-붙여넣기 오류가 있었던 것 같습니다. 하지만 `new_string`은 정확하므로 파일은 원하는 상태일 것입니다. 파일을 읽어 확인해 보겠습니다.
* `initial_data.py`는 이제 정확합니다. `Base.metadata.create_all`이 새 모델을 인식하도록 `Caravan` 모델을 `initial_data.py`로 가져와야 합니다. SQLAlchemy 메타데이터 등록을 위해 직접 사용하지 않더라도 가져오기는 필수입니다. `from src.models.caravan import Caravan`을 추가하겠습니다.

[Day 1 Codex 전체 대화 로그 보기](./codex_logs/Day1-Log.md)

#### 산출물(핵심 파일)
- FastAPI 앱/설정
  - `src/main.py`: FastAPI 앱 팩토리, CORS, `api_router` 마운트
  - `src/core/config.py`: 환경설정(`SECRET_KEY`, `DATABASE_URL`, `CORS_ORIGINS` 등)
  - `src/core/security.py`: 비밀번호 해시/검증, JWT 발급
  - `backend/app/main.py`: Uvicorn 타겟 재노출
- DB/모델/세션
  - `src/database/session.py`: SQLite 엔진, `SessionLocal`, `Base`
  - `src/models/user.py`, `src/models/caravan.py`, `src/models/reservation.py`
  - 예약 인덱스(`ix_reservations_caravan_range`)로 기본 범위 질의 성능 확보
- 스키마/리포지토리/서비스
  - `src/schemas/*`: Pydantic I/O 모델(User/Caravan/Reservation)
  - `src/repositories/*`: Repository(사용자/카라반/예약)
  - `src/services/reservation_validator.py`: 중복 예약, 결제 가능여부 검증
  - `src/services/price_calculator.py`: 일수 기반 가격 계산
  - `src/services/user_service.py`, `src/services/reservation_service.py`
- API 엔드포인트(버전: `/api/v1`)
  - `src/api/api.py`: 라우터 집계
  - `src/api/endpoints/login.py`: 폼 로그인 → JWT
  - `src/api/endpoints/users.py`: 회원 생성, `GET /users/me`, 관리자 액션(승급/충전)
  - `src/api/endpoints/caravans.py`: 호스트만 생성, 목록/단건 조회, 필터링
  - `src/api/endpoints/reservations.py`: 내 예약 목록/생성/취소, 관리자 전체 조회
  - `src/api/endpoints/dev.py`: 데모 개요(개발 확인용)
- 시드/문서/테스트
  - `initial_data.py`: 개발용 drop+create, admin 시드(옵션 데모 포함)
  - `backend/README.md`, `docs/QUICKSTART.md`: 실행/테스트 안내
  - `backend/tests/test_auth.py`, `backend/tests/test_reservations_smoke.py`: 스모크 테스트

#### 실행/검증 명령
- 의존성 설치: `pip install -r requirements.txt`
- DB 초기화: `python initial_data.py`
- 서버: `uvicorn backend.app.main:app --reload`
- 테스트: `pytest -q`

#### 프롬프트 적용 결과
- 도메인 모델/리포지토리/서비스 계층 분리로 책임 명확화, 테스트 용이성 확보
- JWT 기반 인증 흐름 완성(폼 로그인) 및 관리자/호스트 권한 분기 동작 확인
- 예약 생성 트랜잭션에 잔액 차감 + 예약 생성 커밋 원자화 처리
- 스모크 테스트 2종 통과로 기본 엔드투엔드 확인

#### 문제 및 해결
1) SQLite 스레드 제약으로 인한 FastAPI 요청 처리 오류
   - 원인: SQLite 기본 `check_same_thread=True`
   - 해결: `src/database/session.py`에서 `connect_args={"check_same_thread": False}` 적용
2) 예약 중복 검출 경계값 오류 가능성
   - 조치: `[start, end)` 규칙 명시하고 `start < r.end && end > r.start`로 겹침 판정(`ReservationValidator.validate_availability`)
3) 트랜잭션 일관성(잔액 차감 ↔ 예약 저장)
   - 조치: 서비스 계층에서 `commit=False` → `flush()` → 단일 `commit()` 패턴으로 원자화(`src/services/reservation_service.py`)

#### 학습 내용
- SRP/도메인 경계(Repository/Service/Schema) 분리가 테스트와 유지보수에 미치는 이점 재확인
- 예약 도메인의 시간 구간 겹침 판정은 반개방 구간 표기로 명확해짐
- 애플리케이션 레벨 트랜잭션 설계가 단순 SQLite 환경에서도 중요한 안정성을 부여

---

### Day 2 - 프론트엔드(PWA)·Google 로그인 연동 초안 및 API 통합

#### AI 개발 프롬프트
# Continuation Prompt (개발 이어가기)

## 역할
GEMINI.md와 GOAL.md의 지침을 준수하는 풀스택 개발자. FastAPI 백엔드와 Vite+React(PWA) 프론트엔드로 “카라반 공유 플랫폼”의 MVP를 단계적으로 완성하고, 서비스/리포지토리/서비스 계층 아키텍처를 유지한다.

## 목표
사용자/로그인/캐러밴/예약의 기본 흐름이 로컬에서 동작하고, UI 기반 테스트가 자연스럽게 가능하도록 개발 생산성을 높인다.

## 우선순위
기능 완결성(캐러밴→예약 성공 플로우), 롤/권한, 테스트 경험 개선, 이후 결제/리뷰로 확장.

---

## 현재 상태 요약
* **아키텍처:** 리포지토리(데이터 접근) + 서비스(비즈니스) + API(엔드포인트)로 분리됨.
* **도메인:** User(역할 포함), Caravan(등록/조회), Reservation(중복/잔액 검증 포함).
* **인증:** 폼 로그인(JWT), Google ID 토큰 검증(키 미설정 시 예외 처리).
* **초기 데이터:** `admin@example.com`(ADMIN) + 잔액 1000 시드.
* **CORS:** Vite dev(5173) 호출 허용.
* **프론트엔드:** PWA 스캐폴딩(랜딩/로그인/대시보드), 로컬 로그인(개발용), 예약 생성/목록 UI.
* **테스트:** 백엔드 스모크 2종(pytest), 프론트 Vitest+RTL(랜딩/로그인/예약 UI).
* **실행 스크립트:** PowerShell 기준 `scripts/dev_all.ps1`로 웹+API 동시 실행. 개별/테스트 스크립트 제공.

---

## 실행/테스트
* **모두 실행(권장):** `scripts/dev_all.ps1`
* **백엔드만:** `scripts/setup_venv.ps1` → `scripts/dev_api.ps1`
* **웹만:** `scripts/dev_web.ps1`
* **백엔드 테스트:** `scripts/test.ps1`
* **웹 테스트:** `scripts/test_web.ps1`
* **브라우저:** `http://localhost:5173` (로컬 로그인 가능), **API Docs:** `http://localhost:8000/docs`

---

## 즉시 진행할 작업(Phase Next)

### 사용자/권한 관리
* **HOST 승격 API(관리자 전용) 추가:** `POST /users/{id}/role` 또는 전용 topup/promote 엔드포인트.
* **UI:** 로그인 후 프로필 영역에 “호스트 전환/잔액충전(개발용)” 버튼 추가.

### 캐러밴 UX 보강
* **UI:** 캐러밴 등록/내 캐러밴 목록 화면 추가.
* **API:** 캐러밴 목록/상세/검색(위치/가격/수용인원) 쿼리 파라미터 지원.

### 예약 UX 보강
* **UI:** 날짜 캘린더 컴포넌트 도입, 캐러밴 선택 → 가능 날짜 음영 처리.
* **API:** 예약 취소/내 예약 상세 조회, 예약 상태 변경(취소/거절/승인, 호스트 권한).

### 초기 시드 개선
* 개발 편의용 호스트 + 데모 캐러밴 자동 시드(옵션)로 바로 예약 시나리오 가능.

---

## 앞으로 개발하면 좋을 기능

### 결제
* 결제 도메인(모델/스키마/서비스/엔드포인트), 결제 시뮬레이션(테스트 모드), 결제 실패 시 상태 전이.
* 잔액(top-up) API + 관리자 승인 또는 모의 PG 연동.

### 리뷰/신뢰도
* 거래 기반 리뷰/평점, 사용자 신뢰도 계산, 리뷰 모더레이션(관리자).

### 검색/필터/맵
* 위치(도시/좌표) 기반 검색/필터, 가격/편의시설, 예약 가능일 필터링.

### 미디어 업로드
* 캐러밴 이미지 업로드(S3/로컬 디스크), 썸네일/최적화.

### 알림/메시징
* 예약 요청/승인 상태 변경 알림(이메일/푸시), 간단한 호스트-게스트 DM.

### PWA/모바일
* 오프라인 캐싱 전략, 설치 프롬프트, Capacitor로 iOS/Android 래핑 가이드 고도화.

---

## UI 테스트 용이성 향상

### 컴포넌트/화면
* 접근성/라벨 일관화(이미 진행), 필수 버튼/입력에 명확한 레이블 부여해 테스트 안정성↑.
* 테스트ID는 마지막 수단으로만 사용하되, 라벨/role 기반 쿼리를 우선.

### 상태/네트워크
* MSW(Mock Service Worker) 도입해 UI 테스트에서 API 모킹 표준화.
* React Query 옵션(캐시/리트라이/리프레시 간격) 테스트 프로파일 별도 설정.

### 스토리/리그레션
* Storybook 추가로 컴포넌트 상태 시나리오(UI 스냅샷/비주얼 테스트) 구성.
* Playwright 도입으로 경로별 E2E(로그인→캐러밴 생성→예약→목록 확인) 시나리오 자동화.

### 데이터 시드
* 개발용 API(시드/리셋) 또는 스크립트 제공해 테스트 전후 상태 일관성 보장.
* 예약 중복/잔액부족/권한오류 케이스를 고정 데이터로 재현 가능하게 스위치 제공.

---

## 다음 단계에 대한 수용 기준(예시)

### UI에서:
* HOST 사용자로 캐러밴 등록 가능.
* 캐러밴 목록에서 선택 → 가능 날짜 선택 → 예약 생성 201.
* 중복 날짜 409, 잔액 부족 402, 권한 부족 403 UI 토스트로 안내.

### 테스트:
* **Vitest:** 캐러밴 등록/목록/예약 생성 컴포넌트 테스트 추가, 네트워크 MSW 모킹.
* **Pytest:** 예약 취소/중복/권한 검증 포함 4개 이상 케이스 추가.

[Day 2 Codex 전체 대화 로그 보기](./codex_logs/Day2-Log.md)

#### 산출물(핵심 파일)
- 라우팅/부트스트랩
  - `web/src/main.tsx`: Router(QueryClient 포함), PWA 등록
  - `web/src/App.tsx`, `web/src/routes/{Landing,Login,Dashboard}.tsx`
- 인증/상태/유틸
  - `web/src/store/auth.ts`: `user/accessToken`, `signInWithGoogle()`, `signOut()`
  - `web/src/lib/firebase.ts`: Firebase Web SDK 초기화, `signInWithGooglePopup()`
  - `web/src/lib/api.ts`: API 베이스 및 인증 헤더, 에러 표준 처리
  - `web/src/store/ui.ts`: 화면 선택 상태(선택 카라반 등)
- UI 컴포넌트(주요 흐름)
  - `web/src/components/Header.tsx`
  - `web/src/components/CaravanForm.tsx`(호스트만), `CaravanList.tsx`(필터/선택)
  - `web/src/components/ReservationForm.tsx`, `ReservationList.tsx`
  - `web/src/components/BalanceCard.tsx`, `ProfileActions.tsx`(관리자 충전), `AdminReservations.tsx`
  - `web/src/components/DemoOverview.tsx`(개발 확인용 `/dev/overview`)
- 백엔드 연동(추가)
  - `src/api/endpoints/auth_google.py`: `POST /auth/google/verify` 초안(현재 `GOOGLE_CLIENT_ID` 대체 값 사용 주석)
- 문서/스크립트
  - `web/README.md`: 로컬 실행, 환경 변수, PWA/Capacitor 가이드
  - `docs/QUICKSTART.md`: Windows 빠른 실행/테스트 스크립트 정리
  - `scripts/dev_all.cmd|ps1`, `dev_api.*`, `dev_web.*`, `seed.cmd` 등 실행 편의 스크립트

#### 실행/검증 명령
- 웹: `cd web && npm install && npm run dev` (기본 http://localhost:5173)
- API: `uvicorn backend.app.main:app --reload` (http://localhost:8000)
- 전체(Windows): `scripts/dev_all.cmd`
- 로그인: 로컬 `admin@example.com / password` 또는 Google(Firebase .env 필요)

#### 프롬프트 적용 결과
- 예약/카라반 기본 사용자 여정이 UI에서 동작(선택→기간입력→예약 생성→목록 확인)
- 관리자 잔액 충전/전체 예약 조회로 데모 시나리오 점검 가능
- PWA 등록 및 반응형 기본 레이아웃 적용(모바일 사용성 확인)

#### 문제 및 해결
1) Google ID 토큰 검증 실패(실 클라이언트 ID 미설정)
   - 현상: `/auth/google/verify`에서 검증 실패 가능
   - 대응: `.env`로 Firebase 키 설정 전까지 로컬 폼 로그인 경로 유지, 파일에 TODO 주석 표기(`src/api/endpoints/auth_google.py`)
2) CORS 프리플라이트 지연/차단
   - 조치: `src/main.py`에서 `CORS_ORIGINS` 환경 변수 기반 허용, 개발 기본 `*`
3) UI 접근성/가시성
   - 조치: 버튼 ARIA 라벨/포커스 스타일 및 로딩/에러 표기 최소 반영

#### 학습 내용
- Auth 교환(클라이언트 idToken ↔ 서버 JWT) 분리 설계가 프런트/백을 느슨하게 결합하게 함
- React Query로 데이터/에러 상태를 표준화하면 폼/목록 UI 품질이 안정적으로 향상
- 개발 스크립트(dev_all/seed)가 체험형 데모 반복을 빠르게 함

---


### Day 3 - 구글 인증 검증 강화와 호스트 대시보드·캘린더 UX 고도화

#### AI 개발 프롬프트

# 역할: Day 3 페어 프로그래밍 어시스턴트

## 🎯 목표
> Google 인증 검증 완성, 호스트 대시보드(예약 관리)와 예약 캘린더 UI 추가, 취소/상태변경 흐름을 프론트-백엔드 일관성으로 구현.

---

## 📝 작업 단계

### 1. 백엔드 인증/설정 정리
* `src/core/config.py`에 `GOOGLE_CLIENT_ID` 추가, `.env` 연동
* `src/api/endpoints/auth_google.py`에서 `verify_oauth2_token(..., settings.GOOGLE_CLIENT_ID)`로 수정
* **문서**: `backend/README.md`, `docs/QUICKSTART.md`에 `GOOGLE_CLIENT_ID` 안내

### 2. 호스트 전용 예약 조회 API
* **Endpoint**: `GET /api/v1/reservations/host` (host 전용)
* **반환**: 내가 소유한 카라반들에 대한 예약 목록
* **구현**: `ReservationRepository.list_all(host_id=...)` 활용, 권한 체크

### 3. 예약 달력용 API
* **Endpoint**: `GET /api/v1/caravans/{caravan_id}/calendar`
* **반환 예**: `{ "caravan_id": 1, "ranges": [{"start":"2025-01-10","end":"2025-01-12"}] }` // `[start,end)` 규칙

### 4. 프런트엔드 UI/UX 추가
* **Host Panel**
    * `web/src/components/HostPanel.tsx`: 내 카라반 예약 테이블 + 상태 칩 (확정=초록, 보류=호박, 취소=회색)
    * **액션 버튼**: [승인] [취소] → `/reservations/{id}/status` 호출
    * **Dashboard에 배치**: `web/src/routes/Dashboard.tsx` 상단 1열 카드로 노출
* **예약 캘린더**
    * `web/src/components/CaravanCalendar.tsx`: 선택된 카라반의 예약 구간 하이라이트 (월 그리드, 예약일은 붉은 배경)
    * `CaravanList` 아래에 표시, `selectedCaravanId` 변경 시 갱신
* **사용자 예약 취소**
    * `web/src/components/ReservationList.tsx` 각 행에 [취소] 버튼 추가 → `/reservations/{id}/cancel`
    * 성공 시 목록/잔액 재조회, 에러 토스트 표시

### 5. 접근성/시각 요소
* **상태 칩 색상**: `confirmed=green`, `pending=amber`, `cancelled=gray`
* 버튼 `aria-label`, 포커스 링, 비활성 상태 명확히

### 6. 테스트 보강 (백엔드)
* `backend/tests/test_host_permissions.py`
    * 호스트가 자신의 카라반 예약만 조회/상태변경 가능
    * 타 호스트 카라반 예약 상태변경은 `403`
* `backend/tests/test_cancel_refund.py`
    * 사용자 취소 시 예약 상태=`cancelled`, 잔액 환불 검증

### 7. 문서/스크립트 업데이트
* `backend/README.md`, `web/README.md`, `docs/QUICKSTART.md` 인증/새 API/동작 캡처 설명 추가
* 스크립트 영향 없음 (필요 시 `scripts/seed.cmd demo`로 데모 데이터)

### 8. 실행 명령어
* **백엔드**: `python initial_data.py` → `uvicorn backend.app.main:app --reload`
* **프런트**: `cd web && npm install && npm run dev`
* **테스트**: `pytest -q`

---

## 📤 출력 형식

### 1. 파일별 전체 코드 본문
* `src/core/config.py` (설정 추가)
* `src/api/endpoints/auth_google.py` (CLIENT_ID 적용)
* `src/api/endpoints/reservations.py` (호스트 전용 목록, 캘린더용 엔드포인트 추가)
* `backend/tests/test_host_permissions.py`
* `backend/tests/test_cancel_refund.py`
* `web/src/components/HostPanel.tsx`
* `web/src/components/CaravanCalendar.tsx`
* `web/src/components/ReservationList.tsx` (변경)
* `web/src/routes/Dashboard.tsx` (변경)
* `backend/README.md`, `web/README.md`, `docs/QUICKSTART.md` (변경)

### 2. 실행/검증 명령어

### 3. 커밋 메시지 제안 (아래)

---

## ✅ 검증 기준
* Google ID 토큰 검증이 `GOOGLE_CLIENT_ID`로 정상 동작 (설정 미존재 시 로컬 로그인 경로 유지)
* Host Panel에서 내 카라반 예약만 보이고 상태 변경 가능, 타인의 예약은 `403`
* 예약 캘린더가 `[start,end)` 구간으로 정확히 표시
* 사용자 예약 취소 시 상태=`cancelled`, 잔액 증가 확인
* `pytest -q` 통과

- [Day 3 Codex 전체 대화 로그 보기](./codex_logs/Day3-Log.md)

#### 산출물(핵심 파일)

- **인증/설정 (Backend)**
    - `src/core/config.py`: `GOOGLE_CLIENT_ID` 및 `FIREBASE_PROJECT_ID` 설정 노출 (:29, :32)
    - `src/api/endpoints/auth_google.py`: `POST /auth/google/verify` (GIS Audience 검증 → Firebase ID 토큰 검증 순차 폴백) (:30)

- **호스트/예약 (Backend)**
    - `src/api/endpoints/reservations.py`: `GET /reservations/host`, `PUT /reservations/{id}/status` (호스트 전용 조회 및 상태 갱신) (:35)
    - `src/repositories/reservation_repository.py`: `host_id` 필터 지원 (:57)
    - `src/services/reservation_service.py`: 사용자 취소/환불, `CANCELLED` 종단 상태 및 전이 규칙 강제 (:92)
    - `src/api/endpoints/caravans.py`: `GET /caravans/{id}/calendar` (`[start,end)` 예약 구간 반환) (:68)
    - `src/api/endpoints/dev.py`: Demo 모드 seed 데이터 부재 시 `200` 빈 응답 (React Query 경고 제거) (:36)

- **UI 컴포넌트 (Frontend)**
    - `web/src/components/HostPanel.tsx`: 호스트 예약 관리 (테이블, `pending`/`confirmed` 대상 승인/취소 버튼, 캐시 동기화) (:15)
    - `web/src/components/CaravanCalendar.tsx`: 선택된 카라반 예약 기간 하이라이트 (날짜 단위 색칠, 이벤트 연동 갱신) (:14)
    - `web/src/components/ReservationList.tsx`: 게스트 예약 목록 상태 칩 및 [취소] 버튼 추가 (잔액/캘린더/목록 캐시 무효화) (:4)

- **라우팅/상태 (Frontend)**
    - `web/src/routes/Dashboard.tsx`: `HostPanel`/`Calendar` 상단 고정으로 카드 배치 조정 (:1)
    - `web/src/App.tsx`: `accessToken`만 있을 때 `/users/me` 자동 호출로 사용자 스토어 복원 (:6)
    - `web/src/routes/Login.tsx`: 로그인 성공 시 `/app`으로 즉시 이동 (:6)

- **문서/스크립트**
    - `backend/README.md`, `web/README.md`, `docs/QUICKSTART.md`: Google audience (GIS vs Firebase) 선택, 달력 API, 테스트 커맨드 업데이트 (:3, :3, :41)
    - `scripts/firebase_bootstrap.ps1`: Firebase CLI 기반 부트스트랩 자동화 (프로젝트/앱 등록, `.env.local` 생성 등) (:1)
    - `.gitignore`: Windows 특수 파일(CON) 방어용 ignore 규칙 추가 (:72)

- **테스트**
    - `backend/tests/test_host_permissions.py`: 호스트 간 예약 조작 방지, `CANCELLED` 종단 상태 보장 시나리오 (:61)
    - `backend/tests/test_cancel_refund.py`: 게스트 취소 시 잔액 환불 및 상태 변화 검증 (:25)

#### 실행/검증 명령

- **API (초기화)**: `python initial_data.py`
- **API (실행)**: `uvicorn backend.app.main:app --reload`
- **웹**: `cd web && npm run dev`
- **테스트**: `pytest -q`

#### 문제 및 해결

1) **Audience 없는 Google 토큰 허용 문제**
    - **현상**: Day2까지 Firebase 기반 로그인 토큰 사용 시 `verify_oauth2_token`에서 401 발생
    - **대응**: `GOOGLE_CLIENT_ID`/`FIREBASE_PROJECT_ID` 설정 도입, GIS 검증 → Firebase 검증 순으로 폴백하여 토큰 교환 안정화 (`src/core/config.py:29`, `src/api/endpoints/auth_google.py:30`)

2) **호스트 권한 모델 부재**
    - **현상**: 호스트가 타인 예약을 조회/조작하거나 `CANCELLED` 상태를 되살릴 수 있었음
    - **대응**: 전용 엔드포인트(`.../host`), 리포지토리 `host` 필터, 서비스 계층 상태 머신(전이 규칙)을 도입하여 권한/규칙 강제 (`src/api/endpoints/reservations.py:35`, `src/services/reservation_service.py:92`)

3) **달력/대시보드 UX 품질**
    - **현상**: 달력 API 부재로 UI가 더미 데이터를 보여줬고, `/dev/overview` 404가 계속 재시도됨
    - **대응**: 서버에 `calendar` API 및 `overview` 빈 응답(Demo 모드)을 추가하고, React Query 캐시 무효화를 통해 실시간 앵커 데이터 동기화 (`src/api/endpoints/caravans.py:68`, `src/api/endpoints/dev.py:36`)

4) **로그인 이후 상태 동기화**
    - **현상**: `accessToken`만 남으면 Header/Profile이 비고, `/login`에서 `/app`으로 수동 이동해야 했음
    - **대응**: `/users/me` 기반 자동 하이드레이션 및 로그인 성공 직후 네비게이션으로 해결 (`web/src/App.tsx:6`, `web/src/routes/Login.tsx:6`)

#### 학습 내용

- GIS/Firebase 인증을 동시에 지원하려면, `audience` 검증 경로를 명확히 분기하고 문서화해야 테스트 환경마다 발생하는 혼선을 줄일 수 있음
- 권한 모델을 리포지토리(데이터 접근 계층)에서부터 강제하면 React Query 캐시처럼 클라이언트 상태 관리가 단순해지고 잘못된 데이터를 캐시할 여지를 줄일 수 있음
- Windows 콘솔 특수 파일(`CON`)까지 `.gitignore`로 방어해 두면 협업 중 우발적인 파일 생성으로 생기는 merge 노이즈를 줄일 수 있음
---

### Day 4 - PWA 품질 개선 및 모바일 래핑 준비

#### 작업 개요
- 웹 프론트엔드를 “설치 가능한 PWA + Capacitor 래핑 준비” 상태로 정리하고, 오프라인 UX와 모바일 빌드 흐름을 문서화.

#### 주요 변경 사항
- **PWA 매니페스트/아이콘**
  - `web/vite.config.ts`: `VitePWA` 설정에 `includeAssets`/`manifest.icons` 추가 (CaravanShare 이름/short_name, `/icons/pwa-192x192.png`, `/icons/pwa-512x512.png`, maskable 아이콘 등).
  - 앱 스코프(`/`), `background_color`/`theme_color`를 브랜드 컬러에 맞게 정리.

- **서비스워커/캐싱 전략**
  - `web/vite.config.ts`: `workbox` 설정으로 앱 쉘(HTML/JS/CSS/아이콘)을 precache 하고, `/api/` 하위 호출은 `NetworkFirst` 런타임 캐싱(짧은 타임아웃, 별도 캐시 이름)으로 구성.
  - `web/src/pwa.ts`: `registerSW`의 `onNeedRefresh` 콜백에서 새 버전이 준비되면 사용자가 확인 후 새로고침하도록 안내(간단한 confirm 기반).

- **설치/오프라인 UX**
  - `web/src/hooks/usePwaInstallPrompt.ts`: `beforeinstallprompt` 이벤트를 캡처해 상태로 보존하고, `prompt()`를 노출하는 커스텀 훅 추가.
  - `web/src/components/PwaInstallBanner.tsx`: 설치 가능 시 “앱 설치하기” 배너를 보여주고 클릭 시 설치 프롬프트 실행.
  - `web/src/components/OfflineBanner.tsx`: `online`/`offline` 이벤트를 구독해 오프라인 상태일 때 상단 배너로 “오프라인 상태입니다. 네트워크 연결 후 다시 시도해주세요.” 메시지 표시.
  - `web/src/App.tsx`: 공통 레이아웃에 PWA 설치 배너와 오프라인 배너를 삽입해 대시보드 뷰에서 항상 노출.
  - `web/src/lib/api.ts`: fetch 공통 래퍼(`request`)를 추가해 네트워크 오류나 오프라인 상태일 때 명시적인 한글 오류 메시지로 변환.

- **Capacitor 설정/스크립트**
  - `web/capacitor.config.ts`: `appId: "com.caravanshare.app"`, `appName: "CaravanShare"`, `webDir: "dist"` 기반 기본 설정과 dev 용 `server.url: "http://localhost:5173"` 템플릿 추가.
  - `web/package.json`: 모바일 빌드를 위한 스크립트 추가
    - `build:pwa` (PWA 빌드), `cap:init`, `cap:sync`, `cap:android`, `cap:ios`.

- **문서 정리**
  - `web/README.md`: PWA 동작 범위(앱 쉘 오프라인 지원, API 온라인 의존), 설치 방법(브라우저 UI + in-app 배너), 아이콘 경로(`/public/icons/*.png`) 안내, Capacitor 기반 모바일 빌드 플로우 정리.
  - `docs/QUICKSTART.md`: 기본 실행 방법 아래에 PWA 설치와 Capacitor 모바일 빌드 준비 섹션 추가 (build → cap sync → IDE 오픈 흐름).
  - `backend/README.md`: PWA/모바일 환경에서의 CORS 및 `VITE_API_BASE_URL` 설정에 대한 간단한 참고 문구 추가.

#### 실행/검증
- PWA 빌드: `cd web && npm run build:pwa`
- Web tests: `cd web && npm run test:run`
- Capacitor 동기화(플랫폼 추가 이후): `cd web && npm run cap:sync`
*** End of File

## 개발 과정
- 기록 방법
  1. 작업을 일 단위로 나누어 핵심 산출물과 결정만 요약
  2. API·UI 스펙은 `GEMINI.md`를 단일 소스 오브 트루스로 유지하고, 실제 구현 중 생긴 차이는 일지에 근거와 함께 명시
  3. 실행 방법과 테스트는 `docs/QUICKSTART.md` 및 각 `README.md`에 반영 후 링크
