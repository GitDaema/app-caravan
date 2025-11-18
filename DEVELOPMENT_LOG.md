# CaravanShare 개발 로그

이 문서는 CaravanShare(app-caravan) 프로젝트의 일별 개발 기록입니다.  
FastAPI → Node/Express 전환, React PWA, PWA/모바일 대응, 그리고 Day7 의 OAuth/Host/Admin/배포 작업까지 핵심 흐름만 정리했습니다.

---

## Day 1 – 초기 분석 및 FastAPI 기반 골격

- 기존 FastAPI + SQLite/SQLAlchemy 코드(`src/`, `backend/`) 구조를 분석하고, `GOAL.md` 기준 도메인 요구사항(User/Caravan/Reservation/권한)을 정리했다.
- User/Reservation/Caravan CRUD 를 리포지토리/서비스 계층으로 분리하는 리팩토링 방향을 잡았다.
- 간단한 예약 생성/조회 API 와 pytest 기반 최소 테스트를 구성했다.

---

## Day 2 – 예약 도메인 세부 규칙 및 캘린더 뷰 초안

- Reservation 모델에 기간(start/end), 상태(pending/confirmed/cancelled), 중복 방지 규칙을 정리했다.
- FastAPI 시절 예약 생성 시 동일 카라반에 겹치는 구간이 있으면 에러를 반환하는 비즈니스 로직을 작성했다.
- “카라반별 예약 캘린더” 개념을 도입하고, 날짜 범위 리스트를 반환하는 엔드포인트 초안을 만들었다.

---

## Day 3 – React PWA 기반 프론트엔드 골격

- Vite + React 18 + TypeScript 프로젝트(`web/`)를 생성하고, Tailwind CSS, React Router, Zustand, React Query 를 세팅했다.
- 기본 페이지:
  - `/` – Landing (서비스 소개 + “지금 시작하기” 버튼)
  - `/login` – 로그인/회원가입 화면
  - `/app` – 대시보드(Host/Admin/Guest 공통)
- 예약 폼/리스트/카라반 리스트 컴포넌트의 와이어프레임을 작성하고, 더미 데이터 기반 UI 를 우선 구현했다.

---

## Day 4 – PWA, 오프라인 UX, Capacitor 스캐폴드

- `vite-plugin-pwa` 를 도입하고, PWA 매니페스트/아이콘/테마 컬러를 CaravanShare 브랜딩에 맞게 설정했다.
- `web/src/pwa.ts` + `web/src/components/PwaInstallBanner.tsx`:
  - `beforeinstallprompt` 이벤트를 사용해 “앱 설치” 배너를 노출하는 UX를 추가했다.
  - `registerSW` 의 `onNeedRefresh` 콜백으로 새 버전 감지 시 “새 버전이 있습니다. 새로고침할까요?” 패턴 적용.
- `web/src/components/OfflineBanner.tsx` + `web/src/lib/api.ts`:
  - `online` / `offline` 이벤트를 감지해 상단 오프라인 배너를 표시.
  - 공통 fetch 헬퍼에서 네트워크 오류 시 “오프라인 상태입니다” 메시지를 던지도록 처리.
- Capacitor 스캐폴드:
  - `web/capacitor.config.ts` 와 `web/package.json` 스크립트(`cap:init`, `cap:sync`, `cap:android`, `cap:ios`) 를 추가하여 PWA → 하이브리드 앱 래핑 준비.

---

## Day 5 – Node.js + Express + Prisma 전환 계획

- FastAPI 코드 구조를 참고해 Node.js 20 + TypeScript + Express + Prisma 조합으로 백엔드를 전환하기로 결정했다.
- MariaDB 를 기본 DB 로 선택 (`provider = "mysql"`, `Caravan` / `Reservation` / `User` / `SocialAccount` 스키마 정의).
- Express 서버 구조:
  - `createApp()` (`api/src/app.ts`) 에서 CORS, Helmet, morgan, JSON 파서, 쿠키 파서 세팅.
  - `configureSession()` + `configurePassport()` 로 세션/Passport 를 모듈 분리.
  - 라우트: `/auth`, `/api/users`, `/api/caravans`, `/api/reservations`.
- `docker-compose.yml` 로 `db`(MariaDB), `api`(Express) 를 로컬에서 쉽게 올릴 수 있게 구성.

---

