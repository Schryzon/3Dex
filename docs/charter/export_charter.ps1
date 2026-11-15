# 3Dex Project Charter XeLaTeX Compiler
# Compiles Indonesian and English Project Charter LaTeX sources via XeLaTeX
# and renders page previews via pdftoppm.

$ErrorActionPreference = "Stop"

$CharterDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$DocsDir = Split-Path -Parent $CharterDir
$OutputDir = Join-Path $DocsDir "output"
$BuildDir = Join-Path $CharterDir "build"
$PreviewsDir = Join-Path $BuildDir "previews"

foreach ($Dir in @($OutputDir, $BuildDir, $PreviewsDir)) {
    if (-not (Test-Path $Dir)) {
        New-Item -ItemType Directory -Path $Dir | Out-Null
    }
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   3Dex Project Charter XeLaTeX Builder   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$XeLaTeX = Get-Command xelatex -ErrorAction SilentlyContinue
if (-not $XeLaTeX) {
    Write-Error "xelatex was not found in PATH. Please install MiKTeX or TeX Live."
    exit 1
}

$Pdftoppm = Get-Command pdftoppm -ErrorAction SilentlyContinue

$Targets = @(
    @{ Tex = "project_charter_id.tex"; OutName = "3Dex_Project_Charter_ID"; PreviewPrefix = "id_page" },
    @{ Tex = "project_charter_en.tex"; OutName = "3Dex_Project_Charter_EN"; PreviewPrefix = "en_page" }
)

foreach ($Target in $Targets) {
    $TexPath = Join-Path $CharterDir $Target.Tex
    $BaseName = [System.IO.Path]::GetFileNameWithoutExtension($Target.Tex)

    if (-not (Test-Path $TexPath)) {
        Write-Error "Missing source file: $TexPath"
        exit 1
    }

    for ($Pass = 1; $Pass -le 3; $Pass++) {
        Write-Host "[*] Compiling $($Target.Tex) (Pass $Pass/3)..." -ForegroundColor Yellow
        & xelatex -interaction=nonstopmode -halt-on-error -output-directory="$BuildDir" "$TexPath" | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Error "XeLaTeX Pass $Pass failed for $($Target.Tex). Check $BuildDir\$BaseName.log"
            exit 1
        }
    }

    $BuiltPdf = Join-Path $BuildDir "$BaseName.pdf"
    if (-not (Test-Path $BuiltPdf)) {
        Write-Error "Expected output PDF not found: $BuiltPdf"
        exit 1
    }

    $DestOutputPdf = Join-Path $OutputDir "$($Target.OutName).pdf"
    $DestCharterPdf = Join-Path $CharterDir "$($Target.OutName).pdf"
    Copy-Item -Path $BuiltPdf -Destination $DestOutputPdf -Force
    Copy-Item -Path $BuiltPdf -Destination $DestCharterPdf -Force
    Write-Host "  [+] Exported: $DestOutputPdf" -ForegroundColor Green
    Write-Host "  [+] Exported: $DestCharterPdf" -ForegroundColor Green

    if ($Pdftoppm) {
        Write-Host "  [*] Rendering PNG previews for $($Target.OutName)..." -ForegroundColor Blue
        Remove-Item -Path (Join-Path $PreviewsDir "$($Target.PreviewPrefix)-*.png") -Force -ErrorAction SilentlyContinue
        $PreviewOut = Join-Path $PreviewsDir $Target.PreviewPrefix
        & pdftoppm -png -r 150 "$DestOutputPdf" "$PreviewOut"
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "pdftoppm returned exit code $LASTEXITCODE for $($Target.OutName)"
        }
    }
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Charter Compilation Complete           " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
