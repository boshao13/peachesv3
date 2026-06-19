#!/usr/bin/env bash
# Reproducibly download all media assets from the live Peaches site into
# migration/live-assets/ (hashed originals) + migration/live-assets/clean/ (de-hashed).
#
# These are the authoritative source images for the Next.js rebuild (see
# docs/superpowers/specs/2026-06-19-peaches-rebuild-design.md, §7 + Appendix C).
# The raw downloads are git-ignored; run this to regenerate them.
#
# Usage:  bash migration/download-live-assets.sh
#
# If the live JS bundle hash changes, refresh the list with:
#   curl -sL https://www.peachesfitnessclub.com/ | grep -oE '/static/js/main\.[a-f0-9]+\.js'
#   curl -sL https://www.peachesfitnessclub.com/static/js/<bundle> \
#     | grep -oE 'static/media/[A-Za-z0-9._-]+\.(png|jpe?g|avif|webp|svg|gif)' \
#     | sort -u > migration/live-media-list.txt

set -euo pipefail
BASE="https://www.peachesfitnessclub.com"
HERE="$(cd "$(dirname "$0")" && pwd)"
LIST="$HERE/live-media-list.txt"
OUT="$HERE/live-assets"
CLEAN="$OUT/clean"

mkdir -p "$OUT" "$CLEAN"
fail=0
while read -r p; do
  [ -z "$p" ] && continue
  f="$(basename "$p")"
  code="$(curl -sL -o "$OUT/$f" -w '%{http_code}' "$BASE/$p" --max-time 60)"
  if [ "$code" != "200" ]; then echo "FAIL $code $f"; fail=$((fail+1)); continue; fi
  # strip the content hash:  Gym1.a159ae20....webp  ->  Gym1.webp
  clean="$(printf '%s' "$f" | sed -E 's/\.[0-9a-f]{16,40}\././')"
  cp "$OUT/$f" "$CLEAN/$clean"
done < "$LIST"

echo "Downloaded $(ls -1 "$CLEAN" | wc -l | tr -d ' ') assets to $CLEAN (failures: $fail)"
