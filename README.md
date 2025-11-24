# CaravanShare Monorepo

카라반 공유·예약을 위한 웹 애플리케이션 모노레포입니다.  
**P2P 카라반 공유** 시나리오를 기반으로, 게스트(여행자)·호스트(카라반 소유자)·관리자 역할을 모두 지원합니다.

- 호스트는 카라반 등록, 요금 설정, 예약 승인/취소, 예약별 메시지 확인을 할 수 있습니다.
- 게스트는 카라반 검색·상세 조회, 기간 선택 예약, 예약 취소, 리뷰 작성, 사전 문의(Pre-message)를 할 수 있습니다.
- 관리자는 전체 예약·사용자 상태를 모니터링하고, 잔액 충전 등 데모용 편의 기능을 제공합니다.
- 이메일/비밀번호 로그인과 소셜 로그인(Google, Naver, Kakao)을 지원하며, 세션 기반 인증으로 동작합니다.

![메인 랜딩 페이지 스크린샷](images/landing.png)

---

## Repository Navigation

이 리포지토리는 여러 서브 프로젝트를 포함하는 **모노레포**입니다.  
각 폴더의 상세 사용 방법은 해당 폴더의 README 및 `docs/` 문서를 참고하면 됩니다.

- `api/` – **Node.js(Express + Prisma) 기반 메인 API 서버**
  - MariaDB와 연동된 세션 기반 인증(이메일/비밀번호 + 소셜 로그인)
  - 카라반, 예약, 리뷰, 메시지(사전 문의/예약 내 메시지) 도메인 API
  - Jest + supertest 기반 API 테스트 (`npm test`)
- `web/` – **Vite + React + TypeScript PWA 프론트엔드**
  - `/landing`, `/login`, `/app`(대시보드) 등 주요 라우트
  - React Query, Zustand 기반 상태 관리, Tailwind CSS UI
  - Vitest + React Testing Library 기반 화면 테스트 (`npm test`)
- `backend/` – FastAPI + SQLAlchemy 기반 **기존 Python 백엔드**
  - 도메인 모델·비즈니스 규칙의 레퍼런스로 유지됩니다.
  - Pytest 기반 테스트는 계속해서 `backend/tests/` 에 위치합니다.
- `src/` – FastAPI 백엔드의 초기 단일 앱 구조(서비스/리포지토리/도메인 모델 등)
- `tests/` – 상위 수준 테스트 진입점 설명용 폴더
  - 실제 Pytest 테스트 코드는 `backend/tests/` 에 있습니다(자세한 내용은 `tests/README.md` 참고).
- `docs/` – 배포 및 빠른 실행을 위한 문서들
  - `docs/QUICKSTART.md` – **Node + MariaDB + React 전체 Quickstart (권장 진입점)**
  - `docs/DEPLOY_AZURE.md` – Azure VM 에서 Docker / PM2 + Nginx 기반 배포 가이드

추가 참고 문서:

- `DESIGN.md` – 아키텍처/도메인 설계, 주요 기술·설계 결정 기록
- `GOAL.md`, `GEMINI.md`, `DEVELOPMENT_LOG.md` – 과제 목표, 작업 로그, AI 협업 메모 등

---

## Quick Start (권장 흐름)

상세 단계는 `docs/QUICKSTART.md` 에 정리되어 있습니다.  
아래는 **로컬에서 전체 시스템을 빠르게 돌려보는** 상위 수준 요약입니다.

### 1. 공통 사전 준비

- Node.js 20 LTS
- Docker 및 docker-compose

루트에서 `.env` 파일을 준비합니다:

```bash
cp .env.example .env
# Windows PowerShell의 경우:
# copy .env.example .env
```

필수 값 (예시 기준):

- `MARIADB_ROOT_PASSWORD`, `MARIADB_USER`, `MARIADB_PASSWORD`
- `DATABASE_URL` (예: `mysql://caravan:...@db:3306/caravanshare`)
- `SESSION_SECRET`
- `FRONTEND_BASE_URL` (로컬 개발 기본값: `http://localhost:5173`)

### 2. Docker Compose 로 API + DB 실행

```bash
docker compose up -d
```

구성:

- `db` – MariaDB 10.11 (포트 `3306`)
- `api` – Node 20 + Express + Prisma (포트 `3000`)

`api` 컨테이너가 뜨면 `http://localhost:3000/health` 로 상태를 확인할 수 있습니다.

### 3. 프론트엔드(dev 모드) 실행

```bash
cd web
cp .env.local.example .env.local   # 필요 시 값 수정
npm install
npm run dev
```

- 기본 개발 주소: `http://localhost:5173`
- `.env.local` 의 `VITE_API_BASE_URL` 을 `http://localhost:3000` 으로 맞추면 됩니다.

브라우저에서 `http://localhost:5173` 에 접속하면:

- `/landing` – 서비스 소개 랜딩 페이지
- `/login` – 이메일/비밀번호 + 소셜 로그인 화면
- `/app` – 게스트/호스트/관리자 대시보드

를 차례로 확인할 수 있습니다.

### 4. (선택) FastAPI 백엔드 실행 및 테스트

과제의 초기 목표/도메인 모델은 FastAPI 백엔드를 기준으로 설계되었습니다.  
해당 구현을 직접 실행·검증하고 싶다면:

1. 가상환경 및 의존성 설치 (루트에서)

   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .\.venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. FastAPI 서버 실행

   ```bash
   uvicorn backend.app.main:app --reload
   ```

3. Pytest 테스트 실행

   ```bash
   pytest backend/tests -q
   ```

자세한 내용은 `backend/README.md` 와 `tests/README.md` 를 참고하세요.

---

## Tech Stack

### Production Path (Node API + React PWA)

- **Backend (api/)**
  - Node.js 20
  - Express
  - Prisma ORM + MariaDB
  - express-session + Passport (Google/Naver/Kakao OAuth 포함)
  - Jest + supertest

- **Frontend (web/)**
  - React 18
  - Vite
  - TypeScript
  - React Query, Zustand
  - Tailwind CSS
  - PWA & (선택) Capacitor
  - Vitest + React Testing Library

### Reference Implementation (FastAPI)

- **Backend (src/, backend/)**
  - FastAPI
  - SQLAlchemy (SQLite / MariaDB)
  - Pydantic / pydantic-settings
  - Pytest (+ pytest-cov)

FastAPI 구현은 도메인 모델과 예약/결제/권한 비즈니스 규칙을 명확히 보여주기 위한 **참고용 구현**이며,  
실 서비스 시나리오와 배포는 Node API + React PWA 구성을 기본으로 합니다.
