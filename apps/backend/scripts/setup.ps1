# setup.ps1
# Initial Setup: Seed Database & Create Admin

$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..")

Write-Host "=== INITIAL APP SETUP =======================================" -ForegroundColor Cyan

# 1. Prisma Seed
Write-Host "[1/2] Seeding basic data (Categories, etc)..." -ForegroundColor Yellow
npx prisma db seed

# 2. Create Admin
Write-Host "[2/2] Ensuring Admin user exists..." -ForegroundColor Yellow
npx ts-node scripts/setup_admin.ts

Write-Host ""
Write-Host "=== SETUP COMPLETED! ===" -ForegroundColor Green
