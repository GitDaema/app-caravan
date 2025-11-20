# ROLE
이 레포는 **CaravanShare** 웹앱입니다.  
PC/모바일 브라우저에서 동작하는 PWA를 중심으로, 도커 기반 Node.js API와 React 프론트엔드를 포함합니다.  
당신(AI 어시스턴트/개발자)은 **기존 구조를 존중하면서 작은 단위로 수정**하고, 항상 README와 이 문서에서 정의한 규칙을 우선합니다.

# GOAL
- Node.js + Express + Prisma + MariaDB(`api/`)를 사용하는 **세션 기반 백엔드** 완성
- Vite + React + TypeScript(`web/`)를 사용하는 **PWA 프론트엔드** 완성
- **소셜 로그인(Google/Naver/Kakao) + 로컬 로그인**을 모두 지원
- 예약/호스트/관리자 흐름이 끊기지 않는 **데모용 대시보드** 유지
- 기존 FastAPI 백엔드(`backend/`)는 **레거시/참고용**으로 남겨 두고, 실제 기능은 `api/` 기준으로만 구현

---

# CURRENT ARCHITECTURE (2025-11 기준)

## Backend (api/ – 현재 사용)

- Runtime: Node.js 20
- Framework: Express
- ORM: Prisma + MariaDB (도커 `db` 서비스)
- 세션/인증
  - `express-session` + `express-mysql-session`
  - 세션 쿠키 이름: `caravanshare.sid`
  - `trust proxy` 활성화 (Nginx 뒤에서 HTTPS 사용)
  - Passport 전략:
    - `passport-local` (이메일/비밀번호)
    - `passport-google-oauth20`
    - `passport-naver`
    - `passport-kakao`
- 주요 파일/디렉터리
  - `api/src/app.ts`
    - 공통 미들웨어(helmet, cors, morgan, cookie-parser)
    - `configureSession(app)`, `configurePassport()`
    - 라우팅:
      - `/health`
      - `/auth` (인증/소셜 로그인)
      - `/api/users`
      - `/api/caravans`
      - `/api/reservations`
      - `/dev` (데모용)
  - `api/src/config/env.ts`
    - `.env` 로드, 포트/DB/세션/OAuth 설정
    - `frontendBaseUrl`, `GOOGLE_CLIENT_ID/SECRET`, `NAVER_*`, `KAKAO_*` 포함
  - `api/src/config/session.ts`
    - `express-session` 설정
    - production에서는 `secure: true`, `sameSite: 'lax'` 쿠키 설정
  - `api/src/config/passport.ts`
    - `LocalStrategy` (이메일/비밀번호)
    - `GoogleStrategy`, `NaverStrategy`, `KakaoStrategy`
    - 공통 유틸: `upsertSocialUser`로 `SocialAccount`와 `User` 연결
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
    - `POST /api/reservations/:id/status`
  - `api/src/routes/dev.ts`
    - `GET /dev/overview` (로그인 필요)
    - caravans/reservations를 간략히 반환 → 대시보드의 `DemoOverview`에서 사용
  - `api/prisma/schema.prisma`
    - `User`, `Caravan`, `Reservation`, `SocialAccount`, `UserRole`, `ReservationStatus` 등 정의
  - `api/prisma/seed.cjs`
    - `admin@example.com`, `host@example.com`, `guest@example.com` 기본 시드

### Backend 실행/배포 주요 포인트

- 로컬 개발
  - `.env` 작성 (`api/.env.example` 참고)
  - `cd api`
  - `npm install`
  - `npx prisma migrate deploy`
  - `node prisma/seed.cjs` (데모 계정/데이터)
  - `npm run dev` 또는 `node dist/server.js` (환경에 따라)
- 도커 (로컬)
  - 루트에서 `docker-compose.yml`:
    - `db` (MariaDB)
    - `api` (Express)
  - `docker compose up -d` (혹은 `docker-compose up -d`)
- 도커 (Prod)
  - `docker-compose.prod.yml`:
    - `db` + `api` + `web`(nginx)
  - `infra/nginx.caravanshare.conf.example`를 `/etc/nginx/conf.d/default.conf`로 마운트
  - `location /api/ { proxy_pass http://api:3000/; }` 가 **중요** (프리픽스 `/api` 제거)

---

## Frontend (web/ – 현재 사용)

- Runtime: Node 18+
- Vite + React + TypeScript
- 라우팅: `react-router-dom`
  - `/` → `Landing`
  - `/login` → `PublicRoute` + `Login`
  - `/app` → `ProtectedRoute` + `App` + `Dashboard`
- 상태 관리: `Zustand`
  - `web/src/store/auth.ts`
    - `user: User | null`
    - `loading: boolean`
    - `fetchMe()` → `GET {API_BASE}/auth/me` (`credentials: 'include'`)
    - `loginLocal()` → `POST {API_BASE}/auth/login`
    - `logout()` → `POST {API_BASE}/auth/logout`
