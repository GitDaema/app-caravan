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

#### AI 개발 프롬프트

# 역할
당신은 FastAPI 백엔드와 Vite+React+TS PWA 프론트엔드를 사용하는 CaravanShare(app-caravan) 프로젝트의 Day 4 페어 프로그래밍 어시스턴트입니다. 목표는 이 코드베이스를 “설치 가능한 PWA + Capacitor 래핑 준비” 상태로 끌어올리는 것입니다.

# 전체 컨텍스트 요약
- 전체 개요/요구사항: 루트 `GOAL.md`, `GEMINI.md` 참고
- 개발 히스토리: `DEVELOPMENT_LOG.md`의 Day 1~3 기록
  - Day 1: 백엔드 도메인 모델/리포지토리/서비스 레이어 정리 (FastAPI + SQLAlchemy + Pydantic)
  - Day 2: 프론트엔드 PWA 골격, Google/로컬 로그인, 기본 예약/캐러밴/관리자 UI, 초기 테스트
  - Day 3: Google 인증 검증 강화, 호스트 대시보드·예약 캘린더·취소/환불 흐름, 권한/상태 관련 테스트 강화
- 현재 구조(요점):
  - 백엔드: `src/` (models/schemas/repositories/services/api/core/database/exceptions), 실행 엔트리 `backend.app.main:app` 혹은 `src.main:app` (로그/README 기준)
  - 프론트엔드: `web/` (Vite + React + TS + React Router + React Query + Zustand)
    - 라우팅: `web/src/main.tsx`, `web/src/App.tsx`, `web/src/routes/{Landing,Login,Dashboard}.tsx`
    - 상태: `web/src/store/{auth,ui}.ts`
    - UI: `web/src/components/*` (HostPanel, CaravanCalendar, ReservationList 등)
    - PWA: `web/vite.config.ts` 에 `VitePWA` 플러그인, `web/src/pwa.ts` 에 서비스워커 등록, `web/src/main.tsx` 에 `./pwa` import
  - 실행/테스트:
    - 백엔드: `uvicorn backend.app.main:app --reload`, `pytest -q`
    - 프론트엔드: `cd web && npm install && npm run dev`, `npm run test:run`
    - 빠른 안내: `docs/QUICKSTART.md`, `web/README.md`, `backend/README.md`

이 Day 4 작업에서, 기존 도메인/인증/예약 로직은 “되도록 건드리지 않고”, PWA 품질과 모바일 래핑 준비에 집중합니다.

# Day 4 핵심 목표
1. **PWA 매니페스트/아이콘/메타데이터 정비**
   - 브라우저에서 “설치 가능(Installable)” 판정을 확실히 받도록 PWA 관련 설정을 보강합니다.
   - 다양한 해상도 아이콘을 준비하고, 이름/short_name/start_url/display/theme_color 등 메타데이터를 정리합니다.

2. **서비스워커/캐싱 전략 개선**
   - `vite-plugin-pwa` 설정을 활용해, 최소한 “앱 쉘(라우팅/기본 UI)”은 오프라인에서도 열리도록 precache 전략을 설계합니다.
   - API 호출은 완전 오프라인 지원이 아니라, 네트워크 우선(혹은 적절한 캐시) 전략으로 설계하되, 실패 시 UI에서 명확한 피드백(토스트/메시지)을 제공하도록 합니다.

3. **설치/업데이트 UX 개선**
   - PWA 설치 배너/힌트를 위한 간단한 컴포넌트 또는 훅을 추가합니다 (예: “앱 설치하기” 안내 바).
   - 서비스워커 업데이트 시 새 버전이 다운로드되면, “새 버전 사용하기” 정도의 안내 혹은 자동 reload 전략을 마련합니다.

4. **Capacitor 기반 모바일 빌드 준비**
   - 이 리포를 모노레포/루트 기준으로, Capacitor v6 구성을 문서와 스크립트 차원에서 준비합니다.
   - 실제 `npx cap add android/ios` 까지 강제하지는 않아도 되지만, 최소한:
     - 프로젝트 구조 상 어디에서 `npx cap init` 을 실행할지,
     - `capacitor.config.ts` (또는 `capacitor.config.json`)의 기본 템플릿,
     - `npm run build` → `npx cap copy` → 플랫폼별 IDE(안드로이드 스튜디오/Xcode)에서 열기 흐름
     를 명확히 문서화합니다.

5. **문서/README/QUICKSTART 업데이트**
   - `web/README.md`, `docs/QUICKSTART.md` 등에:
     - PWA 기능(설치/오프라인 동작 범위),
     - 모바일 빌드/Capacitor 사용법(기본 명령/주의사항),
     를 간단하고 실용적인 수준으로 추가합니다.

# 구체 작업 지시

## 1) PWA 매니페스트/아이콘 정비
- `web/vite.config.ts` 의 `VitePWA` 설정을 검토/보강하세요.
  - `manifest.icons` 가 현재 비어있다면, 일반적인 PWA 아이콘 세트를 추가하세요.
    - 예: 192x192, 512x512 PNG 경로 (예: `/icons/icon-192.png`, `/icons/icon-512.png` 등)
  - 필요하다면 `/public/icons/` 디렉터리를 만들고 아이콘 파일 경로를 전제로 한 구성을 넣되,
    - 실제 바이너리 이미지는 생성하지 않고, README에 “아이콘 파일은 디자인 완료 후 이 경로에 배치” 정도로 명시해도 괜찮습니다.
- `name`, `short_name`, `start_url`, `display`, `background_color`, `theme_color` 가 GOAL/GEMINI의 브랜드(“CaravanShare”)와 일관되도록 정리합니다.

## 2) 서비스워커/캐싱 전략 설계
- `VitePWA` 옵션에 다음을 고려해 설정합니다. (필요시 `registerType`, `workbox` 등 사용)
  - 앱 쉘(HTML/JS/CSS/폰트/아이콘)을 precache.
  - API 호출(`/api/`)은 네트워크 우선 + fallback 정도로 처리하거나, 명시적으로 캐시 대상에서 제외.
- 오프라인 상태에서:
  - 랜딩(`/`)과 기본 UI는 열리지만,
  - API가 안 될 때는 예약/목록 등의 버튼에서 “오프라인 상태입니다. 네트워크 연결 후 다시 시도해주세요.” 같은 메시지가 보이도록 합니다.
- 필요하면 React Query의 글로벌 에러 핸들링 또는 간단한 에러 토스트 컴포넌트로 통일된 UX를 제공하도록 권장합니다.

## 3) 설치/업데이트 UX
- 예시 구현 방향:
  - `web/src/hooks/usePwaInstallPrompt.ts` (또는 유사 이름) 훅을 만들어 `beforeinstallprompt` 이벤트를 받아 상태를 저장.
  - `Header` 또는 `Dashboard` 상단에 “앱 설치하기” 버튼/배너를 보여주고, 클릭 시 `prompt()` 호출.
- 서비스워커 업데이트:
  - `web/src/pwa.ts` 에서 `registerSW` 콜백을 활용해 새 버전이 준비되면 `window.location.reload()` 또는 “새 버전 사용하기” 버튼을 보여주는 패턴 중 하나를 채택.

## 4) Capacitor 스캐폴딩 (설정/문서 중심)
- 코드베이스 구조를 고려해, Capacitor 프로젝트 루트를 어떻게 둘지 제안하고 설정 파일을 추가합니다.
  - 예: `web/` 디렉터리 기준으로 `npx cap init` 하는 것을 기본으로 가정할 수 있습니다.
