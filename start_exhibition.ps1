$ErrorActionPreference = "Stop"

# 1. Find Local IPv4 Address
$IP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Wi-Fi -ErrorAction SilentlyContinue | Select-Object -ExpandProperty IPAddress -First 1)
if (-not $IP) {
    $IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch "^127\." -and $_.IPAddress -notmatch "^169\." } | Select-Object -ExpandProperty IPAddress -First 1)
}
if (-not $IP) { $IP = "127.0.0.1" }
Write-Host "Detected Local Network IP: $IP" -ForegroundColor Cyan

# 2. Setup Environment Variables
$frontendEnv = "$PSScriptRoot/apps/frontend/.env.local"
$backendEnv = "$PSScriptRoot/apps/backend/.env"
$dockerEnv = "$PSScriptRoot/.env.docker"

if (-not (Test-Path $frontendEnv)) { Copy-Item "$PSScriptRoot/apps/frontend/.env.local.example" $frontendEnv }
if (-not (Test-Path $backendEnv)) { Copy-Item "$PSScriptRoot/apps/backend/.env.example" $backendEnv }
if (-not (Test-Path $dockerEnv)) { Copy-Item "$PSScriptRoot/.env.docker.example" $dockerEnv }

Write-Host "Injecting local IP and configuring Database/MinIO secrets into .env files..."
$FE_Content = Get-Content $frontendEnv | Foreach-Object {
    $_ -replace "NEXT_PUBLIC_API_URL=.*", "NEXT_PUBLIC_API_URL=http://$($IP):4000" `
       -replace "NEXT_PUBLIC_MINIO_URL=.*", "NEXT_PUBLIC_MINIO_URL=http://$($IP):9000" `
       -replace "NEXT_PUBLIC_SITE_URL=.*", "NEXT_PUBLIC_SITE_URL=http://$($IP):3000"
}
Set-Content $frontendEnv -Value $FE_Content

$BE_Content = Get-Content $backendEnv | Foreach-Object {
    $_ -replace "FRONTEND_URL=.*", "FRONTEND_URL=http://$($IP):3000" `
       -replace "STORAGE_ENDPOINT=.*", "STORAGE_ENDPOINT=http://$($IP):9000" `
       -replace "DATABASE_URL=.*", "DATABASE_URL=postgresql://threedex:3Dex!@127.0.0.1:5432/threedex" `
       -replace "STORAGE_ACCESS_KEY=.*", "STORAGE_ACCESS_KEY=minioadmin" `
       -replace "STORAGE_SECRET_KEY=.*", "STORAGE_SECRET_KEY=minioadmin" `
       -replace "ALLOWED_ORIGINS=.*", "ALLOWED_ORIGINS=http://$($IP):3000,http://localhost:3000"
}
if ($BE_Content -notmatch "ALLOWED_ORIGINS=") { $BE_Content += "ALLOWED_ORIGINS=http://$($IP):3000,http://localhost:3000" }
Set-Content $backendEnv -Value $BE_Content

$Docker_Content = Get-Content $dockerEnv | Foreach-Object {
    $_ -replace "FRONTEND_URL=.*", "FRONTEND_URL=http://$($IP):3000" `
       -replace "STORAGE_ENDPOINT=.*", "STORAGE_ENDPOINT=http://$($IP):9000" `
       -replace "NEXT_PUBLIC_API_URL=.*", "NEXT_PUBLIC_API_URL=http://$($IP):4000" `
       -replace "DATABASE_URL=.*", "DATABASE_URL=postgresql://threedex:3Dex!@db:5432/threedex" `
       -replace "STORAGE_ACCESS_KEY=.*", "STORAGE_ACCESS_KEY=minioadmin" `
       -replace "STORAGE_SECRET_KEY=.*", "STORAGE_SECRET_KEY=minioadmin" `
       -replace "ALLOWED_ORIGINS=.*", "ALLOWED_ORIGINS=http://$($IP):3000,http://localhost:3000"
}
if ($Docker_Content -notmatch "ALLOWED_ORIGINS=") { $Docker_Content += "ALLOWED_ORIGINS=http://$($IP):3000,http://localhost:3000" }
Set-Content $dockerEnv -Value $Docker_Content
Write-Host "Env files updated successfully!" -ForegroundColor Green

# 3. Spin up Docker
Write-Host "`nSpinning up Database, MinIO, and Backend API..." -ForegroundColor Cyan
docker-compose up -d --build

Write-Host "Waiting 10 seconds for containers to initialize..."
Start-Sleep -Seconds 10

# 4. Initialize MinIO Bucket
Write-Host "`nConfiguring MinIO Bucket..." -ForegroundColor Cyan
docker exec 3dex-minio sh -c "mc alias set local http://127.0.0.1:9000 minioadmin minioadmin && mc mb local/3dex-models --ignore-existing && mc anonymous set public local/3dex-models"

# 5. Database Setup
Write-Host "`nRunning Database Migrations & Seeds..." -ForegroundColor Cyan
docker exec -it 3dex-api npx prisma migrate deploy
docker exec -it 3dex-api npm run seed

# 6. Start Frontend
Write-Host "`nStarting Next.js Frontend bound to 0.0.0.0..." -ForegroundColor Green
Write-Host "You can access the web app on this machine at: http://localhost:3000"
Write-Host "Others on the Wi-Fi network can access it at: http://$($IP):3000" -ForegroundColor Yellow

Push-Location "$PSScriptRoot/apps/frontend"
try {
    npm install
    npx next dev -H 0.0.0.0
}
finally {
    Pop-Location
}

