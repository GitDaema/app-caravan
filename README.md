# Caravan Share Web Application

FastAPI 백엔드와 Vite/React(PWA) 프론트엔드로 구성된 **카라반 공유·예약 웹 애플리케이션**입니다.

- 호스트가 카라반 정보를 등록하고 관리할 수 있습니다.
- 게스트가 일정 기간 동안 카라반을 검색·예약할 수 있습니다.
- 예약 시 잔액 차감 / 취소 시 환불 등 기본 결제 흐름을 시뮬레이션합니다.
- Google 로그인 등 외부 인증 연동을 통해 실제 서비스 환경에 가까운 플로우를 제공합니다.

![메인 페이지 스크린샷](images/landing.png)

---

## Repository Navigation

이 리포지토리는 단일 모노레포 형태로 구성되어 있으며, 각 서브 디렉터리의 상세 내용은 해당 폴더의 README를 참고합니다.

- `backend/` – FastAPI 기반 API 서버와 DB, 테스트 관련 정보  
  → 자세한 내용은 `backend/README.md` 참고
- `web/` – Vite/React 기반 PWA 프론트엔드 및 Capacitor 설정  
  → 자세한 내용은 `web/README.md` 참고
- `tests/` – 테스트 구조와 위치에 대한 설명 (실제 테스트 코드는 `backend/tests/` 에 위치)  
  → 자세한 내용은 `tests/README.md` 참고

그 외 참고 문서:

- `DESIGN.md` – 아키텍처/도메인 설계 및 기술적 의사결정 정리
- `GOAL.md`, `GEMINI.md`, `DEVELOPMENT_LOG.md` – 과제 목표, 작업 로그, 추가 메모

---

## Quick Start (High-level)

자세한 설치/환경 변수 설정은 각 서브 프로젝트 README를 참고하고, 아래는 전체를 빠르게 띄우는 개략적인 방법입니다.

1. **Docker Compose 로 올인원 실행 (권장)**
   - 루트에서 `.env` 를 준비한 뒤:
     - `docker-compose up`  
   - 이 방법은 DB 및 API 레이어를 컨테이너로 함께 올리는 데 초점을 둡니다.

2. **로컬 개발 모드로 각각 실행**
   - 터미널 1: `backend/` 진입 → FastAPI 서버 실행 (상세 커맨드는 `backend/README.md` 참고)
   - 터미널 2: `web/` 진입 → Vite 개발 서버 실행 (상세 커맨드는 `web/README.md` 참고)

테스트 실행 및 커버리지 측정 방법은 `backend/README.md` 와 `tests/README.md` 에서 별도로 안내합니다.

---

## Tech Stack

- **Backend**
  - FastAPI
  - SQLAlchemy (SQLite / MariaDB 등 관계형 DB)
  - Pydantic / pydantic-settings
  - Pytest (+ pytest-cov)

- **Frontend**
  - React
  - Vite
  - TypeScript
  - PWA & Capacitor (모바일 앱 패키징용)

