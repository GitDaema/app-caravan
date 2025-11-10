$ErrorActionPreference = 'Stop'

# 1) Ensure backend venv exists
$VenvPy = Join-Path (Join-Path ".venv" "Scripts") "python.exe"
if (-not (Test-Path $VenvPy)) {
  Write-Host "[i] Creating virtual environment (.venv)" -ForegroundColor Cyan
  ./scripts/setup_venv.ps1
}

# 2) Start Backend API in new window
Write-Host "[i] Opening API server window" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -File ./scripts/dev_api.ps1"

# 3) Start Frontend Dev server in new window
Write-Host "[i] Opening Web dev server window" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -File ./scripts/dev_web.ps1"

Write-Host "[✓] Ready: Web http://localhost:5173  |  API http://localhost:8000" -ForegroundColor Green