- 다음과 같은 파일/내용을 준비합니다.
  - `web/capacitor.config.ts` (또는 루트에 `capacitor.config.ts`) 템플릿:
    - `appId`, `appName`, `webDir`(예: `dist`), 서버 URL(개발시) 등을 적절히 설정.
  - `web/package.json` 에 모바일 관련 스크립트 예:
    - `"build:pwa": "vite build"`
    - `"cap:sync": "npx cap sync"`
    - `"cap:android": "npx cap open android"`, `"cap:ios": "npx cap open ios"` 등.
- 실제 `npx cap add ios/android` 실행 여부는 개발 환경에 따라 다를 수 있으므로,
  - 실행 예시는 문서에 명시하고,
  - 코드 변경은 config/스크립트/문서 수준에 머무르도록 합니다.

## 5) 문서 업데이트
- `web/README.md`:
  - “PWA & 설치 방법” 섹션 추가 (지원 범위: 앱 쉘 오프라인 지원, 예약/API는 온라인 필요 등).
  - “모바일 빌드(Capacitor)” 섹션에 기본 명령/흐름 정리.
- `docs/QUICKSTART.md`:
  - 기존 백엔드/웹 실행 안내 아래에 “PWA 설치”와 “모바일 빌드 준비” 짧은 섹션 추가.
- 필요하다면 `backend/README.md` 에도 PWA/Capacitor와 연동되는 환경 변수나 CORS 관련 참고를 한 줄 정도 첨언.

# 제약 조건
- `GOAL.md` 의 설계 원칙(SRP, OCP, DIP, 예외 처리, 테스트 가능 구조)을 가능한 한 준수하세요.
- 이미 구현된 인증/예약/권한 로직을 불필하게 변경하지 마세요.
- 기존 테스트(`pytest`, `npm run test:run`)가 깨지면, 원인을 분석하고 **우선 기존 동작을 보존하는 방향**으로 수정하세요.
- 새로운 기능/설정은 “Day 4 작업”임을 `DEVELOPMENT_LOG.md` 에 요약 추가하는 것을 권장합니다 (가능하다면).

# 산출물(예상 파일 목록)
- PWA/프론트엔드
  - `web/vite.config.ts` (VitePWA 설정 보강)
  - `web/src/pwa.ts` (업데이트 UX 개선 시)
  - `web/src/hooks/usePwaInstallPrompt.ts` (또는 유사 훅/컴포넌트)
  - 필요 시 `web/src/components/PwaInstallBanner.tsx` 등
  - (선택) `/public/manifest.webmanifest` 또는 아이콘 경로 관련 파일/구조
- Capacitor 관련
  - `web/capacitor.config.ts` (또는 루트 `capacitor.config.ts`)
  - `web/package.json` 스크립트 업데이트
- 문서
  - `web/README.md`
  - `docs/QUICKSTART.md`
  - (선택) `DEVELOPMENT_LOG.md` 의 Day 4 섹션 추가

# 작업 방식
1. 먼저 현재 PWA 설정(`web/vite.config.ts`, `web/src/pwa.ts`, 라우팅 구조)을 빠르게 스캔해 어떤 부분이 이미 구현되어 있고 어떤 부분이 비어 있는지 파악하세요.
2. 그 다음 PWA 매니페스트/아이콘/서비스워커 설정을 정리하고, 설치/업데이트 UX를 최소 기능 수준으로 구현합니다.
3. 이어서 Capacitor 설정 파일과 npm 스크립트를 추가하고, 모바일 빌드 흐름을 README/QUICKSTART에 명확히 문서화합니다.
4. 변경 후에는:
   - `cd web && npm run build` (가능하다면),
   - `cd web && npm run test:run`
   을 실행해 빌드/테스트가 통과하는지 점검합니다.

- [Day 4 Codex 전체 대화 로그 보기](./codex_logs/Day4-Log.md)

#### 산출물(핵심 파일)
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

#### 문제 및 해결

1) **PWA 설치 가능(Installable) 기준 미달**
    - **현상**: Day 2에서 PWA 플러그인만 추가했을 뿐, `manifest.icons`나 `theme_color`, `name` 등 필수 메타데이터가 누락되어 브라우저가 앱 설치를 제안하지 않았음.
    - **대응**: `web/vite.config.ts`의 `VitePWA` 설정을 보강. `/public/icons/` 경로에 맞춘 192x192, 512x512, maskable 아이콘 경로를 `manifest.icons`에 명시하고, `name`, `short_name`, `theme_color` 등을 브랜드("CaravanShare")에 맞게 설정.

2) **오프라인 및 네트워크 불안정 대응 부재**
    - **현상**: 네트워크 연결이 끊기면 앱 쉘(기본 UI)조차 로드되지 않거나, API 호출 시 브라우저 기본 오류(fetch 실패)가 그대로 노출됨.
    - **대응**: `workbox` 캐싱 전략을 도입. 앱 쉘/에셋은 `precache`로, API 호출(`/api/`)은 `NetworkFirst` (네트워크 우선, 실패 시 캐시)로 분리. `online`/`offline` 이벤트를 감지하는 `OfflineBanner`와 공통 `fetch` 래퍼(`lib/api.ts`)를 추가해 명확한 한글 오류 메시지 제공 (`web/vite.config.ts`, `web/src/components/OfflineBanner.tsx`).

3) **앱 설치/업데이트 UX 누락**
    - **현상**: PWA 설치가 가능하더라도 사용자가 설치를 유도하는 UI가 없었고, 새 버전 배포 시 사용자가 기존 캐시(이전 버전)에 머무르는 문제가 있었음.
    - **대응**: `beforeinstallprompt` 이벤트를 캡처하는 `usePwaInstallPrompt` 훅과 `PwaInstallBanner` 컴포넌트를 추가해 앱 내 설치 유도. `web/src/pwa.ts`의 `onNeedRefresh` 콜백을 활용해 새 버전 감지 시 "새로고침" 확인창을 띄우도록 수정 (`web/src/hooks/usePwaInstallPrompt.ts`, `web/src/pwa.ts`).

4) **모바일 네이티브 앱 래핑(Wrapping) 경로 부재**
    - **현상**: PWA 외에 안드로이드/iOS 스토어 배포를 위한 Capacitor 연동 설정이나 스크립트가 전무했음.
    - **대응**: `web/` 디렉터리 기준으로 `web/capacitor.config.ts` 설정 파일(appId, appName, webDir: "dist" 등)을 추가. `web/package.json`에 `cap:sync`, `cap:android` 등 모바일 빌드/동기화 스크립트를 추가하고 `README` 문서에 빌드 플로우(build → sync → open IDE)를 명시 (`web/capacitor.config.ts`, `web/package.json`).

#### 학습 내용

- PWA가 브라우저에서 '설치 가능' 판정을 받으려면 서비스워커 등록 외에도 `manifest.icons` (특히 192x192, 512x512), `name`, `start_url`, `display` 등 핵심 메타데이터가 완비되어야 함.
- 안정적인 PWA 오프라인 경험을 위해서는 `vite-plugin-pwa`의 `workbox` 설정을 활용해 "앱 쉘(precache)"과 "API 데이터(NetworkFirst 또는 CacheFirst)"의 캐싱 전략을 명확히 분리해야 함.
- 사용자 경험 측면에서, `online`/`offline` 이벤트를 감지하는 UI(배너)와 `fetch` 공통 래퍼에서의 명시적인 오류 피드백은 API 캐싱만큼이나 중요함.
- PWA 설치 유도는 `beforeinstallprompt` 이벤트를 캡처하는 커스텀 훅으로, 앱 업데이트는 `registerSW`의 `onNeedRefresh` 콜백으로 처리하는 것이 표준적인 UX 패턴임.
- Capacitor는 기존 Vite PWA 프로젝트의 프론트엔드 루트(`web/`)에 `capacitor.config.ts`를 추가하고 `webDir`을 빌드 결과물(`dist`)로 지정하는 방식으로 비교적 간단하게 네이티브 래핑 준비가 가능함.


---


