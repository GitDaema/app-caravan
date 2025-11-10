#!/usr/bin/env bash
set -euo pipefail

cd web
if [ ! -d node_modules ]; then npm install; fi
npm run dev

