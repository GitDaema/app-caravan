Web (Vite + React + TS + PWA)

로컬 실행
- Node 18+ 권장
- 의존성 설치: `npm install`
- 개발 서버: `npm run dev` (http://localhost:5173)

환경 변수 (.env)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_API_BASE_URL` (예: `http://localhost:8000/api/v1`)

라우팅
- `/` 랜딩
- `/login` Google 로그인 → 서버 JWT 교환
- `/app` 기본 대시보드 (예약 생성/목록)

PWA
- `vite-plugin-pwa` 자동 등록. 배포 시 manifest/service worker 동작.

모바일 (Capacitor 가이드)
- 초기화: `npx cap init caravanshare com.example.caravanshare`
- 플랫폼 추가: `npx cap add ios` / `npx cap add android`
- 웹 에셋 빌드: `npm run build` → `dist/`
- 복사: `npx cap copy`
- 네이티브 열기: `npx cap open ios|android`

테스트 (UI)
- 러너: Vitest + Testing Library (jsdom)
- 실행: `npm run test` (watch) 또는 `npm run test:run` (CI 모드)
- 루트 스크립트: `scripts/test_web.ps1` 또는 `scripts/test_web.sh`
