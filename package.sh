#!/bin/bash

# Package Fast Reader extension for Chrome Web Store submission

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

OUTPUT="fast-reader.zip"

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
