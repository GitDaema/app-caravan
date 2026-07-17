#!/bin/bash
# Render/클라우드 배포 시 인스턴스가 재시작되어 SQLite 데이터가 날아가도 
# 자동으로 DB 테이블을 재구축하고 데모 데이터를 주입해주는 스타트 헬퍼 스크립트입니다.

echo "==> Initializing Database and Seeding Demo Data..."
python initial_data.py

echo "==> Starting FastAPI Backend App via Uvicorn..."
uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
