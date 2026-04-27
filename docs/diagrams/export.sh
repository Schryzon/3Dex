#!/bin/bash

# Navigate to the script's directory so it can be run from anywhere
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLANTUML_JAR="$SCRIPT_DIR/plantuml.jar"
EXPORTS_DIR="$SCRIPT_DIR/exports"

cd "$SCRIPT_DIR" || exit 1

# Find all .puml files recursively
find . -type f -name "*.puml" | while read -r puml_file; do
    # Remove the leading './' from the file path
    puml_path="${puml_file#./}"
    puml_dir=$(dirname "$puml_path")
    
    # Determine the absolute output directory
    if [ "$puml_dir" = "." ]; then
        out_dir="$EXPORTS_DIR"
    else
        out_dir="$EXPORTS_DIR/$puml_dir"
    fi
    
    # Create the output directory if it doesn't exist
    mkdir -p "$out_dir"
    
    echo "Generating $puml_path -> $out_dir"
    java -jar "$PLANTUML_JAR" "$puml_path" -o "$out_dir"
done

echo "All diagrams generated successfully!"
