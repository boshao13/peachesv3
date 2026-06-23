#!/usr/bin/env bash
# Back up the CURRENTLY-deployed site before a new deploy, so you can roll back.
# Creates a timestamped tar.gz of the deployed app (incl. the built .next + public),
# records the git SHA, copies the nginx config, prunes old backups, and (optionally)
# uploads to S3. Safe to run on its own at any time.
#
# Config via env (defaults shown):
#   APP_DIR     deployed app/repo dir        (default: $HOME/peachesv3)
#   BACKUP_DIR  where backups are written     (default: $HOME/peaches-backups)
#   KEEP        how many backups to retain     (default: 10)
#   NGINX_CONF  nginx site config to snapshot  (default: /etc/nginx/conf.d/peaches.conf)
#   S3_BUCKET   optional: also upload, e.g. s3://my-bucket/peaches-backups
#
# Usage:  bash scripts/backup-site.sh
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/peachesv3}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/peaches-backups}"
KEEP="${KEEP:-10}"
NGINX_CONF="${NGINX_CONF:-/etc/nginx/conf.d/peaches.conf}"
S3_BUCKET="${S3_BUCKET:-}"

[ -d "$APP_DIR" ] || { echo "APP_DIR not found: $APP_DIR" >&2; exit 1; }
ts="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
archive="$BACKUP_DIR/peaches-$ts.tar.gz"

# Record the deployed commit (for git-based rollback) + a manifest.
sha="$(git -C "$APP_DIR" rev-parse HEAD 2>/dev/null || echo 'n/a')"
{
  echo "timestamp: $ts"
  echo "app_dir:   $APP_DIR"
  echo "git_sha:   $sha"
} > "$BACKUP_DIR/peaches-$ts.info"

# Archive the deployed dir. Include .next + public (fast restore, no rebuild needed);
# exclude node_modules/.git (reinstalled via `npm ci` on restore) to keep it lean.
parent="$(cd "$(dirname "$APP_DIR")" && pwd)"
base="$(basename "$APP_DIR")"
tar -C "$parent" \
  --exclude="$base/node_modules" \
  --exclude="$base/.git" \
  --exclude="$base/.env.local" \
  -czf "$archive" "$base"

# Snapshot nginx config (best-effort).
[ -f "$NGINX_CONF" ] && cp "$NGINX_CONF" "$BACKUP_DIR/nginx-peaches-$ts.conf" || true

# Optional S3 upload.
if [ -n "$S3_BUCKET" ] && command -v aws >/dev/null 2>&1; then
  aws s3 cp "$archive" "$S3_BUCKET/" && aws s3 cp "$BACKUP_DIR/peaches-$ts.info" "$S3_BUCKET/"
fi

# Prune old local backups (keep newest $KEEP).
ls -1t "$BACKUP_DIR"/peaches-*.tar.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | while read -r old; do
  rm -f "$old" "${old%.tar.gz}.info"
done

echo "✓ Backup created: $archive"
echo "  git SHA: $sha   (restore with: bash scripts/rollback.sh)"
