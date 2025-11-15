Web (Vite + React + TS)

Local development
- Node 18+ recommended
- Install deps: `npm install`
- Start dev server: `npm run dev` (http://localhost:5173)

Env (.env)
- `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`)
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN` (if using Google sign-in)

Routes
- `/` Landing
- `/login` Google or local login (exchanges for API JWT)
- `/app` Dashboard (caravans, reservations, balance)

PWA & Install
- PWA service worker is enabled via `vite-plugin-pwa` and `web/src/pwa.ts`.
- App shell (HTML/JS/CSS/basic assets) is precached so the dashboard can open even when offline.
- API calls (under `/api/`) use a network-first strategy; when offline, UI shows an offline banner and API actions surface a clear error message.
- Installable on modern browsers: use the browser's “Install app” or the in-app “앱 설치하기” banner (based on `beforeinstallprompt`).
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
- When developing with a device/emulator, you can point Capacitor to the Vite dev server (`http://localhost:5173`) using the `server.url` in `capacitor.config.ts` (remove or disable it for production builds).
