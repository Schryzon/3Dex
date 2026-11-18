# 3Dex Work Breakdown Structure (WBS) XeLaTeX Compiler
# Compiles docs/wbs/wbs_id.tex via 3-pass XeLaTeX, copies PDFs to docs/output and docs/wbs,
# and renders 150 DPI page PNG previews via pdftoppm.

$ErrorActionPreference = "Stop"

$WbsDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$DocsDir = Split-Path -Parent $WbsDir
$OutputDir = Join-Path $DocsDir "output"
$BuildDir = Join-Path $WbsDir "build"
$PreviewsDir = Join-Path $BuildDir "previews"

foreach ($Dir in @($OutputDir, $BuildDir, $PreviewsDir)) {
    if (-not (Test-Path $Dir)) {
        New-Item -ItemType Directory -Path $Dir | Out-Null
    }
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   3Dex WBS Document XeLaTeX Builder      " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$XeLaTeX = Get-Command xelatex -ErrorAction SilentlyContinue
if (-not $XeLaTeX) {
    Write-Error "xelatex was not found in PATH."
    exit 1
}

$Pdftoppm = Get-Command pdftoppm -ErrorAction SilentlyContinue

$Targets = @(
    @{ Tex = "wbs_id.tex"; OutName = "3Dex_WBS_ID"; PreviewPrefix = "wbs_id_page" }
)

foreach ($Target in $Targets) {
    $TexPath = Join-Path $WbsDir $Target.Tex
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
    $DestWbsPdf = Join-Path $WbsDir "$($Target.OutName).pdf"
    Copy-Item -Path $BuiltPdf -Destination $DestOutputPdf -Force
    Copy-Item -Path $BuiltPdf -Destination $DestWbsPdf -Force
    Write-Host "  [+] Exported: $DestOutputPdf" -ForegroundColor Green
    Write-Host "  [+] Exported: $DestWbsPdf" -ForegroundColor Green

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
Write-Host "   WBS Compilation Complete               " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
