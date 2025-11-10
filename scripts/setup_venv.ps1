param(
  [string]$PythonPath = "C:\Users\admin\AppData\Local\Programs\Python\Python312\python.exe"
)

if (-not (Test-Path $PythonPath)) {
  Write-Host "[i] Specified Python not found. Using 'python' on PATH." -ForegroundColor Yellow
  $PythonPath = "python"
}

Write-Host "[i] Creating venv: .venv" -ForegroundColor Cyan
& $PythonPath -m venv .venv

$VenvPy = Join-Path (Join-Path ".venv" "Scripts") "python.exe"

Write-Host "[i] Upgrading pip" -ForegroundColor Cyan
& $VenvPy -m pip install -U pip

Write-Host "[i] Installing requirements" -ForegroundColor Cyan
& $VenvPy -m pip install -r requirements.txt

Write-Host "[i] Installing extra test deps (httpx, requests)" -ForegroundColor Cyan
& $VenvPy -m pip install httpx requests

Write-Host "[i] Initializing DB (drop+create)" -ForegroundColor Cyan
& $VenvPy initial_data.py

Write-Host "[✓] Ready. Run scripts/test.ps1 or scripts/dev_api.ps1" -ForegroundColor Green

