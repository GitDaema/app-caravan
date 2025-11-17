# CaravanShare Quickstart (Node + MariaDB + React)

이 문서는 새 Node.js + Express + Prisma + MariaDB 백엔드와
React + Vite 프론트엔드를 기준으로 작성되었습니다.
기존 Python/FastAPI 코드는 `src/` + `backend/` 폴더에 레거시 레퍼런스로 남아 있습니다.

---

## 1. 필수 사전 준비

- Node.js 20 LTS
- Docker + docker-compose (로컬에서 MariaDB + API 구동용)
- (선택) Git, VS Code 등 IDE

---

## 2. 로컬 개발 환경 구성

### 2-1. 백엔드(API) + MariaDB 시작

루트 디렉터리(`app-caravan`)에서:

```bash
docker-compose up -d
```

구성:
- `db`: MariaDB 10.11 (포트 `3306`)
- `api`: Node 20 + Express + Prisma (포트 `3000`)

환경 변수(개발 기본값):
- DB: `mysql://caravan:caravan@db:3306/caravanshare`
- API: `http://localhost:3000`

필요 시 `api/.env.example`를 복사해서 `api/.env`로 만들고,
OAuth Client ID/Secret 등을 채워줍니다.

```bash
cd api
cp .env.example .env   # Windows PowerShell에서는 수동 복사
```

> 첫 실행 시 컨테이너 내부에서 `npx prisma migrate deploy`가 실행되어
> MariaDB에 스키마가 생성됩니다.

### 2-2. 프론트엔드(web) 개발 서버 실행

```bash
cd web
npm install
npm run dev
```

- Vite Dev Server: `http://localhost:5173`
- `.env.local` 기본값:
  - `VITE_API_BASE_URL=http://localhost:3000`

브라우저에서 `http://localhost:5173` 접속 후
새로운 UI/UX와 로그인 흐름을 확인할 수 있습니다.

---

## 3. 인증 / 소셜 로그인 설정

### 3-1. 공통 개요

백엔드(`api/`)는 세션 기반 인증을 사용합니다.

- `express-session` + `express-mysql-session` (세션은 MariaDB에 저장)
- 클라이언트는 세션 쿠키(httpOnly)를 통해 로그인 상태 유지
- 주요 엔드포인트:
  - `POST /auth/login` : 이메일/비밀번호 로그인
  - `POST /auth/register` : 회원가입
  - `POST /auth/logout` : 로그아웃
  - `GET /auth/me` : 현재 로그인한 사용자 정보
  - `GET /auth/google`, `/auth/naver`, `/auth/kakao` : 소셜 로그인 시작
  - `GET /auth/*/callback` : 각 소셜 로그인 콜백

프론트엔드(`web/`)는:

- `/login` 페이지에서
  - Google / Naver / Kakao 버튼 클릭 시 `/auth/*`로 리다이렉트
  - 이메일/비밀번호 폼은 `POST /auth/login` 호출
- 로그인 성공 시 `/app` 대시보드로 이동
- 앱 공통 레이아웃(`App.tsx`)에서 `GET /auth/me`를 호출해 전역 유저 상태를 동기화

### 3-2. Google OAuth

1. Google Cloud Console에서 OAuth 클라이언트 생성 (웹 애플리케이션)
2. Redirect URI 등록:
   - 예: `http://localhost:3000/auth/google/callback`
3. 다음 값을 `api/.env`에 설정:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

### 3-3. Naver / Kakao OAuth

각 포털 개발자 콘솔에서 애플리케이션을 생성하고
Redirect URI를 다음과 같이 설정합니다.

- Naver: `http://localhost:3000/auth/naver/callback`
- Kakao: `http://localhost:3000/auth/kakao/callback`

`api/.env`에 각각의 Client ID/Secret과 Callback URL을 채워넣으면 됩니다.

---

## 4. 테스트 실행

### 4-1. 백엔드 테스트 (Jest + supertest)

```bash
cd api
npm install
npm test
```

포함 내용:
- `test/health.test.ts`:
  - `GET /health` 엔드포인트가 `200`과 `{ status: 'ok' }`를 반환하는지 검증

> 참고: 현재 통합 인증 플로우 테스트는 MariaDB 의존성이 있어
> 최소한의 헬스체크 테스트만 Jest + supertest로 구성되어 있습니다.
> 필요 시 `SESSION_STORE=memory`와 테스트용 DB를 활용해 통합 테스트를 확장할 수 있습니다.

