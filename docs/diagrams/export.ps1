$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$PlantUmlJar = Join-Path $ScriptDir "plantuml.jar"
$ExportsDir = Join-Path $ScriptDir "exports"

Set-Location $ScriptDir

# Find all .puml files recursively
$PumlFiles = Get-ChildItem -Path . -Filter "*.puml" -Recurse

foreach ($File in $PumlFiles) {
    # Get the relative directory path from the script directory
    $RelativePath = $File.DirectoryName.Substring($ScriptDir.Length)
    if ($RelativePath.StartsWith("\") -or $RelativePath.StartsWith("/")) {
        $RelativePath = $RelativePath.Substring(1)
    }

    # Determine the absolute output directory
    $OutDir = if ([string]::IsNullOrEmpty($RelativePath)) {
        $ExportsDir
    } else {
        Join-Path $ExportsDir $RelativePath
    }

    # Create the output directory if it doesn't exist
    if (-not (Test-Path -Path $OutDir)) {
        New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
    }

    # Relative path for logging
    $RelativeFilePath = $File.FullName.Substring($ScriptDir.Length + 1)
    Write-Host "Generating $RelativeFilePath -> $OutDir"
    
    # Run plantuml with absolute output path
    & java -jar "$PlantUmlJar" "$($File.FullName)" -o "$OutDir"
}

Write-Host "All diagrams generated successfully!"
