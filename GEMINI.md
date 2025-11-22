# ROLE

이 문서는 **CaravanShare** 앱의 현재 구조와 규칙을 정리한 문서입니다.  
PC/모바일 브라우저에서 동작하는 PWA 를 중심으로, Docker 기반 Node.js API 와 React 프론트엔드로 구성되어 있습니다.  
AI 어시스턴트(예: Gemini, ChatGPT 등)가 코드를 수정할 때 **기존 구조를 존중하면서도 안전하게 변경**하도록 돕는 것이 목적입니다.

# GOAL

- Node.js + Express + Prisma + MariaDB (`api/`) 를 사용하는 **세션 기반 백엔드** 완성
- Vite + React + TypeScript (`web/`) 를 사용하는 **PWA 프론트엔드** 완성
- **소셜 로그인 (Google / Naver / Kakao) + 로컬 로그인** 모두 지원
- 예약/호스트/관리자 흐름을 커버하는 **데모 대시보드** 제공
- FastAPI 백엔드 (`backend/`) 는 **참고용 레거시**로 유지하고, 실제 기능은 모두 `api/` 기준으로 구현
- 추가 기능:
  - 카라반별 리뷰 (`Review`)
  - 예약 단위 1:1 메시지 (`Message`)

---

# CURRENT ARCHITECTURE (2025-11 기준)

## Backend (api/ – 현재 사용)

- Runtime: Node.js 20
- Framework: Express
- ORM: Prisma + MariaDB (Docker 서비스 `db`)
- 세션/인증
  - `express-session` + `express-mysql-session`
  - 세션 쿠키 이름: `caravanshare.sid`
  - `app.set('trust proxy', 1)` – Nginx 뒤에서 HTTPS 사용 시 원본 프로토콜 신뢰
  - Passport 전략:
    - `passport-local` (이메일/비밀번호)
    - `passport-google-oauth20`
    - `passport-naver`
    - `passport-kakao`

### 주요 파일/디렉터리

- `api/src/app.ts`
  - 공통 미들웨어: `helmet`, `cors`, `morgan`, `cookie-parser`, `express.json`
  - `configureSession(app)`, `configurePassport()` 호출
  - 엔드포인트 매핑:
    - `GET /health`
    - `/auth` – 인증/소셜 로그인
    - `/api/users`
    - `/api/caravans`
    - `/api/reservations`
    - `/api/reviews`
    - `/api/messages`
    - `/dev` – 데모용
- `api/src/config/env.ts`
  - `.env` 로드, 포트/DB/세션/OAuth 설정
  - `FRONTEND_BASE_URL`, `GOOGLE_*`, `NAVER_*`, `KAKAO_*` 등 포함
- `api/src/config/session.ts`
  - `express-session` 설정
  - `SESSION_STORE=memory` 인 경우 메모리 세션(테스트용)
  - 그 외에는 `express-mysql-session` 으로 MariaDB 에 세션 저장
  - production 에서 `cookie.secure=true`, `sameSite='lax'`
- `api/src/config/passport.ts`
  - Local / Google / Naver / Kakao 전략 정의
  - `upsertSocialUser` 로 `SocialAccount` 와 `User` 연결
- `api/src/routes/auth.ts`
  - `POST /auth/login`
  - `POST /auth/register`
  - `POST /auth/logout`
  - `GET /auth/me`
  - `GET /auth/google|naver|kakao`
  - `GET /auth/*/callback`
- `api/src/routes/users.ts`
  - `GET /api/users/me`
  - `PUT /api/users/me/balance`
- `api/src/routes/caravans.ts`
  - `GET /api/caravans`
  - `POST /api/caravans` (HOST 전용)
  - `GET /api/caravans/:id/calendar`
- `api/src/routes/reservations.ts`
  - `GET /api/reservations`
  - `POST /api/reservations`
  - `POST /api/reservations/:id/cancel`
  - `GET /api/reservations/host`
  - `GET /api/reservations/admin/all`
  - `POST /api/reservations/:id/status` (HOST 가 상태 변경)
  - `POST /api/reservations/cleanup-cancelled` (취소된 예약 및 관련 메시지 정리)