### Day 5 - PWA 품질 점검 및 모바일 환경(LAN IP) 연동 안정화

#### AI 개발 프롬프트

## 역할 및 목표

**역할** : 당신은 FastAPI 백엔드와 Vite+React+TS PWA 프론트엔드를 사용하는 **CaravanShare(app-caravan)** 프로젝트의 Day 5 페어 프로그래밍 어시스턴트입니다.

**오늘 목표**: Day 1~4에서 구축된 구조를 유지한 채, 이 코드베이스를 **“모바일 실전 적용 + 가벼운 점검”** 단계까지 끌어올리는 것입니다.

---

## 컨텍스트 요약

* **전체 요구사항·도메인**: 루트 `GOAL.md`, `GEMINI.md`
* **개발 히스토리**: `DEVELOPMENT_LOG.md`의 Day 1~4
    * **Day 1**: 도메인 모델/리포지토리/서비스 레이어 정리
    * **Day 2**: PWA 골격, Google/로컬 로그인, 기본 예약/캐러밴/관리자 UI
    * **Day 3**: Google 인증 강화, 호스트 대시보드·캘린더·취소/환불 플로우
    * **Day 4**: PWA 설치/업데이트 UX, Capacitor 래핑 준비
* **주요 위치만 참고**:
    * **백엔드**: `src/main.py`, `src/core/config.py`, `src/api/`, `src/repositories/`, `src/services/*`
    * **웹**: `web/src/main.tsx`, `web/src/App.tsx`, `web/src/routes/{Landing,Login,Dashboard}.tsx`, `web/src/components/*`, `web/src/lib/api.ts`, `web/src/pwa.ts`
    * **설정/가이드**: `docs/QUICKSTART.md`, `web/README.md`, `web/capacitor.config.ts`, `web/.env.local`

---

## Day 5 핵심 목표

1.  **모바일 네트워크 경로 안정화**: 모바일 기기/에뮬레이터에서 API 연동이 안정적으로 동작하도록 **`VITE_API_BASE_URL`**·**CORS**·**Capacitor `server.url`** 경로를 정리하고 검증한다.
2.  **모바일 레이아웃 스모크 테스트**: `/login`, `/app` 핵심 플로우(로그인 → 대시보드 → 예약/취소)가 세로 위주의 모바일 화면에서 깨지지 않도록 반응형 레이아웃을 스모크 테스트한다.
3.  **오프라인/에러 UX 정돈**: 오프라인/에러 흐름(오프라인 배너, 예약 버튼 비활성화, API 에러 메시지)을 헷갈리지 않고 조용하지만 분명한 UX로 정돈한다.
4.  **환경/인증 전략 문서화**: **“PC 로컬 개발용 / 에뮬레이터·실기기용” `.env` 패턴**, Capacitor 운용 플로우, 1차 인증 전략(로컬 로그인 중심 + Google/Firebase는 실험 수준)을 문서로 정리한다.

---

## 우선 체크포인트

### 1. 네트워크 경로 & CORS

* **`VITE_API_BASE_URL` 패턴 제안**: `web/.env.local`, `web/src/lib/api.ts`에서 `VITE_API_BASE_URL` 사용 방식을 확인하고, 다음처럼 쉽게 바꿀 수 있는 패턴을 제안해 주세요.
    * **PC 개발용 예**: `http://localhost:8000/api/v1`
    * **에뮬레이터/실기기용 예**: `http://192.168.x.x:8000/api/v1`
* **CORS 전략 정리**: `src/core/config.py`, `src/main.py` 기준으로 **`CORS_ORIGINS`** 환경 변수에 위 오리진들을 넣었을 때 무리 없이 동작하도록, 환경 변수 기반 CORS 전략만 간단히 정리해 주세요 (코드 변경은 최소).

### 2. 모바일 레이아웃 스모크 테스트 (`/login`, `/app`)

* **`/login` (`web/src/routes/Login.tsx`)**:
    * 이메일/비밀번호 입력창과 버튼이 모바일에서 가로 스크롤 없이 **한 컬럼**으로 자연스럽게 배치되도록, 기존 Tailwind 유틸리티 범위 내에서만 여백·정렬 정도를 조정해 주세요.
* **`/app` (Dashboard + 각 컴포넌트)**:
    * Dashboard의 `md:grid-cols-2` 그리드가 모바일에서는 **1열**로 자연스럽게 흐르도록 현재 구조를 유지하되, 카드 간 여백/패딩만 가볍게 손보는 수준으로 제안해 주세요.
    * 새로운 CSS 시스템이나 복잡한 레이아웃 컴포넌트는 도입하지 말고, Tailwind 클래스 보정에 집중해 주세요.

### 3. 오프라인/에러 UX 정돈

* **문구 통일**: `web/src/components/OfflineBanner.tsx`, `web/src/components/ReservationForm.tsx`, `web/src/lib/api.ts`를 기준으로:
    * 오프라인 시 배너 메시지, 예약 버튼 비활성화 상태, API 에러 메시지가 서로 모순 없이 같은 톤으로 보이도록 한국어 문구를 정리해 주세요.
* **UX 시나리오**: **“오프라인 → 버튼이 비활성화 → 사용자가 이해할 수 있는 짧은 안내”**가 되는 하나의 UX 시나리오를 상정하고 메시지를 맞춰 주세요.

### 4. 환경·Capacitor·인증 전략 문서화

* `docs/QUICKSTART.md`, `web/README.md`에 다음을 2~3줄씩 추가/보완하는 형태로 제안해 주세요.
    * “PC용 / 에뮬레이터·디바이스용” `VITE_API_BASE_URL` 예시
    * Capacitor `web/capacitor.config.ts`의 **`server.url`**은 **개발 중에만** Vite dev 서버에 붙고, **실제 빌드에서는 제거/주석 처리**한다는 운영 플로우
    * Day 5 기준 인증 전략: “로컬 로그인(`admin@example.com` / `password`) 중심, Google/Firebase 로그인은 선택적 실험(웹뷰/외부 브라우저 전환 이슈는 TODO로 남김)”

### 5. (선택) 모바일 빌드/실기기 확인 플로우 정리

* 이미 정의된 스크립트(`npm run build:pwa`, `npm run cap:sync`, `npm run cap:android`/`npm run cap:ios`)를 활용해,
* “실제 기기나 에뮬레이터에서 확인할 때의 최소 단계”를 5~7줄 정도의 체크리스트로 정리해 주세요.

### 6. UX 테스트 가이드 요청 (사용자 관점, 시각적 테스트)

* 각 주요 작업(네트워크 설정, 레이아웃 조정, 오프라인 UX, 문서화) 이후에,
* 실제 사용자가 모바일에서 앱을 써본다고 가정하고 따라 할 수 있는 **시각적인 테스트 시나리오**를 bullet 목록으로 제안해 주세요.
    * 예: “DevTools 모바일 뷰(iPhone 14 등)에서 `/login`을 열고, 이메일/비밀번호를 입력한 뒤 로그인 버튼을 눌렀을 때 어떤 화면/메시지가 보여야 하는지”
    * 예: “에뮬레이터/실기기에서 네트워크를 끊은 뒤 예약 버튼의 상태와 배너 문구가 어떻게 바뀌어야 하는지”

---

## 제약 및 산출물

* **제약**: `GOAL.md`, `GEMINI.md`의 아키텍처·책임 분리 원칙을 해치지 않도록, 변경은 설정/문구/문서/간단한 Tailwind 보정 수준에 한정합니다.
* **Day 5 종료 시점에는**:
    * 모바일에서 “로컬 로그인 → 대시보드 진입 → 예약 생성/취소” 플로우를 직관적으로, 시각적으로 테스트할 수 있는 시나리오가 정리되어 있고,
    * .env 프로파일링, CORS/Capacitor 운용, 1차 인증 전략이 `docs/QUICKSTART.md`, `web/README.md`에 짧게나마 반영되어 있어야 합니다.