## Day 6 – Express + Passport + React 통합 1차 완료

- Prisma 스키마 확정:
  - `UserRole`(guest/host/admin), `CaravanStatus`, `ReservationStatus`, `SocialProvider`(GOOGLE/NAVER/KAKAO).
  - `User`, `SocialAccount`, `Caravan`, `Reservation` 모델 및 관계 정의.
- Express + Passport:
  - Local 전략 + Google/Naver/Kakao 전략 초안을 `api/src/config/passport.ts` 에 구현.
  - `express-session` + (개발용) 메모리 스토어, 추후 MariaDB 스토어로 확장할 수 있게 `SESSION_STORE` 옵션화.
  - `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/me` 및 각 `/auth/*/callback` 라우트 초안 작성.
- React 측:
  - `useAuthStore` 로 세션 상태 관리, `/auth/me` 호출로 로그인 여부를 파악.
  - `/login` 에 소셜 로그인 버튼(Google/Naver/Kakao) 추가.
  - `/app` 대시보드에 HostPanel, AdminReservations, ReservationForm/List, CaravanForm/List, CaravanCalendar, BalanceCard 등을 배치.

---

## Day 7 – OAuth + Host/Admin 플로우 + 배포 플랜

### 1) Kakao 소셜 회원가입/로그인 완성

- `api/src/config/passport.ts`
  - Kakao 전략에서 `profile._json.kakao_account.email` / `profile._json.kakao_account.profile.nickname` 을 안전하게 읽도록 정리.
  - `deserializeUser` 가 항상 `socialAccounts` 를 포함해 User 를 로드하도록 변경 (향후 provider 표시에 사용 가능).
- `api/src/routes/auth.ts`
  - 공통 `serializeUser()` 헬퍼 추가:
    - 응답에서 `id`, `email`, `fullName`, `balance`, `role`(대문자)만 반환.
    - `hashedPassword` 는 클라이언트로 보내지 않음.
  - `/auth/login`, `/auth/register`, `/auth/me`:
    - 모두 `{ user: { ... } }` 구조를 사용하도록 통일.
  - `/auth/google|naver|kakao/callback`:
    - 기존 `failureRedirect` 방식 → 커스텀 콜백으로 변경.
    - OAuth 에러/동의 취소 시:
      - 예: `?error=google_cancelled`, `?error=kakao_cancelled`.
    - 이메일 미제공 시:
      - 예: `?error=naver_no_email`, `?error=kakao_no_email`.
    - 로그인/서버 오류 시:
      - 예: `?error=google_login`, `?error=google_server` 등으로 코드화.
    - 성공 시 세션 생성 후 항상 `${FRONTEND_BASE_URL}/app` 으로 리다이렉트.
- Kakao 엣지 케이스 처리:
  - 이메일 미제공: `done(null, false, { message: 'No email from Kakao' })` → `/login?error=kakao_no_email`.
  - 동의 취소: `?error=access_denied` → `/login?error=kakao_cancelled`.

### 2) 소셜 계정 linking 및 인증 UX 보강

- `upsertSocialUser` (passport 설정 내부 헬퍼):
  - `SocialAccount(provider, providerUserId)` 기준으로 기존 소셜 계정 조회.
  - 이미 연결된 계정이 있으면 바로 해당 User 반환.
  - 같은 이메일의 User 가 있으면 `socialAccounts.create` 로 provider 연결.
  - 없으면 새 User(role: guest) + SocialAccount 를 생성.
- `api/src/routes/auth.ts`
  - `/auth/me` 응답이 항상 동일 구조의 `{ user: {...} }` 를 반환하도록 변경 → 프론트에서 provider 종류와 관계없이 동일하게 처리 가능.
- `web/src/store/auth.ts`
  - `/auth/me` 응답을 `data.user` 로 고정.
  - `role` 타입을 `'GUEST' | 'HOST' | 'ADMIN'` 으로 유지하면서, 백엔드에서 대문자로 직렬화된 값을 그대로 사용.
  - 세션 조회 실패 시 에러 메시지를 한국어로 정리.
