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
$RemotePort = if ($env:REMOTE_DB_PORT) { $env:REMOTE_DB_PORT } else { "5432" }
$DBUser = $env:DB_USER
$DBName = $env:DB_NAME
$DBPass = $env:DB_PASS
$LocalContainer = "threedex"
$PgImage = "postgres:18"  # Match VPS PostgreSQL version

if (-not $RemoteHost -or -not $DBPass) {
    Write-Host "Error: REMOTE_DB_HOST or DB_PASS not set in environment or .env file." -ForegroundColor Red
    exit 1
}

Write-Host "Starting Database Sync (Remote -> Local)..." -ForegroundColor Cyan

# Set password for pg_dump
$env:PGPASSWORD = $DBPass

# 1. Dump from Remote using a temporary postgres:18 container
Write-Host "Dumping data from remote ($RemoteHost)..."

# Use absolute path for volume mount
$BackupPath = Resolve-Path .
docker run --rm `
    -v "${BackupPath}:/backup" `
    -e "PGPASSWORD=$DBPass" `
    $PgImage `
    pg_dump -h "$RemoteHost" -p "$RemotePort" -U "$DBUser" -f /backup/db_sync.sql "$DBName"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Could not reach remote DB ($RemoteHost). Skipping sync, using local data." -ForegroundColor Yellow
    Remove-Item db_sync.sql -ErrorAction SilentlyContinue
    exit 0
}

# 2. Restore to Local Docker container
Write-Host "Restoring data to local container..."
Get-Content db_sync.sql | docker exec -i $LocalContainer psql -U $DBUser -d $DBName

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to restore database locally." -ForegroundColor Red
}
else {
    Write-Host "Database Sync Completed successfully!" -ForegroundColor Green
}

# Cleanup
Remove-Item db_sync.sql
