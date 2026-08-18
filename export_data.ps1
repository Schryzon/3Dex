$ErrorActionPreference = "Stop"

$script_dir = $PSScriptRoot
if (-not $script_dir) {
    $script_dir = (Get-Location).Path
}

Push-Location $script_dir
try {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backup_dir = Join-Path $script_dir "backups"
    if (-not (Test-Path $backup_dir)) {
        New-Item -ItemType Directory -Path $backup_dir | Out-Null
    }

    $zip_filename = "backup_$timestamp.zip"
    $zip_path = Join-Path $backup_dir $zip_filename

    $temp_staging = Join-Path $script_dir "_temp_export_$timestamp"
    if (Test-Path $temp_staging) {
        Remove-Item -Recurse -Force $temp_staging
    }
    New-Item -ItemType Directory -Path $temp_staging | Out-Null

    Write-Host "Exporting Database from PostgreSQL container (threedex)..." -ForegroundColor Cyan
    docker exec -t threedex pg_dump -U threedex -d threedex -F c -f /tmp/backup.dump
    $dump_dest = Join-Path $temp_staging "db_backup.dump"
    docker cp threedex:/tmp/backup.dump $dump_dest
    docker exec threedex rm /tmp/backup.dump

    Write-Host "Exporting MinIO Storage (3dex-minio)..." -ForegroundColor Cyan
    $minio_staging = Join-Path $temp_staging "minio_backup"
    New-Item -ItemType Directory -Path $minio_staging | Out-Null
    
    # Copy minio models bucket if it exists in container
    try {
        docker cp 3dex-minio:/data/3dex-models (Join-Path $minio_staging "3dex-models") 2>$null
    } catch {
        Write-Host "Note: 3dex-models bucket was empty or not found in container." -ForegroundColor Yellow
    }

    Write-Host "Compressing backup into $zip_filename..." -ForegroundColor Cyan
    Compress-Archive -Path "$temp_staging\*" -DestinationPath $zip_path -Force

    # Clean up staging
    Remove-Item -Recurse -Force $temp_staging

    Write-Host "`nBackup Complete!" -ForegroundColor Green
    Write-Host "Archive saved to: $zip_path" -ForegroundColor Green
} finally {
    Pop-Location
}
