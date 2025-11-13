param(
  [string]$ProjectId = "",
  [string]$AppDisplayName = "caravanshare-web",
  [switch]$EnableGoogleProvider
)

$ErrorActionPreference = 'Stop'

# Normalize console/output encoding to UTF-8 (reduce garbled text)
try {
  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
  $OutputEncoding = [System.Text.UTF8Encoding]::new()
} catch {}
try { cmd /c chcp 65001 > $null } catch {}

function Ensure-FirebaseTools {
  try {
    firebase --version | Out-Null
  } catch {
    Write-Host "[!] firebase-tools not found. Install with:" -ForegroundColor Yellow
    Write-Host "    npm i -g firebase-tools"
    throw
  }
}

function Ensure-Login {
  $login = $null
  try { $login = firebase login:list --json | ConvertFrom-Json } catch {}
  $hasDefault = $false
  if ($login) {
    foreach ($entry in $login) { if ($entry.default -eq $true) { $hasDefault = $true; break } }
  }
  if (-not $hasDefault) {
    Write-Host "[i] Firebase login..." -ForegroundColor Cyan
    firebase login
  }
}

function Ensure-Project([string]$projectId) {
  $projects = $null
  try { $projects = firebase projects:list --json | ConvertFrom-Json } catch {}
  if ($projects -and ($projects | Where-Object { $_.projectId -eq $projectId })) { return }
  Write-Host "[i] Creating GCP project: $projectId" -ForegroundColor Cyan
  firebase projects:create $projectId --display-name "CaravanShare" | Out-Null
}

function Ensure-AddFirebase([string]$projectId) {
  Write-Host "[i] Adding Firebase resources to project (if needed): $projectId" -ForegroundColor Cyan
  try {
    firebase projects:addfirebase $projectId | Out-Null
  } catch {
    Write-Host "[!] addfirebase failed or not needed. If this persists, add Firebase to the GCP project in the Console." -ForegroundColor Yellow
  }
}

function Ensure-WebApp([string]$projectId, [string]$appName) {
  $apps = $null
  try { $apps = firebase apps:list WEB -P $projectId --json | ConvertFrom-Json } catch {}
  if ($apps -and $apps.result -and ($apps.result | Where-Object { $_.displayName -eq $appName })) { return }
  Write-Host "[i] Creating Web App: $appName" -ForegroundColor Cyan
  try {
    firebase apps:create WEB $appName -P $projectId | Out-Null
  } catch {
    Write-Host "[!] Web App creation failed. Will try to continue." -ForegroundColor Yellow
  }
}

function Export-SdkConfig([string]$projectId, [string]$envPath) {
  $apps = firebase apps:list WEB -P $projectId --json | ConvertFrom-Json
  $appId = $null
  if ($apps -and $apps.result) { $appId = ($apps.result | Select-Object -First 1).appId }
  if (-not $appId) { throw "No Web App found. Create one in Console or re-run after addfirebase." }
  $cfg = firebase apps:sdkconfig WEB $appId -P $projectId --json | ConvertFrom-Json
  $apiKey = $cfg.result.sdkConfig.apiKey
  $authDomain = $cfg.result.sdkConfig.authDomain
  $dir = Split-Path $envPath -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  "VITE_FIREBASE_API_KEY=$apiKey`nVITE_FIREBASE_AUTH_DOMAIN=$authDomain`n" | Set-Content -Encoding ascii $envPath
  Write-Host "[OK] Wrote: $envPath" -ForegroundColor Green
  Write-Host "[HINT] Backend env:  `$env:FIREBASE_PROJECT_ID = '$projectId'" -ForegroundColor DarkCyan
}

function Enable-GoogleProvider([string]$projectId) {
  try { gcloud --version | Out-Null } catch {
    Write-Host "[!] gcloud not found. Skipping provider auto-enable. Enable Google provider in Console." -ForegroundColor Yellow
    return
  }
  $token = gcloud auth print-access-token
  $uri = "https://identitytoolkit.googleapis.com/v2/projects/$projectId/config?updateMask=signIn"
  $body = @{ signIn = @{ allowDuplicateEmails = $false; email = @{ enabled = $true }; google = @{ enabled = $true } } } | ConvertTo-Json -Depth 5
  try {
    Invoke-RestMethod -Method PATCH -Uri $uri -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $body | Out-Null
    Write-Host "[OK] Google provider enable request sent" -ForegroundColor Green
  } catch {
    Write-Host "[!] Provider auto-enable failed. Please enable in Console." -ForegroundColor Yellow
  }
}

Ensure-FirebaseTools
Ensure-Login

if (-not $ProjectId) {
  $ProjectId = Read-Host "Firebase Project ID (e.g. caravanshare-demo)"
}

Ensure-Project $ProjectId
Ensure-AddFirebase $ProjectId
Ensure-WebApp $ProjectId $AppDisplayName
Export-SdkConfig $ProjectId "web/.env.local"

if ($EnableGoogleProvider) {
  Enable-GoogleProvider $ProjectId
}

Write-Host "[DONE] Firebase bootstrap complete" -ForegroundColor Green

