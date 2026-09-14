#!/bin/bash
# Provision a replacement Peaches web box. Pass as EC2 user-data at launch.
#
# Used to build i-0720e365a20dbdf2d on 2026-09-14 after the box was found
# compromised for the third time. Recorded here because the host had been
# rebuilt by hand twice and nothing captured how.
#
# Launch it with (us-east-2):
#   ami: latest Canonical ubuntu-noble-24.04-amd64-server
#   type: t3.micro    root: 20 GiB gp3, ENCRYPTED
#   metadata-options: HttpTokens=required   (IMDSv2)
#   security group: 80 + 443 from 0.0.0.0/0, 22 from ONE admin /32 (never an ISP /16)
#
# After it reports PROVISION_COMPLETE:
#   1. fill in /home/ubuntu/peachesv3/.env.production (see below)
#   2. bash deploy-from-mac.sh        # builds locally, ships .next
#   3. move the Elastic IP onto it, then:
#      sudo certbot --nginx -d peachesfitnessclub.com -d www.peachesfitnessclub.com --redirect
set -euxo pipefail
exec > >(tee /var/log/peaches-provision.log) 2>&1

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y nginx git curl ca-certificates gnupg unattended-upgrades certbot python3-certbot-nginx rsync

# MTU: AWS defaults ens5 to 9001 (jumbo frames). That is fine inside the VPC but
# black-holes bulk transfers to the internet when the path MTU is 1500 and the
# security group drops the ICMP that path-MTU discovery needs. Symptom: short ssh
# commands work, every scp/rsync resets partway through. Cost hours on 2026-09-14.
ip link set dev ens5 mtu 1500 || true
cat > /etc/systemd/network/70-ens5-mtu.link <<'EOF'
[Match]
OriginalName=ens5

[Link]
MTUBytes=1500
EOF
mkdir -p /etc/networkd-dispatcher/routable.d
cat > /etc/networkd-dispatcher/routable.d/50-mtu <<'EOF'
#!/bin/sh
ip link set dev ens5 mtu 1500 || true
EOF
chmod +x /etc/networkd-dispatcher/routable.d/50-mtu

# 2 GiB swap: 1 GiB RAM is tight for npm ci
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
npm install -g pm2

# sshd hardening
cat > /etc/ssh/sshd_config.d/99-hardening.conf <<'EOF'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
MaxAuthTries 3
AllowUsers ubuntu
X11Forwarding no
AllowTcpForwarding no
EOF
systemctl restart ssh || systemctl restart sshd || true

# automatic security updates
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF

# app checkout + production deps (build is shipped from the workstation)
sudo -u ubuntu git clone --branch rebuild/nextjs --depth 1 https://github.com/boshao13/peachesv3.git /home/ubuntu/peachesv3
cd /home/ubuntu/peachesv3
sudo -u ubuntu tee .env.production >/dev/null <<'EOF'
NEXT_PUBLIC_SITE_URL=https://www.peachesfitnessclub.com
# ROTATED CREDENTIALS REQUIRED - the previous values were on a host an attacker
# held root on for ~3 weeks and must be treated as burned. Fill these in:
NEXT_PUBLIC_MAPBOX_API_KEY=
RESEND_API_KEY=
EOF
sudo -u ubuntu npm ci --omit=dev --no-audit --no-fund

# nginx reverse proxy (certbot adds TLS once DNS points here)
cat > /etc/nginx/sites-available/peaches <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name peachesfitnessclub.com www.peachesfitnessclub.com;
    client_max_body_size 10M;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 30s;
    }
}
EOF
ln -sf /etc/nginx/sites-available/peaches /etc/nginx/sites-enabled/peaches
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx && systemctl enable nginx

touch /home/ubuntu/PROVISION_COMPLETE
chown ubuntu:ubuntu /home/ubuntu/PROVISION_COMPLETE
