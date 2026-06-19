#!/usr/bin/env bash
# Resize/migrate the live assets (migration/live-assets/clean) into public/images/<group>/,
# capping the long edge at 2400px (no upscaling) — spec §7 + Appendix C. Idempotent.
# Requires ffmpeg (brew install ffmpeg). Run after migration/download-live-assets.sh.
# Portable to bash 3.2 (macOS default).
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$HERE/live-assets/clean"
DEST="$HERE/../public/images"
Q=82

resize() { # $1 src  $2 dest  $3 maxedge(default 2400)
  local max="${3:-2400}"
  ffmpeg -nostdin -y -loglevel error -i "$1" \
    -vf "scale=w='min(${max},iw)':h='min(${max},ih)':force_original_aspect_ratio=decrease" \
    -quality "$Q" "$2"
  echo "  $2"
}

group() { # $1 group-dir  $2.. base names (resized .webp @2400)
  local g="$1"; shift
  mkdir -p "$DEST/$g"
  local f
  for f in "$@"; do
    resize "$SRC/$f.webp" "$DEST/$g/$f.webp" 2400
  done
}

group gym Gym1 Gym2 Gym3 Gym4 Gym5 Gym6 Gym7
group bootybuilder Bootybuilder1 Bootybuilder2 Bootybuilder3 Bootybuilder4 Bootybuilder5 Bootybuilder6
group classes Classes1 Classes2 Classes3
group plunge Plunge1 Plunge2 Plunge3 Plunge4
group sauna Sauna1 Sauna2
group peachybar Peachybar1 Peachybar2
group lounge PeachesLounge
group kids kidsclub1 kidsclub2 kidsclub3 kidsclub4 kidsclub5

mkdir -p "$DEST/trainers"
resize "$SRC/kira.webp" "$DEST/trainers/kira.webp" 1600
cp "$SRC/kiraheading.webp" "$DEST/trainers/kiraheading.webp"; echo "  $DEST/trainers/kiraheading.webp"

mkdir -p "$DEST/brand"
resize "$SRC/MAINLOGO.png" "$DEST/brand/MAINLOGO.png" 1200
cp "$SRC/logo.png" "$DEST/brand/logo.png"
cp "$SRC/logo3.png" "$DEST/brand/logo3.png"
cp "$SRC/peachasset.png" "$DEST/brand/peachasset.png"
resize "$SRC/mainbackground.webp" "$DEST/brand/mainbackground.webp" 2400

echo "Done. Files in public/images: $(find "$DEST" -type f | wc -l | tr -d ' ')"
