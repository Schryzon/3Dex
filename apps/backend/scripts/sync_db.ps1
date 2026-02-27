# Sync Database from Remote to Local Docker
# Usage: ./sync_db.ps1

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

Write-Host "Starting Database Sync (Remote -> Local)..." -ForegroundColor Cyan

# Set password for pg_dump
$env:PGPASSWORD = $DBPass

# 1. Dump from Remote using local docker container as a client
Write-Host "Dumping data from remote ($RemoteHost)..."
docker exec -e PGPASSWORD=$DBPass $ContainerName pg_dump -h $RemoteHost -U $DBUser $DBName > db_sync.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Could not reach remote DB ($RemoteHost). Skipping sync, using local data." -ForegroundColor Yellow
    exit 0
}

# 2. Restore to Local
Write-Host "Restoring data to local container..."
Get-Content db_sync.sql | docker exec -i $ContainerName psql -U $DBUser -d $DBName

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to restore database locally." -ForegroundColor Red
}
else {
    Write-Host "Database Sync Completed successfully!" -ForegroundColor Green
}

# Cleanup
Remove-Item db_sync.sql
