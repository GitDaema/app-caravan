# 프로젝트 개발 일지

## 프로젝트 개요
- 프로젝트명: CaravanShare (app-caravan)
- 목표: FastAPI 기반 예약 도메인 API와 Vite+React PWA를 통합한 멀티플랫폼(웹/PWA, 모바일 래핑 가능) 카라반 공유 앱 MVP 구축 — 폼 로그인과 Google 로그인(토큰 교환) 지원, 기본 예약 흐름 작동, 간단한 관리자/호스트 권한 시나리오 제공
- 범위: 서버(FastAPI + SQLite/SQLAlchemy) · 웹(PWA, React Router, TanStack Query, Zustand) · 개발/테스트 스크립트(Windows 우선) · 최소 스모크 테스트(pytest)

---

## 개발 과정
- 기록 방법
  1. 작업을 일 단위로 나누어 핵심 산출물과 결정만 요약
  2. API·UI 스펙은 `GEMINI.md`를 단일 소스 오브 트루스로 유지하고, 실제 구현 중 생긴 차이는 일지에 근거와 함께 명시
  3. 실행 방법과 테스트는 `docs/QUICKSTART.md` 및 각 `README.md`에 반영 후 링크
  4. 커밋 메시지는 Conventional Commits 형식, AI 관여 표시는 `[ai-assist]`

---

### Day 1 - 환경 세팅 및 백엔드 도메인/API 골격 구현

#### AI 개발 프롬프트(요약)
- 기준 문서: `GEMINI.md`의 ROLE/GOAL/API SPEC/BACKEND REQUIREMENTS
- 목표: 인증(폼 로그인 + 서버발급 JWT)·사용자/카라반/예약 도메인 모델·리포지토리/서비스 계층·예약 검증/가격 계산·기본 엔드포인트 구현 및 스모크 테스트

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

#### AI 개발 프롬프트(요약)
- 기준 문서: `GEMINI.md`의 FRONTEND REQUIREMENTS/AUTH FLOW
- 목표: Vite+React+TS 기반 PWA 스캐폴딩, React Router/Query/Zustand 상태, Google 로그인(idToken) → 서버 교환 엔드포인트 연동(로컬 계정 폴백 포함), 예약/카라반 UI 연결

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