- `web/src/routes/Login.tsx`
  - 인코딩 문제로 깨져 있던 한글 메시지를 모두 복구.
  - `useSearchParams` 로 `?error=` 코드를 읽고, 다음과 같이 사용자 친화적 메시지로 매핑:
    - `google_no_email`, `naver_no_email`, `kakao_no_email`
    - `*_cancelled`, `*_server`, `*_login`
    - 알 수 없는 코드는 “소셜 로그인에 실패했습니다. 다시 시도해 주세요.” 로 처리.
  - 소셜 버튼 레이블을 `Google로 로그인`, `Naver로 로그인`, `Kakao로 로그인` 으로 통일.

### 3) Host/Admin 플로우 및 데모 데이터

- Prisma seed (`api/prisma/seed.cjs`)
  - 데모용 사용자:
    - `admin@example.com` / `password` (role: `admin`)
    - `host@example.com` / `password` (role: `host`)
    - `guest@example.com` / `password` (role: `guest`, 초기 잔액 100,000)
  - 데모 카라반 2개:
    - Family Caravan Alpha, Premium Lakeview Caravan (모두 host 소유).
  - 예약 2개:
    - 첫 번째 카라반: 가까운 날짜 범위, `pending`.
    - 두 번째 카라반: 그 이후 날짜 범위, `confirmed`.
  - `npm run seed` (`node prisma/seed.cjs`) 로 실행할 수 있도록 `api/package.json` 에 스크립트 추가.
- Host/Admin/Guest UI 정리
  - Host 전용:
    - `web/src/components/HostPanel.tsx`:
      - `user.role === 'HOST'` 일 때만 렌더링.
      - Host 가 소유한 카라반에 대한 예약 목록 표시, `pending → confirmed` / `confirmed → cancelled` 상태 변경 가능.
      - 상태 변경 성공 시 HostPanel + 해당 카라반 캘린더 Query 무효화.
  - Admin 전용:
    - `web/src/components/AdminReservations.tsx`:
      - `user.role === 'ADMIN'` 일 때만 전체 예약 목록 표시.
    - `web/src/components/ProfileActions.tsx`:
      - Admin 전용 “잔액 충전 (+100)” 버튼 → `PUT /api/users/me/balance` 호출 후 `fetchMe` 로 잔액 갱신.
  - Guest/공통:
    - `web/src/components/CaravanForm.tsx`:
      - Host 전용 카라반 등록 폼.
    - `web/src/components/CaravanList.tsx`:
      - 위치/가격/인원 필터 + Host 본인 카라반 표시(`내 카라반`).
    - `web/src/components/CaravanCalendar.tsx`:
      - 선택된 카라반의 예약 구간을 달력으로 표시 (`GET /api/caravans/:id/calendar`).
    - `web/src/components/ReservationForm.tsx` + `ReservationList.tsx`:
      - Guest 의 예약 생성 및 취소 플로우 구현.
    - `web/src/components/BalanceCard.tsx`:
      - `GET /users/me` 기반 현재 잔액 표시.
    - `web/src/components/DemoOverview.tsx`:
      - `/dev/overview` 응답(카라반/예약 요약)을 보여주는 데모 카드.

### 4) Azure VM 배포 플랜 문서화

- `docs/DEPLOY_AZURE.md`
  - **공통 준비**:
    - Ubuntu VM 생성, Node 20, Docker, docker-compose-plugin, Nginx 설치.
    - 레포 클론 후 루트 `.env` 생성 (`.env.example` 기반).
  - **시나리오 A – Docker Compose 기반**:
    - `docker-compose.prod.yml` + `infra/nginx.caravanshare.conf.example` 사용.
    - `web` 쪽에서 `npm run build` 로 `web/dist` 생성 후, Nginx 컨테이너가 이를 정적 서빙.
    - `/api/*` 요청은 `proxy_pass http://api:3000/;` 를 통해 Express API 로 전달.
    - `MARIADB_*`, `DATABASE_URL`, `SESSION_SECRET`, `FRONTEND_BASE_URL`, OAuth 키 등을 `.env` 로 관리.
  - **시나리오 B – Node + PM2 + Nginx 기반**:
    - VM 에 MariaDB 설치 후 `caravanshare` DB 및 `caravan` 유저 생성.
    - `api/.env` 에 로컬 DB (`localhost:3306`) 기준 `DATABASE_URL` 설정.
    - `npx prisma migrate deploy` → `node prisma/seed.cjs` → `npm run build` → `pm2 start dist/server.js`.
    - `web` 빌드 결과를 `/var/www/caravanshare-web` 에 복사하고, Nginx 가 정적 서빙 + `/api/*` 프록시를 담당.

