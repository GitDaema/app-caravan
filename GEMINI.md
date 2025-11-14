# ROLE
너는 멀티플랫폼(PC/모바일) 앱을 구현하는 풀스택 코딩 에이전트다. 출력은 “파일별 전체 코드 본문”만 포함하라. 설명/수다는 최소화하고, 각 코드 블록 첫 줄에 파일 경로 주석을 넣어라(예: `# web/src/main.tsx`). 한 번에 실행 가능한 구조를 생성하고, README에 로컬 실행/빌드 방법을 명시하라. 항상 한국어로 답변해라.

# GOAL
- 하나의 코드베이스로 PC와 모바일에서 모두 실행 가능한 앱을 만든다.
- 웹(PWA)로 동작하며, 모바일 빌드는 Capacitor로 래핑 가능하도록 한다. (데스크톱은 선택: Tauri 스캐폴드만 README에 옵션으로 안내)
- **구글 로그인** 및 **이메일/비밀번호** 로그인을 지원하고, 로그인 상태로 백엔드 API(예약, 캐러밴 관리 등) 호출이 가능하다.
- **사용자 역할**(일반 사용자, 호스트, 관리자)에 따른 기능 분리를 제공한다.
- 현대적인 **UI/UX**(반응형, 접근성, 기본 컴포넌트 일관성)를 제공한다.

# STACK (최신)
## Frontend (Web/PWA, 모바일 래핑 베이스)
- Vite + React + TypeScript
- react-router-dom
- @tanstack/react-query (데이터 패칭/캐싱)
- Zustand (전역 상태 관리)
- Tailwind CSS + shadcn/ui + lucide-react
- Firebase Web SDK v10 (Google Auth Provider)
- Capacitor v6 (iOS/Android 래핑 준비)
- PWA: `vite-plugin-pwa`
- Testing: `vitest`, `react-testing-library`

## Backend (API)
- FastAPI (Python 3.11+)
- Uvicorn
- **SQLAlchemy** (ORM)
- **Alembic** (데이터베이스 마이그레이션)
- Pydantic (v2, with `pydantic-settings`)
- `python-jose[cryptography]` (JWT)
- `passlib[bcrypt]` (비밀번호 해싱)
- `google-auth` (Google ID 토큰 검증)
- `pytest` (테스트)

# ARCHITECTURE (Backend)
백엔드는 계층형 아키텍처(Layered Architecture)를 채택하여 각 부분의 책임을 명확히 분리했다.

- **`src/models`**: SQLAlchemy 모델. 데이터베이스 테이블 스키마를 정의.
- **`src/schemas`**: Pydantic 스키마. API 요청/응답 데이터 유효성 검사 및 직렬화/역직렬화.
- **`src/repositories`**: 데이터베이스 접근 계층. CRUD 연산을 수행하며, 서비스 계층과 데이터베이스를 분리.
- **`src/services`**: 비즈니스 로직. 여러 리포지토리를 조합하여 복잡한 비즈니스 규칙을 처리.
- **`src/api`**: FastAPI 엔드포인트. HTTP 요청을 받아 적절한 서비스로 전달하고, 결과를 HTTP 응답으로 반환.
- **`src/core`**: 설정(`config.py`), 보안(`security.py`) 등 프로젝트 전반의 핵심 기능.
- **`src/database`**: 데이터베이스 세션 관리(`session.py`).
- **`src/exceptions`**: 커스텀 예외 정의.

# AUTH FLOW
1.  **Google 로그인**:
    1.  프론트엔드가 Firebase Google Sign-In으로 `idToken`을 획득.
    2.  프론트엔드가 백엔드에 `POST /api/auth/google/verify`로 `{ "idToken": "..." }` 전송.
    3.  백엔드는 Google ID 토큰을 검증하고, 사용자 생성/조회 후 내부 JWT(Access Token)를 발급.
2.  **이메일 로그인**:
    1.  프론트엔드가 `POST /api/login/access-token`으로 이메일/비밀번호 전송.
    2.  백엔드는 사용자 검증 후 내부 JWT를 발급.
3.  **API 접근**: 프론트엔드는 이후 모든 요청의 `Authorization: Bearer <access_token>` 헤더에 JWT를 담아 API 호출.

# API SPEC (주요 엔드포인트)
- **Auth & Users**
  - `POST /api/auth/google/verify`: 구글 토큰 검증 및 JWT 발급
  - `POST /api/login/access-token`: 이메일/비밀번호 로그인
  - `POST /api/users/`: 사용자 회원가입
  - `GET /api/users/me`: 현재 로그인된 사용자 정보
  - `PUT /api/users/me/balance`: 사용자 잔액 충전 (개발용)
