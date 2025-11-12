# CaravanShare 빠른 실행/테스트 가이드 (Windows)

PowerShell 실행 정책 문제를 피하기 위해 `.cmd` 스크립트를 제공합니다. 아래 명령은 `cmd.exe`(명령 프롬프트)에서 실행하세요.

## 1) 가상환경/의존성 설치

PowerShell이 허용된다면:

  scripts/setup_venv.ps1

PowerShell이 제한된다면(또는 수동):

  python -m venv .venv
  .venv\Scripts\python.exe -m pip install -U pip
  .venv\Scripts\python.exe -m pip install -r requirements.txt

웹 의존성은 첫 실행 시 자동 설치됩니다.

## 2) DB 시드(관리자/데모 데이터)

- 기본(admin + 잔액 1000):

  scripts/seed.cmd

- 데모 호스트/카라반 포함:

  scripts/seed.cmd demo

## 3) 개발 서버 동시 실행

  scripts/dev_all.cmd

- API: http://localhost:8000
- Web: http://localhost:5173

로컬 로그인: admin@example.com / password

## 4) 테스트 실행

- 백엔드만:  scripts/test_api.cmd
- 프론트만:  scripts/test_web.cmd
- 전체:      scripts/test_all.cmd

## 5) 개별 실행 (원하면 분리 실행)

- API만: scripts/dev_api.cmd
- Web만: scripts/dev_web.cmd

## 참고

- Google ID 토큰 검증은 실제 클라이언트 ID 설정 전에는 실패할 수 있습니다. 로컬 로그인으로 진행하세요.
- 웹에서 API 경로는 기본 `http://localhost:8000/api/v1` 입니다. 필요 시 `VITE_API_BASE_URL` 환경변수로 변경 가능합니다.

