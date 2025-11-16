Web (Vite + React + TS)

Local development
- Node 18+ recommended
- Install deps: `npm install`
- Start dev server: `npm run dev` (http://localhost:5173)

Env (.env)
- `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`)
  - PC 브라우저용 예: `http://localhost:8000/api/v1`
  - 에뮬레이터/실기기용 예: `http://192.168.x.x:8000/api/v1` (백엔드가 떠 있는 PC의 LAN IP)
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN` (if using Google sign-in)

Routes
- `/` Landing
- `/login` Google or local login (exchanges for API JWT)
- `/app` Dashboard (caravans, reservations, balance)

Auth strategy (Day 5)
- 기본 로그인은 로컬 계정(`admin@example.com` / `password`)입니다.
- Google/Firebase 로그인은 선택적 실험 단계이며, 웹뷰/외부 브라우저 전환 관련 이슈는 TODO로 남겨 둡니다.

PWA & Install
- PWA service worker is enabled via `vite-plugin-pwa` and `web/src/pwa.ts`.
- App shell (HTML/JS/CSS/basic assets) is precached so the dashboard can open even when offline.
- API calls (under `/api/`) use a network-first strategy; when offline, UI shows an offline banner and API actions surface a clear error message.
- Installable on modern browsers: use the browser's "Install app" UI or the in-app "앱 설치하기" banner (based on `beforeinstallprompt`).
- Manifest icons are configured to use `/icons/pwa-192x192.png`, `/icons/pwa-512x512.png` and maskable variants under `/icons/`; place actual PNG assets there when the final design is ready.

New UI
- Host Panel: manage reservations you host (approve/cancel)
- Caravan Calendar: highlights reserved days for selected caravan
- Reservation list: cancel button with status chips

Tests
- `npm run test` (watch) or `npm run test:run` (CI)

Mobile build (Capacitor, v6)
- Capacitor config: `web/capacitor.config.ts` (assumes `webDir: "dist"`).
- Typical flow:
  - Build web assets: `npm run build:pwa`
  - Sync into native projects: `npm run cap:sync`
  - Open Android Studio: `npm run cap:android`
  - Open Xcode: `npm run cap:ios`
- Initial Capacitor wiring (run once, inside `web/`): `npm run cap:init`
- During development you may set `server.url` to the Vite dev server (e.g. `http://localhost:5173`); **for production builds, comment out or remove `server.url`** so the packaged `dist` assets are served.

Mobile UX smoke tests (Day 5)
- `/login`를 DevTools 모바일 뷰(iPhone 14 등)에서 열고, 기본 로컬 계정으로 로그인했을 때 `/app` 대시보드가 한 컬럼 그리드로 자연스럽게 보이는지 확인합니다.
- `/app`에서 카라반을 선택한 뒤 예약 시작/종료일을 지정하고 "예약하기"를 눌렀을 때, 예약 카드와 캘린더에 바로 반영되는지 확인합니다.
- 에뮬레이터/실기기에서 네트워크를 끊으면 상단에 오프라인 배너가 뜨고, 예약 버튼이 비활성화되며 "오프라인 상태" 안내 문구가 보이는지 확인합니다.
- 네트워크를 다시 연결한 뒤 새로고침해서, 로그인→대시보드→예약/취소 흐름이 정상적으로 동작하는지 한 번 더 스모크 테스트합니다.

