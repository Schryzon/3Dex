# push.ps1
# Sync Local -> Remote (DB & MinIO)

$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..")

Write-Host "=== PUSHING DATA TO REMOTE =================================" -ForegroundColor Red

# 1. Sync Database
Write-Host "[1/2] Pushing Database..." -ForegroundColor Yellow
if (Test-Path "scripts/push_to_remote_db.ps1") { 
    powershell scripts/push_to_remote_db.ps1 
    if ($LASTEXITCODE -ne 0) { Write-Host "DB Push aborted or failed. Skipping MinIO sync." -ForegroundColor Yellow; exit 1 }
}
else { Write-Host "Error: push_to_remote_db.ps1 not found" -ForegroundColor Red; exit 1 }

# 2. Sync MinIO
Write-Host "[2/2] Pushing MinIO Files..." -ForegroundColor Yellow
npx ts-node scripts/worker.ts sync-minio push

Write-Host ""
Write-Host "=== PUSH COMPLETED! ==========================================" -ForegroundColor Green
