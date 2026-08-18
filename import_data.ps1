$ErrorActionPreference = "Stop"

if (-not (Test-Path "./db_backup.dump")) {
    Write-Host "Error: db_backup.dump not found." -ForegroundColor Red
    exit 1
}

Write-Host "Importing Database (Dropping existing data)..." -ForegroundColor Cyan
docker cp ./db_backup.dump threedex:/tmp/backup.dump
# -c means clean (drop) before restoring
docker exec -t threedex pg_restore -U threedex -d threedex -c /tmp/backup.dump
docker exec threedex rm /tmp/backup.dump

Write-Host "Importing MinIO..." -ForegroundColor Cyan
if (Test-Path "./minio_backup/3dex-models") {
    docker cp ./minio_backup/3dex-models 3dex-minio:/data/backup_import
    docker exec 3dex-minio sh -c "mc alias set local http://127.0.0.1:9000 minioadmin minioadmin && mc mb local/3dex-models --ignore-existing && mc anonymous set download local/3dex-models && mc mirror /data/backup_import local/3dex-models"
    docker exec 3dex-minio rm -rf /data/backup_import
} else {
    Write-Host "Warning: ./minio_backup/3dex-models not found. Skipping MinIO restore." -ForegroundColor Yellow
}

Write-Host "Import Complete!" -ForegroundColor Green
