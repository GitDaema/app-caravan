$VenvPy = Join-Path (Join-Path ".venv" "Scripts") "python.exe"
if (-not (Test-Path $VenvPy)) {
  Write-Host "[!] .venv not found. Run scripts/setup_venv.ps1 first." -ForegroundColor Red
  exit 1
}

& $VenvPy -m pytest -q