- [Day 5 Codex 전체 대화 로그 보기](./codex_logs/Day5-Log.md)

#### 산출물(핵심 파일)

- **네트워크 설정/UX**
    - `web/.env.local`: PC용(`http://localhost:8000/api/v1`)과 모바일/실기기용(`http://192.168.x.x:8000/api/v1`) VITE_API_BASE_URL 주석 예시 추가.
    - `web/src/lib/api.ts`: `fetch` 래퍼에 오프라인 감지 로직 및 한글 오류 메시지(`오프라인 상태입니다. 네트워크 연결 후 다시 시도해 주세요.`) 통일 (:29)
    - `web/src/components/OfflineBanner.tsx`: `navigator.onLine` 기반 상태 관리로 오프라인 시 노란 배너 표시.
    - `web/src/components/ReservationForm.tsx`: 오프라인 상태일 때 예약 버튼 비활성화 및 `오프라인에서는 예약 생성 불가` 문구로 변경 (:25)

- **모바일 레이아웃 (Tailwind 보정)**
    - `web/src/routes/Login.tsx`: 루트 컨테이너 `min-h-screen flex items-center justify-center px-4 py-8` 및 `max-w-md`로 모바일 중앙 정렬/단일 컬럼화.
    - `web/src/routes/Dashboard.tsx`: 그리드 클래스 `grid gap-4 md:gap-6 md:grid-cols-2`로 조정하여 모바일 기본 1열 스택 보장.
    - `web/src/components/ReservationForm.tsx`: 카라반 미선택 안내 문구를 레이아웃에 독립적인 `먼저 카라반 목록에서 예약할 카라반을 선택해 주세요.`로 수정.

- **문서/Capacitor 플로우**
    - `docs/QUICKSTART.md`, `web/README.md`: PC/에뮬레이터용 `VITE_API_BASE_URL` 설정 예시, Day 5 기준 인증 전략(`로컬 로그인 중심`), Capacitor 빌드 플로우(server.url 설정) 상세 정리.
    - `web/capacitor.config.ts`: 개발 시 `server.url` 사용, 배포 시 주석 처리하는 플로우 명시.

#### 실행/검증 명령

- **API 실행**: `uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000` (PC LAN IP에 노출)
- **프론트 실행**: `cd web && npm run dev -- --host 0.0.0.0 --port 5173` (PC LAN IP에 노출)
- **모바일 접속**: 모바일 브라우저/에뮬레이터에서 `http://<PC_LAN_IP>:5173/login` 접속
- **UX 테스트**:
    - 로그인/세션: 로컬 계정 로그인 → /app 진입 → 새로고침/재접속 시 세션 유지 확인.
    - 레이아웃: 모바일 뷰에서 로그인/대시보드 화면이 1열 스크롤로 깨짐 없이 보이는지 확인.
    - 오프라인: Wi-Fi/네트워크를 끈 상태에서 배너, 버튼 비활성화, 안내 문구가 모두 일관되게 보이는지 확인.

#### 문제 및 해결

1) **모바일에서 API 접근 불가**
    - **현상**: Uvicorn/Vite가 기본적으로 루프백 주소인 **127.0.0.1**에만 바인딩되어 같은 네트워크 내 모바일 기기(LAN IP)에서 PC 서버에 접근 불가, 모든 API 요청이 **ERR_CONNECTION_REFUSED**로 실패.
    - **대응**: 백엔드와 프론트엔드 서버 실행 시 `--host 0.0.0.0` 옵션을 명시적으로 추가하여, 해당 서버가 **모든 네트워크 인터페이스(LAN IP 포함)**에서 요청을 받도록 설정.
    클라이언트 앱이 API 서버를 올바르게 찾도록 `web/.env.local`의 `VITE_API_BASE_URL` 값을 PC의 실제 LAN IP로 수정하는 환경 변수 전략을 확립하여 해결.

2) **모바일 레이아웃**
    - **현상**: 로그인 폼과 대시보드 컴포넌트들이 모바일 뷰에서 **가로 스크롤을 유발**하거나, 콘텐츠가 한 컬럼으로 자연스럽게 떨어지지 않고 깨져 보이는 문제 발생. 특히 대시보드의 2열 그리드가 모바일 해상도에서 겹침.
    - **대응**: Tailwind CSS 유틸리티를 활용하여 복잡한 리팩토링 없이 수정. 
    `Login.tsx`의 루트 컨테이너에 `max-w-md` 및 `flex-col` 스타일을 적용하여 모바일에서 항상 중앙에 위치한 단일 컬럼으로 보이도록 조정.
    `Dashboard.tsx`의 그리드 클래스를 `md:grid-cols-2`로 명시하고 모바일 기본을 1열 스택으로 보장하도록 **gap 및 padding**을 조정.

3) **오프라인 UX 불일치**
    - **현상**: 네트워크 연결이 끊어졌을 때, 사용자는 API 호출 실패 메시지와 오프라인 상태 메시지 혼재.
    버튼이 활성화된 채로 API 호출을 시도해 불필요한 네트워크 오류가 발생.
    - **대응**: **오프라인 상태 감지 로직**을 `web/src/lib/api.ts`와 `web/src/components/OfflineBanner.tsx`에 일관되게 통합.
    네트워크 연결 상태(`navigator.onLine`)가 끊어지면 예약 폼의 버튼을 즉시 **비활성화(disabled)**하고 사용자에게 **오프라인 상태에서는 예약 생성 불가**라는 통일된 문구를 노출.

#### 학습 내용

- **모바일 LAN IP 통신 원리**: 웹 개발에서 `localhost` 또는 `127.0.0.1`은 항상 "클라이언트 자기 자신"을 의미하므로, 모바일 기기가 PC에서 실행되는 서버에 접근하기 위해서는 서버가 **0.0.0.0**에 바인딩되어 LAN 전체에 노출되어야 하고, 클라이언트는 PC의 **실제 LAN IP 주소**를 명시적으로 사용해야만 통신할 수 있음을 이해.
- **PWA/모바일 환경에서의 UX 원칙**: 모바일 환경의 PWA에서는 네트워크 연결 상태가 불안정하거나 끊길 수 있음을 가정하고 설계해야 불필요한 오류 메시지나 실패 경험을 줄일 수 있음을 깨달음.
- **Tailwind 기반 반응형 설계**: 복잡한 모바일 레이아웃 이슈는 **새로운 컴포넌트나 CSS 시스템 없이도** Tailwind의 **Utility-First 접근 방식**과 **미디어 쿼리 프리픽스(md:, sm:)** 만을 사용하여 최소한의 코드 변경으로도 충분히 해결 가능하다는 사실을 실감.


---


### Day 6 - 백엔드 스택 전면 전환 및 소셜 로그인/DB 구조 이관

#### AI 개발 프롬프트

# CaravanShare 프로젝트 Day 6 개발 계획 및 구현 지침

## 역할 및 목표

**역할**: Node.js, MariaDB, Prisma 기반의 목표 스택으로 FastAPI+SQLite 코드베이스를 전면 전환하는 풀스택 개발 도우미.

**목표**:
1. **기술 스택 전환**: Node.js/Express 및 MariaDB/Prisma로 백엔드 전환.
2. **소셜 인증 구현**: Google, Naver, Kakao **세션 기반** OAuth 로그인 구현.
3. **UX 및 기능 보강**: React Hook Form, Framer Motion 등을 사용한 UI 전면 개편.
4. **배포 준비**: Docker 및 Azure VM 배포 가능한 인프라 구조 설계 및 설정.

---

## 현재 프로젝트 구조 및 스택 요약 (Day 5 기준)

