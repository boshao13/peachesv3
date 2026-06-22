#!/usr/bin/env bash
# PRE-CUTOVER snapshot — run this ON the EC2 box BEFORE the first deploy of the new
# Next.js site. The site currently live is the OLD static CRA build served straight off
# disk by nginx (no Node/pm2). The per-deploy backup-site.sh only archives the NEW app dir
# ($HOME/peachesv3), so it would NOT capture the current live site. This script does:
#
#   1) Inspects what nginx is actually serving (server_name, root, proxy_pass, ports).
#   2) Archives the served document root(s) + the ENTIRE /etc/nginx config.
#   3) Snapshots pm2 state (if any) and a manifest (date, ports, nginx -T dump).
#   4) Optionally uploads the archive to S3.
#
# Everything is read-only except writing the backup files — it does NOT stop/modify nginx.
# Restore later by putting the doc root back and `cp`-ing the nginx confs, then `nginx -t && systemctl reload nginx`.
#
# Config via env (defaults shown):
#   BACKUP_DIR  where to write the snapshot   (default: $HOME/peaches-backups)
#   S3_BUCKET   optional offsite upload        (e.g. s3://my-bucket/peaches-backups)
#
# Usage (on the box):  bash scripts/precutover-snapshot.sh
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-$HOME/peaches-backups}"
S3_BUCKET="${S3_BUCKET:-}"
ts="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
work="$BACKUP_DIR/precutover-$ts"
mkdir -p "$work"

# sudo only if available + needed (config files are usually root-readable anyway).
SUDO=""; if command -v sudo >/dev/null 2>&1; then SUDO="sudo"; fi

echo "==> 1/5 Capturing nginx config"
NGINX_BIN="$(command -v nginx || echo /usr/sbin/nginx)"
# Full effective config (resolves all includes) — best single source of truth.
$SUDO "$NGINX_BIN" -T > "$work/nginx-T.txt" 2>/dev/null || echo "(nginx -T unavailable)" > "$work/nginx-T.txt"
# Copy the whole config tree too (sites-available/enabled, conf.d, snippets, certs paths).
if [ -d /etc/nginx ]; then
  $SUDO tar -C /etc -czf "$work/etc-nginx.tar.gz" nginx 2>/dev/null || echo "(could not tar /etc/nginx)"
fi

echo "==> 2/5 Discovering served document root(s)"
# Pull every `root <path>;` and `proxy_pass <url>;` out of the effective config.
roots="$(grep -hoiE '^[[:space:]]*root[[:space:]]+[^;]+;' "$work/nginx-T.txt" 2>/dev/null \
          | sed -E 's/^[[:space:]]*root[[:space:]]+//I; s/;[[:space:]]*$//' | sort -u || true)"
proxies="$(grep -hoiE 'proxy_pass[[:space:]]+[^;]+;' "$work/nginx-T.txt" 2>/dev/null \
          | sed -E 's/.*proxy_pass[[:space:]]+//I; s/;[[:space:]]*$//' | sort -u || true)"
servers="$(grep -hoiE 'server_name[[:space:]]+[^;]+;' "$work/nginx-T.txt" 2>/dev/null \
          | sed -E 's/.*server_name[[:space:]]+//I; s/;[[:space:]]*$//' | sort -u || true)"
{
  echo "server_name(s):"; echo "${servers:-  (none found)}" | sed 's/^/  /'
  echo "root(s):";        echo "${roots:-  (none found)}"   | sed 's/^/  /'
  echo "proxy_pass:";     echo "${proxies:-  (none)}"        | sed 's/^/  /'
} | tee "$work/serving-summary.txt"

echo "==> 3/5 Archiving served doc root(s)"
i=0
if [ -n "$roots" ]; then
  while IFS= read -r r; do
    [ -z "$r" ] && continue
    if [ -d "$r" ]; then
      i=$((i+1))
      out="$work/docroot-$i.tar.gz"
      echo "    archiving $r -> $(basename "$out")"
      $SUDO tar -C "$(dirname "$r")" -czf "$out" "$(basename "$r")" 2>/dev/null \
        || echo "    (failed to archive $r)"
      echo "$r" >> "$work/docroots.txt"
    else
      echo "    (root not a dir, skipping: $r)"
    fi
  done <<< "$roots"
else
  echo "    no static root found (site may be fully proxied) — nginx config still captured."
fi

echo "==> 4/5 Snapshotting process/runtime state"
{
  echo "timestamp:   $ts"
  echo "host:        $(hostname) / $(hostname -I 2>/dev/null | awk '{print $1}')"
  echo "os:          $(. /etc/os-release 2>/dev/null; echo "${PRETTY_NAME:-unknown}")"
  echo "node:        $(command -v node >/dev/null && node -v || echo 'not installed')"
  echo "npm:         $(command -v npm >/dev/null && npm -v || echo 'not installed')"
  echo "pm2:         $(command -v pm2 >/dev/null && pm2 -v || echo 'not installed')"
  echo "nginx:       $($NGINX_BIN -v 2>&1)"
  echo "--- listening sockets (80/443/3000) ---"
  ($SUDO ss -ltnp 2>/dev/null || netstat -ltnp 2>/dev/null) | grep -E ':80 |:443 |:3000 ' || echo '  (none of 80/443/3000 found)'
} > "$work/manifest.txt"
cat "$work/manifest.txt"
# pm2 (if the old site somehow uses it)
if command -v pm2 >/dev/null 2>&1; then
  pm2 jlist > "$work/pm2-jlist.json" 2>/dev/null || true
  pm2 save 2>/dev/null || true
fi

echo "==> 5/5 Bundling snapshot"
archive="$BACKUP_DIR/precutover-$ts.tar.gz"
tar -C "$BACKUP_DIR" -czf "$archive" "precutover-$ts"
rm -rf "$work"

if [ -n "$S3_BUCKET" ] && command -v aws >/dev/null 2>&1; then
  echo "==> Uploading to $S3_BUCKET"
  aws s3 cp "$archive" "$S3_BUCKET/" || echo "(S3 upload failed — local copy still saved)"
fi

echo ""
echo "✓ Pre-cutover snapshot saved: $archive"
echo "  Contains: nginx-T.txt, etc-nginx.tar.gz, served doc root(s), manifest, pm2 state."
echo "  Inspect:  tar -tzf '$archive'   |   restore notes are in the script header."