- `api/src/routes/reviews.ts`
  - `GET /api/reviews?caravan_id=...`
  - `POST /api/reviews`
- `api/src/routes/messages.ts`
  - `GET /api/messages?reservation_id=...`
  - `POST /api/messages`
- `api/src/routes/dev.ts`
  - `GET /dev/overview` – 데모 대시보드용 요약 데이터

### Prisma 스키마/시드

- `api/prisma/schema.prisma`
  - 모델:
    - `User` – 이메일/비밀번호/이름/역할/잔액
    - `SocialAccount` – OAuth provider + providerUserId
    - `Caravan` – 카라반 정보, `host`(User) 참조
    - `Reservation` – 예약 정보, `user`/`caravan` 참조
    - `Review` – 카라반 리뷰, `caravan`/`user` 참조
    - `Message` – 예약 단위 메시지, `reservation`/`sender`/`receiver` 참조
  - enum:
    - `UserRole` – `guest`, `host`, `admin`
    - `ReservationStatus` – `pending`, `confirmed`, `cancelled`
    - `CaravanStatus` – `available`, `reserved`, `maintenance`
    - `SocialProvider` – `GOOGLE`, `NAVER`, `KAKAO`
- `api/prisma/seed.cjs`
  - 기본 유저:
    - `admin@example.com` (ADMIN)
    - `host@example.com` (HOST)
    - `guest@example.com` (GUEST)
  - 샘플 카라반 및 예약 데이터 생성

### Backend 실행/배포

- 로컬 개발
  1. 환경 변수
     - `cd api`
     - `cp .env.example .env`
     - 필수 항목:
       - `DATABASE_URL` – MariaDB (Docker `db` 서비스) 를 가리키도록 설정
       - `SESSION_SECRET` – 충분히 랜덤한 문자열
       - `FRONTEND_BASE_URL=http://localhost:5173`
  2. 마이그레이션 및 시드
     - `npm install`
     - `npx prisma migrate deploy`
     - `node prisma/seed.cjs`
  3. 서버 실행
     - 개발: `npm run dev`
     - 빌드 후: `npm run build` + `npm start`

- Docker (로컬)
  - 루트에서 `docker-compose.yml`:
    - `db` (MariaDB)
    - `api` (Express)
  - 실행:
    - `docker compose up -d` (또는 `docker-compose up -d`)

- Docker (Prod)
  - `docker-compose.prod.yml`:
    - `db` + `api` + `web`(nginx)
  - `infra/nginx.caravanshare.conf.example` 를 `/etc/nginx/conf.d/default.conf` 로 마운트
  - 중요한 설정:
    - `location /api/ { proxy_pass http://api:3000/; }`
      - `/api/...` 요청을 Express 컨테이너로 프록시

---

## Frontend (web/ – 현재 사용)

- Runtime: Node 18+
- Bundler: Vite
- UI: React 18 + TypeScript
- 스타일: Tailwind CSS
- 라우팅: `react-router-dom`
  - `/` → `Landing`
  - `/login` → `PublicRoute` + `Login`
  - `/app` → `ProtectedRoute` + `Dashboard`
- 전역 상태: `Zustand`
- 서버 상태: `@tanstack/react-query`

### 주요 파일/디렉터리

- `web/src/main.tsx`, `web/src/App.tsx`
  - 라우터/쿼리클라이언트/스토어 Provider 설정
- `web/src/routes/Landing.tsx`
  - 랜딩 페이지
- `web/src/routes/Login.tsx`
  - 로컬 로그인 + 소셜 로그인 버튼
  - `?error=...` 쿼리 파라미터로 소셜 로그인 오류 처리
- `web/src/routes/Dashboard.tsx`
  - `/app` 내부 레이아웃
