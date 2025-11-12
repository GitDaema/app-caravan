@echo off
setlocal

REM Open API and Web dev servers in separate windows
start "API" cmd /k scripts\dev_api.cmd
start "WEB" cmd /k scripts\dev_web.cmd

echo [OK] API -> http://localhost:8000  |  Web -> http://localhost:5173

