#!/usr/bin/env bash
set -euo pipefail

PY_WIN="/c/Users/admin/AppData/Local/Programs/Python/Python312/python.exe"
PY=${PY_WIN}

if ! command -v "$PY" >/dev/null 2>&1; then
  if command -v py >/dev/null 2>&1; then PY=py; else PY=python; fi
fi

echo "[i] 가상환경 생성: .venv"
"$PY" -m venv .venv

VENV_PY="./.venv/Scripts/python.exe"

echo "[i] pip 업그레이드"
"$VENV_PY" -m pip install -U pip

echo "[i] requirements 설치"
"$VENV_PY" -m pip install -r requirements.txt

echo "[i] 테스트 의존성 보강 (httpx, requests)"
"$VENV_PY" -m pip install httpx requests

echo "[i] DB 초기화 (drop+create)"
"$VENV_PY" initial_data.py

echo "[✓] 준비 완료. 테스트: scripts/test.sh  또는  API: scripts/dev_api.sh"

