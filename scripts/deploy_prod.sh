#!/usr/bin/env bash
set -euo pipefail

# Simple prod deploy helper for the Azure VM.
# Usage (on VM):
#   cd ~/app-caravan
#   ./scripts/deploy_prod.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Using existing working tree (no git pull)."

echo "==> Building frontend (web)..."
cd "$ROOT_DIR/web"

if command -v npm >/dev/null 2>&1; then
  # Prefer npm ci when possible, fall back to npm install
  if npm ci >/dev/null 2>&1; then
    echo "npm ci completed."
  else
    echo "npm ci failed, falling back to npm install..."
    npm install
  fi
  npm run build
else
  echo "npm is not installed or not in PATH on this VM." >&2
  exit 1
fi

cd "$ROOT_DIR"

echo "==> Choosing compose command..."
if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
else
  COMPOSE="docker-compose"
fi
echo "Using: $COMPOSE"

echo "==> Removing old api service container (if any)..."
$COMPOSE -f docker-compose.prod.yml rm -f api >/dev/null 2>&1 || true

echo "==> Building and starting prod stack (db + api + web)..."
$COMPOSE -f docker-compose.prod.yml up -d --build

echo "==> Deploy completed."