| 영역 | 현재 스택 (FastAPI/SQLite) |
| :--- | :--- |
| **프론트엔드** | **React 18.x, TypeScript, Vite** |
| **상태 관리** | @tanstack/react-query, Zustand |
| **스타일링** | **Tailwind CSS** |
| **백엔드/API** | **Python 3.11+, FastAPI** |
| **인증** | JWT 기반 (폼 로그인, Google ID Token 검증) |
| **데이터베이스**| **SQLite** (파일 기반), SQLAlchemy ORM |
| **인프라/배포** | 로컬 `uvicorn` 및 `vite dev`, Docker **없음** |

---

## 현재 스택 vs 확정 목표 스택 비교 및 변경 전략

| 영역 | 유지해도 되는 부분 | 요구사항 때문에 반드시 변경해야 하는 부분 | 변경 규모 | 우선순위 | 변경 전략 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **프론트엔드**| React, TS, Vite, React Router, React Query, Tailwind CSS, Zustand, PWA 골격 | 폼 처리: RHF + Zod 도입. UI/UX: Framer Motion, Headless UI 기반 디자인 시스템 도입. | 중간 | 4 | **기존 UI 컴포넌트를 RHF + Zod 기반으로 마이그레이션**하고, Headless/Framer Motion을 적용하여 UI/UX 개선. |
| **백엔드/API** | 도메인 모델(User, Caravan, Reservation)의 논리적 구조, RESTful 엔드포인트 설계 | **런타임/프레임워크**: Python/FastAPI **→ Node.js/Express**. API 기능은 포팅 필요. | 크게 | 2 | **새로운 `api/` 디렉터리 생성 후 Express 계층 구조로 포팅** (라우터 → 컨트롤러 → 서비스 → 리포지토리). |
| **인증/로그인** | 이메일/비밀번호 로그인 지원 (개념) | **인증 전략**: JWT → **세션 기반(Passport)** 전환. **소셜 로그인**: Google ID Token 검증 → **Google, Naver, Kakao** Passport 리다이렉트 플로우로 확장. | 크게 | 3 | Node 백엔드에 `express-session`, `passport-google/naver/kakao` 전략 구현 및 `/auth/*` 라우트 정리. 프론트 로그인 플로우도 **리다이렉트 방식**으로 변경. |
| **데이터베이스**| 도메인 논리 모델 | **DBMS**: SQLite → **MariaDB**. **ORM**: SQLAlchemy → **Prisma ORM**. 마이그레이션 도구 도입. | 크게 | 1 | **Prisma 스키마**를 정의하고 `prisma migrate`로 MariaDB에 스키마를 적용하는 것이 최우선. |
| **인프라/배포**| 환경 변수 기반 설정 | **개발 환경**: Docker Compose(MariaDB, API, Web) 도입. **운영 환경**: Azure VM + Nginx/PM2 배포 구조 설계 및 포트(80/443) 정리. | 중간 | 5 | `docker-compose.yml` 및 `Dockerfile` 작성 후, Azure 배포용 Nginx/PM2 설정을 문서화. |

---

## 상세 설계 (목표 스택 기준)

### 1. MariaDB + Prisma DB 스키마/마이그레이션

* **DBMS/ORM**: MariaDB 10.11+ / Prisma ORM (`provider = "mysql"`) 사용.
* **핵심 스키마**:
    * `User`: `email` (@unique), `hashedPassword`, `role`, `balance`.
    * `SocialAccount`: `provider` (enum), `providerUserId` (String), `userId` (@relation(User)) 설정. **`@@unique([provider, providerUserId])`**로 소셜 계정 식별.
    * `sessions`: `express-mysql-session` 라이브러리가 사용할 세션 테이블 구조를 활용.
* **마이그레이션**: `api/prisma/schema.prisma`를 정의하고 `npx prisma migrate dev`로 스키마 관리.

### 2. 소셜 로그인 + 세션 기반 인증 플로우

* **세션**: `express-session` 및 `express-mysql-session`을 사용하여 MariaDB에 세션 데이터를 저장하고, **`httpOnly`, `secure` (운영 시)** 쿠키로 세션 ID 관리.
* **Passport**:
    * `passport.serializeUser(user.id)`, `passport.deserializeUser(id)`로 세션에 유저 ID만 저장/조회.
    * `passport-google/naver/kakao` 전략을 Express 라우터에 통합.
* **플로우**:
    * 프론트엔드의 소셜 버튼 클릭 → `/auth/provider` 경로로 **리다이렉트 시작**.
    * `/auth/provider/callback`에서 Passport 인증 성공 시, `req.logIn(user)`로 세션을 생성하고 프론트엔드 경로(`http://localhost:5173/app` 또는 `FRONTEND_BASE_URL/app`)로 **최종 리다이렉트**.
    * 로그인 상태 확인은 `GET /auth/me`를 통해 세션을 검증하여 유저 정보를 반환.

### 3. 프론트엔드 라우팅/상태/디자인 시스템 구조

* **라우팅**: React Router v6 유지. `/`, `/login`, `/app`, `/app/host` 등 경로 유지.
* **폼 검증**: 로그인, 예약, 카라반 폼 등을 **`useForm` (RHF)** 및 **`zodResolver`**를 사용하여 스키마 기반 유효성 검사로 강화.
* **UI/UX**: `web/src/components/ui/` 디렉터리에 공통 컴포넌트(Button, Input 등)를 구성하고, **Framer Motion**을 사용하여 페이지 전환 및 카드 인터랙션에 동적 요소 추가.
* **AI 이미지**: `web/src/assets/ai/`에 고품질 이미지 에셋을 배치하고 랜딩 페이지 등에 활용.

### 4. Azure VM + Docker/Nginx 배포 구조

* **개발**: `docker-compose.yml`로 `db`, `api`, `web` 서비스를 묶어 로컬 개발 환경을 단일 명령으로 관리.
* **운영(Azure)**:
    * **포트**: 외부 노출은 **80/443** 포트만 허용하도록 NSG 및 Nginx 설정.
    * **Nginx**: 프론트 빌드 결과를 정적 서빙하고, `/api/` 경로 요청을 내부 Express 서버(3000 포트)로 리버스 프록시.
    * **배포**: **Node + PM2 + Nginx** 방식(API 안정성 및 관리 용이) 또는 **Docker Compose** 방식을 최종 문서화.

---

## 실제 코드 구현 및 리팩터링 (최종 구현)

* **우선순위 1 (DB)**: MariaDB + Prisma 스키마/마이그레이션 (`api/prisma/schema.prisma`) 구현.
* **우선순위 2 (백엔드)**: Node.js + Express 스켈레톤, 미들웨어, DB 연결 포팅 (`api/src/*`).
* **우선순위 3 (인증)**: Passport + 세션 기반 인증 및 Google/Naver/Kakao 전략 구현 (`api/src/config/passport.ts`, `api/src/routes/auth.ts`).
* **우선순위 4 (프론트 UI)**: 프론트엔드 `useAuthStore` 세션 전환, 로그인 폼 RHF + Zod 마이그레이션, Framer Motion 애니메이션 적용.
* **우선순위 5 (인프라)**: Dockerfile, `docker-compose.yml`, Nginx 설정 예시 추가 및 Azure 배포 가이드 문서화.

---

## 테스트 및 검증

### 백엔드 (Jest + supertest)

* `GET /health` (기본 서버 상태) 테스트.
* `POST /auth/login` (로컬 로그인) 및 `GET /auth/me` (세션 유지) 성공/실패 플로우 테스트.
* 소셜 로그인 콜백(예: `/auth/google/callback`) 성공 시 **302 리다이렉트** 및 세션 생성 확인.

### 프론트엔드 (Vitest + RTL)

* 로그인 페이지 **RHF + Zod** 기반 폼 검증 로직 테스트.
* `useAuthStore`의 세션 기반 유저 로딩/로그아웃 동작 테스트.
* Framer Motion 적용 페이지의 렌더링 스모크 테스트.

