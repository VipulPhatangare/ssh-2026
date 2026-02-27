# Deployment Guide — sahayai.synthomind.cloud

## Overview

| Service              | Tech          | Port   | Served via            |
|----------------------|---------------|--------|-----------------------|
| Frontend             | React (CRA)   | —      | Nginx static files    |
| Backend API          | Node.js/Express | 5000 | Nginx `/api` proxy    |
| ML Prediction Server | Python/Flask  | 5001   | PM2 (internal only)   |

**Domain:** `https://sahayai.synthomind.cloud`  
**Server:** Hostinger VPS (Ubuntu 20.04 / 22.04 recommended)

---

## Quick Deploy (First Time)

### 1. SSH into your VPS
```bash
ssh root@<YOUR_VPS_IP>
```

### 2. Clone + deploy in one command
```bash
curl -O https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/main/deploy/deploy.sh
bash deploy.sh --first-run
```

> **Note:** Update `REPO_URL` and `BRANCH` at the top of `deploy/deploy.sh` before running.

---

## Step-by-Step Manual Setup

### Prerequisites
```bash
apt-get update
apt-get install -y curl git nginx certbot python3-certbot-nginx python3 python3-pip python3-venv build-essential

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# PM2
npm install -g pm2
```

### Clone the Repository
```bash
mkdir -p /var/www/sahayai
cd /var/www/sahayai
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
```

### Configure Environment Variables
```bash
cp deploy/.env.production.example .env
nano .env
# Fill in: MONGO_URI, JWT_SECRET, CLOUDINARY_* values
```

### Install Backend Dependencies
```bash
cd /var/www/sahayai
npm install --omit=dev
```

### Set Up Python & Train ML Model
```bash
cd /var/www/sahayai
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python train_and_save_model.py   # creates kisan_approval_model.pkl
```

### Build React Frontend
```bash
cd /var/www/sahayai/frontend
npm install --omit=dev
npm run build
# Build output: /var/www/sahayai/frontend/build/
```

---

## Nginx Setup

```bash
# Copy Nginx config
cp /var/www/sahayai/deploy/nginx/sahayai.synthomind.cloud.conf \
   /etc/nginx/sites-available/sahayai.synthomind.cloud.conf

# Enable site
ln -s /etc/nginx/sites-available/sahayai.synthomind.cloud.conf \
      /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test & reload
nginx -t && systemctl reload nginx
```

### SSL with Let's Encrypt (Certbot)
```bash
certbot --nginx -d sahayai.synthomind.cloud \
  --non-interactive --agree-tos \
  -m admin@synthomind.cloud --redirect

# Auto-renewal is set up by certbot automatically
certbot renew --dry-run   # test renewal
```

---

## Process Management with PM2

```bash
cd /var/www/sahayai

# Start all services
pm2 start ecosystem.config.js --env production

# Save process list (survives reboot)
pm2 save

# Enable PM2 auto-start on server reboot
pm2 startup systemd -u root --hp /root
# Copy & run the printed command

# Check status
pm2 status
pm2 logs sahayai-backend
pm2 logs sahayai-python
```

---

## Updating the Application

```bash
ssh root@<YOUR_VPS_IP>
cd /var/www/sahayai
bash deploy/deploy.sh
```

Or manually:
```bash
cd /var/www/sahayai
git pull origin main
npm install --omit=dev
cd frontend && npm run build && cd ..
pm2 reload ecosystem.config.js --env production
```

---

## Environment Variables Reference

| Variable               | Required | Description                          |
|------------------------|----------|--------------------------------------|
| `PORT`                 | Yes      | Backend port (5000)                  |
| `NODE_ENV`             | Yes      | Set to `production`                  |
| `CLIENT_URL`           | Yes      | `https://sahayai.synthomind.cloud`   |
| `MONGO_URI`            | Yes      | MongoDB Atlas connection string      |
| `JWT_SECRET`           | Yes      | Long random string (min 64 chars)    |
| `JWT_EXPIRE`           | No       | Token expiry (default: `7d`)         |
| `CLOUDINARY_CLOUD_NAME`| Yes      | Cloudinary account name              |
| `CLOUDINARY_API_KEY`   | Yes      | Cloudinary API key                   |
| `CLOUDINARY_API_SECRET`| Yes      | Cloudinary API secret                |
| `PYTHON_SERVICE_URL`   | No       | Python server URL (default: `:5001`) |

---

## Useful Commands

```bash
# Check site health
curl https://sahayai.synthomind.cloud/api/health

# View live logs
pm2 logs --lines 50

# Restart individual services
pm2 restart sahayai-backend
pm2 restart sahayai-python

# Check Nginx
systemctl status nginx
tail -f /var/log/nginx/sahayai.error.log

# Check certificates
certbot certificates
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| 502 Bad Gateway | `pm2 status` — check backend is running |
| CORS error | Verify `CLIENT_URL` in `.env` matches the domain exactly |
| API not reachable | Check firewall: `ufw allow 80`, `ufw allow 443` |
| ML predictions failing | Check `kisan_approval_model.pkl` exists; re-run `train_and_save_model.py` |
| SSL errors | Run `certbot renew` and `systemctl reload nginx` |

---

## Firewall Setup

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'   # ports 80 + 443
ufw enable
ufw status
```

> Ports 5000 and 5001 should remain **closed** to the public — Nginx proxies to them internally.
