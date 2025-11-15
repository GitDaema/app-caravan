# CaravanShare Quickstart (Windows)

Prereqs
- Python 3.11+, Node 18+

1) Create venv and install

  python -m venv .venv
  .venv\Scripts\python.exe -m pip install -U pip
  .venv\Scripts\python.exe -m pip install -r requirements.txt

2) Seed DB (admin user, optional demo)

- Basic (admin with 1000 balance):

  python initial_data.py

- Demo data (host + caravan):

  set SEED_DEMO=1 && python initial_data.py

3) Start dev servers

  # API
  uvicorn backend.app.main:app --reload

  # Web
  cd web && npm install && npm run dev

API: http://localhost:8000
Web: http://localhost:5173

Local login
- Email: admin@example.com
- Password: password

Running tests
- Backend: `pytest -q`
- Web: `cd web && npm run test:run`

Environment
- Backend
  - `SECRET_KEY` (optional in dev)
  - `DATABASE_URL` (default sqlite:///./caravan_booking.db)
  - `GOOGLE_CLIENT_ID` (optional; Google Identity Services path)
  - `FIREBASE_PROJECT_ID` (optional; Firebase Authentication path)
- Web
  - `VITE_API_BASE_URL` (default http://localhost:8000/api/v1)
  - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN` if using Google sign-in via Firebase

Notes
- Google 로그인은 두 경로 중 하나를 선택해 구성하세요.
  1) Google Identity Services(GIS): 웹 OAuth 클라이언트 ID를 만들고 `GOOGLE_CLIENT_ID`를 백엔드에 설정.
  2) Firebase Authentication: 프로젝트 생성, Google provider 활성화, 웹 앱 API Key/Domain을 프런트에 설정하고 `FIREBASE_PROJECT_ID`를 백엔드에 설정.
- Calendar API returns [start,end) date ranges; UI highlights each day d with start <= d < end.

PWA install (web)
- Web app is shipped as a PWA using `vite-plugin-pwa`.
- App shell (routing + basic UI) is available offline; bookings and other API features still require network access.
- In supported browsers you can install the app via the browser UI or the in-app “앱 설치하기” banner (triggered from the `beforeinstallprompt` event).

Mobile build (Capacitor)
- Capacitor is configured under `web/capacitor.config.ts` with `webDir: "dist"`.
- Recommended flow (from project root):
  - Build web: `cd web && npm run build:pwa`
  - Sync native projects: `cd web && npm run cap:sync`
  - (Once per machine) initialize Capacitor in `web/`: `cd web && npm run cap:init`
  - Add platforms as needed (run manually): `npx cap add android`, `npx cap add ios`
  - Open IDEs: `cd web && npm run cap:android` or `npm run cap:ios`
- Ensure the backend API URL (`VITE_API_BASE_URL`) is reachable from the emulator/device (e.g. LAN IP instead of `localhost` when needed).
