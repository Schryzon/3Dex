# 3Dex TeX Diagrams Exporter
# Compiles standalone TikZ diagrams via XeLaTeX and converts to 300 DPI PNGs via pdftoppm.

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$TexDir = Join-Path $ScriptDir "tex"
$BuildDir = Join-Path $TexDir "build"
$ExportsDir = Join-Path $ScriptDir "exports\tex"

if (-not (Test-Path $BuildDir)) {
    New-Item -ItemType Directory -Path $BuildDir | Out-Null
}
if (-not (Test-Path $ExportsDir)) {
    New-Item -ItemType Directory -Path $ExportsDir | Out-Null
}

$TexFiles = Get-ChildItem -Path $TexDir -Filter "*.tex"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Compiling 3Dex TikZ Diagrams to PDF/PNG " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

foreach ($File in $TexFiles) {
    $BaseName = [System.IO.Path]::GetFileNameWithoutExtension($File.Name)
    Write-Host "[*] Compiling: $($File.Name)..." -ForegroundColor Yellow
    
    # Run xelatex
    & xelatex -interaction=nonstopmode -output-directory="$BuildDir" "$($File.FullName)" | Out-Null
    
    $PdfFile = Join-Path $BuildDir "$BaseName.pdf"
    if (Test-Path $PdfFile) {
        $DestPdf = Join-Path $ExportsDir "$BaseName.pdf"
        Copy-Item -Path $PdfFile -Destination $DestPdf -Force
        
        # Convert to PNG using pdftoppm (300 DPI)
        $PngPrefix = Join-Path $ExportsDir $BaseName
        & pdftoppm -png -r 300 -singlefile "$DestPdf" "$PngPrefix"
        Write-Host "  [+] Exported: $BaseName.pdf and $BaseName.png" -ForegroundColor Green
    } else {
        Write-Host "  [-] Failed to generate PDF for $($File.Name)" -ForegroundColor Red
    }
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "       All TeX Diagrams Exported!          " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