### 5) 환경변수/비밀 관리 모델 정리

- `.gitignore`:
  - 루트 `.env`, `web/.env`, `web/.env.local`, `api/.env.local`, `*.db` 등을 버전 관리에서 제외.
- 예시 파일 보강:
  - `api/.env.example`:
    - `SESSION_SECRET`, `SESSION_COOKIE_NAME`, `SESSION_STORE`, `FRONTEND_BASE_URL`, 각 OAuth Client ID/Secret/Callback URL 명시.
  - `web/.env.local.example`:
    - `VITE_API_BASE_URL`, 선택적인 Firebase 키 예시.
  - 루트 `.env.example`:
    - Docker/Azure 에서 사용할 환경 변수 이름과 예시 값을 한 곳에 정리.
- `docker-compose.yml` / `docker-compose.prod.yml`:
  - 모든 민감 정보는 `${VAR_NAME}` 로만 참조하고, 실제 값은 루트 `.env` 또는 VM 환경변수에만 정의.

### 6) 테스트 및 품질 보강

- **백엔드 (Jest + supertest)**:
  - `api/test/health.test.ts`:
    - 기존 `GET /health` 테스트 유지 (`SESSION_STORE=memory` 로 세션 스토어를 메모리로 강제).
  - `api/test/auth.test.ts`:
    - Prisma 로 테스트용 유저를 생성한 뒤 `POST /auth/login` → `GET /auth/me` 가 정상 동작하는지 검증.
    - `passport.authenticate` 를 테스트용으로 패치하여 `/auth/google/callback` 성공 시 `/app` 으로 302 리다이렉트 되는 happy path 확인.
- **프론트엔드 (Vitest + RTL)**:
  - `web/src/routes/Login.test.tsx`:
    - 소셜 버튼 3개 렌더링 여부 검사.
    - 이메일 형식 검증 및 에러 메시지 노출 확인.
    - 기본 값(admin@example.com/password) 제출 시 `useAuthStore.loginLocal` 이 호출되는지 확인.
    - `?error=kakao_no_email` 쿼리 시 Kakao 이메일 미제공 메시지가 노출되는지 확인.
  - `web/src/routes/App.test.tsx`:
    - 로그인하지 않은 상태에서 HostPanel/AdminReservations 가 렌더링되지 않는지 검사.
    - `HOST` 사용자일 때 `호스트 예약 관리` 카드가 보이는지, `ADMIN` 사용자일 때 `전체 예약 (관리자)` + `잔액 충전 (+100)` 버튼이 보이는지 검증.
    - `api.get/post/put` 은 Vitest mock 으로 대체해 테스트가 네트워크/백엔드에 의존하지 않도록 구성.

### 7) Day 7 회고 및 TODO

- **배운 점**
  - Passport 기반 소셜 로그인에서도, 콜백 라우트에서 커스텀 콜백을 사용하면 UX 중심의 에러 핸들링(`?error=...`)이 가능하다.
  - `User`/`SocialAccount` 를 분리하고 이메일 기준 linking 을 해두면, Google/Naver/Kakao 를 왔다 갔다 해도 하나의 계정으로 관리할 수 있다.
  - Host/Admin/Guest 플로우를 실제 데이터(seed) 기준으로 점검하면, UI 인코딩 문제나 권한 체크 누락 등을 한 번에 드러낼 수 있다.
  - 배포 시나리오를 Docker/PM2 두 축으로 명확히 나누어 문서화하면, 과제 제출/데모/실제 클라우드 배포 모두를 같은 코드베이스에서 커버하기 쉽다.
- **남은 TODO**
  - `/auth/me` 응답에 연결된 소셜 provider 목록을 포함시켜 마이페이지에서 계정 연동 상태를 시각화.
  - Host/Admin 화면에서 예약/카라반 목록의 정렬/필터(날짜, 상태, 호스트별)를 강화.
  - Azure VM 시나리오 B 에 대해 systemd 서비스 유닛 예시 및 HTTPS 자동 설정 스크립트 초안 추가.
  - Kakao/Naver/Google 콘솔 Redirect URL 설정 체크리스트를 별도 문서로 정리.
  - 백엔드/프론트엔드 테스트를 happy path 중심에서 에러/권한/엣지 케이스까지 확장.

