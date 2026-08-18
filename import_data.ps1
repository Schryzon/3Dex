param (
    [string]$BackupPath
)

$ErrorActionPreference = "Stop"

$script_dir = $PSScriptRoot
if (-not $script_dir) {
    $script_dir = (Get-Location).Path
}

Push-Location $script_dir
try {
    $backup_dir = Join-Path $script_dir "backups"
    $selected_zip = $null

    if ($BackupPath) {
        if (Test-Path $BackupPath) {
            $selected_zip = Get-Item $BackupPath
        } else {
            Write-Host "Error: Specified backup file '$BackupPath' not found." -ForegroundColor Red
            exit 1
        }
    } else {
        # 1. Auto-detect latest backup ZIP in backups/ and root
        $zip_candidates = @()
        if (Test-Path $backup_dir) {
            $zip_candidates += Get-ChildItem -Path $backup_dir -Filter "backup_*.zip"
        }
        if (Test-Path $script_dir) {
            $zip_candidates += Get-ChildItem -Path $script_dir -Filter "backup_*.zip"
        }

        if ($zip_candidates -and $zip_candidates.Count -gt 0) {
            $selected_zip = $zip_candidates | Sort-Object -Property LastWriteTime -Descending | Select-Object -First 1
        }
    }

    if ($selected_zip) {
        Write-Host "Found latest backup archive: $($selected_zip.Name)" -ForegroundColor Green
        Write-Host "Archive location: $($selected_zip.FullName)" -ForegroundColor DarkGray

        $temp_restore = Join-Path $script_dir "_temp_restore"
        if (Test-Path $temp_restore) {
            Remove-Item -Recurse -Force $temp_restore
        }
        New-Item -ItemType Directory -Path $temp_restore | Out-Null

        Write-Host "Extracting archive..." -ForegroundColor Cyan
        Expand-Archive -Path $selected_zip.FullName -DestinationPath $temp_restore -Force

        $db_dump_path = Join-Path $temp_restore "db_backup.dump"
        $minio_restore_path = Join-Path $temp_restore "minio_backup\3dex-models"

        if (-not (Test-Path $db_dump_path)) {
            Write-Host "Error: db_backup.dump not found inside the backup archive." -ForegroundColor Red
            Remove-Item -Recurse -Force $temp_restore
            exit 1
        }

        Write-Host "Temporarily stopping API service to release database connections..." -ForegroundColor Yellow
        docker stop 3dex-api | Out-Null

        Write-Host "Importing Database (Clean & Restore)..." -ForegroundColor Cyan
        docker cp $db_dump_path threedex:/tmp/backup.dump
        docker exec -t threedex pg_restore -U threedex -d threedex --clean --if-exists /tmp/backup.dump
        docker exec threedex rm /tmp/backup.dump

        Write-Host "Restarting API service..." -ForegroundColor Yellow
        docker start 3dex-api | Out-Null

        Write-Host "Importing MinIO Storage..." -ForegroundColor Cyan
        if (Test-Path $minio_restore_path) {
            docker cp $minio_restore_path 3dex-minio:/data/
            docker exec 3dex-minio sh -c "mc alias set local http://127.0.0.1:9000 minioadmin minioadmin && mc mb local/3dex-models --ignore-existing && mc anonymous set public local/3dex-models"
            Write-Host "MinIO files restored successfully!" -ForegroundColor Green
        } else {
            Write-Host "Note: No 3D model files found in backup. Skipping MinIO restore." -ForegroundColor Yellow
        }

        # Clean up temporary extraction folder
        Remove-Item -Recurse -Force $temp_restore -ErrorAction SilentlyContinue

        Write-Host "`nImport Complete! All database records and models restored from $($selected_zip.Name)." -ForegroundColor Green
    } else {
        # Fallback: check if uncompressed legacy dump exists
        $legacy_dump = Join-Path $script_dir "db_backup.dump"
        if (Test-Path $legacy_dump) {
            Write-Host "No backup ZIP found, but legacy 'db_backup.dump' exists. Proceeding with legacy restore..." -ForegroundColor Yellow
            
            Write-Host "Temporarily stopping API service..." -ForegroundColor Yellow
            docker stop 3dex-api | Out-Null

            Write-Host "Importing Database..." -ForegroundColor Cyan
            docker cp $legacy_dump threedex:/tmp/backup.dump
            docker exec -t threedex pg_restore -U threedex -d threedex --clean --if-exists /tmp/backup.dump
            docker exec threedex rm /tmp/backup.dump

            Write-Host "Restarting API service..." -ForegroundColor Yellow
            docker start 3dex-api | Out-Null

            $legacy_minio = Join-Path $script_dir "minio_backup\3dex-models"
            if (Test-Path $legacy_minio) {
                docker cp $legacy_minio 3dex-minio:/data/
                docker exec 3dex-minio sh -c "mc alias set local http://127.0.0.1:9000 minioadmin minioadmin && mc mb local/3dex-models --ignore-existing && mc anonymous set public local/3dex-models"
                Write-Host "MinIO files restored successfully!" -ForegroundColor Green
            }

            Write-Host "`nLegacy Import Complete!" -ForegroundColor Green
        } else {
            Write-Host "Error: No backup archives (backup_*.zip) or legacy dump files found." -ForegroundColor Red
            exit 1
        }
    }
} finally {
    Pop-Location
}
