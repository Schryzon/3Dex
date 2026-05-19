#!/usr/bin/env bash

# 3Dex Documentation PDF Exporter
# This script uses Pandoc and XeLaTeX to export the explanations markdown files to high-quality PDF files.

set -euo pipefail

# Define Paths
DOCS_DIR="$(dirname "$0")/explanations"
OUTPUT_DIR="$(dirname "$0")/output"

# Ensure Output Directory Exists
mkdir -p "$OUTPUT_DIR"

# Text Colors
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}   3Dex System Architecture PDF Exporter   ${NC}"
echo -e "${CYAN}==========================================${NC}"

# 1. Dependency Checks
echo -e "${YELLOW}[*] Checking dependencies...${NC}"

if ! command -v pandoc &> /dev/null; then
    echo -e "${RED}[-] Pandoc is not installed or not in PATH. Please install Pandoc (https://pandoc.org) before running this script.${NC}"
    exit 1
fi
echo -e "  - Pandoc: Found"

PDF_ENGINE="xelatex"
if ! command -v xelatex &> /dev/null; then
    if command -v pdflatex &> /dev/null; then
        PDF_ENGINE="pdflatex"
        echo -e "  - PDF Engine: Found pdflatex (falling back from xelatex)"
    else
        echo -e "${RED}[-] No LaTeX engine (xelatex or pdflatex) found in PATH. Please install MikTeX, MacTeX, or TeX Live to support PDF compilation.${NC}"
        exit 1
    fi
else
    echo -e "  - PDF Engine: Found xelatex"
fi

# 2. File Assembly
echo -e "${YELLOW}[*] Discovering markdown documents...${NC}"

# Helper to find and sort files
find_md_files() {
    local dir="$1"
    if [ -d "$dir" ]; then
        find "$dir" -maxdepth 5 -name "*.md" | sort
    fi
}

COVER_FILE="$DOCS_DIR/00_cover.md"
UNCATEGORIZED_FILES=($(find_md_files "$DOCS_DIR/uncategorized"))
OBJECT_FILES=($(find_md_files "$DOCS_DIR/object_diagrams"))
SEQUENCE_FILES=($(find_md_files "$DOCS_DIR/sequence_diagrams"))
ACTIVITY_FILES=($(find_md_files "$DOCS_DIR/activity_diagrams"))

# Exclude COVER_FILE from body list so it is cleanly injected before the Table of Contents
ALL_FILES=(${UNCATEGORIZED_FILES[@]:+"${UNCATEGORIZED_FILES[@]}"} ${OBJECT_FILES[@]:+"${OBJECT_FILES[@]}"} ${SEQUENCE_FILES[@]:+"${SEQUENCE_FILES[@]}"} ${ACTIVITY_FILES[@]:+"${ACTIVITY_FILES[@]}"})

if [ ${#ALL_FILES[@]} -eq 0 ]; then
    echo -e "${RED}[-] No markdown files found under $DOCS_DIR.${NC}"
    exit 1
fi

echo -e "  - Found ${#ALL_FILES[@]} markdown documents."

# 3. Export Actions
COMBINED_PDF="$OUTPUT_DIR/3dex_complete_architecture.pdf"

echo -e "${YELLOW}[*] Compiling unified document: 3dex_complete_architecture.pdf...${NC}"
if [ -f "$COVER_FILE" ]; then
    if pandoc "${ALL_FILES[@]}" -o "$COMBINED_PDF" --pdf-engine="$PDF_ENGINE" --toc --number-sections -V geometry:margin=1in -V colorlinks:true -V header-includes="\usepackage{graphicx} \usepackage{fontspec}" -B "$COVER_FILE"; then
        echo -e "${GREEN}[+] Complete Architecture PDF exported successfully to: $COMBINED_PDF${NC}"
    else
        echo -e "${RED}[-] Unified compilation failed.${NC}"
        exit 1
    fi
else
    if pandoc "${ALL_FILES[@]}" -o "$COMBINED_PDF" --pdf-engine="$PDF_ENGINE" --toc --number-sections -V geometry:margin=1in -V colorlinks:true -V header-includes="\usepackage{graphicx} \usepackage{fontspec}"; then
        echo -e "${GREEN}[+] Complete Architecture PDF exported successfully to: $CombinedPDF${NC}"
    else
        echo -e "${RED}[-] Unified compilation failed.${NC}"
        exit 1
    fi
fi

# Generate category-specific PDFs
echo -e "${YELLOW}[*] Generating category-specific PDFs...${NC}"

compile_category() {
    local name="$1"
    shift
    local files=("@")
    
    if [ $# -gt 0 ]; then
        local out_file="$OUTPUT_DIR/3dex_${name}.pdf"
        echo -e "  - Compiling ${name}..."
        if pandoc "$@" -o "$out_file" --pdf-engine="$PDF_ENGINE" --toc --number-sections -V geometry:margin=1in -V colorlinks:true; then
            echo -e "  ${GREEN}[+] Exported: $out_file${NC}"
        else
            echo -e "  ${RED}[-]- Failed compiling ${name}${NC}"
        fi
    fi
}

compile_category "1_uncategorized" "${UNCATEGORIZED_FILES[@]}"
compile_category "2_object_diagrams" "${OBJECT_FILES[@]}"
compile_category "3_sequence_diagrams" "${SEQUENCE_FILES[@]}"
compile_category "4_activity_diagrams" "${ACTIVITY_FILES[@]}"

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}         Compilation Phase Complete        ${NC}"
echo -e "${CYAN}==========================================${NC}"
