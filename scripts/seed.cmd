@echo off
setlocal

set VENV_PY=.venv\Scripts\python.exe
if not exist %VENV_PY% (
  echo [!] .venv not found. Run scripts\setup_venv.ps1 or create venv first.
  exit /b 1
)

if "%1"=="demo" (
  set SEED_DEMO=1
)

echo [i] Seeding database... (SEED_DEMO=%SEED_DEMO%)
"%VENV_PY%" initial_data.py

