FROM python:3.10-slim

WORKDIR /app

# 시스템 의존성 필요한 경우 설치 (gcc 등)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 포트 설정
EXPOSE 8000

# SQLite 데이터베이스 마이그레이션이 필요하면 수행 가능하도록 하고, uvicorn 구동
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