- `web/src/routes/ProtectedRoute.tsx`, `PublicRoute.tsx`
  - `useAuthStore().fetchMe()` 를 통해 세션 상태 확인 후 라우팅

- `web/src/store/auth.ts`
  - 타입: `User { id, email, fullName?, role: 'GUEST'|'HOST'|'ADMIN', balance }`
  - 액션:
    - `fetchMe()` – `GET {API_BASE}/auth/me`
    - `loginLocal(email, password)` – `POST {API_BASE}/auth/login`
    - `registerLocal(email, password, fullName?)` – `POST {API_BASE}/auth/register`
    - `logout()` – `POST {API_BASE}/auth/logout`
- `web/src/store/ui.ts`
  - 현재 선택된 카라반 ID, 모달 상태 등 UI 상태 관리

- `web/src/lib/api.ts`
  - `API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'`
  - `fetch` 호출 시 항상 `credentials: 'include'`
  - 공통 에러 처리 및 오프라인 감지 메시지
- `web/src/lib/firebase.ts`
  - 선택적 Firebase 연동 (Google ID Token 발급용)
  - 현재는 기본 로그인 흐름에 필수는 아님

- 주요 UI 컴포넌트
  - `CaravanList` – 카라반 목록 조회 (`GET /api/caravans`)
  - `CaravanForm` – 호스트가 카라반 등록
  - `CaravanCalendar` – 카라반별 예약 캘린더 (`GET /api/caravans/:id/calendar`)
  - `ReservationForm` – 예약 생성 (`POST /api/reservations`)
  - `ReservationList` – 게스트 예약 목록/취소 (`GET /api/reservations`, `POST /api/reservations/:id/cancel`)
  - `HostPanel` – 호스트용 예약 관리 (`GET /api/reservations/host`, `POST /api/reservations/:id/status`)
  - `AdminReservations` – 관리자용 전체 예약 목록 (`GET /api/reservations/admin/all`)
  - `BalanceCard` – 사용자 잔액 조회/충전 (`GET/PUT /api/users/me`, `/api/users/me/balance`)
  - `ReviewSection` – 카라반 리뷰 목록/작성 (`GET/POST /api/reviews`)
  - `MessageThread` – 예약 단위 메시지 쓰레드 (`GET/POST /api/messages`)
  - `OfflineBanner`, `PwaInstallBanner` – PWA UX 보조 컴포넌트

- PWA
  - `web/src/pwa.ts` + `vite-plugin-pwa`
  - App shell (HTML/JS/CSS/아이콘) precache
  - `/api/` 에 대해 `NetworkFirst` 전략 사용
  - `navigateFallbackDenylist: [/^\/api\//]` 로 `/api/auth/*` OAuth 콜백이 React 404 로 처리되지 않도록 함

### Frontend 개발/빌드