### 4-2. 프론트엔드 테스트 (Vitest + RTL)

```bash
cd web
npm test         # 또는 npm run test:run
```

주요 테스트:
- `__tests__/Login.test.tsx`:
  - 로그인 폼 제출 시 `loginLocal` 액션이 호출되는지 검증
- 기존 컴포넌트 테스트:
  - 카라반 리스트, 예약 폼/리스트 등 기본 UI 동작 확인

---

## 5. Azure VM 배포 개요

### 5-1. 기본 아키텍처

- Azure Linux VM (Ubuntu LTS)
- Node.js 20 LTS
- MariaDB 10.11+ (VM 내부 설치 또는 Docker)
- Nginx (포트 80/443 → 프록시/정적 서빙)

추천 구조:

- Nginx
  - `https://your-domain/` → 프론트엔드 빌드 결과(dist) 정적 서빙
  - `https://your-domain/api/*` → Node API (`http://localhost:3000`)로 프록시
- Node API
  - `pm2` 등으로 `dist/server.js`를 서비스로 실행
- MariaDB
  - VM 내부 혹은 별도 Managed 인스턴스

### 5-2. 배포 절차(요약)

1. VM에 Node 20, MariaDB, Nginx 설치
2. 앱 코드 배포:
   - `api/`에서 `npm install && npm run build`
   - `web/`에서 `npm install && npm run build`
3. Prisma 마이그레이션:
   - `cd api && npx prisma migrate deploy`
4. API 실행:
   - `NODE_ENV=production pm2 start dist/server.js --name caravanshare-api`
5. Nginx 설정:
   - 80/443 포트 오픈
   - `location / { root /var/www/caravanshare-web; }`
   - `location /api/ { proxy_pass http://localhost:3000/api/; }`

---

## 6. 주요 UX 흐름 (사용자 관점 체크리스트)

### 6-1. 로그인 / 인증

브라우저에서:

1. `http://localhost:5173` 접속 → 랜딩 페이지
   - AI 스타일 히어로 이미지와 소개 문구 확인
   - "지금 시작하기" 버튼 → `/login`으로 이동
2. `/login` 페이지:
   - 상단: Google / Naver / Kakao 로그인 버튼
     - 클릭 시 각각 `/auth/google`, `/auth/naver`, `/auth/kakao`로 리다이렉트
     - OAuth 승인 후 `/app`으로 돌아와 세션이 유지되어야 함
   - 하단: 이메일/비밀번호 로그인 폼
     - 유효성 검증(React Hook Form + Zod) 메시지 확인
     - 올바른 계정이면 `/app`으로 이동

### 6-2. 대시보드 / 예약 플로우

로그인 후 `/app`에서:

- 상단 헤더:
  - 우측에 유저 이메일 또는 이름 표시
  - "로그아웃" 클릭 시 세션 종료 및 `/`로 이동
- 메인 컨텐츠:
  - 카라반 리스트:
    - 필터(위치, 가격, 인원수)에 따라 리스트가 갱신
    - 카드 선택 시 예약 대상 카라반이 강조
  - 예약 폼:
    - 시작일/종료일 선택
    - "예약하기" 버튼 클릭 시 예약 생성
  - 예약 리스트:
    - 본인이 만든 예약 목록 표시
    - 각 예약에 대해 취소 버튼 동작 확인
  - 호스트 패널(HostPanel):
    - 호스트 권한 계정일 경우에만 표시
    - 자신의 카라반에 대한 예약 목록, 상태 변경(확정/취소) 수행
  - 관리자 예약(AdminReservations):
    - 관리자 권한 계정일 경우 전체 예약 목록 확인 가능

### 6-3. 반응형 + 동적 UI

- PC/태블릿/모바일 브라우저에서:
  - 랜딩/로그인/대시보드 레이아웃이 해상도에 맞게 재배치
  - 주요 카드/버튼에 Hover/Press 애니메이션(Framer Motion) 적용
  - PWA 배너/오프라인 배너(기존 구현) 동작

---

## 7. 참고: 레거시 Python/FastAPI 코드

- `src/`, `backend/` 아래의 FastAPI + SQLAlchemy 코드는
  도메인 모델/비즈니스 규칙 참고용으로 남겨두었습니다.
- 현재 권장 개발/배포 경로는 `api/`(Node + Express + Prisma)입니다.

