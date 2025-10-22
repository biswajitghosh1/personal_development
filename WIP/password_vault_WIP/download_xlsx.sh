#!/bin/sh
# Download SheetJS xlsx.full.min.js into current directory
URLS=(
  "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"
  "https://unpkg.com/xlsx/dist/xlsx.full.min.js"
  "https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"
)
for u in "${URLS[@]}"; do
  echo "Trying $u ..."
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$u" -o xlsx.full.min.js && { echo "Downloaded xlsx.full.min.js"; exit 0; }
  elif command -v wget >/dev/null 2>&1; then
    wget -qO xlsx.full.min.js "$u" && { echo "Downloaded xlsx.full.min.js"; exit 0; }
  fi
done
echo "Failed to download automatically. Please download xlsx.full.min.js from https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js and place it here."
