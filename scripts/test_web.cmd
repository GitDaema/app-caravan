@echo off
setlocal

pushd web
if not exist node_modules (
  call npm install
)
call npm run test:run
popd

