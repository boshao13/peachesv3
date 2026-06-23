#!/usr/bin/env bash
# Safe deploy on EC2: back up the current site, pull, install, BUILD, then reload.
# If the build fails, the script aborts BEFORE touching the running app, so the
# current site keeps serving. Roll back any time with scripts/rollback.sh.
#
# Config via env (defaults shown):
#   APP_DIR   deployed app/repo dir   (default: $HOME/peachesv3)
#   BRANCH    branch to deploy         (default: master)
#   PM2_NAME  pm2 process name         (default: peaches)
#
# Usage:  bash scripts/deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/peachesv3}"
BRANCH="${BRANCH:-master}"
PM2_NAME="${PM2_NAME:-peaches}"
HERE="$(cd "$(dirname "$0")" && pwd)"

cd "$APP_DIR"

echo "==> 1/4 Backing up current site"
APP_DIR="$APP_DIR" bash "$HERE/backup-site.sh"

echo "==> 2/4 Fetching $BRANCH"
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> 3/4 Installing + building (old site still serving)"
npm ci
npm run build   # set -e aborts here on failure → no reload, old app stays up

echo "==> 4/4 Reloading $PM2_NAME"
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 reload "$PM2_NAME" --update-env
else
  pm2 start "npm run start" --name "$PM2_NAME"
fi
pm2 save

echo "✓ Deployed $(git rev-parse --short HEAD) on $BRANCH"