### 수동 테스트

* **PC/모바일 브라우저**에서 **Google, Naver, Kakao** 리다이렉트 기반 로그인 → 세션 유지 → 로그아웃 플로우를 엔드투엔드로 점검.
* 반응형 레이아웃 및 동적 UI(애니메이션) 확인.
* 방화벽 환경을 가정한 **80/443 포트** 중심의 외부 접근 가능성 점검.

---

## 문서화 및 Azure 배포 준비

* **`docs/QUICKSTART.md`**: 로컬 개발 환경(Docker, MariaDB, Node API, Vite Web) 세팅 방법, `.env` 환경 변수 예시, 테스트 명령 정리.
* **`docs/DEPLOY_AZURE.md` (신규)**: Azure VM 생성, Node/MariaDB/Nginx 설치, `git clone`, `.env` 설정, **Prisma Migrate 실행**, PM2/Nginx를 사용한 서비스 배포 방법, 80/443 포트 설정 가이드 정리.
* **`.env.example`**: DB, SESSION_SECRET, 모든 OAuth Client ID/Secret 등 **필수 환경 변수 목록**과 예시 값 명시.

---

## 최종 변경 내용 요약

| 항목 | 최종 기술 스택 | 충족 여부 | 변경된 부분 |
| :--- | :--- | :--- | :--- |
| **백엔드/DB** | Node.js/Express, MariaDB, Prisma ORM | 충족 | FastAPI/SQLite에서 Node.js/MariaDB로 **전면 교체**. |
| **인증** | 세션 기반 Passport (Google/Naver/Kakao) | 충족 | JWT 인증에서 **세션 기반 OAuth 플로우**로 전면 전환. |
| **UI/UX** | RHF/Zod, Framer Motion, Headless UI, Tailwind | 충족 | **UI 프레임워크는 유지**했으나, 폼/애니메이션/컴포넌트를 **대규모 리팩터링**. |
| **배포** | Docker Compose, Azure VM, Nginx/PM2 | 충족 | Docker 및 Azure 배포 구조를 **새로 설계/구현**하고 문서화. |

* **기존 유지 부분**: React, TypeScript, Vite, React Query, Zustand, Tailwind CSS, 도메인 모델(논리적 구조).
* **남아 있을 수 있는 TODO**: Azure HTTPS/TLS 적용, 실제 DB 환경에서의 세션 스토리지 테스트(현재는 dev에서 memory store 사용), 소셜 계정 이메일 중복 시 계정 연결(Linking) UX 고도화.

- [Day 6 Codex 전체 대화 로그 보기](./codex_logs/Day6-Log.md)

#### 산출물(핵심 파일)

- **백엔드 스택 전환 (Node.js/Express/Prisma)**
    - `api/`: 새로운 Node.js Express 앱 디렉터리 생성.
    - `api/prisma/schema.prisma`: MariaDB/Prisma 기반 User, SocialAccount, Caravan, Reservation 모델 정의 (:1)
    - `api/src/config/passport.ts`: passport-local, passport-google-oauth20, passport-naver-v2, passport-kakao 전략 초기 구현. (:1)
    - `api/src/routes/auth.ts`: /auth/login (로컬), /auth/register, /auth/me, /auth/google|naver|kakao 엔드포인트 구현. (:1)
    - `api/src/config/session.ts`: `express-session` 및 `express-mysql-session` 설정 (개발 시 메모리, 운영 시 MariaDB 세션 스토어 전환 가능)
    - `api/package.json`: 필요한 Express, Passport, Prisma, TypeScript 패키지 의존성 정의.

