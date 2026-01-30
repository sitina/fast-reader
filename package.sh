#!/bin/bash

# Package Fast Reader extension for Chrome Web Store submission

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXTENSION_DIR="$SCRIPT_DIR/packages/extension"
OUTPUT="$SCRIPT_DIR/fast-reader.zip"

# Verify extension directory exists
if [ ! -d "$EXTENSION_DIR" ]; then
  echo "Error: Extension directory not found at $EXTENSION_DIR"
  exit 1
fi

cd "$EXTENSION_DIR"

# Remove old package if exists
rm -f "$OUTPUT"

# Create zip with only extension files
zip -r "$OUTPUT" \
  manifest.json \
  popup/ \
  content/ \
  reader/ \
  lib/ \
  icons/*.png \
  -x "*.DS_Store"

echo "Created $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"
echo ""
echo "Contents:"
unzip -l "$OUTPUT"