- 서버 상태: `@tanstack/react-query`
  - `CaravanList` → `/api/caravans`
  - `ReservationList` → `/api/reservations`
  - `HostPanel` → `/api/reservations/host`
  - `AdminReservations` → `/api/reservations/admin/all`
  - `CaravanCalendar` → `/api/caravans/:id/calendar`
  - `BalanceCard` → `/api/users/me`
  - `DemoOverview` → `/dev/overview`
- API 래퍼: `web/src/lib/api.ts`
  - `export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'`
  - 모든 요청에 `credentials: 'include'` 적용
- PWA: `vite-plugin-pwa`
  - `web/vite.config.ts` → `VitePWA` 설정
  - `navigateFallbackDenylist: [/^\/api\//]` 로 **/api 경로는 SPA fallback 대상에서 제외**
    - 덕분에 `/api/auth/*` 같은 OAuth 리다이렉트가 React 404로 먹히지 않음
  - 런타임 캐싱: `/api/`는 `NetworkFirst`
- 라우트 가드
  - `web/src/routes/PublicRoute.tsx`
    - 마운트 시 `fetchMe()` 한 번 호출
    - `loading` 동안 `"세션 확인 중..."` 표시
    - `user`가 있으면 `/app`으로 리다이렉트
  - `web/src/routes/ProtectedRoute.tsx`
    - 마운트 시 `fetchMe()` 한 번 호출
    - `loading` 동안 `"세션 확인 중..."` 표시
    - `user`가 없으면 `/login`으로 리다이렉트

### Frontend 개발/빌드

- 로컬 개발
  - `cd web`
  - `cp .env.local.example .env.local`
  - `.env.local`에서:
    - `VITE_API_BASE_URL=http://localhost:3000`
  - `npm install`
  - `npm run dev` (`http://localhost:5173`)
- 빌드
  - `npm run build` → `web/dist` 생성
  - prod 도커에서 `web/dist` 를 nginx 루트로 마운트

---

## Legacy Backend (backend/ – FastAPI)

- 초기 설계이자 참고용 코드
  - FastAPI + SQLAlchemy + Alembic + JWT
  - `/api/v1/*` 스타일의 엔드포인트 설계
- **현재 배포/기능 구현은 여기서 하지 않는다.**
  - 새 기능/버그 수정은 항상 `api/`(Node) 기준
  - FastAPI 코드는 아이디어/모델링 참고 정도로만 활용

---

# SOCIAL LOGIN FLOW (현재 Node + Passport)

1. 프론트 `/login` 화면
   - Google 버튼 클릭 → `window.location.href = \`${API_BASE}/auth/google\``
   - Naver → `${API_BASE}/auth/naver`
   - Kakao → `${API_BASE}/auth/kakao`
2. 백엔드 `/auth/{provider}`
   - Passport가 각 Provider 인증 페이지로 302 리다이렉트
3. Provider 콜백
   - Redirect URI:
     - Google: `https://caravanshare.xyz/api/auth/google/callback`
     - Naver: `https://caravanshare.xyz/api/auth/naver/callback`
     - Kakao: `https://caravanshare.xyz/api/auth/kakao/callback`
   - Nginx `/api/` 프록시가 Express에는 `/auth/*/callback`으로 전달
   - Passport 전략이 사용자 정보 조회/생성 후 `req.logIn(user, ...)`
   - 성공 시 `res.redirect(`${env.frontendBaseUrl}/app`)`
   - 실패 시 `res.redirect(`${env.frontendBaseUrl}/login?error=...`)`
4. 프론트 `/app`
   - `ProtectedRoute`가 `fetchMe()` 호출
   - `/auth/me` → `{ user: {...} }` 이면 대시보드 렌더

---

# FILE TREE (요약)

```text
.
├── api/                     # Node + Express + Prisma 백엔드 (현재 사용)
│   ├── src/
│   │   ├── app.ts
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── session.ts
│   │   │   └── passport.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── caravans.ts
│   │   │   ├── reservations.ts
│   │   │   └── dev.ts
│   │   └── middleware/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.cjs
│   └── package.json
├── web/                     # Vite + React PWA 프론트엔드
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
│   │   │   ├── HostPanel.tsx
│   │   │   ├── ReservationForm.tsx
│   │   │   ├── ReservationList.tsx
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
├── backend/                 # Legacy FastAPI 백엔드 (참고용)
│   └── README.md
├── docs/
│   └── QUICKSTART.md        # 로컬/Prod 설정 요약
├── infra/
│   └── nginx.caravanshare.conf.example
├── docker-compose.yml       # dev (db + api)
├── docker-compose.prod.yml  # prod (db + api + nginx(web))
└── GEMINI.md                # 이 문서
```

