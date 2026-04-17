# PowerShell script to sync Prod DB and MinIO down to Local environment
$ErrorActionPreference = "Stop"

# 1. Load Environment Variables from apps/backend/.env
$envFile = Join-Path $PSScriptRoot "apps\backend\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "Error: apps/backend/.env file not found." -ForegroundColor Red
    exit 1
}

Write-Host "Loading credentials from $envFile..."
Get-Content $envFile | Where-Object { $_ -match "^([^#=]+)=(.*)$" } | ForEach-Object {
    $name = $($matches[1]).Trim()
    $value = $($matches[2]).Trim().Trim('"').Trim("'")
    Set-Item -Path "Env:$name" -Value $value
}

# Construct Production specific URLs
$ProdDbUrl = "postgresql://$($env:DB_USER):$($env:DB_PASS)@$($env:REMOTE_DB_HOST):5432/$($env:DB_NAME)"
$ProdMinioUrl = $env:STORAGE_ENDPOINT
$ProdMinioAccessKey = $env:STORAGE_ACCESS_KEY
$ProdMinioSecretKey = $env:STORAGE_SECRET_KEY

# Construct Local specific URLs
$LocalDbUrl = $env:DATABASE_URL
$BucketName = $env:STORAGE_BUCKET
$LocalMinioUrl = "http://localhost:9000"
$LocalMinioAccess = if ([string]::IsNullOrEmpty($env:LOCAL_STORAGE_ACCESS_KEY)) { "minioadmin" } else { $env:LOCAL_STORAGE_ACCESS_KEY }
$LocalMinioSecret = if ([string]::IsNullOrEmpty($env:LOCAL_STORAGE_SECRET_KEY)) { "minioadmin" } else { $env:LOCAL_STORAGE_SECRET_KEY }

Write-Host "Target Prod DB: $($env:REMOTE_DB_HOST)" -ForegroundColor DarkCyan
Write-Host "Target Prod MinIO: $ProdMinioUrl" -ForegroundColor DarkCyan
Write-Host "WARNING: THIS SCRIPT WILL OVERWRITE ALL DATA IN YOUR LOCAL ENVIRONMENT WITH PROD DATA." -ForegroundColor Yellow

$confirm = Read-Host "Are you sure you want to overwrite your LOCAL database and MinIO? (y/N)"
if ($confirm -notmatch "^y$|^Y$") {
    Write-Host "Operation cancelled."
    exit
}

# --- 2. Database Sync (Prod -> Local) ---
Write-Host "`nStarting Database Sync (Prod -> Local)..." -ForegroundColor Cyan

# Dump Prod via pg_dump
Write-Host "Dumping PROD database..."
pg_dump -Fc -d $ProdDbUrl -f "prod_db_dump.custom"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error during pg_dump. Check your Prod DB URL." -ForegroundColor Red
    exit 1
}

# Restore to Local via pg_restore
Write-Host "Restoring to LOCAL database (Dropping existing tables)..."
# -c means drop database elements before recreating them
pg_restore -c -d $LocalDbUrl "prod_db_dump.custom"

# Clean up
if (Test-Path "prod_db_dump.custom") {
    Remove-Item "prod_db_dump.custom"
}
Write-Host "Database sync complete." -ForegroundColor Green

# --- 3. MinIO Sync (Prod -> Local) ---
Write-Host "`nStarting MinIO Sync (Prod -> Local)..." -ForegroundColor Cyan

$mcPath = Get-Command "mc.exe" -ErrorAction SilentlyContinue 
if (-not $mcPath) {
    $mcPath = Get-Command "mc" -ErrorAction SilentlyContinue
}

if (-not $mcPath) {
    Write-Host "Warning: MinIO Client (mc) not found in PATH. Skipping MinIO sync." -ForegroundColor Yellow
} else {
    Write-Host "Configuring MinIO client aliases..."
    
    # Configure prod alias
    mc alias set prodminio $ProdMinioUrl $ProdMinioAccessKey $ProdMinioSecretKey | Out-Null
    
    # Configure local alias
    mc alias set localminio $LocalMinioUrl $LocalMinioAccess $LocalMinioSecret | Out-Null
    
    Write-Host "Mirroring storage buckets (Prod -> Local)..."
    # --overwrite and --remove will ensure exact mirror (deletes local files not in prod)
    mc mirror --overwrite --remove "prodminio/$BucketName" "localminio/$BucketName"
    
    Write-Host "Storage sync complete." -ForegroundColor Green
}

Write-Host "`nLocal Environment Successfully Synced with Production!" -ForegroundColor Green