- **Caravans**
  - `GET /api/caravans/`: 캐러밴 목록 조회
  - `POST /api/caravans/`: (호스트) 새 캐러밴 등록
  - `GET /api/caravans/{caravan_id}`: 특정 캐러밴 정보 조회
- **Reservations**
  - `GET /api/reservations/`: (사용자) 내 예약 목록
  - `POST /api/reservations/`: 새 예약 생성
  - `POST /api/reservations/{reservation_id}/cancel`: 예약 취소
- **Host**
  - `GET /api/host/reservations`: (호스트) 내 캐러밴의 예약 목록
- **Admin**
  - `GET /api/admin/reservations`: (관리자) 모든 예약 목록

# FRONTEND REQUIREMENTS (UI/UX)
- **페이지**:
  - `/`: 랜딩 페이지 (캐러밴 목록)
  - `/login`: 로그인/회원가입 페이지
  - `/app`: 로그인 후 대시보드 (내 예약, 예약 만들기)
  - `/host`: (호스트) 호스트 패널 (내 캐러밴, 받은 예약 관리)
  - `/admin`: (관리자) 관리자 대시보드
- **주요 컴포넌트**:
  - `Header`: 로그인/로그아웃, 프로필, 잔액 표시
  - `CaravanList`: 캐러밴 카드 목록
  - `CaravanCalendar`: 캐러밴 예약 가능 날짜 표시
  - `ReservationForm`: 예약 생성 폼
  - `ReservationList`: 내 예약 목록
  - `HostPanel`: 호스트용 관리 UI
  - `AdminReservations`: 관리자용 예약 관리 UI
  - `BalanceCard`: 사용자 잔액 표시 및 충전
- **상태 관리 (Zustand)**:
  - `useAuthStore`: `{ user, accessToken, ... }`
  - `useUIStore`: `{ isSidebarOpen, ... }`
- **데이터 페칭 (@tanstack/react-query)**: API 호출 결과 캐싱 및 상태 관리

# FILE TREE (현재 구조)
```
.
├── src/                      # Backend Source
│   ├── api/
│   │   ├── api.py
│   │   └── endpoints/
│   │       ├── auth_google.py
│   │       ├── caravans.py
│   │       ├── login.py
│   │       ├── reservations.py
│   │       └── users.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   ├── database/
│   │   └── session.py
│   ├── models/
│   │   ├── caravan.py
│   │   ├── reservation.py
│   │   └── user.py
│   ├── repositories/
│   │   ├── caravan_repository.py
│   │   ├── reservation_repository.py
│   │   └── user_repository.py
│   ├── schemas/
│   │   ├── caravan.py
│   │   ├── reservation.py
│   │   ├── token.py
│   │   └── user.py
│   ├── services/
│   │   ├── caravan_service.py
│   │   ├── reservation_service.py
│   │   └── user_service.py
│   └── main.py
├── web/                      # Frontend Source
│   ├── src/
│   │   ├── components/
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── CaravanCalendar.tsx
│   │   │   ├── CaravanList.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── HostPanel.tsx
│   │   │   └── ReservationForm.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── firebase.ts
│   │   ├── routes/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Landing.tsx
│   │   │   └── Login.tsx
│   │   ├── store/
│   │   │   ├── auth.ts
│   │   │   └── ui.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── package.json
├── backend/                  # Legacy (현재 사용 안 함)
├── requirements.txt
└── README.md
```

# ACCEPTANCE CRITERIA
- **로컬 실행**:
  1. 백엔드: `uvicorn src.main:app --reload` 실행
  2. 프론트엔드: `npm install && npm run dev` 실행
- **기능 검증**:
  1. `/login`에서 구글 또는 이메일로 로그인/회원가입 후 `/app`으로 이동.
  2. `/` 또는 `/app`에서 캐러밴을 선택하고 예약 생성.
  3. 내 예약 목록에서 방금 만든 예약 확인 및 취소 가능.
  4. (호스트 역할 유저) `/host`에서 자신이 등록한 캐러밴 및 예약 현황 관리.
- **PWA**: 웹 앱 설치 가능(manifest/service worker 동작), 모바일 반응형 UI.
- **Capacitor**: `npx cap init` 등 Capacitor CLI를 통한 모바일 앱 빌드 준비.
