#!/usr/bin/env python3
"""Downscale oversized source photos in public/images so next/image optimizes them
faster on the (1-CPU) prod box and the originals are leaner. Only touches WebP files
whose longest edge exceeds the target; re-encodes at quality 80. Idempotent.
Usage:  python3 scripts/optimize-images.py [--dry-run]
"""
import os, sys
from PIL import Image

ROOT = "public/images"
DEFAULT_MAX = 1600
OVERRIDES = {"brand/mainbackground.webp": 1920}  # full-bleed hero LCP — keep crisper
DRY = "--dry-run" in sys.argv

before_total = after_total = 0
changed = 0
for dirpath, _, files in os.walk(ROOT):
    for fn in sorted(files):
        if not fn.lower().endswith(".webp"):
            continue
        path = os.path.join(dirpath, fn)
        rel = os.path.relpath(path, ROOT)
        target = OVERRIDES.get(rel, DEFAULT_MAX)
        before = os.path.getsize(path)
        with Image.open(path) as im:
            w, h = im.size
            longest = max(w, h)
            if longest <= target:
                continue
            scale = target / longest
            nw, nh = round(w * scale), round(h * scale)
            resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
            if not DRY:
                resized.save(path, "WEBP", quality=80, method=6)
        after = os.path.getsize(path) if not DRY else before
        before_total += before
        after_total += after
        changed += 1
        print(f"{rel}: {w}x{h} -> {nw}x{nh}   {before//1024}KB -> {after//1024}KB")

print(f"\n{changed} images resized   {before_total//1024}KB -> {after_total//1024}KB"
      f"   (saved {(before_total-after_total)//1024}KB){'  [dry-run]' if DRY else ''}")
