# push_to_remote_db.ps1
# Force push ALL tables from local Docker DB -> remote VPS DB (destructive!)

$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $ScriptDir "../.env"

# Load .env
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | Where-Object { $_ -match "=" -and $_ -notmatch "^#" } | ForEach-Object {
        $name, $value = $_.Split("=", 2)
        $value = $value.Trim().Trim('"')
        [System.Environment]::SetEnvironmentVariable($name.Trim(), $value)
    }
}

$RemoteHost     = $env:REMOTE_DB_HOST
$RemotePort     = if ($env:REMOTE_DB_PORT) { $env:REMOTE_DB_PORT } else { "5432" }
$DBUser         = $env:DB_USER
$DBName         = $env:DB_NAME
$DBPass         = $env:DB_PASS
$LocalContainer = "threedex"
$PgImage        = "postgres:18"

if (-not $RemoteHost -or -not $DBPass) {
    Write-Host "Error: REMOTE_DB_HOST or DB_PASS not set in .env" -ForegroundColor Red
    exit 1
}

Write-Host "================================================================" -ForegroundColor Yellow
Write-Host "  WARNING: This will OVERWRITE all tables on the remote DB!" -ForegroundColor Yellow
Write-Host "  Remote: $RemoteHost" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Yellow
$confirm = Read-Host "Are you sure? This cannot be undone. (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Aborted." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "[1/3] Dumping local Docker DB..." -ForegroundColor Cyan
docker exec -e PGPASSWORD=$DBPass $LocalContainer `
    pg_dump -U $DBUser $DBName --no-owner --no-acl --clean --if-exists `
    > db_push_remote.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to dump local DB." -ForegroundColor Red
    exit 1
}
Write-Host "Dump saved to db_push_remote.sql"

Write-Host ""
Write-Host "[2/3] Pushing all tables to remote DB ($RemoteHost)..." -ForegroundColor Cyan
Get-Content db_push_remote.sql | docker run -i --rm -e "PGPASSWORD=$DBPass" $PgImage `
    psql -h "$RemoteHost" -p "$RemotePort" -U "$DBUser" -d "$DBName"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to push to remote DB." -ForegroundColor Red
    Remove-Item db_push_remote.sql -ErrorAction SilentlyContinue
    exit 1
}

Write-Host ""
Write-Host "[3/3] Cleaning up..." -ForegroundColor Cyan
Remove-Item db_push_remote.sql -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=== push_to_remote_db.ps1 completed! ===========================" -ForegroundColor Green
Write-Host "  All local tables have been pushed to $RemoteHost" -ForegroundColor Green
