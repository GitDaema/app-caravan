@echo off
setlocal

call scripts\test_api.cmd || exit /b 1
call scripts\test_web.cmd

