Web (Vite + React + TS)
========================

`web/` 디렉터리는 CaravanShare의 **React 기반 PWA 프론트엔드**입니다.  
Node 기반 API (`api/`) 와 **세션 쿠키**를 사용해 통신하며, Google/Naver/Kakao 소셜 로그인과  
로컬 이메일/비밀번호 로그인을 모두 지원합니다.

---

Local development
-----------------

- 권장 Node 버전: **18+**
- 최초 설치:
  - `cd web`
  - `npm install`
- 개발 서버 실행:
  - `npm run dev`
  - 기본 주소: http://localhost:5173

Env (.env.local)
----------------

`web/.env.local.example` 를 복사해 `.env.local` 로 사용합니다.

- `VITE_API_BASE_URL`
  - 기본(로컬): `http://localhost:3000`
  - 프로덕션: `https://caravanshare.xyz/api`
  - 이 값은 프론트에서 호출하는 **백엔드 루트 URL** 입니다.
    - `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/me`
    - `/auth/google|naver|kakao`
    - `/api/users/*`, `/api/caravans/*`, `/api/reservations/*`
    - `/api/reviews/*`, `/api/messages/*`
    - `/dev/overview`
- (선택) `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`
  - 현재는 Passport 기반 소셜 로그인이 기본이며,  
    추후 Firebase 연동을 위한 옵션 값입니다.

Routes
------

- `/`
  - 랜딩 페이지 (서비스 소개, 진입 버튼 등)
- `/login`
  - 소셜 로그인(Google/Naver/Kakao) + 로컬 로그인(이메일/비밀번호)
  - 소셜 로그인 버튼:
    - `${VITE_API_BASE_URL}/auth/google`
    - `${VITE_API_BASE_URL}/auth/naver`
    - `${VITE_API_BASE_URL}/auth/kakao`
  - 로그인 성공 시 `/app` 으로 이동
- `/app`
  - 보호된 대시보드 영역
  - `ProtectedRoute` 가 `GET {VITE_API_BASE_URL}/auth/me` 로 세션을 검증
  - 주요 카드/위젯:
    - Caravan 리스트 및 예약 생성/예약 목록
    - Host/관리자용 패널
    - 잔액 조회 및 충전(`BalanceCard`)
    - 카라반별 예약 캘린더(`CaravanCalendar`)
    - 카라반 리뷰(`ReviewSection`)
    - 예약별 메시지 쓰레드(`MessageThread`)
    - DemoOverview (`/dev/overview` 데이터를 요약 출력)

Auth strategy (현재)
--------------------

- 세션 기반 인증 (JWT 토큰 대신 **서버 세션 + 쿠키** 사용)
  - 백엔드: `express-session` + `express-mysql-session`
  - 프론트: `fetch(..., { credentials: 'include' })` 로 쿠키를 항상 포함
- auth 스토어: `web/src/store/auth.ts`
  - `fetchMe()` → `GET {API_BASE}/auth/me`
  - `loginLocal(email, password)` → `POST {API_BASE}/auth/login`
  - `registerLocal(email, password, fullName?)` → `POST {API_BASE}/auth/register`
  - `logout()` → `POST {API_BASE}/auth/logout`
- 라우트 가드:
  - `PublicRoute`
    - 마운트 시 `fetchMe()` 호출
    - 로딩 상태에서 `"세션 확인 중.."` 과 같은 메시지 출력
    - 이미 로그인된 사용자는 `/app` 으로 리다이렉트
  - `ProtectedRoute`
    - 마운트 시 `fetchMe()` 호출
    - 비로그인 사용자는 `/login` 으로 리다이렉트

PWA & Service Worker
--------------------

- PWA/서비스 워커는 `vite-plugin-pwa` 와 `web/src/pwa.ts` 에서 설정합니다.
- 주요 포인트
  - HTML/JS/CSS/정적 자산 App shell 을 precache
  - `/api/` 경로는 `NetworkFirst` 전략 사용
  - `navigateFallbackDenylist: [/^\/api\//]` 설정으로  
    `/api/auth/*` 같은 OAuth 리다이렉트 요청이 React 404 로 처리되지 않도록 함
- 브라우저 설치
  - 지원 환경에서는 브라우저가 제공하는 PWA 설치 배너를 통해 설치 가능
  - `OfflineBanner`, `PwaInstallBanner` 컴포넌트로 UX 보조

New UI (요약)
-------------

- Host Panel
  - 호스트가 자신의 카라반 예약을 확인/상태 변경
- Admin Reservations
  - 관리자용 전체 예약 목록/상태 확인
- Caravan Calendar
  - 선택한 카라반의 예약 날짜 범위를 캘린더로 표시
- Reservation List
  - 사용자의 예약 목록 및 취소 버튼
- Balance Card
  - 현재 잔액 조회 및 잔액 충전 버튼
- Review Section
  - 카라반별 별점(1~5) + 코멘트 리뷰 목록/작성
  - API: `GET/POST {API_BASE}/api/reviews`
- Message Thread
  - 예약별 게스트↔호스트 간 1:1 메시지 쓰레드
  - API: `GET/POST {API_BASE}/api/messages`

Tests
-----

- 유닛/컴포넌트 테스트
  - `npm run test` (watch 모드)
  - `npm run test:run` (CI 용 단발 실행)

Mobile build (Capacitor, 선택)
------------------------------

현재는 **PWA 중심**으로 사용하며, 필요 시 Capacitor 로 모바일 빌드를 생성할 수 있습니다.

- Capacitor 설정: `web/capacitor.config.ts` (`webDir: "dist"`)
- 기본 플로우:
  - `npm run build` (또는 `npm run build:pwa`)
  - `npm run cap:sync`
  - `npm run cap:android`
  - `npm run cap:ios`
- 개발 중에는 `capacitor.config.ts` 의 `server.url` 을 Vite dev 서버로 지정해  
  실시간 개발이 가능하지만, **실제 배포 빌드에서는 제거하고**  
  `dist` 빌드 결과를 번들에 포함해야 합니다.

