@echo off
setlocal

set VENV_PY=.venv\Scripts\python.exe
if not exist %VENV_PY% (
  echo [!] .venv not found. Run scripts\setup_venv.ps1 or create venv first.
  exit /b 1
)

%VENV_PY% -m uvicorn backend.app.main:app --reload