---

# AI ASSISTANT / CONTRIBUTOR GUIDELINES

이 레포는 종종 AI 어시스턴트를 사용해 변경됩니다. **실수로 인증/인프라를 망가뜨리지 않기 위한 규칙**을 명시합니다.

## 1. 수정 범위 기본 규칙

- **UI 작업만 할 때**
  - 변경 허용: `web/src/components/**`, `web/src/routes/**`, `web/src/styles/**`, `web/src/lib/**`, `web/src/store/**`
  - 변경 지양: `api/**`, `infra/**`, `docker-compose*.yml`, `api/prisma/schema.prisma`
  - 필요한 경우에만:
    - API 응답 형태를 정말로 바꿔야 한다면, **먼저 README와 이 문서에서 영향 범위를 정리한 뒤** 최소한으로 수정
- **백엔드/인프라 변경 시**
  - 항상:
    - 어떤 엔드포인트/환경변수를 바꾸는지 **GEMINI.md와 README에 반영**
    - 소셜 로그인 플로우(`/auth/*`, `/auth/*/callback`, `/auth/me`)가 깨지지 않았는지 수동 체크

## 2. 소셜 로그인 관련 주의사항

- `VITE_API_BASE_URL`는 **백엔드에서 `/auth/*`와 `/api/*`를 서빙하는 루트**여야 합니다.
  - 로컬: `http://localhost:3000`
  - Prod: `https://caravanshare.xyz/api`
- Nginx 설정에서:
  - `location /api/ { proxy_pass http://api:3000/; }`
  - 여기서 `proxy_pass` 끝의 `/` 가 중요 (Express에는 `/auth/...`로 전달되도록)
- PWA 서비스워커:
  - `navigateFallbackDenylist: [/^\/api\//]` 를 유지해야 `/api/auth/*`가 React 404로 떨어지지 않음
- 소셜 로그인 확인 체크리스트:
  1. `/login`에서 Google/Naver/Kakao 버튼 클릭 → `Network` 탭에서 첫 요청이 `/api/auth/{provider}` 이고 302 인지
  2. Provider 로그인 완료 후 최종 URL이 `/app` 인지
  3. `/api/auth/me`가 200이고 `{ user: ... }`를 반환하는지

## 3. Git / 브랜치 운용 팁

- 잘 동작하는 시점에 **태그**를 하나 달아 둡니다.
  - 예: `git tag stable-social-login && git push origin stable-social-login`
- 기능 개발은 가급적 **별도 브랜치**에서 진행합니다.
  - `git checkout -b feature/ui-tweak-dashboard`
  - 문제가 생기면 브랜치를 버리거나, 태그 기준으로 비교(`git diff stable-social-login`)하여 원인 파악

## 4. 테스트 / 수동 확인

- 백엔드
  - `cd api && npm test` (있는 경우)
  - 최소한 `GET /health` 가 200인지 확인
- 프론트엔드
  - `cd web && npm test` (있는 경우)
  - 수동 확인:
    - `/login` → 소셜 로그인 → `/app` 진입
    - 대시보드에서 Caravan/Reservation 목록이 정상 호출되는지

---

# New endpoints (reviews/messages)

- `GET /api/reviews?caravan_id=...` : list reviews newest-first
- `POST /api/reviews` : session required, body `{ caravan_id, rating (1~5), comment }`
- `GET /api/messages?reservation_id=...` : session required, only reservation guest or host
- `POST /api/messages` : session required, body `{ reservation_id, content }`, receiver resolved from reservation

# Manual checks

- 로그인 후 `/api/auth/me` 200
- 같은 카라반에 리뷰 작성 → `/api/reviews?caravan_id=...` 로 확인
- 예약 단위 메시지 전송/조회(`/api/messages?reservation_id=...`) 성공
- 소셜 로그인 흐름 영향 없음: `/api/auth/google` 302, `/api/auth/me` 200

# ACCEPTANCE CRITERIA (요약)

1. **로컬 실행**
   - `docker compose up -d` (또는 `docker-compose up -d`) 후
   - `web/`에서 `npm run dev` 실행 → `http://localhost:5173`
2. **소셜 로그인**
   - `/login`에서 소셜 로그인 버튼 → Provider 로그인 → `/app` 으로 돌아오고 세션 유지
3. **예약 흐름**
   - `/app`에서 Caravan 선택 → 예약 생성 → 목록/달력에서 확인
4. **PWA 동작**
   - 기본적인 오프라인 배너, 설치 가능한 manifest, 서비스워커가 정상 동작
5. **문서 일관성**
   - GEMINI.md, `web/README.md`, `backend/README.md`, `docs/QUICKSTART.md`가 현재 Node + React + 소셜 로그인 구조를 올바르게 설명할 것
