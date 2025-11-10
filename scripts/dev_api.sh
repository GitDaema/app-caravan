#!/usr/bin/env bash
set -euo pipefail

VENV_PY="./.venv/Scripts/python.exe"
if [ ! -f "$VENV_PY" ]; then
  echo "[!] .venv이 없습니다. 먼저 scripts/setup_venv.sh 를 실행하세요." 1>&2
  exit 1
fi

"$VENV_PY" -m uvicorn backend.app.main:app --reload

