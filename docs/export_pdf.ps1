# 3Dex Documentation PDF Exporter
# This script uses Pandoc and XeLaTeX to export the explanations markdown files to high-quality PDF files.

$ErrorActionPreference = "Stop"

# Define Paths
$DocsDir = Join-Path $PSScriptRoot "explanations"
$OutputDir = Join-Path $PSScriptRoot "output"

# Ensure Output Directory Exists
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   3Dex System Architecture PDF Exporter   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Dependency Checks
Write-Host "[*] Checking dependencies..." -ForegroundColor Yellow

$PandocCheck = Get-Command pandoc -ErrorAction SilentlyContinue
if (-not $PandocCheck) {
    Write-Error "Pandoc is not installed or not in PATH. Please install Pandoc (https://pandoc.org) before running this script."
    exit 1
}
Write-Host "  - Pandoc: Found" -ForegroundColor Green

$XeLaTeXCheck = Get-Command xelatex -ErrorAction SilentlyContinue
$PdfLaTeXCheck = Get-Command pdflatex -ErrorAction SilentlyContinue

$PdfEngine = "xelatex"
if (-not $XeLaTeXCheck) {
    if ($PdfLaTeXCheck) {
        $PdfEngine = "pdflatex"
        Write-Host "  - PDF Engine: Found pdflatex (falling back from xelatex)" -ForegroundColor Yellow
    } else {
        Write-Error "No LaTeX engine (xelatex or pdflatex) found in PATH. Please install MikTeX or TeX Live to support PDF compilation."
        exit 1
    }
} else {
    Write-Host "  - PDF Engine: Found xelatex" -ForegroundColor Green
}

# 2. File Assembly
Write-Host "[*] Discovering markdown documents..." -ForegroundColor Yellow

# Gather files in logical reading order
$CoverFile = Join-Path $DocsDir "00_cover.md"
$UncategorizedFiles = Get-ChildItem -Path (Join-Path $DocsDir "uncategorized") -Filter "*.md" | Sort-Object Name
$ObjectFiles = Get-ChildItem -Path (Join-Path $DocsDir "object_diagrams") -Filter "*.md" -Recurse | Sort-Object Name
$SequenceFiles = Get-ChildItem -Path (Join-Path $DocsDir "sequence_diagrams") -Filter "*.md" -Recurse | Sort-Object Name
$ActivityFiles = Get-ChildItem -Path (Join-Path $DocsDir "activity_diagrams") -Filter "*.md" -Recurse | Sort-Object Name

# Exclude CoverFile from the body sequence so it can be cleanly injected before the Table of Contents
$AllFiles = @()
$AllFiles += $UncategorizedFiles.FullName
$AllFiles += $ObjectFiles.FullName
$AllFiles += $SequenceFiles.FullName
$AllFiles += $ActivityFiles.FullName

if ($AllFiles.Count -eq 0) {
    Write-Error "No markdown files found under $DocsDir."
    exit 1
}

Write-Host "  - Found $($AllFiles.Count) markdown documents." -ForegroundColor Green

# 3. Export Actions
$CombinedPDF = Join-Path $OutputDir "3dex_complete_architecture.pdf"

Write-Host "[*] Compiling unified document: 3dex_complete_architecture.pdf..." -ForegroundColor Yellow
try {
    # Combine all files into a single high-quality PDF, placing the cover page before the TOC
    if (Test-Path $CoverFile) {
        & pandoc $AllFiles -o $CombinedPDF --pdf-engine=$PdfEngine --toc --number-sections -V geometry:margin=1in -V colorlinks:true -V header-includes="\usepackage{graphicx} \usepackage{fontspec} \let\oldtoc\tableofcontents \renewcommand{\tableofcontents}{\oldtoc\clearpage}" -B $CoverFile
    } else {
        & pandoc $AllFiles -o $CombinedPDF --pdf-engine=$PdfEngine --toc --number-sections -V geometry:margin=1in -V colorlinks:true -V header-includes="\usepackage{graphicx} \usepackage{fontspec} \let\oldtoc\tableofcontents \renewcommand{\tableofcontents}{\oldtoc\clearpage}"
    }
    Write-Host "[+] Complete Architecture PDF exported successfully to: $CombinedPDF" -ForegroundColor Green
}
catch {
    Write-Host "[-] Compilation failed: $_" -ForegroundColor Red
    exit 1
}

# Generate chapter-specific PDFs
Write-Host "[*] Generating category-specific PDFs..." -ForegroundColor Yellow

$Categories = @(
    @{ Name = "1_uncategorized"; Files = $UncategorizedFiles.FullName },
    @{ Name = "2_object_diagrams"; Files = $ObjectFiles.FullName },
    @{ Name = "3_sequence_diagrams"; Files = $SequenceFiles.FullName },
    @{ Name = "4_activity_diagrams"; Files = $ActivityFiles.FullName }
)

foreach ($Category in $Categories) {
    if ($Category.Files.Count -gt 0) {
        $OutFile = Join-Path $OutputDir "3dex_$($Category.Name).pdf"
        Write-Host "  - Compiling $($Category.Name)..." -ForegroundColor Blue
        try {
            & pandoc $Category.Files -o $OutFile --pdf-engine=$PdfEngine --toc --number-sections -V geometry:margin=1in -V colorlinks:true -V header-includes="\usepackage{graphicx} \usepackage{fontspec} \let\oldtoc\tableofcontents \renewcommand{\tableofcontents}{\oldtoc\clearpage}"
            Write-Host "  [+] Exported: $OutFile" -ForegroundColor Green
        }
        catch {
            Write-Host "  [-] Failed compiling $($Category.Name): $_" -ForegroundColor Red
        }
    }
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "         Compilation Phase Complete        " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
