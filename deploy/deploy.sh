#!/bin/bash
# =============================================================
# deploy.sh  —  Full deployment script for sahayai.synthomind.cloud
# Run on the Hostinger VPS as root or a sudo user.
#
# Usage (first time):   bash deploy.sh --first-run
# Usage (update only):  bash deploy.sh
# =============================================================

set -e  # Exit immediately on error

# ── Configuration ─────────────────────────────────────────────────────────────
APP_DIR="/var/www/sahayai"
REPO_URL="https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git"  # ← CHANGE THIS
BRANCH="main"
DOMAIN="sahayai.synthomind.cloud"
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}.conf"
LOG_DIR="/var/log/pm2"
PYTHON_VENV="${APP_DIR}/.venv"

# ── Colours ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

FIRST_RUN=false
[[ "$1" == "--first-run" ]] && FIRST_RUN=true

# =============================================================
# STEP 1 — System dependencies (first run only)
# =============================================================
if $FIRST_RUN; then
  info "Installing system packages..."
  apt-get update -qq
  apt-get install -y -qq \
    curl git nginx certbot python3-certbot-nginx \
    python3 python3-pip python3-venv build-essential

  # Node.js 20.x via NodeSource
  if ! command -v node &>/dev/null; then
    info "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  fi

  # PM2 globally
  if ! command -v pm2 &>/dev/null; then
    info "Installing PM2..."
    npm install -g pm2
  fi

  # Create app directory
  mkdir -p "$APP_DIR" "$LOG_DIR"

  # Clone repository
  info "Cloning repository..."
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

# =============================================================
# STEP 2 — Pull latest code
# =============================================================
info "Pulling latest code from ${BRANCH}..."
cd "$APP_DIR"
git fetch origin
git reset --hard "origin/${BRANCH}"

# =============================================================
# STEP 3 — Backend Node.js dependencies
# =============================================================
info "Installing backend Node.js dependencies..."
cd "$APP_DIR"
npm install --omit=dev

# =============================================================
# STEP 4 — Python virtual environment & dependencies
# =============================================================
info "Setting up Python virtual environment..."
cd "$APP_DIR"
if [ ! -d "$PYTHON_VENV" ]; then
  python3 -m venv "$PYTHON_VENV"
fi
"${PYTHON_VENV}/bin/pip" install -q --upgrade pip
"${PYTHON_VENV}/bin/pip" install -q -r requirements.txt

# Train the ML model if not already present
if [ ! -f "${APP_DIR}/kisan_approval_model.pkl" ]; then
  info "Training ML model (first time)..."
  cd "$APP_DIR"
  "${PYTHON_VENV}/bin/python" train_and_save_model.py
fi

# =============================================================
# STEP 5 — Build React frontend
# =============================================================
info "Installing frontend dependencies..."
cd "$APP_DIR/frontend"
npm install --omit=dev

info "Building React app..."
npm run build

info "Copying React build to web root..."
mkdir -p "${APP_DIR}/frontend"
# Build is already at frontend/build — Nginx points there directly

# =============================================================
# STEP 6 — Environment file check
# =============================================================
if [ ! -f "${APP_DIR}/.env" ]; then
  warn "No .env file found at ${APP_DIR}/.env"
  warn "Copy deploy/.env.production.example to ${APP_DIR}/.env and fill in values:"
  warn "  cp ${APP_DIR}/deploy/.env.production.example ${APP_DIR}/.env"
  warn "  nano ${APP_DIR}/.env"
  error "Aborting: .env is required for the server to start."
fi

# =============================================================
# STEP 7 — Nginx setup (first run only)
# =============================================================
if $FIRST_RUN; then
  info "Configuring Nginx..."

  # Copy Nginx config (HTTP-only first, certbot will add SSL)
  cp "${APP_DIR}/deploy/nginx/${DOMAIN}.conf" "$NGINX_CONF"

  # Temporarily comment out SSL lines so nginx starts before certbot
  sed -i 's|ssl_certificate|# ssl_certificate|g' "$NGINX_CONF"
  sed -i 's|ssl_certificate_key|# ssl_certificate_key|g' "$NGINX_CONF"
  sed -i 's|include.*options-ssl|# include.*options-ssl|g' "$NGINX_CONF"
  sed -i 's|ssl_dhparam|# ssl_dhparam|g' "$NGINX_CONF"
  # Also temporarily serve HTTP on 80 (remove the 301 redirect)
  sed -i 's|return 301|# return 301|g' "$NGINX_CONF"
  # Change https listen to http temporarily
  sed -i '/listen 443/d' "$NGINX_CONF"
  sed -i '/ssl http2/d' "$NGINX_CONF"

  # Actually, let's use a clean HTTP-only nginx config for Let's Encrypt
  cat > "$NGINX_CONF" <<'NGINX_HTTP'
server {
    listen 80;
    listen [::]:80;
    server_name sahayai.synthomind.cloud;

    root /var/www/sahayai/frontend/build;
    index index.html;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location /api/ {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        client_max_body_size 20M;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_HTTP

  # Enable site
  ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
  rm -f /etc/nginx/sites-enabled/default

  nginx -t && systemctl reload nginx

  # Obtain SSL certificate
  info "Obtaining SSL certificate from Let's Encrypt..."
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos \
    -m "admin@synthomind.cloud" --redirect

  # Now replace with the full HTTPS nginx config
  cp "${APP_DIR}/deploy/nginx/${DOMAIN}.conf" "$NGINX_CONF"
  ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
  nginx -t && systemctl reload nginx

  info "SSL configured successfully."
fi

# =============================================================
# STEP 8 — Reload Nginx (on every deploy)
# =============================================================
info "Reloading Nginx..."
nginx -t && systemctl reload nginx

# =============================================================
# STEP 9 — Start / reload PM2 processes
# =============================================================
info "Starting / reloading PM2 processes..."
cd "$APP_DIR"

if pm2 list | grep -q "sahayai-backend"; then
  pm2 reload ecosystem.config.js --only sahayai-backend
else
  pm2 start ecosystem.config.js --only sahayai-backend --env production
fi

if pm2 list | grep -q "sahayai-python"; then
  pm2 reload ecosystem.config.js --only sahayai-python
else
  pm2 start ecosystem.config.js --only sahayai-python
fi

# Save PM2 process list & enable startup on first run
if $FIRST_RUN; then
  pm2 save
  pm2 startup systemd -u root --hp /root | tail -1 | bash
fi

# =============================================================
# Done
# =============================================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment complete!                               ║${NC}"
echo -e "${GREEN}║   Site: https://${DOMAIN}   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
info "Useful commands:"
echo "  pm2 status                  — check processes"
echo "  pm2 logs sahayai-backend    — backend logs"
echo "  pm2 logs sahayai-python     — Python ML server logs"
echo "  pm2 restart all             — restart all processes"
echo "  nginx -t                    — test nginx config"
echo "  systemctl reload nginx      — reload nginx"
