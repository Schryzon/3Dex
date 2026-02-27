# Push Database from Local Docker to Remote
# Usage: ./push_db.ps1

# Load environment variables from .env file if it exists
$EnvFile = Join-Path $PSScriptRoot "../.env"
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | Where-Object { $_ -match "=" -and $_ -notmatch "^#" } | ForEach-Object {
        $name, $value = $_.Split('=', 2)
        [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim())
    }
}

$RemoteHost = $env:REMOTE_DB_HOST
$DBUser = $env:DB_USER
$DBName = $env:DB_NAME
$DBPass = $env:DB_PASS
$ContainerName = "threedex"

if (-not $RemoteHost -or -not $DBPass) {
    Write-Host "Error: REMOTE_DB_HOST or DB_PASS not set in environment or .env file." -ForegroundColor Red
    exit 1
}

Write-Host "WARNING: This will OVERWRITE the remote database at $RemoteHost!" -ForegroundColor Yellow
$Confirmation = Read-Host "Are you sure you want to push your local DB to remote? (y/n)"
if ($Confirmation -ne "y") {
    Write-Host "Push cancelled." -ForegroundColor Red
    exit 0
}

Write-Host "Starting Database Push (Local -> Remote)..." -ForegroundColor Cyan

# Set password for local dump
$env:PGPASSWORD = $DBPass

# 1. Dump from Local
Write-Host "Dumping local data..."
docker exec -e PGPASSWORD=$DBPass $ContainerName pg_dump -U $DBUser $DBName > db_push.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to dump local database." -ForegroundColor Red
    exit $LASTEXITCODE
}

# 2. Restore to Remote
Write-Host "Sending data to remote ($RemoteHost)..."
Get-Content db_push.sql | docker exec -i $ContainerName psql -h $RemoteHost -U $DBUser -d $DBName

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to restore to remote database." -ForegroundColor Red
}
else {
    Write-Host "Database Push Completed successfully!" -ForegroundColor Green
}

# Cleanup
Remove-Item db_push.sql
