#!/usr/bin/env bash
# Roll back to a previous backup created by scripts/backup-site.sh.
# Restores the archived app (incl. built .next + public), reinstalls deps, and reloads pm2.
# No rebuild needed — the backup already contains the build.
#
# Config via env (defaults shown):
#   APP_DIR     deployed app/repo dir   (default: $HOME/peachesv3)
#   BACKUP_DIR  where backups live       (default: $HOME/peaches-backups)
#   PM2_NAME    pm2 process name         (default: peaches)
#
# Usage:
#   bash scripts/rollback.sh                      # restore the most recent backup
#   bash scripts/rollback.sh <path-to-backup.tar.gz>   # restore a specific one
#   ls -1t "$HOME/peaches-backups"/peaches-*.tar.gz    # list available backups
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/peachesv3}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/peaches-backups}"
PM2_NAME="${PM2_NAME:-peaches}"

archive="${1:-$(ls -1t "$BACKUP_DIR"/peaches-*.tar.gz 2>/dev/null | head -1 || true)}"
[ -n "$archive" ] && [ -f "$archive" ] || { echo "No backup found in $BACKUP_DIR" >&2; exit 1; }

echo "==> Rolling back to: $archive"
[ -f "${archive%.tar.gz}.info" ] && cat "${archive%.tar.gz}.info"

parent="$(cd "$(dirname "$APP_DIR")" && pwd)"
base="$(basename "$APP_DIR")"

# Preserve local secrets + move the broken app aside (don't delete — keep for inspection).
if [ -d "$APP_DIR" ]; then
  [ -f "$APP_DIR/.env.local" ] && cp "$APP_DIR/.env.local" "/tmp/peaches.env.local.bak" || true
  [ -f "$APP_DIR/.env.production" ] && cp "$APP_DIR/.env.production" "/tmp/peaches.env.production.bak" || true
  mv "$APP_DIR" "$APP_DIR.broken-$(date +%Y%m%d-%H%M%S)"
fi

echo "==> Restoring archive"
tar -C "$parent" -xzf "$archive"
[ -f "/tmp/peaches.env.local.bak" ] && mv "/tmp/peaches.env.local.bak" "$APP_DIR/.env.local" || true
[ -f "/tmp/peaches.env.production.bak" ] && mv "/tmp/peaches.env.production.bak" "$APP_DIR/.env.production" || true

cd "$APP_DIR"
echo "==> Reinstalling deps (build is already in the backup)"
npm ci

echo "==> Reloading $PM2_NAME"
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 reload "$PM2_NAME" --update-env
else
  pm2 start "npm run start" --name "$PM2_NAME"
fi
pm2 save

echo "✓ Rolled back to $archive"