- 로컬 개발
  - `cd web`
  - `cp .env.local.example .env.local`
  - `.env.local`:
    - `VITE_API_BASE_URL=http://localhost:3000`
  - 실행:
    - `npm install`
    - `npm run dev` (http://localhost:5173)

- 빌드
  - `npm run build` → `web/dist` 생성
  - 프로덕션 Docker 에서 `web/dist` 를 nginx 루트로 마운트

---

## Legacy Backend (backend/ – FastAPI)

- 초기 설계/실험 단계에서 사용하던 FastAPI + SQLAlchemy + Alembic + JWT 구현
- `/api/v1/*` 형태의 엔드포인트를 제공하지만,  
  **현재 Node 백엔드/React 프론트에서는 사용하지 않음**
- 도메인 모델/비즈니스 규칙/초기 설계 아이디어를 참고하는 용도
- 자세한 내용은 `backend/README.md` 참고

---

# SOCIAL LOGIN FLOW (Node + Passport)

1. 프론트 `/login` 화면
   - Google 버튼 클릭 → `window.location.href = \`${API_BASE}/auth/google\``
   - Naver 버튼 → `${API_BASE}/auth/naver`
   - Kakao 버튼 → `${API_BASE}/auth/kakao`
2. 백엔드 `/auth/{provider}`
   - Passport 가 해당 Provider 로그인 페이지로 302 리다이렉트
3. Provider 콜백
   - 로컬 예시:
     - Google: `http://localhost:3000/auth/google/callback`
     - Naver: `http://localhost:3000/auth/naver/callback`
     - Kakao: `http://localhost:3000/auth/kakao/callback`
   - 프로덕션 예시 (nginx `location /api/ { proxy_pass http://api:3000/; }` 기준):
     - Google: `https://caravanshare.xyz/api/auth/google/callback`
     - Naver: `https://caravanshare.xyz/api/auth/naver/callback`
     - Kakao: `https://caravanshare.xyz/api/auth/kakao/callback`
   - 콜백 처리:
     - 성공: `req.logIn(user, ...)` 후 `res.redirect(`${env.frontendBaseUrl}/app`)`
     - 실패: `res.redirect(`${env.frontendBaseUrl}/login?error=...`)`
4. 프론트 `/app`
   - `ProtectedRoute` 가 `fetchMe()` 를 호출
   - `/auth/me` 가 200 이고 `{ user: ... }` 를 반환하면 로그인 상태로 간주

---

# FILE TREE (요약)

```text
.
├── api/                       # Node + Express + Prisma 백엔드 (현재 사용)
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── session.ts
│   │   │   └── passport.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── caravans.ts
│   │   │   ├── reservations.ts
│   │   │   ├── reviews.ts
│   │   │   ├── messages.ts
│   │   │   └── dev.ts
│   │   └── middleware/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.cjs
│   └── package.json
├── web/                       # Vite + React PWA 프론트엔드
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── routes/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── PublicRoute.tsx
│   │   ├── components/
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── CaravanList.tsx
│   │   │   ├── CaravanCalendar.tsx
│   │   │   ├── CaravanForm.tsx
│   │   │   ├── HostPanel.tsx
│   │   │   ├── AdminReservations.tsx
│   │   │   ├── ReservationForm.tsx
│   │   │   ├── ReservationList.tsx
│   │   │   ├── ReviewSection.tsx
│   │   │   ├── MessageThread.tsx
│   │   │   ├── OfflineBanner.tsx
│   │   │   ├── PwaInstallBanner.tsx
│   │   │   └── DemoOverview.tsx
│   │   ├── store/
│   │   │   ├── auth.ts
│   │   │   └── ui.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── firebase.ts
│   │   └── pwa.ts
│   ├── vite.config.ts
│   └── package.json
├── backend/                   # Legacy FastAPI 백엔드 (참고용)
│   └── README.md
├── docs/
│   └── QUICKSTART.md          # 로컬/Prod 설정 요약
├── infra/
│   └── nginx.caravanshare.conf.example
├── docker-compose.yml         # dev (db + api)
├── docker-compose.prod.yml    # prod (db + api + nginx(web))
└── GEMINI.md                  # 이 문서
```

---

# AI ASSISTANT / CONTRIBUTOR GUIDELINES

AI 어시스턴트가 코드를 수정할 때 지켜야 할 최소 규칙입니다.

## 1. 변경 범위 기본 규칙

- **UI 작업 우선**
  - 기본적으로 변경 허용:
    - `web/src/components/**`
    - `web/src/routes/**`
    - `web/src/styles/**`
    - `web/src/lib/**`
    - `web/src/store/**`
  - 기본적으로 건드리지 말 것:
    - `api/**`
    - `infra/**`
    - `docker-compose*.yml`
    - `api/prisma/schema.prisma`
  - 예외적으로 백엔드/인프라를 수정해야 할 때는:
    - 먼저 README / 이 문서(`GEMINI.md`)에서 영향 범위를 설명하고,
    - 가능한 한 최소 범위로만 변경합니다.

- **백엔드/인프라 수정 시**
  - 어떤 엔드포인트/환경 변수를 바꾸는지 **명시적으로 기록**
  - 소셜 로그인 관련 엔드포인트가 깨지지 않는지 확인:
    - `/auth/*`, `/auth/*/callback`, `/auth/me`

## 2. 소셜 로그인 및 네트워크 관련 주의사항

- `VITE_API_BASE_URL` 은 **백엔드의 `/auth/*` 와 `/api/*` 를 모두 포함하는 루트**여야 합니다.
  - 로컬: `http://localhost:3000`
  - Prod: `https://caravanshare.xyz/api`
- Nginx 설정
  - `location /api/ { proxy_pass http://api:3000/; }`
  - `proxy_pass` 뒤의 슬래시(`/`) 가 중요 (Express 가 `/auth/...` 를 올바르게 받도록)
- PWA 서비스 워커
  - `navigateFallbackDenylist: [/^\/api\//]` 설정 유지
  - 그렇지 않으면 `/api/auth/*` 콜백이 React 라우터 404 로 잡힐 수 있음

## 3. Git / 브랜치 운용 (권장)

- 중요한 시점에서는 태그 사용:
  - 예: `git tag stable-social-login && git push origin stable-social-login`
- 기능 개발은 가능하면 별도 브랜치:
  - 예: `git checkout -b feature/ui-tweak-dashboard`

## 4. 테스트 / 동작 확인

- 백엔드
  - `cd api && npm test` (있는 경우)
  - 최소한 `GET /health` 가 200 인지 확인
- 프론트엔드
  - `cd web && npm test` (있는 경우)
  - 수동 확인:
    - `/login` 에서 소셜/로컬 로그인 후 `/app` 진입
    - `/app` 에서 Caravan/Reservation/Review/Message UI 가 정상 동작

---

# New endpoints (reviews/messages)

- `GET /api/reviews?caravan_id=...`  
  - 지정한 카라반의 리뷰를 최신순으로 조회
- `POST /api/reviews`  
  - 세션 필요, body: `{ caravan_id, rating (1~5), comment }`
- `GET /api/messages?reservation_id=...`  
  - 세션 필요, 예약의 게스트 또는 호스트만 접근 가능
- `POST /api/messages`  
  - 세션 필요, body: `{ reservation_id, content }`,  
    예약 정보에서 수신자(`receiver_id`) 를 자동 결정

# Manual checks

- 로그인 후 `/api/auth/me` 가 200 인지 확인
- 같은 카라반에 리뷰 작성 후  
  `/api/reviews?caravan_id=...` 로 조회 시 방금 작성한 리뷰가 포함되는지 확인
- 예약 단위 메시지 송수신:
  - `/api/messages?reservation_id=...` 조회
  - `POST /api/messages` 로 메시지 전송 후 다시 조회
- 소셜 로그인 흐름:
  - `/api/auth/google` 302 → Provider → `/app`
  - `/api/auth/me` 200

# ACCEPTANCE CRITERIA (요약)

1. **로컬 실행**
   - 루트에서 `docker compose up -d` (또는 `docker-compose up -d`)
   - `web/` 에서 `npm run dev` 실행 후 `http://localhost:5173` 접속
2. **소셜 로그인**
   - `/login` 에서 Google/Naver/Kakao 버튼 클릭 시 Provider 로그인 후 `/app` 으로 진입
   - `/auth/me` 가 200 이고 `{ user: ... }` 응답
3. **예약 흐름**
   - `/app` 에서 Caravan 선택 → 예약 생성 → 예약 목록/캘린더에서 정상 반영
4. **PWA 동작**
   - 기본 오프라인 배너, install 가능한 manifest, 서비스 워커 정상 동작
5. **문서 최신화**
   - `GEMINI.md`, `web/README.md`, `backend/README.md`, `docs/QUICKSTART.md` 가  
     현재 Node + React + 소셜 로그인 + 리뷰/메시지 구조를 정확하게 설명할 것

