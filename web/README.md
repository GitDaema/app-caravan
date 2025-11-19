Web (Vite + React + TS)
========================

이 디렉터리는 CaravanShare의 **프론트엔드(PWA)** 입니다.  
Node 기반 API(`api/`)와 세션 쿠키를 사용해 동작합니다.

---

Local development
-----------------

- Node 18+ 추천
- 의존성 설치:
  - `cd web`
  - `npm install`
- 개발 서버 실행:
  - `npm run dev` → http://localhost:5173

Env (.env.local)
----------------

`web/.env.local.example`를 복사해서 사용합니다.

- `VITE_API_BASE_URL`
  - 기본값(로컬): `http://localhost:3000`
  - Prod 예시: `https://caravanshare.xyz/api`
  - 이 값은 프론트에서 호출하는 **백엔드 루트**입니다.
    - `/auth/login`, `/auth/me`, `/auth/google|naver|kakao`
    - `/api/users/*`, `/api/caravans/*`, `/api/reservations/*`, `/dev/overview`
- (선택) `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`
  - 현재 Passport 기반 소셜 로그인에 필수는 아니며, 추후 Firebase 연동용으로 남겨둘 수 있습니다.

Routes
------

- `/`
  - 랜딩 페이지 (서비스 소개)
- `/login`
  - 소셜 로그인(Google/Naver/Kakao) + 로컬 로그인(이메일/비밀번호)
  - 소셜 로그인 버튼:
    - `${VITE_API_BASE_URL}/auth/google`
    - `${VITE_API_BASE_URL}/auth/naver`
    - `${VITE_API_BASE_URL}/auth/kakao`
  - 로그인 성공 시 `/app` 으로 이동
- `/app`
  - 보호된 대시보드
  - `ProtectedRoute`가 `GET {VITE_API_BASE_URL}/auth/me`로 세션을 확인
  - 주요 위젯:
    - Caravan 리스트, 예약 생성 폼, 예약 목록
    - Host/관리자 전용 패널
    - DemoOverview (`/dev/overview` 호출)

Auth strategy (현재)
--------------------

- 세션 기반 인증 (JWT가 아니라 **서버 세션 + 쿠키**)
  - 백엔드: `express-session` + `express-mysql-session`
  - 프론트: `fetch(..., { credentials: 'include' })`
- 스토어: `web/src/store/auth.ts`
  - `fetchMe()` → `GET {API_BASE}/auth/me`
  - `loginLocal(email, password)` → `POST {API_BASE}/auth/login`
  - `logout()` → `POST {API_BASE}/auth/logout`
- 라우트 가드:
  - `PublicRoute`:
    - 마운트 시 `fetchMe()` 한 번 호출
    - `loading` 동안 `"세션 확인 중..."` 표시
    - 로그인된 사용자는 `/app` 으로 리다이렉트
  - `ProtectedRoute`:
    - 마운트 시 `fetchMe()` 한 번 호출
    - `loading` 동안 `"세션 확인 중..."` 표시
    - 비로그인 사용자는 `/login` 으로 리다이렉트

PWA & Service Worker
--------------------

- PWA 서비스워커는 `vite-plugin-pwa`와 `web/src/pwa.ts` 로 등록됩니다.
- 주요 포인트:
  - App shell(HTML/JS/CSS/아이콘 등)을 precache
  - `/api/` 경로는 `NetworkFirst` 전략 사용
  - `navigateFallbackDenylist: [/^\/api\//]` 설정으로,
    - `/api/auth/*` 같은 OAuth 리다이렉트 요청이 React 404로 처리되지 않도록 함
- 브라우저 설치:
  - 브라우저의 “앱 설치” UI 또는 앱 내 PWA 설치 배너(지원하는 환경에서) 사용

New UI (요약)
-------------

- Host Panel
  - 호스트가 자신의 카라반 예약을 승인/취소
- Caravan Calendar
  - 선택한 카라반의 예약 날짜 범위를 캘린더로 표시
- Reservation List
  - 사용자 예약 목록 및 취소 버튼
- Balance Card
  - 현재 잔액 및 잔액 충전 버튼

Tests
-----

- 단위/컴포넌트 테스트:
  - `npm run test` (watch)
  - `npm run test:run` (CI)

Mobile build (Capacitor, v6 – 선택)
-----------------------------------

현재 핵심은 웹/PWA이며, 필요 시 Capacitor를 사용해 모바일 래핑할 수 있습니다.

- Capacitor config: `web/capacitor.config.ts` (`webDir: "dist"` 가정)
- Typical flow:
  - `npm run build` (또는 `npm run build:pwa`)
  - `npm run cap:sync`
  - `npm run cap:android`
  - `npm run cap:ios`
- 개발 중에는 `capacitor.config.ts` 의 `server.url` 을 Vite dev 서버로 지정할 수 있지만,  
  **프로덕션 빌드에는 제거**하고 패키지된 `dist` 자산을 사용해야 합니다.