- **프론트엔드 전환 (세션 연동/UX)**
    - `web/src/store/auth.ts`: JWT 기반 → 세션 기반 `GET /auth/me` 호출 + 유저 상태 관리 로직으로 전면 전환.
    - `web/src/routes/Login.tsx`: React Hook Form + Zod 기반으로 로그인 폼 리팩터링 및 소셜 로그인 버튼을 백엔드 리다이렉트 경로(/auth/*)로 연결.
    - `web/src/components/ui/{Button,Input,Card}.tsx`: Tailwind + Headless UI 스타일의 공통 컴포넌트 추가.
    - `web/src/App.tsx`, `web/src/routes/{Landing,Dashboard}.tsx`: Framer Motion을 사용한 페이지 전환 애니메이션 추가.

- **인프라/환경 재정비**
    - `docker-compose.yml`: `db` 서비스(MariaDB 10.11) 및 `api` 서비스(Node Express) 추가.
    - `api/Dockerfile`: Node 20 slim 기반의 API 빌드/실행 환경 정의.
    - `api/.env.example`: DB, SESSION_SECRET, OAuth 키 예시 추가.

- **테스트**
    - `api/test/health.test.ts`: Jest + supertest 기반 GET /health 스모크 테스트.
    - `web/src/__tests__/Login.test.tsx`: Vitest 기반 로그인 폼 렌더링/검증 테스트.

#### 문제 및 해결

1) **Docker 빌드 실패 (npm ETARGET)**
    - **현상**: `passport-naver-v2`, `@types/express-mysql-session` 등 Day 6에서 새로 추가된 일부 **패키지/타입 버전**이 npm 레지스트리에 존재하지 않아 Docker 이미지 빌드(`npm install`)가 반복적으로 실패하는 라이브러리의 버전 의존성 문제 발생.
    - **대응**: 빌드 실패 루프에서 벗어나기 위해 `passport-naver-v2`를 안정적인 **`passport-naver`**로 교체하고 존재하지 않는 `@types` 패키지는 `package.json`에서 제거한 뒤 **`declare module`**을 사용하여 프로젝트 내에 타입 선언을 직접 추가하는 전략으로 전환.

2) **Prisma 마이그레이션 권한 에러**
    - **현상**: Docker 환경의 MariaDB에 연결된 일반 계정(`caravan`)이 `npx prisma migrate dev` 실행 시 필요한 **Shadow Database** 생성 권한이 없어 마이그레이션 실패.
    - **대응**: 로컬 개발 시에 한해 `api/.env`의 `DATABASE_URL`을 **root 계정**으로 임시 변경하여 마이그레이션을 실행. 이를 통해 DB 스키마 생성 및 적용을 완료했고, 런타임 시에는 다시 일반 계정을 사용하도록 설정하여 보안과 개발 편의성을 모두 확보.

3) **프론트 Input 컴포넌트의 Ref 문제**
    - **현상**: 새로 마이그레이션된 React Hook Form(RHF)이 커스텀 컴포넌트인 `web/src/components/ui/Input.tsx`에 **ref를 붙이려 했으나**, 폼 값이 RHF에 등록되지 않아 Zod의 `Required` 에러가 지속적으로 발생.
    - **대응**: `Input.tsx` 컴포넌트를 **`React.forwardRef`**로 감싸서, RHF의 `register` 함수가 제공하는 ref를 정상적으로 받아서 최종적인 `<input>` 태그에 전달하도록 수정하여 RHF의 폼 값 추적 문제를 해결.

4) **GitHub Push Protection 차단**
    - **현상**: `docker-compose.yml` 파일에 실제 Google Client ID/Secret 문자열이 포함된 커밋이 히스토리에 남아있어 GitHub Push Protection 차단 발생.
    - **대응**: `docker-compose.yml` 내의 실제 키 값을 `"${VAR_NAME}"` 형태의 **환경변수 참조**로 변경하고, **`git reset --soft HEAD~1`** 후 **`git commit --amend`**를 통해 비밀이 포함된 커밋을 히스토리에서 제거하여 안전하게 푸시 완료.

#### 학습 내용

- **Node.js/TS 환경에서의 라이브러리 타입 선언**: Node.js 환경은 기존 Express 생태계의 라이브러리 중 일부는 타입 선언 파일(`@types/package-name`)을 공식적으로 제공하지 않을 수 있으니 **`declare module 'package-name';`**을 포함하는 **`.d.ts` 파일**을 직접 만들어 TypeScript 컴파일러를 만족시키는 것이 안정적임을 확인.
- **OAuth 리다이렉트 처리의 일관성**: 소셜 로그인 콜백은 서버(Node.js)에서 세션을 설정한 뒤 반드시 **프론트엔드 URL(`FRONTEND_BASE_URL`)**로 리다이렉트할 필요성 있음. 콜백에서 `res.redirect('/app')`처럼 상대 경로를 사용하면 API 서버 도메인으로 이동하여 **`Cannot GET`** 오류를 유발하므로, `res.redirect(`${env.frontendBaseUrl}/app`)`와 같이 프론트 주소를 명시적으로 사용하는 것이 올바른 패턴임을 학습.
- **Prisma Migrate의 권한 관리**: 개발 환경에서 Prisma CLI의 `migrate dev` 명령은 Shadow Database 생성을 위해 **DB에 데이터베이스 생성 권한**이 있는 계정 필요. 런타임(컨테이너)에서 사용하는 일반 계정(`caravan`)은 최소 권한 원칙에 따라 권한이 없을 수 있으므로, 마이그레이션 작업에 한해서만 **DB root 계정**을 사용하는 등 권한을 분리하여 관리하는 것이 효과적임을 깨달음.


---


### Day 7 - Kakao 로그인/Admin/Host 플로우 완성 및 Azure 배포 준비

#### AI 개발 프롬프트

# CaravanShare 프로젝트 Day 7 개발 계획 및 구현 지침

## 역할 및 목표

**역할**: Node.js, MariaDB, Prisma 기반 백엔드와 React 프론트엔드의 소셜 로그인, 권한별 플로우를 완성하고 Azure 배포 환경을 구축하는 풀스택 개발 도우미.

**목표**:
1. **소셜 인증 완성**: Kakao 로그인 구현 및 Google/Naver/Kakao 인증/에러 처리 UX 통일.
2. **도메인 플로우 검증**: Seed 데이터 기반 Host/Admin 기능 및 권한 제어 로직 완성.
3. **배포 인프라 구축**: Azure VM 배포를 위한 Docker Compose/PM2 설정 및 가이드 문서화.
4. **보안/환경변수 정리**: GitHub 공개 레포 정책 준수를 위한 민감 정보 관리 체계 확립.

---

## 실행 계획 (Short Plan)

### 1. Kakao 인증 및 소셜 로그인 UX 통합
* **백엔드**: `passport-kakao` 전략 구현 (`api/src/config/passport.ts`). 이메일 미제공 시 가상 이메일 처리 로직 추가. `/auth/kakao` 라우트 및 콜백 처리 (`api/src/routes/auth.ts`).
* **프론트엔드**: `Login.tsx`에 Kakao 버튼 연결. OAuth 에러(`?error=...`)를 한글 메시지로 매핑하여 표시.

### 2. Host/Admin 플로우 및 Seed 데이터
* **Seed**: `api/prisma/seed.cjs` 작성 (Admin/Host/Guest 계정 + 카라반/예약 더미 데이터).
* **UI/API**: `HostPanel`(예약 상태 변경), `AdminReservations`(전체 조회), `ProfileActions`(잔액 충전) 컴포넌트와 백엔드 API(`PUT /api/users/me/balance` 등) 연결 및 권한 체크 로직 보강.

### 3. 배포 준비 (Azure VM)
* **설정 파일**: `docker-compose.prod.yml` (DB+API+Web), `nginx.caravanshare.conf.example` (리버스 프록시) 작성.
* **문서화**: `docs/DEPLOY_AZURE.md` 생성 (VM 세팅 → 배포 → 도메인 연결 가이드).

### 4. 환경변수 및 리팩토링
* **Env**: `.env.example` 파일들(root, api, web) 최신화. `docker-compose.yml` 비밀 값 변수 처리.
* **테스트**: 백엔드 인증 테스트(`auth.test.ts`) 및 프론트 로그인 폼 테스트 보강.

---

## 실제 코드 구현 및 리팩터링 (최종 구현)

### 1. Kakao 로그인 & 소셜 UX

* **`api/src/config/passport.ts`**:
    * `passport-kakao` 전략 추가.
    * **중요**: Kakao가 반환하는 `profile.id`(Int)를 `String(profile.id)`로 변환하여 Prisma 스키마와 일치시킴.
    * 이메일이 없는 경우 `kakao_${profile.id}@no-email.local` 가상 이메일 생성 로직 적용.
* **`api/src/routes/auth.ts`**:
    * 로그인 성공 시: `res.redirect(env.frontendBaseUrl + '/app')`
    * 로그인 실패 시: `res.redirect(env.frontendBaseUrl + '/login?error=code')` (예: `kakao_server`, `access_denied`)
* **`web/src/routes/Login.tsx`**:
    * `SOCIAL_ERROR_MESSAGES` 상수를 정의하여 에러 코드별 사용자 친화적 메시지 표시.

### 2. Host/Admin/Guest 권한 및 데이터 시드

* **`api/prisma/seed.cjs`**:
    * `npm run seed` 명령으로 실행.
    * `admin@example.com` (ADMIN), `host@example.com` (HOST), `guest@example.com` (GUEST) 유저 생성.
    * 카라반 2개, 예약 2개(pending, confirmed) 데이터 생성.
* **UI/API 권한 연동**:
    * `HostPanel`: `user.role === 'HOST'` 확인 후 렌더링. 예약 승인/취소 API 연결.
    * `AdminReservations`: `user.role === 'ADMIN'` 확인 후 전체 예약 목록 표시.
    * `ProfileActions`: Admin일 경우 잔액 충전 버튼 노출 및 API(`PUT /api/users/me/balance`) 연결.

### 3. Azure VM 배포 인프라

* **`docker-compose.yml` (Local)**:
    * `${GOOGLE_CLIENT_ID}`와 같이 환경 변수 참조 문법으로 변경하여 비밀 값 제거.
* **`docker-compose.prod.yml` (Azure)**:
    * `web` 서비스를 Nginx 컨테이너로 교체하여 정적 파일 서빙 및 `/api` 리버스 프록시 처리.
    * `restart: always` 정책 적용.
* **`infra/nginx.caravanshare.conf.example`**:
    * `location /`: `root /usr/share/nginx/html`, `try_files $uri /index.html`.
    * `location /api/`: `proxy_pass http://api:3000`.

---

## 문서화 및 Azure 배포 준비

* **`docs/DEPLOY_AZURE.md`**:
    * **시나리오 A (Docker)**: `git clone` → `.env` 설정 → `docker compose -f docker-compose.prod.yml up -d`.
    * **시나리오 B (PM2+Nginx)**: Node.js/MariaDB 설치 → `npm run build` → `pm2 start` → Nginx 설정 파일 복사.
    * **공통**: 방화벽(NSG) 80/443 포트 오픈, Google/Naver/Kakao 콘솔 Redirect URI 설정(도메인 필요).
* **`api/.env.example` & `web/.env.local.example`**:
    * 필수 환경 변수(`DATABASE_URL`, `SESSION_SECRET`, `*_CLIENT_ID`, `VITE_API_BASE_URL`) 명시.

---

## 최종 변경 내용 요약

* **기술 스택**: Node.js, Express, Passport(Kakao 추가), Prisma, MariaDB, React, Vite.
* **주요 변경**:
    * Kakao 로그인 추가 및 소셜 로그인 전체 에러 핸들링 통일.
    * Prisma Seed 스크립트로 테스트 데이터 확보.
    * Azure 배포를 위한 Docker Compose Prod 설정 및 Nginx 구성 파일 추가.
    * 공개 레포지토리 보안을 위한 환경 변수 처리 및 문서화 완료.
* **남은 과제**: 실제 도메인 연결 및 HTTPS(Lets Encrypt) 적용(Google OAuth 필수 요건 충족 위해).

- [Day 7 Codex 전체 대화 로그 보기](./codex_logs/Day7-Log.md)

#### 산출물(핵심 파일)

- **Kakao 로그인 & 소셜 UX**
    - `api/src/config/passport.ts`: Kakao 전략 추가 및 `providerUserId`를 `String(profile.id)`로 캐스팅하여 Prisma `Int/String` 타입 불일치 에러 해결 (:130)
    - `api/src/routes/auth.ts`: OAuth 콜백에서 성공 시 `/app` 리다이렉트, 실패 시 `/login?error=...` (예: `kakao_server`, `kakao_no_email`) 안전 리다이렉트 로직 통일 (:1)
    - `web/src/routes/Login.tsx`: `SOCIAL_ERROR_MESSAGES` 맵 추가하여 `?error=...` 코드를 사용자 친화적인 한글 메시지로 표시 (:30)
    - `api/src/config/passport.ts`: Kakao 이메일 미제공 시 `kakao_<ID>@no-email.local` 형태의 가짜 이메일 생성 로직 추가.

- **Host/Admin 플로우 & 데모 데이터**
    - `api/prisma/seed.cjs`: `admin@example.com` (admin), `host@example.com` (host), `guest@example.com` (guest) 유저와 데모 카라반/예약 데이터를 생성하는 Prisma Seed 스크립트 추가 (:1)
    - `web/src/components/HostPanel.tsx`: `user.role === 'HOST'`일 때만 렌더링, 예약 상태 변경(confirmed/cancelled) 버튼 로직 구현 (:1)
    - `web/src/components/AdminReservations.tsx`: `user.role === 'ADMIN'`일 때만 전체 예약 목록 표시 (:1)
    - `web/src/components/ProfileActions.tsx`: Admin 전용 “잔액 충전 (+100)” 버튼(PUT /api/users/me/balance) 추가.
    - `api/src/routes/caravans.ts`: 예약 캘린더용 `GET /api/caravans/:id/calendar` API 구현 (:31)

- **환경변수/배포**
    - `api/.env.example`, `web/.env.local.example`, `/.env.example`: 필요한 모든 DB, Session, OAuth, API_BASE_URL 환경 변수 명시.
    - `docker-compose.yml`: DB/API 비밀번호/URL을 모두 `${VAR_NAME}` 참조로 변경. (:5)
    - `docker-compose.prod.yml`: Azure Docker 배포를 가정한 db + api + web(nginx) 3 서비스 예시 추가.
    - `infra/nginx.caravanshare.conf.example`: Nginx / 정적 서빙 + /api/* 리버스 프록시 설정 샘플 추가.
    - `docs/DEPLOY_AZURE.md`: A) Docker Compose 기반, B) Node + PM2 + Nginx 기반 Azure VM 배포 시나리오를 Ubuntu VM 기준으로 단계별 정리.

- **테스트**
    - `api/test/auth.test.ts`: POST /auth/login → GET /auth/me (로컬 로그인) 및 /auth/google/callback (mocking) 테스트 추가.
    - `web/src/routes/Login.test.tsx`: Vitest로 소셜 버튼 렌더링, Zod 폼 검증, `?error=...` 메시지 표시 테스트 추가.
    - `web/src/routes/App.test.tsx`: HOST/ADMIN 권한에 따른 HostPanel/AdminReservations 조건부 렌더링 테스트 추가.

#### 문제 및 해결

1) **Kakao 로그인 Prisma 타입 에러**
    - **현상**: `passport-kakao` 전략은 사용자 고유 ID를 **숫자(Int)** 형태로 반환했으나, MariaDB에 정의된 `SocialAccount.providerUserId` 칼럼은 문자열(`String`) 타입으로 설정되어 있어 **Prisma의 findUnique 호출** 시 타입 불일치 에러 발생.
    - **대응**: `api/src/config/passport.ts`의 Kakao 전략 로직에서 `profile.id`를 DB에 저장/조회하기 전에 **`String(profile.id)`**로 명시적 캐스팅을 적용해 Prisma의 String 타입 요구사항을 만족시키고 데이터베이스와의 일관성 문제를 해결.

2) **소셜 로그인 Redirect URI 유효성 문제 (Google)**
    - **현상**: Azure VM 배포 시 Google OAuth 콘솔에 VM의 **공용 IP 주소**를 Redirect URI로 등록하려 하자 Google 정책상 **'공개 최상위 도메인(TLD)'**이 아니라는 이유로 등록이 거부됨.
    - **대응**: Google 로그인까지 외부에서 완벽하게 지원하기 위해 **도메인(caravanshare.xyz)**을 구매하고 DNS A 레코드를 Azure VM 공용 IP에 연결하는 전략을 채택. 이후 모든 OAuth Redirect URI와 `FRONTEND_BASE_URL`을 **`http://caravanshare.xyz/...`** 도메인 기준으로 변경하여 Google의 유효성 검사 통과.

3) **Kakao 이메일 권한 문제 및 처리**
    - **현상**: 이메일이 없는 Kakao 계정 사용자는 로그인 자체가 불가한데, 카카오 개발자 콘솔에서 이메일 정보에 대한 **권한 신청/승인 절차**가 과제용으로 수행할 수 없다는 문제 발생.
    - **대응**: 백엔드 `passport.ts`에서 **이메일이 제공되지 않을 경우** `kakao_<ID>@no-email.local` 형태의 **가상(synthetic) 이메일**을 생성하여 User 레코드를 만들도록 로직을 수정.

4) **Nginx 502/403 에러 (배포 환경)**
    - **현상**: Azure VM에 Nginx를 구성한 후 브라우저 접속 시 **403 Forbidden** (정적 파일 문제) 또는 **502 Bad Gateway** (API 프록시 문제)가 발생.
    - **대응**: 403 에러는 Nginx `root` 경로에 **프론트엔드 빌드 결과(`web/dist`) 대신 API 빌드 결과(`api/dist`)**가 복사되어 발생했음을 확인하고, 웹 빌드 파일을 올바르게 복사하도록 수정. 
    502 에러는 PM2로 API 서버(`127.0.0.1:3000`)를 띄우지 않아 Nginx의 프록시 대상이 비어있어 발생했음을 확인하고 `pm2 start`로 API를 기동하여 해결.

#### 학습 내용

- **Prisma와 OAuth ID 타입 일관성**: Prisma를 사용할 때 외부 OAuth Provider(예: Kakao)가 고유 ID를 숫자(Int)로 제공하더라도, DB 모델에서 해당 ID를 **String**으로 정의했다면 반드시 입력 시 **`String()` 캐스팅**을 적용하여 타입 불일치로 인한 런타임 에러를 방지해야 한다는 사실을 깨달음.
- **도메인 기반 OAuth의 필수성**: Google과 같은 주요 OAuth Provider는 보안을 이유로 **순수 IP 주소**를 콜백 URI로 허용하지 않으니 Azure VM 등 공용 IP 환경에서 소셜 로그인을 테스트하려면 **도메인(TLD)**을 연결하고 해당 도메인을 콜백 URI로 등록하는 것이 필수적임을 확인.
- **DB 권한/데모 데이터 관리**: 실제 서비스와 유사한 시나리오(Host/Admin 권한, 예약 상태 변경)를 데모하려면 **Prisma Seed 스크립트**를 작성하여 관리자/호스트 유저와 데모 데이터를 자동으로 생성하고 초기화하는 프로세스를 구축하는 것이 가장 올바른 길임을 실감.


---


