#!/usr/bin/env bash
# Deploy peachesfitnessclub.com FROM YOUR MAC (build here, ship the compiled .next to the box).
#
# WHY THIS EXISTS:
#   The EC2 box currently has NO outbound internet (egress is blocked upstream at the VPC),
#   so it cannot `git pull` or `npm ci` — the on-box ./deploy.sh cannot run. This script
#   builds on the Mac (which has internet + full devDependencies) and rsyncs only the
#   compiled output to the box, which just serves it. Atomic swap + auto-rollback on failure.
#
#   Once the box's egress is restored (or it's rebuilt onto a clean AMI), the on-box
#   ./deploy.sh (git pull + npm ci + build) becomes the normal path and this can be retired.
#
# USAGE:  bash deploy-from-mac.sh
# OVERRIDE:  KEY=~/path/key.pem HOST=ubuntu@1.2.3.4 bash deploy-from-mac.sh
set -euo pipefail

KEY="${KEY:-$HOME/.ssh/peaches-2026.pem}"        # rotated key (2026-07); old ~/Downloads/peaches.pem also still works
HOST="${HOST:-ubuntu@18.225.92.153}"
REMOTE="${REMOTE:-/home/ubuntu/peachesv3}"
BRANCH="${BRANCH:-rebuild/nextjs}"
REPO="${REPO:-https://github.com/boshao13/peachesv3.git}"
WORK="${WORK:-/tmp/peaches-deploy}"
SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)

echo "==> 1/6 Fresh shallow checkout of origin/$BRANCH"
rm -rf "$WORK"
git clone --quiet --branch "$BRANCH" --depth 1 "$REPO" "$WORK"
cd "$WORK"
echo "    building commit $(git rev-parse --short HEAD)"

echo "==> 2/6 Pull build-time env (public NEXT_PUBLIC_* only) from the box"
scp -i "$KEY" -o IdentitiesOnly=yes "$HOST:$REMOTE/.env.production" .env.production

echo "==> 3/6 Install deps + build"
npm ci --no-audit --no-fund
NODE_OPTIONS="--max-old-space-size=4096" npm run build

echo "==> 4/6 Ship compiled .next -> box staging (.next.new, excluding build cache)"
rsync -az --delete --exclude cache -e "${SSH[*]}" .next/ "$HOST:$REMOTE/.next.new/"

echo "==> 5/6 Atomic swap + restart + health check (auto-rollback on failure)"
"${SSH[@]}" "$HOST" bash -s <<'REMOTE_EOF'
set -e
cd /home/ubuntu/peachesv3
TS=$(date +%Y%m%d-%H%M%S)
[ -d .next ] && mv .next ".next.bak.$TS"
mv .next.new .next
pm2 restart peaches --update-env >/dev/null && pm2 save >/dev/null
sleep 4
H=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/ || echo 000)
if [ "$H" != "200" ]; then
  echo "   HEALTH FAIL ($H) — rolling back to .next.bak.$TS"
  rm -rf .next; mv ".next.bak.$TS" .next
  pm2 restart peaches --update-env >/dev/null
  exit 1
fi
echo "   health OK ($H); previous build kept at .next.bak.$TS"
# retain only the 2 most-recent backups
ls -1dt .next.bak.* 2>/dev/null | tail -n +3 | xargs -r rm -rf
REMOTE_EOF

echo "==> 6/6 External verification (real domain over HTTPS)"
for p in / /membership /contact; do
  printf "    %-28s HTTP %s\n" "https://peachesfitnessclub.com$p" \
    "$(curl -s -o /dev/null -w '%{http_code}' "https://peachesfitnessclub.com$p")"
done
echo "==> Done."
