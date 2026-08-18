$ErrorActionPreference = "Stop"

Write-Host "Exporting Database..." -ForegroundColor Cyan
docker exec -t threedex pg_dump -U threedex -d threedex -F c -f /tmp/backup.dump
docker cp threedex:/tmp/backup.dump ./db_backup.dump
docker exec threedex rm /tmp/backup.dump

Write-Host "Exporting MinIO..." -ForegroundColor Cyan
if (-not (Test-Path "./minio_backup")) {
    New-Item -ItemType Directory -Path "./minio_backup" | Out-Null
}
docker exec 3dex-minio sh -c "mc alias set local http://127.0.0.1:9000 minioadmin minioadmin && mc mirror local/3dex-models /data/backup_export"
docker cp 3dex-minio:/data/backup_export ./minio_backup/3dex-models
docker exec 3dex-minio rm -rf /data/backup_export

Write-Host "Backup Complete! Files saved to ./db_backup.dump and ./minio_backup/3dex-models" -ForegroundColor Green
