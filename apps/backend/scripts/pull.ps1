# pull.ps1
# Sync Remote -> Local (DB & MinIO)

$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..")

Write-Host "=== pulling DATA FROM REMOTE ================================" -ForegroundColor Cyan

# 1. Sync Database
Write-Host "[1/3] Syncing Database..." -ForegroundColor Yellow
if (Test-Path "scripts/sync_db.ps1") { powershell scripts/sync_db.ps1 } 
else { Write-Host "Error: sync_db.ps1 not found" -ForegroundColor Red; exit 1 }

# 2. Sync MinIO
Write-Host "[2/3] Syncing MinIO Files..." -ForegroundColor Yellow
npx ts-node scripts/worker.ts sync-minio pull

# 3. Register Models
Write-Host "[3/3] Registering Models..." -ForegroundColor Yellow
npx ts-node scripts/worker.ts register-models

Write-Host ""
Write-Host "=== PULL COMPLETED! ==========================================" -ForegroundColor Green
